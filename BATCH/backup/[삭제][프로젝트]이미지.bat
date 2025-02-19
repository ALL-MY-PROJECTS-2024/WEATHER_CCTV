@echo off
setlocal enabledelayedexpansion

echo Stopping all running containers from this project...
docker compose -f docker-compose-localWindow.yml down

echo Removing project specific images...
docker rmi weather_cctv-predict:latest
docker rmi weather_cctv-yolo:latest
docker rmi weather_cctv-redis:latest
docker rmi weather_cctv-mysql8:latest
docker rmi weather_cctv-auth:latest
docker rmi weather_cctv-fn:latest

echo Cleanup completed.
pause