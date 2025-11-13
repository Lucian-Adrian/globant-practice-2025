# Docker Compose Deployment Guide

This guide explains how to deploy the Driving School Management System using Docker Compose.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (or Docker Engine + Docker Compose)
  - Docker version 20.10 or higher
  - Docker Compose v2 or higher
- **Git** (to clone the repository)

### Verify Installation

```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker compose version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env` file contains all necessary configuration for local development. For production deployment, you should update these values:

**Important variables to change for production:**
- `DJANGO_SECRET_KEY` - Generate a secure random key
- `DJANGO_DEBUG` - Set to `0` for production
- `POSTGRES_PASSWORD` - Use a strong password
- `DJANGO_ALLOWED_HOSTS` - Set to your domain(s)

### 3. Start the Services

```bash
docker compose up --build
```

This command will:
- Build Docker images for backend and frontend
- Start PostgreSQL database
- Run database migrations
- Start the Django backend server
- Start the React frontend development server

### 4. Access the Application

Once all services are running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **API Documentation (Swagger)**: http://localhost:8000/api/docs/swagger/
- **API Documentation (ReDoc)**: http://localhost:8000/api/docs/redoc/
- **API Schema**: http://localhost:8000/api/schema/
- **Database**: localhost:5432

## Services Overview

The Docker Compose setup includes three services:

### 1. Database (db)
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Volume**: `postgres15_data` for data persistence
- **Health Check**: Ensures database is ready before starting dependent services

### 2. Backend (backend)
- **Base Image**: Python 3.11 Slim
- **Port**: 8000
- **Framework**: Django 5 + Django REST Framework
- **Features**:
  - Automatic database migrations on startup
  - Optional superuser creation
  - Optional static file collection
  - Health check waiting for database

### 3. Frontend (frontend)
- **Base Image**: Node 18 Alpine
- **Port**: 3000
- **Framework**: React + Vite + React Admin
- **Features**:
  - Hot module reloading
  - Automatic proxy to backend API

## Environment Variables

### Database Configuration

```bash
POSTGRES_DB=drivingschool          # Database name
POSTGRES_USER=drivingschool        # Database user
POSTGRES_PASSWORD=drivingschoolpwd # Database password (change for production!)
DB_HOST=db                         # Database host (service name in docker-compose)
DB_PORT=5432                       # Database port
```

### Django Configuration

```bash
DJANGO_SECRET_KEY=insecure-dev-key-change-in-production  # Django secret key
DJANGO_DEBUG=1                     # Debug mode (0 for production)
DJANGO_SETTINGS_MODULE=project.settings
DJANGO_ALLOWED_HOSTS=              # Comma-separated list of allowed hosts
```

### Optional Superuser Creation

Uncomment these variables to automatically create a superuser on first startup:

```bash
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=adminpass
DJANGO_SUPERUSER_EMAIL=admin@example.com
```

### Static Files

```bash
DISABLE_COLLECTSTATIC=1           # Skip collectstatic (dev)
DJANGO_COLLECTSTATIC=0            # Run collectstatic (production)
```

### JWT Authentication

```bash
JWT_ACCESS_MINUTES=30             # Access token lifetime
JWT_REFRESH_DAYS=7                # Refresh token lifetime
```

### Business Configuration

```bash
BUSINESS_TZ=Europe/Chisinau       # Business timezone
FRONTEND_ORIGIN=http://localhost:3000
```

### Development Settings

```bash
DISABLE_CSRF=1                    # Disable CSRF for API development
CHOKIDAR_USEPOLLING=true         # Enable polling for file watching
VITE_API_BASE_URL=http://backend:8000
```

## Common Commands

### Start Services

```bash
# Start in foreground (see logs)
docker compose up

# Start in background (detached mode)
docker compose up -d

# Rebuild images and start
docker compose up --build
```

### Stop Services

```bash
# Stop services (keep containers)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (deletes database data!)
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs

# Follow logs
docker compose logs -f

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs db

# Last N lines
docker compose logs --tail=100
```

### Execute Commands in Containers

```bash
# Access backend shell
docker compose exec backend bash

# Run Django management commands
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell

# Access frontend shell
docker compose exec frontend sh

# Access database shell
docker compose exec db psql -U drivingschool -d drivingschool
```

### Rebuild Specific Service

```bash
docker compose up --build backend
docker compose up --build frontend
```

