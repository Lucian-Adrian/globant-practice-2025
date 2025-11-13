#!/bin/bash
# Production deployment script
# Usage: ./scripts/deploy.sh

set -e

echo "==================================="
echo "Production Deployment Script"
echo "==================================="

# Check if production env file exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found"
    echo "Please create it from .env.production.example"
    exit 1
fi

# Pull latest changes
echo "Pulling latest code..."
git pull origin main

# Build and start services
echo "Building Docker images..."
docker compose -f docker-compose.prod.yml build

echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend python manage.py migrate

# Collect static files
echo "Collecting static files..."
docker compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

# Create backup before deployment
echo "Creating pre-deployment backup..."
./scripts/backup.sh

# Check services health
echo "Checking services health..."
docker compose -f docker-compose.prod.yml ps

echo "==================================="
echo "Deployment completed successfully!"
echo "==================================="
echo ""
echo "Services are running:"
echo "- Frontend: http://localhost"
echo "- Backend API: http://localhost/api/"
echo "- Admin: http://localhost/admin/"
echo ""
echo "To view logs: docker compose -f docker-compose.prod.yml logs -f"
