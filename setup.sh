#!/bin/bash

# OS 감지
case "$(uname -s)" in
    Linux*)     
        echo "Linux 환경 감지"
        echo "VIDEO_VOLUME=/home/user/video" > .env
        ;;
    MINGW*|CYGWIN*|MSYS*)     
        echo "Windows 환경 감지"
        echo "VIDEO_VOLUME=c:\video" > .env
        ;;
    *)          
        echo "알 수 없는 운영체제"
        exit 1
        ;;
esac

# Docker Compose 실행
docker-compose up -d