FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Normalize line endings and ensure entrypoint script is executable (Windows dev safety)
RUN sed -i 's/\r$//' /app/entrypoint.sh \
	&& chmod +x /app/entrypoint.sh

EXPOSE 8000

# Default command (can be overridden in docker-compose)
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
