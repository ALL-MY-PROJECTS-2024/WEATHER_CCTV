import os
from pathlib import Path

def check_folders():
    video_path = Path("video")
    incomplete_folders = []
    expected_hours = [f"{str(h).zfill(2)}00" for h in range(24)]  # 0000 to 2300
    
    # video 폴더 내의 모든 문자열 폴더 확인
    for string_folder in video_path.iterdir():
        if not string_folder.is_dir():
            continue
            
        # YYYYMMDD 폴더들 확인
        for date_folder in string_folder.iterdir():
            if not date_folder.is_dir():
                continue
                
            # 해당 날짜 폴더의 시간 폴더들 수집
            existing_hours = set()
            for hour_folder in date_folder.iterdir():
                if hour_folder.is_dir():
                    existing_hours.add(hour_folder.name)
            
            # 누락된 시간대가 있는지 확인
            if set(expected_hours) - existing_hours:
                if string_folder.name not in incomplete_folders:
                    incomplete_folders.append(string_folder.name)
                break
    
    return incomplete_folders

if __name__ == "__main__":
    try:
        incomplete = check_folders()
        if incomplete:
            print("다음 폴더들이 불완전한 시간대를 가지고 있습니다:")
            for folder in incomplete:
                print(f"- {folder}")
        else:
            print("모든 폴더가 완전한 시간대를 가지고 있습니다.")
    except Exception as e:
        print(f"오류 발생: {str(e)}")