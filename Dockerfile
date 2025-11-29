FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY backend/ .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app

# Create startup script
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'PORT=${PORT:-8000}' >> /app/start.sh && \
    echo 'python manage.py migrate --noinput' >> /app/start.sh && \
    echo 'gunicorn project.wsgi:application --bind 0.0.0.0:$PORT' >> /app/start.sh && \
    chmod +x /app/start.sh

USER app

# Expose port
EXPOSE 8000

# Run the application
CMD ["/app/start.sh"]