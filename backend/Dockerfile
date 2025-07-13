# Base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/back

# Set working directory
WORKDIR /app

# Install system dependencies (for Whisper, audio, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire app
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Run the app with live reload (good for dev; remove `--reload` in production)
CMD ["uvicorn", "back.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
