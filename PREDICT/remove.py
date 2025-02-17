import os
import re
import platform
import shutil
from datetime import datetime, timedelta

def remove_old_date_folders(base_path):
    """
    base_path 아래 하위 디렉토리 중 YYYYMMDD 형태의 디렉토리를 찾고,
    현재 날짜 기준 2일 이상 지난 날짜라면 해당 디렉토리를 삭제한다.
    """
    # 현재 날짜
    today = datetime.now()
    
    for root, dirs, files in os.walk(base_path):
        # os.walk는 재귀적으로 하위 폴더를 탐색
        for dir_name in dirs:
            # 폴더명이 8자리 숫자(YYYYMMDD)인지 확인
            if re.match(r'^\d{8}$', dir_name):
                folder_date_str = dir_name
                try:
                    # 문자열(YYYYMMDD)을 날짜 객체로 변환
                    folder_date = datetime.strptime(folder_date_str, "%Y%m%d")
                    
                    # (오늘 - 폴더날짜).days 로 일수를 계산
                    day_diff = (today - folder_date).days
                    
                    # 2일이 지났으면 삭제
                    if day_diff >= 2:
                        folder_path = os.path.join(root, dir_name)
                        shutil.rmtree(folder_path)  # 디렉토리 및 모든 하위 파일 삭제
                        print(f"[삭제] {folder_path} (폴더 날짜: {folder_date_str}, 현재와 {day_diff}일 차이)")
                except ValueError as ve:
                    # 날짜 형식 변환에 실패한 경우
                    print(f"[오류] '{dir_name}' 날짜 파싱 실패: {ve}")
                except OSError as ose:
                    # 파일/디렉토리 삭제 등에서 발생 가능한 예외
                    print(f"[오류] '{dir_name}' 삭제 실패: {ose}")

def get_base_path():
    """
    현재 운영체제를 확인하고, 해당 운영체제에 맞는 base_path를 반환한다.
    """
    current_os = platform.system().lower()
    if current_os == 'windows':
        # Windows 운영체제일 경우
        # 원하는 Windows 경로로 설정하세요
        return r"C:\video"
    elif current_os == 'linux':
        # Linux 운영체제일 경우
        # 원하는 Linux 경로로 설정하세요
        return "/video"
    else:
        # 지원하지 않는 운영체제일 경우
        print(f"지원되지 않는 운영체제: {platform.system()}")
        return None

def cleanup_old_folders():
    base_path = get_base_path()
    if base_path:
        if platform.system().lower() in ['linux', 'windows']:
            remove_old_date_folders(base_path)
        else:
            print("지원되지 않는 운영체제이므로, 스크립트를 실행하지 않습니다.")
    else:
        print("적절한 base_path를 설정할 수 없어 스크립트를 종료합니다.")

if __name__ == "__main__":
    cleanup_old_folders()
