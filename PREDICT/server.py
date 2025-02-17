import os
import cv2
from flask import Flask, request, send_file, jsonify
from concurrent.futures import ThreadPoolExecutor
import multiprocessing
from flask_cors import CORS

# Flask 앱 인스턴스 생성
def create_app(endpoint):
    app = Flask(__name__)
    CORS(app)  # CORS 활성화

    # 동영상 폴더 경로 설정
    VIDEO_BASE_PATH = os.path.join(os.getcwd(), 'video')  # 현재 프로젝트의 'video' 폴더

    # ThreadPoolExecutor 설정
    executor = ThreadPoolExecutor(max_workers=10)

    # 요청 처리 함수
    def fetch_frame(instl_pos, date_folder, hour_folder, minute, frame_time):
        try:
            # 동영상 파일 경로 생성
            video_path = os.path.join(VIDEO_BASE_PATH, instl_pos, date_folder, hour_folder, minute, 'video.mp4')
            print(f"Generated video path: {video_path}")  # 디버깅 출력

            if not os.path.exists(video_path):
                return None, "Video not found."

            # OpenCV로 비디오 열기
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return None, "Failed to open video."

            # FPS와 전체 프레임 수 확인
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = cap.get(cv2.CAP_PROP_FRAME_COUNT)

            # 타임스탬프를 프레임 번호로 변환
            target_frame = int(frame_time * fps)

            if target_frame >= total_frames:
                return None, "Frame time exceeds video length."

            # 해당 프레임으로 이동
            cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
            ret, frame = cap.read()
            cap.release()

            if not ret:
                return None, "Failed to read frame."

            # 임시 이미지 파일 경로 생성
            image_path = os.path.join(VIDEO_BASE_PATH, 'temp_frame.jpg')
            cv2.imwrite(image_path, frame)
            return image_path, None
        except Exception as e:
            print(f"Error: {e}")
            return None, str(e)

    @app.route(f'/{endpoint}', methods=['GET'])
    def get_frame():
        instl_pos = request.args.get('instl_pos')
        date_folder = request.args.get('date_folder')
        hour_folder = request.args.get('hour_folder')
        minute = request.args.get('minute')
        frame_time = request.args.get('frame_time', type=float)  # 재생 시간(초)을 요청

        # 요청 파라미터 디버깅 출력
        print(f"Request parameters:")
        print(f"  instl_pos: {instl_pos}")
        print(f"  date_folder: {date_folder}")
        print(f"  hour_folder: {hour_folder}")
        print(f"  minute: {minute}")
        print(f"  frame_time: {frame_time}")

        if not all([instl_pos, date_folder, hour_folder, minute, frame_time]):
            return jsonify({"error": "Missing parameters. Please provide instl_pos, date_folder, hour_folder, minute, and frame_time."}), 400

        # 동영상에서 프레임 추출
        future = executor.submit(fetch_frame, instl_pos, date_folder, hour_folder, minute, frame_time)
        image_path, error = future.result()

        if image_path:
            print(f"Frame image available at: {image_path}")
            return send_file(image_path, as_attachment=False, mimetype='image/jpeg')
        else:
            print(f"Error occurred: {error}")
            return jsonify({"error": error}), 404

    @app.route('/')
    def index():
        return f"Video Server is running on port {app.config['PORT']} with endpoint /{endpoint}."

    return app

def run_server(port, endpoint):
    app = create_app(endpoint)
    app.config['PORT'] = port
    app.run(host='0.0.0.0', port=port)

if __name__ == "__main__":
    server_configs = [
        (5002, 'get_frame2'),
        (5003, 'get_frame3'),
        (5004, 'get_frame4')
    ]
    processes = []

    for port, endpoint in server_configs:
        p = multiprocessing.Process(target=run_server, args=(port, endpoint))
        p.start()
        processes.append(p)

    for p in processes:
        p.join()
