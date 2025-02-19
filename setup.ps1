# OS 감지
if ($IsWindows) {
    Write-Host "Windows 환경 감지"
    "VIDEO_VOLUME=c:\video" | Out-File -FilePath .env -Encoding UTF8
}
elseif ($IsLinux) {
    Write-Host "Linux 환경 감지"
    "VIDEO_VOLUME=/home/user/video" | Out-File -FilePath .env -Encoding UTF8
}
else {
    Write-Host "알 수 없는 운영체제"
    exit 1
}

# Docker Compose 실행
docker-compose up -d