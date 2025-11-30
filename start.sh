#!/bin/bash
set -e

echo "[startup] Running migrations..."
python manage.py migrate --noinput

if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "[startup] Ensuring superuser exists..."
  python manage.py createsuperuser --username "$DJANGO_SUPERUSER_USERNAME" --email "${DJANGO_SUPERUSER_EMAIL:-admin@example.com}" --noinput 2>/dev/null || echo "[startup] Superuser already exists or creation failed"
  # Set the password explicitly
  python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
try:
    user = User.objects.get(username=username)
    user.set_password(password)
    user.save()
    print(f'[startup] Password set for user {username}')
except User.DoesNotExist:
    print(f'[startup] User {username} not found')
"
fi

echo "[startup] Starting gunicorn on port ${PORT:-8000}..."
exec gunicorn project.wsgi:application --bind 0.0.0.0:${PORT:-8000}
