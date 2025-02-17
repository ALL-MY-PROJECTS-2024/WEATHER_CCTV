import json
import time
import os
from datetime import datetime
import schedule
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess

# JSON 파일 경로
file_path = './dataset/CCTV1.json'

def get_minute_by_time():
    current_time = datetime.now()
    minute = current_time.minute

    # 0-30분 사이면 '00', 31-45분 사이면 '30', 46-59분 사이면 '60'으로 설정
    if minute <= 30:
        return "00"
    elif minute <= 45:
        return "30"
    else:
        return "60"

# 시스템 최상위 경로로 video 폴더 생성
def get_top_level_directory():
    if os.name == 'nt':  # Windows
        return os.path.join(os.path.splitdrive(os.getcwd())[0], '\\')  # C:\ 또는 드라이브 루트
    else:  # Linux, macOS
        return os.path.sep  # / (루트 디렉토리)

# 파일명이 현재 시간의 분에 따라 '00', '30', '60'으로 지정하는 함수
def get_minute_by_time():
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

    # 현재 시각 정보 가져오기
    now = datetime.now()
    
    # 연월일(YYYYMMDD) 폴더명
    date_folder = now.strftime('%Y%m%d')

    # HH00 형태 폴더명 (예: 14시 -> "1400")
    hour_folder = now.strftime('%H') + "00"

    top_level_directory = get_top_level_directory()
    # top_level_directory = "C:\\Users\\jwg13\\Downloads\\SEG\\CCTV_WEATHER_PROJECT_FN\\public"

    min = get_minute_by_time()

    video_directory = os.path.join(top_level_directory, 'video', instl_pos, date_folder, hour_folder, min)
    os.makedirs(video_directory, exist_ok=True)
    
    output_filename = os.path.join(video_directory, f'video.mp4')

    remove_existing_file(output_filename)

    print(f"녹화를 시작합니다: {output_filename} from {rtsp_url}")

    # 분(MM)에 따른 비트레이트 설정 (원하시는 로직에 맞춰 조정 가능)
    minute = now.strftime('%M')
    if minute in ['00', '30']:
        bitrate = '300k'
    else:
        bitrate = '200k'


    #-----------------------------
    # WINDOW
    #-----------------------------
    # command = [
    #     "ffmpeg",
    #     "-i", rtsp_url,
    #     "-c:v", "libx264",
    #     "-an",
    #     "-b:v", bitrate,
    #     "-s", "160x160",
    #     "-r", "10",
    #     "-f", "mp4",
    #     "-t", "00:00:30",
    #     output_filename
    # ]

    #-----------------------------
    # LINUX
    #-----------------------------
    command = [
        "ffmpeg",
        "-protocol_whitelist", "file,http,https,tcp,tls",
        "-i", rtsp_url,  # HLS URL
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-an",
        "-t", "00:00:10",  # 녹화 시간 30초
        "-b:v", bitrate, 
        "-vf", "scale=160:160",
        "-r", "10",
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

    # 새벽 3시 00분에 폴더 정리 작업 추가
    schedule.every().day.at("03:00").do(run_move)  # move.py의 기능 실행
    schedule.every().day.at("04:00").do(run_cleanup)

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
    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = []
        # CCTV 작업을 100개씩 나누어 병렬 처리
        for i in range(0, total_cctvs, chunk_size):
            chunk = data[i:i+chunk_size]  # 100개씩 나누기
            futures.extend([executor.submit(record_cctv, cctv) for cctv in chunk])
        
        # 각 작업이 완료될 때마다 확인
        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                print(f"녹화 작업 중 예외 발생: {e}")

    print("녹화 작업 완료")

# remove.py 모듈에서 cleanup_old_folders 함수를 가져옵니다.
from remove import cleanup_old_folders

def run_cleanup():
    print("폴더 정리 작업 시작")
    cleanup_old_folders()
    print("폴더 정리 작업 완료")

def run_move():
    print("폴더 복사 작업 시작")
    move.main()
    print("폴더 복사 작업 완료")
    
if __name__ == "__main__":
    # 녹화 작업 및 폴더 정리 작업을 스케줄링
    schedule_recording()
    #run_recording()
