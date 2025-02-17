# Base Python image
FROM python:3.11.3-slim

# Set the working directory inside the container
WORKDIR /app

# Upgrade pip to the latest version
RUN pip install --no-cache-dir --upgrade pip

# Install necessary system dependencies for OpenCV GUI features
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx libglib2.0-0 libgtk2.0-dev pkg-config && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements.txt for dependencies
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire application code into the container
COPY . .

# Expose the Flask application's port
EXPOSE 5000

# Set the default command to run the application
CMD ["python", "opencv_run.py"]

# Default to bash instead of starting the app
# CMD ["/bin/bash"]
