FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Normalize potential CRLF endings in scripts (safe if file not present)
RUN find . -type f -name "*.sh" -exec sed -i 's/\r$//' {} + || true

EXPOSE 8000

# Default command now provided via docker-compose for startup sequence
