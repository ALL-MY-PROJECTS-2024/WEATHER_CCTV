import json
import time
import os
from datetime import datetime
import schedule
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess

# move.py 모듈 import 추가
import move
# remove.py 모듈에서 cleanup_old_folders 함수를 가져옵니다.
from remove import cleanup_old_folders

# JSON 파일 경로
file_path = './dataset/CCTV1.json'

# 시스템 최상위 경로 대신 프로젝트 내부의 video 폴더 경로 반환
def get_video_directory():
    return os.path.join(os.getcwd(), 'video')

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

    top_level_directory = get_video_directory()

    min = get_minute_by_time()

    video_directory = os.path.join(top_level_directory, instl_pos, date_folder, hour_folder, min)
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


    # for hour in range(0, 24):  # 0시부터 23시까지
    #     schedule.every().day.at(f"{hour:02}:01").do(run_recording)
    #     schedule.every().day.at(f"{hour:02}:31").do(run_recording)
    #     schedule.every().day.at(f"{hour:02}:46").do(run_recording)

    # # 새벽 3시 00분에 폴더 정리 작업 추가
    # schedule.every().day.at("03:00").do(run_move)  # move.py의 기능 실행
    # schedule.every().day.at("04:00").do(run_cleanup)

        # 5분마다 녹화 실행
    schedule.every(5).minutes.do(run_recording)
    
    # 10분마다 정리작업 실행
    schedule.every(10).minutes.do(run_move)
    schedule.every(10).minutes.do(run_cleanup)
    

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

def run_cleanup():
    print("폴더 정리 작업 시작")
    cleanup_old_folders()
    print("폴더 정리 작업 완료")

def run_move():
    print("폴더 복사 작업 시작")
    try:
        move.main()
        print("폴더 복사 작업 완료")
    except Exception as e:
        print(f"폴더 복사 작업 중 오류 발생: {str(e)}")
    
def run_ondayback():
    """ondayback.py 실행하는 함수"""
    try:
        print("=== Running ondayback.py ===")
        result = subprocess.run(['python3', 'ondayback.py'], 
                              capture_output=True, 
                              text=True)
        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)
        print("=== ondayback.py completed ===")
    except Exception as e:
        print(f"=== Error running ondayback.py: {str(e)} ===")

def main():
    # ondayback.py 먼저 실행
    run_ondayback()
    
    # 기존 스케줄링 코드
    schedule_recording()
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()