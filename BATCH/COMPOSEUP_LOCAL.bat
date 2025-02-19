@echo off
echo START DIR: %CD%
cd /d "%~dp0.."
echo CHANGE DIR: %CD%
docker compose -f docker-compose-localWindow.yml up
pause