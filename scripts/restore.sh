#!/bin/bash
# Restore script for PostgreSQL database
# Usage: ./scripts/restore.sh <backup_file.sql.gz>

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Example: $0 ./backups/db_backup_20250113_120000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Load environment variables
if [ -f .env.production ]; then
    source .env.production
else
    echo "Error: .env.production file not found"
    exit 1
fi

CONTAINER_NAME="driving-school-db"

echo "WARNING: This will replace the current database with the backup!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "Decompressing backup..."
gunzip -c "${BACKUP_FILE}" > /tmp/restore.sql

echo "Restoring database..."
docker exec -i ${CONTAINER_NAME} psql -U ${POSTGRES_USER} ${POSTGRES_DB} < /tmp/restore.sql

rm /tmp/restore.sql

echo "Database restore completed successfully"
