import os
import re
import shutil
from datetime import datetime, timedelta

def rename_folders_to_yesterday(base_path):
    """
    base_path 아래의 폴더들 중 'YYYYMMDD' 형태의 폴더명을 찾아
    오늘 날짜를 기준으로 하루 전 날짜로 변경하는 함수
    """
    # 오늘 날짜 구하기
    today = datetime.now()
    yesterday = today - timedelta(days=1)
    yesterday_str = yesterday.strftime("%Y%m%d")

    for root, dirs, files in os.walk(base_path):
        for dir_name in dirs:
            # 폴더명이 8자리 숫자인지 정규식으로 확인
            if re.match(r'^\d{8}$', dir_name):
                try:
                    # 현재 폴더명을 datetime으로 파싱 시도
                    old_date = datetime.strptime(dir_name, "%Y%m%d")
                    new_date_str = yesterday_str  # 하루 전 날짜를 새 이름으로 설정

                    old_path = os.path.join(root, dir_name)
                    new_path = os.path.join(root, new_date_str)

                    # 동일한 이름일 경우 변경하지 않음
                    if old_path == new_path:
                        print(f"폴더 '{old_path}'는 이미 어제 날짜로 되어 있습니다.")
                        continue

                    # 새로운 경로가 이미 존재하는지 확인하고, 존재할 경우 고유한 이름 생성
                    counter = 1
                    while os.path.exists(new_path):
                        new_path = os.path.join(root, f"{new_date_str}_{counter}")
                        counter += 1

                    # shutil.move를 사용하여 폴더 이동
                    shutil.move(old_path, new_path)
                    print(f"폴더 '{old_path}'를 '{new_path}'로 변경했습니다.")
                except ValueError as ve:
                    # 날짜 파싱 중 ValueError 등이 발생할 경우 건너뜀
                    print(f"폴더 '{dir_name}'의 날짜 변환 실패: {ve}")
                except OSError as ose:
                    # 파일 시스템 관련 예외 발생 시 출력
                    print(f"폴더 '{old_path}'를 '{new_path}'로 변경 실패: {ose}")
                except Exception as e:
                    # 기타 예상치 못한 예외 처리
                    print(f"폴더 '{old_path}'를 '{new_path}'로 변경 중 오류 발생: {e}")

if __name__ == "__main__":
    base_path = r"./video"  # 변경할 루트 경로
    rename_folders_to_yesterday(base_path)
