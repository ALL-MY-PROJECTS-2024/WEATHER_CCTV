import json
import time
import os
from datetime import datetime
import schedule
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess

# JSON 파일 경로
file_path = './dataset/CCTV1.json'

# 시스템 최상위 경로로 video 폴더 생성
def get_top_level_directory():
    if os.name == 'nt':  # Windows
        return os.path.join(os.path.splitdrive(os.getcwd())[0], '\\')  # C:\ 또는 드라이브 루트
    else:  # Linux, macOS
        return os.path.sep  # / (루트 디렉토리)

# 파일명을 현재 시간의 분에 따라 '00', '30', '60'으로 지정하는 함수
def get_filename_by_time():
    current_time = datetime.now()
    minute = current_time.minute

    # 00분 이하일 때 '00', 30분 이하일 때 '30', 59분 이하일 때 '60'으로 설정
    if minute <= 30:
        return '00'
    elif minute <= 45:
        return '30'
    else:
        return '60'

# 파일이 존재하면 삭제 후 새로 생성하는 함수
def remove_existing_file(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
        print(f"기존 파일 삭제됨: {file_path}")

# 녹화 함수
def record_cctv(cctv):
    rtsp_url = cctv['rtspAddr']
    instl_pos = cctv.get('instlPos', 'default')
    
    current_time = datetime.now().strftime('%Y%m%d')
    top_level_directory = "C:\\Users\\jwg13\\Downloads\\SEG\\CCTV_WEATHER_PROJECT_FN\\public"
    
    video_directory = os.path.join(top_level_directory, 'video', instl_pos, current_time)
    
    os.makedirs(video_directory, exist_ok=True)
    
    time_suffix = get_filename_by_time()
    if not time_suffix:
        return
    
    output_filename = os.path.join(video_directory, f'video_{time_suffix}.mp4')

    remove_existing_file(output_filename)

    print(f"녹화를 시작합니다: {output_filename} from {rtsp_url}")

    # 비트레이트 설정 (00, 30, 60에 따른 비트레이트 값)
    bitrate_map = {
        '00': '300k',
        '30': '300k',
        '60': '200k'
    }
    # time_suffix에 따라 비트레이트를 설정
    bitrate = bitrate_map.get(time_suffix, '300k')  # 기본값은 200k

    command = [
        "ffmpeg",
        "-i", rtsp_url,
        "-c:v", "libx264",
        "-an",
        "-b:v", bitrate ,
        "-s", "160x160",
        "-r", "10",
        "-f", "mp4",
        "-t", "00:05:00",
        output_filename
    ]

    try:
        # ffmpeg 실행 및 출력, 오류 로그를 UTF-8로 처리
        result = subprocess.run(command, capture_output=True, text=True, encoding='utf-8')
        if result.returncode != 0:
            print(f"FFmpeg 실행 오류: {result.stderr}")
        else:
            print(f"녹화 완료: {output_filename}")
    except Exception as e:
        print(f"FFmpeg 실행 중 예외 발생: {str(e)}")

# 매일 08:00부터 23:00 사이에 매시 01분, 31분, 46분에 녹화
def schedule_recording():
    for hour in range(6, 24):  # 6시부터 23시까지
        schedule.every().day.at(f"{hour:02}:01").do(run_recording)
        schedule.every().day.at(f"{hour:02}:31").do(run_recording)
        schedule.every().day.at(f"{hour:02}:46").do(run_recording)

    while True:
        schedule.run_pending()
        time.sleep(0.5)

def run_recording():
    print("녹화 작업 시작")
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    chunk_size = 100
    total_cctvs = len(data)

    # ThreadPoolExecutor를 사용하여 병렬 처리
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = []
        # CCTV 작업을 50개씩 나누어 병렬 처리
        for i in range(0, total_cctvs, chunk_size):
            print("!!!")
            chunk = data[i:i+chunk_size]  # 50개씩 나누기
            futures.extend([executor.submit(record_cctv, cctv) for cctv in chunk])
        
        # 각 작업이 완료될 때마다 확인
        for future in as_completed(futures):
            future.result()

    print("녹화 작업 완료")

if __name__ == "__main__":
    # 첫 번째 녹화를 시작하고, 이후 08:00부터 23:00 사이의 매시 01분, 31분, 46분에 반복
    #schedule_recording()
    run_recording()
