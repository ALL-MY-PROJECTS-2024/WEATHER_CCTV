# Base Python image
FROM python:3.11.3-slim

# Set the working directory inside the container
WORKDIR /app

# Upgrade pip to the latest version
RUN pip install --no-cache-dir --upgrade pip

# Install necessary system dependencies for OpenCV GUI features, FFmpeg, tzdata, and 7z
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx libglib2.0-0 libgtk2.0-dev pkg-config ffmpeg tzdata dos2unix p7zip-full && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set the timezone to Asia/Seoul
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy requirements.txt for dependencies
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application code into the container
COPY . .

# Copy video_origin to video directory
#RUN echo "=== Checking video_origin directory ===" && \
#    ls -lh video_origin && \
#   mkdir -p video && \
#    echo "=== Copying video_origin to video ===" && \
#   cp -r video_origin/* video/ && \
#    echo "=== Checking video directory contents ===" && \
#    ls -lh video && \
#    echo "=== Copy completed ==="


# Set the default command to run the application
CMD ["bash", "-c", "python3 gen_video.py & python3 server.py & wait"]