## Troubleshooting

### Database Connection Issues

If the backend cannot connect to the database:

1. Check database is running:
   ```bash
   docker compose ps db
   ```

2. Check database logs:
   ```bash
   docker compose logs db
   ```

3. Verify environment variables:
   ```bash
   docker compose config
   ```

### Port Already in Use

If you get "port already allocated" errors:

1. Check what's using the port:
   ```bash
   # Linux/Mac
   lsof -i :3000
   lsof -i :8000
   lsof -i :5432
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. Either stop the conflicting service or change ports in `docker-compose.yml`

### Frontend Cannot Connect to Backend

If frontend shows connection errors:

1. Verify backend is running:
   ```bash
   docker compose ps backend
   docker compose logs backend
   ```

2. Check `VITE_API_BASE_URL` is set to `http://backend:8000` (not `localhost`)

3. Verify CORS settings in backend settings.py

### Clean Slate / Reset Everything

If things are completely broken:

```bash
# Stop everything
docker compose down -v

# Remove all containers, networks, and volumes
docker system prune -a --volumes

# Rebuild from scratch
docker compose up --build
```

### Migration Issues

If database migrations fail:

```bash
# Check migration status
docker compose exec backend python manage.py showmigrations

# Try running migrations manually
docker compose exec backend python manage.py migrate

# Create new migrations (if model changes were made)
docker compose exec backend python manage.py makemigrations
```

## Production Deployment

For production deployment, make these changes:

### 1. Update Environment Variables

```bash
# Generate a secure secret key
DJANGO_SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')

# Disable debug mode
DJANGO_DEBUG=0

# Set allowed hosts
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Use strong database password
POSTGRES_PASSWORD=your-secure-password-here

# Enable collectstatic
DISABLE_COLLECTSTATIC=0
DJANGO_COLLECTSTATIC=1

# Update frontend origin
FRONTEND_ORIGIN=https://yourdomain.com
```

### 2. Use Production Docker Compose

Create a `docker-compose.prod.yml`:

```yaml
services:
  backend:
    command: gunicorn project.wsgi:application --bind 0.0.0.0:8000 --workers 4
    environment:
      DJANGO_DEBUG: 0
      
  frontend:
    command: ["npm", "run", "build"]
    # Add nginx service to serve built files
```

### 3. Security Considerations

- **Never commit `.env` file** - it's already in `.gitignore`
- Use **secrets management** for production (AWS Secrets Manager, HashiCorp Vault, etc.)
- Enable **HTTPS** with proper SSL certificates
- Configure **firewall rules** to restrict access
- Use **container security scanning** tools
- Regularly **update dependencies** and base images

### 4. Backup Strategy

Set up regular database backups:

```bash
# Manual backup
docker compose exec db pg_dump -U drivingschool drivingschool > backup.sql

# Restore from backup
docker compose exec -T db psql -U drivingschool drivingschool < backup.sql
```

## Development Workflow

### Making Changes

1. Code changes in `backend/` are reflected immediately (Django auto-reload)
2. Code changes in `frontend/` trigger hot module reloading (Vite HMR)
3. No need to rebuild containers for code changes

### Installing Dependencies

**Backend (Python):**
```bash
# Add to requirements.txt
docker compose exec backend pip install new-package
docker compose exec backend pip freeze > requirements.txt

# Rebuild to persist
docker compose up --build backend
```

**Frontend (Node):**
```bash
# Update package.json
docker compose exec frontend npm install new-package

# Rebuild to persist
docker compose up --build frontend
```

### Database Changes

```bash
# Make model changes in backend/school/models.py
# Create migrations
docker compose exec backend python manage.py makemigrations

# Apply migrations
docker compose exec backend python manage.py migrate
```

## Monitoring

### Health Checks

The setup includes health checks:

- Database: `pg_isready` command
- Backend: Depends on database health

View health status:
```bash
docker compose ps
```

### Resource Usage

Monitor container resource usage:
```bash
docker stats
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Documentation](https://docs.djangoproject.com/)
- [React Admin Documentation](https://marmelab.com/react-admin/)

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review [CONTRIBUTING.md](CONTRIBUTING.md)
3. Check Docker Compose logs
4. Open an issue on GitHub with:
   - Error messages
   - Docker Compose logs
   - Environment details (OS, Docker version)
   - Steps to reproduce

---

**Happy Deploying! 🚀**
