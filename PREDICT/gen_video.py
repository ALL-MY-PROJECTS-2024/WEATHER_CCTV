import json
import time
import os
from datetime import datetime
import schedule
from concurrent.futures import ThreadPoolExecutor, as_completed
import subprocess
import logging

# remove.py 모듈에서 cleanup_old_folders 함수를 가져옵니다.
from remove import cleanup_old_folders

# JSON 파일 경로
file_path = './dataset/CCTV1.json'

# 시스템 최상위 경로 대신 프로젝트 내부의 video 폴더 경로 반환
def get_video_directory():
    """
    컨테이너 내부의 video 폴더 경로를 반환합니다.
    """
    return "/app/video"

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

# 로깅 설정
def setup_logger():
    """로깅 설정을 초기화합니다."""
    log_directory = os.path.join(get_video_directory(), 'logs')
    os.makedirs(log_directory, exist_ok=True)
    
    # 현재 날짜로 로그 파일명 생성 (YYYY-MM-DD.log)
    current_date = datetime.now().strftime('%Y-%m-%d')
    log_file = os.path.join(log_directory, f'{current_date}.log')
    
    # 로거 설정
    logger = logging.getLogger('FFmpegLogger')
    logger.setLevel(logging.ERROR)
    
    # 기존 핸들러 제거 (로거 중복 방지)
    if logger.handlers:
        for handler in logger.handlers:
            logger.removeHandler(handler)
    
    # 파일 핸들러 설정
    file_handler = logging.FileHandler(log_file, encoding='utf-8')
    file_handler.setLevel(logging.ERROR)
    
    # 포맷터 설정
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    
    # 핸들러 추가
    logger.addHandler(file_handler)
    
    return logger

# 녹화 함수
def record_cctv(cctv):
    # 매 녹화 시도마다 로거 재설정 (새로운 날짜 반영을 위해)
    logger = setup_logger()
    rtsp_url = cctv['rtspAddr']
    instl_pos = cctv.get('instlPos', 'default')

    try:
        # 현재 시각 정보 가져오기
        now = datetime.now()
        
        # 연월일(YYYYMMDD) 폴더명
        date_folder = now.strftime('%Y%m%d')
        hour_folder = now.strftime('%H') + "00"
        min = get_minute_by_time()

        top_level_directory = get_video_directory()
        video_directory = os.path.join(top_level_directory, instl_pos, date_folder, hour_folder, min)
        os.makedirs(video_directory, exist_ok=True)
        
        output_filename = os.path.join(video_directory, f'video.mp4')
        remove_existing_file(output_filename)

        print(f"녹화를 시작합니다: {output_filename} from {rtsp_url}")

        # 분(MM)에 따른 비트레이트 설정
        minute = now.strftime('%M')
        bitrate = '300k' if minute in ['00', '30'] else '200k'

        command = [
            "ffmpeg",
            "-protocol_whitelist", "file,http,https,tcp,tls",
            "-i", rtsp_url,
            "-c:v", "libx264",
            "-preset", "ultrafast",
            "-an",
            "-t", "00:00:10",
            "-b:v", bitrate,
            "-vf", "scale=160:160",
            "-r", "10",
            "-y",  # 기존 파일 덮어쓰기
            "-reconnect", "1",  # 연결 재시도 활성화
            "-reconnect_at_eof", "1",  # EOF에서 재연결
            "-reconnect_streamed", "1",  # 스트리밍 재연결
            "-reconnect_delay_max", "5",  # 최대 재연결 지연 시간
            "-timeout", "10000000",  # 타임아웃 설정
            output_filename
        ]

        max_retries = 3
        retry_count = 0

        while retry_count < max_retries:
            try:
                result = subprocess.run(
                    command, 
                    capture_output=True, 
                    text=True, 
                    encoding='utf-8',
                    timeout=30
                )
                
                if result.returncode == 0:
                    print(f"녹화 완료: {output_filename}")
                    return
                else:
                    error_msg = f"FFmpeg 실행 오류 (시도 {retry_count + 1}/{max_retries}): {result.stderr}"
                    print(error_msg)
                    logger.error(f"카메라: {instl_pos}\nURL: {rtsp_url}\n오류: {error_msg}\n")
                    retry_count += 1
                    if retry_count < max_retries:
                        time.sleep(2)
                    
            except subprocess.TimeoutExpired:
                error_msg = f"녹화 시간 초과 (시도 {retry_count + 1}/{max_retries})"
                print(error_msg)
                logger.error(f"카메라: {instl_pos}\nURL: {rtsp_url}\n오류: {error_msg}\n")
                retry_count += 1
                if retry_count < max_retries:
                    time.sleep(2)
            except Exception as e:
                error_msg = f"FFmpeg 실행 중 예외 발생: {str(e)}"
                print(error_msg)
                logger.error(f"카메라: {instl_pos}\nURL: {rtsp_url}\n오류: {error_msg}\n")
                retry_count += 1
                if retry_count < max_retries:
                    time.sleep(2)

        logger.error(f"카메라: {instl_pos}\nURL: {rtsp_url}\n오류: 최대 재시도 횟수 초과\n")
        print(f"최대 재시도 횟수 초과: {output_filename}")

    except Exception as e:
        error_msg = f"녹화 준비 중 예외 발생: {str(e)}"
        print(error_msg)
        logger.error(f"카메라: {instl_pos}\nURL: {rtsp_url}\n오류: {error_msg}\n")

def schedule_recording():
    # 매시 01분, 31분, 46분에 녹화 실행
    for hour in range(0, 24):  # 0시부터 23시까지
        schedule.every().day.at(f"{hour:02}:01").do(run_recording)
        schedule.every().day.at(f"{hour:02}:31").do(run_recording)
        schedule.every().day.at(f"{hour:02}:46").do(run_recording)

    # 새벽 4시 00분에 폴더 정리 작업 추가
    schedule.every().day.at("04:00").do(run_cleanup)


    # 테스트 코드 
    # # 5분마다 녹화 실행
    # schedule.every(5).minutes.do(run_recording)
    
    # # 10분마다 정리작업 실행
    # schedule.every(10).minutes.do(run_cleanup)

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
    # 로깅 설정 초기화
    setup_logger()
    
    # ondayback.py 먼저 실행
    run_ondayback()
    
    # 기존 스케줄링 코드
    schedule_recording()
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()