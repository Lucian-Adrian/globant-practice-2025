#!/bin/bash
# Backup script for PostgreSQL database
# Usage: ./scripts/backup.sh

set -e

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
else
    echo "Error: .env.production file not found"
    exit 1
fi

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"
CONTAINER_NAME="driving-school-db"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo "Starting database backup..."
echo "Backup file: ${BACKUP_FILE}"

# Perform backup
docker exec -t ${CONTAINER_NAME} pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > "${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_FILE}"
echo "Backup completed: ${BACKUP_FILE}.gz"

# Remove backups older than 30 days
find "${BACKUP_DIR}" -name "db_backup_*.sql.gz" -mtime +30 -delete
echo "Old backups cleaned up (kept last 30 days)"

# Optional: Upload to S3 or cloud storage
# aws s3 cp "${BACKUP_FILE}.gz" s3://your-bucket/backups/

echo "Backup process finished successfully"
