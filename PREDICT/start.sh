#!/bin/bash

# 스크립트 실행 중 오류 발생시 즉시 중단
set -e

# 실행 시작 로그
echo "=== Starting Application ==="

# ondayback.py 실행
echo "Starting ondayback.py..."
python3 ondayback.py

# gen_video.py와 server.py를 백그라운드로 실행
echo "Starting gen_video.py..."
python3 gen_video.py &
GEN_PID=$!

echo "Starting server.py..."
python3 server.py &
SERVER_PID=$!

# 프로세스 종료 처리
trap 'kill $GEN_PID $SERVER_PID; exit' SIGTERM SIGINT

# 모든 백그라운드 프로세스가 종료될 때까지 대기
wait

# 스크립트가 종료되기 전에 실행
echo "=== Application stopped ==="