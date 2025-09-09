import os, time, sys
import psycopg2

host = os.getenv('DB_HOST','db')
port = int(os.getenv('DB_PORT','5432'))
db = os.getenv('POSTGRES_DB','postgres')
user = os.getenv('POSTGRES_USER','postgres')
pwd = os.getenv('POSTGRES_PASSWORD','')

retries = int(os.getenv('DB_WAIT_RETRIES','60'))
delay = float(os.getenv('DB_WAIT_DELAY','2'))

for i in range(retries):
    try:
        conn = psycopg2.connect(dbname=db, user=user, password=pwd, host=host, port=port)
        conn.close()
        print(f"[wait_for_db] Database reachable after {i+1} attempt(s).")
        break
    except Exception as e:
        print(f"[wait_for_db] Attempt {i+1}/{retries} failed: {e}")
        time.sleep(delay)
else:
    print("[wait_for_db] Could not connect to database; exiting.")
    sys.exit(1)