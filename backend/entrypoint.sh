echo "[entrypoint] Waiting for database $DB_HOST:$DB_PORT..."
#!/bin/sh
set -e

echo "[entrypoint] Waiting for database $DB_HOST:$DB_PORT..."
python <<'PY'
import time, os, sys
import psycopg2

host = os.getenv('DB_HOST','db')
port = int(os.getenv('DB_PORT','5432'))
db = os.getenv('POSTGRES_DB','postgres')
user = os.getenv('POSTGRES_USER','postgres')
pwd = os.getenv('POSTGRES_PASSWORD','')

for i in range(60):
    try:
        conn = psycopg2.connect(dbname=db, user=user, password=pwd, host=host, port=port)
        conn.close()
        print("[entrypoint] Database is reachable.")
        break
    except Exception as e:
        print(f"[entrypoint] DB not ready ({i+1}/60): {e}")
        time.sleep(2)
else:
    print("[entrypoint] Could not connect to database; exiting.")
    sys.exit(1)
PY

echo "[entrypoint] Running migrations..."
python manage.py migrate --noinput

if [ "$DJANGO_COLLECTSTATIC" = "1" ]; then
  echo "[entrypoint] Collecting static files..."
  python manage.py collectstatic --noinput
  echo "[entrypoint] Static collection complete."
fi

if [ "$DJANGO_SUPERUSER_USERNAME" ] && [ "$DJANGO_SUPERUSER_PASSWORD" ]; then
  echo "[entrypoint] Ensuring superuser $DJANGO_SUPERUSER_USERNAME exists..."
  python manage.py shell -c "from django.contrib.auth import get_user_model;import os;U=get_user_model();u=os.environ['DJANGO_SUPERUSER_USERNAME'];(U.objects.filter(username=u).exists()) or U.objects.create_superuser(u, os.environ.get('DJANGO_SUPERUSER_EMAIL','admin@example.com'), os.environ['DJANGO_SUPERUSER_PASSWORD'])" || echo "[entrypoint] Superuser creation skipped (maybe already exists)."
fi

echo "[entrypoint] Starting app: $@"
exec "$@"