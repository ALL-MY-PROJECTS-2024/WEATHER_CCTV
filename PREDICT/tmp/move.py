import os
import platform
import shutil
from pathlib import Path
import sys


# remove.py 모듈에서 cleanup_old_folders 함수를 가져옵니다.
from remove import cleanup_old_folders

# move.py 모듈에서 main 함수를 가져옵니다.
import move





def get_source_path():
    """
    소스 'video' 폴더의 경로를 반환합니다.
    Windows에서는 'C:\video', Linux에서는 '/video'를 소스로 설정합니다.
    """
    current_os = platform.system().lower()
    if current_os == 'windows':
        return Path(r"C:\video")
    elif current_os == 'linux':
        return Path("/video")
    else:
        print(f"[오류] 지원되지 않는 운영체제: {platform.system()}")
        return None

def get_destination_path():
    """
    현재 스크립트가 실행되는 디렉토리의 상위 디렉토리에 있는 'video' 폴더 경로를 반환합니다.
    """
    script_dir = Path(__file__).resolve().parent
    parent_dir = script_dir.parent
    dest_video = parent_dir / "CCTV_WEATHER_PROJECT_FN/public/video"
    return dest_video

def copy_folders(source: Path, destination: Path):
    """
    소스 디렉토리의 모든 파일과 하위 폴더를 대상 디렉토리로 복사합니다.
    기존 파일과 폴더는 덮어씌웁니다.
    """
    try:
        # shutil.copytree의 dirs_exist_ok 파라미터는 Python 3.8 이상에서 사용 가능합니다.
        shutil.copytree(source, destination, dirs_exist_ok=True)
        print(f"[복사 완료] '{source}'의 모든 내용을 '{destination}'로 복사했습니다.")
    except TypeError:
        # Python 버전이 3.8 미만인 경우, dirs_exist_ok를 사용할 수 없으므로 대체 로직 사용
        print("[경고] Python 3.8 이상에서만 'dirs_exist_ok' 옵션을 사용할 수 있습니다.")
        print("대체 로직을 사용하여 폴더를 복사합니다.")
        for root, dirs, files in os.walk(source):
            rel_path = Path(root).relative_to(source)
            dest_dir = destination / rel_path
            dest_dir.mkdir(parents=True, exist_ok=True)
            for file in files:
                src_file = Path(root) / file
                dest_file = dest_dir / file
                try:
                    shutil.copy2(src_file, dest_file)
                    print(f"[복사] '{src_file}' -> '{dest_file}'")
                except Exception as e:
                    print(f"[오류] '{src_file}' 복사 실패: {e}")
    except Exception as e:
        print(f"[오류] 폴더 복사 실패: {e}")
        sys.exit(1)

def main():
    source_path = get_source_path()
    if source_path is None:
        print("소스 경로를 설정할 수 없어 스크립트를 종료합니다.")
        sys.exit(1)

    destination_path = get_destination_path()

    print(f"소스 경로: {source_path}")
    print(f"대상 경로: {destination_path}")

    # 소스 경로 존재 여부 확인
    if not source_path.exists() or not source_path.is_dir():
        print(f"[오류] 소스 디렉토리 '{source_path}'가 존재하지 않거나 디렉토리가 아닙니다.")
        sys.exit(1)

    # 대상 경로가 없으면 생성
    if not destination_path.exists():
        try:
            destination_path.mkdir(parents=True)
            print(f"[생성] 대상 디렉토리 '{destination_path}'를 생성했습니다.")
        except Exception as e:
            print(f"[오류] 대상 디렉토리 '{destination_path}' 생성 실패: {e}")
            sys.exit(1)

    # 폴더 복사
    copy_folders(source_path, destination_path)

    print("복사 작업이 완료되었습니다.")

if __name__ == "__main__":
    main()
