import os
import shutil
import cv2
import random

def ensure_folders_and_process_videos(base_dir, specific_date):
    # 확인해야 할 폴더 이름
    required_folders = ['00', '30', '60']

    # 1DEPTH 폴더 탐색
    for first_level_folder in os.listdir(base_dir):
        first_level_path = os.path.join(base_dir, first_level_folder)

        if not os.path.isdir(first_level_path):
            continue

        # 특정 날짜 디렉토리 설정
        date_dir = os.path.join(first_level_path, specific_date)

        if not os.path.exists(date_dir):
            continue

        print(f"Processing directory: {date_dir}")

        # 시간 폴더 확인 (HH00)
        existing_time_folders = [f for f in os.listdir(date_dir) if os.path.isdir(os.path.join(date_dir, f)) and f.endswith('00') and len(f) == 4 and f.isdigit()]
        existing_time_folders.sort()

        # HH00 폴더 생성
        for hour in range(0, 24):
            time_folder = f"{hour:02}00"
            time_folder_path = os.path.join(date_dir, time_folder)

            if time_folder not in existing_time_folders:
                print(f"Missing time folder: {time_folder}. Creating it.")

                # 복사할 원본 폴더 선택
                source_time_folder = None
                if existing_time_folders:
                    # 이전 시간대 또는 다음 시간대 복사
                    previous_hour = max([int(f[:2]) for f in existing_time_folders if int(f[:2]) < hour], default=None)
                    next_hour = min([int(f[:2]) for f in existing_time_folders if int(f[:2]) > hour], default=None)

                    if previous_hour is not None:
                        source_time_folder = os.path.join(date_dir, f"{previous_hour:02}00")
                    elif next_hour is not None:
                        source_time_folder = os.path.join(date_dir, f"{next_hour:02}00")

                if source_time_folder:
                    shutil.copytree(source_time_folder, time_folder_path)
                    print(f"Copied {source_time_folder} to {time_folder_path}")

        # 각 HH00 폴더 내에서 하위 폴더 확인 및 비디오 처리
        for time_folder in os.listdir(date_dir):
            time_folder_path = os.path.join(date_dir, time_folder)
            if os.path.isdir(time_folder_path) and time_folder.endswith('00'):
                print(f"Processing time folder: {time_folder_path}")

                # 하위 폴더 확인
                existing_folders = [f for f in os.listdir(time_folder_path) if os.path.isdir(os.path.join(time_folder_path, f))]

                for folder in required_folders:
                    if folder not in existing_folders:
                        print(f"Missing folder: {folder}. Creating it.")

                        # 복사할 원본 폴더 선택
                        source_folder = None
                        for existing_folder in existing_folders:
                            if existing_folder in required_folders:
                                source_folder = os.path.join(time_folder_path, existing_folder)
                                break

                        if source_folder:
                            target_folder = os.path.join(time_folder_path, folder)
                            shutil.copytree(source_folder, target_folder)
                            print(f"Copied {source_folder} to {target_folder}")

                # 비디오 파일 처리
                for folder in required_folders:
                    target_path = os.path.join(time_folder_path, folder)
                    if os.path.exists(target_path):
                        for video_file in os.listdir(target_path):
                            video_path = os.path.join(target_path, video_file)
                            if os.path.isfile(video_path) and video_file.endswith(('.mp4', '.avi', '.mkv')):
                                print(f"Processing video: {video_path}")
                                processed_video_path = process_video(video_path)
                                if processed_video_path:
                                    os.remove(video_path)
                                    os.rename(processed_video_path, video_path)
                                    print(f"Replaced original video with processed video: {video_path}")

def process_video(video_path):
    # 비디오 읽기
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        print(f"Failed to open video: {video_path}")
        return None

    # 비디오 속성 가져오기
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    codec = cv2.VideoWriter_fourcc(*'mp4v')

    # 랜덤한 시작 프레임 계산 (3초 ~ 끝까지 랜덤)
    min_start_frame = 3 * fps
    max_start_frame = total_frames - fps  # 최소 1초 남기고 끝냄
    if min_start_frame >= max_start_frame:
        start_frame = min_start_frame  # 전체가 짧을 경우 최소값으로 설정
    else:
        start_frame = random.randint(min_start_frame, max_start_frame)

    # 새 파일 이름 생성
    output_path = video_path.replace('.', '_processed.')

    # 비디오 작성기 설정
    out = cv2.VideoWriter(output_path, codec, fps, (width, height))

    if not out.isOpened():
        print(f"Failed to initialize VideoWriter for: {output_path}")
        cap.release()
        return None

    # 시작 프레임으로 이동
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)

    # 리소스 해제
    cap.release()
    out.release()
    print(f"Processed video saved to: {output_path}")
    return output_path

if __name__ == "__main__":
    base_directory = r"C:\\video"
    specific_date = "20241223"  # 처리하려는 특정 날짜 (YYYYMMDD 형식)
    ensure_folders_and_process_videos(base_directory, specific_date)
