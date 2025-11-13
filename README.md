# Driving School Management System

A full-stack web application for managing a driving school, including students, instructors, vehicles, courses, lessons, and payments.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [API Documentation](#api-documentation)
- [Documentation](#documentation)
- [Contributing](#contributing)

## 🚀 Quick Start

### For Local Development

1. **Install Prerequisites**
   - Docker Desktop
   - Visual Studio Code (recommended)

2. **Clone Repository**
   ```bash
   git clone https://github.com/Lucian-Adrian/globant-practice-2025
   cd globant-practice-2025
   ```

3. **Start Development Environment**
   ```bash
   docker compose up --build
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - API Docs: http://localhost:8000/api/docs/swagger/
   - Database: localhost:5432

### For Windows Local Deployment

**See [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)** - Deploy on Windows with Docker Desktop (no dual boot needed!)

### For Cloud/Production Deployment

See the **[deployment/](deployment/)** folder for all production deployment resources.

## 💻 Development

### Services

The application consists of three main services:

- **Database**: PostgreSQL 15 (port 5432)
- **Backend**: Django 5 + DRF (port 8000)
- **Frontend**: React + React Admin + Vite (port 3000)

### Environment Configuration

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

The default configuration works out-of-the-box for development.

### API Endpoints

Base URL: `http://localhost:8000/api/`

**Resources** (list, retrieve, create, update):

- Students: `/api/students/`
- Instructors: `/api/instructors/`
- Vehicles: `/api/vehicles/`
- Courses: `/api/courses/`
- Enrollments: `/api/enrollments/`
- Lessons: `/api/lessons/`
- Payments: `/api/payments/`

**API Documentation**:

- OpenAPI Schema: `http://localhost:8000/api/schema/`
- Swagger UI: `http://localhost:8000/api/docs/swagger/`
- ReDoc UI: `http://localhost:8000/api/docs/redoc/`
- Enums Metadata: `http://localhost:8000/api/meta/enums/`

### Common Commands

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild after changes
docker compose up --build

# Execute commands in backend
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py shell

# Access database
docker compose exec db psql -U drivingschool -d drivingschool
```

## 🌐 Production Deployment

### 🪟 Windows Local Deployment (Recommended for Beginners)

**[WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)** - Complete guide for deploying on Windows
- No dual boot required - use Docker Desktop!
- Port forwarding setup
- Dynamic DNS configuration
- SSL certificate setup
- **Estimated cost**: $10-20/month (electricity)

### ☁️ Cloud & Production Deployment

All production deployment resources are in the **[deployment/](deployment/)** folder:

**Quick Start:**
- 📘 [deployment/docs/PRODUCTION_QUICKSTART.md](deployment/docs/PRODUCTION_QUICKSTART.md) - 5-minute setup
- 📘 [deployment/docs/QUICK_DEPLOYMENT_GUIDE.md](deployment/docs/QUICK_DEPLOYMENT_GUIDE.md) - Decision tree

**Cloud Platforms:**
- ✅ AWS, DigitalOcean, Azure - [deployment/docs/CLOUD_DEPLOYMENT.md](deployment/docs/CLOUD_DEPLOYMENT.md)
- ✅ Google Cloud Platform - [deployment/docs/GCP_DEPLOYMENT.md](deployment/docs/GCP_DEPLOYMENT.md)

**Self-Hosted:**
- ✅ Ubuntu/Linux Server - [deployment/docs/HOME_SERVER_DEPLOYMENT.md](deployment/docs/HOME_SERVER_DEPLOYMENT.md)

**Resources:**
- 🐳 Docker configs - [deployment/docker/](deployment/docker/)
- 🔧 Scripts - [deployment/scripts/](deployment/scripts/)
- 📋 Checklist - [deployment/docs/DEPLOYMENT_CHECKLIST.md](deployment/docs/DEPLOYMENT_CHECKLIST.md)
- 🔄 CI/CD - [deployment/docs/CI_CD_SETUP.md](deployment/docs/CI_CD_SETUP.md)

## 📚 Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file - overview and quick start |
| [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) | Windows deployment guide (recommended for local) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributing guidelines and workflow |
| [CHANGELOG.md](CHANGELOG.md) | Version history and changes |

### Production Deployment Documentation

All deployment guides are in the **[deployment/](deployment/)** folder:

| Document | Description |
|----------|-------------|
| [deployment/README.md](deployment/README.md) | Deployment resources overview |
| [deployment/docs/PRODUCTION_QUICKSTART.md](deployment/docs/PRODUCTION_QUICKSTART.md) | 5-minute production setup |
| [deployment/docs/QUICK_DEPLOYMENT_GUIDE.md](deployment/docs/QUICK_DEPLOYMENT_GUIDE.md) | Platform selection guide |
| [deployment/docs/CLOUD_DEPLOYMENT.md](deployment/docs/CLOUD_DEPLOYMENT.md) | AWS, DigitalOcean, Azure guides |
| [deployment/docs/GCP_DEPLOYMENT.md](deployment/docs/GCP_DEPLOYMENT.md) | Google Cloud Platform guide |
| [deployment/docs/HOME_SERVER_DEPLOYMENT.md](deployment/docs/HOME_SERVER_DEPLOYMENT.md) | Ubuntu/Linux self-hosted |
| [deployment/docs/DEPLOYMENT_CHECKLIST.md](deployment/docs/DEPLOYMENT_CHECKLIST.md) | Pre-deployment checklist |
| [deployment/docs/CI_CD_SETUP.md](deployment/docs/CI_CD_SETUP.md) | GitHub Actions CI/CD |
| [deployment/docs/DEPLOYMENT.md](deployment/docs/DEPLOYMENT.md) | Docker Compose reference |

### Technical Documentation

- [CLASSES_IMPLEMENTATION.md](docs/CLASSES_IMPLEMENTATION.md) - Backend models
- [REUSABLE_COMPONENTS.md](docs/REUSABLE_COMPONENTS.md) - Frontend components
- [api-docs-swagger.md](docs/api-docs-swagger.md) - API documentation

## 🤝 Contributing

We follow a feature branch workflow. See [CONTRIBUTING.md](CONTRIBUTING.md) for:

- Git workflow and branch naming
- Commit message guidelines
- Pull request process
- Code style standards
- Testing requirements

### Development Workflow

1. Create feature branch from `main`
2. Make changes and commit regularly
3. Push branch and create Pull Request
4. Address review feedback
5. Merge to `main` after approval

### Task Management

The project uses a phase-based task system. Reference task IDs (e.g., `P0-STR-01`) in commits and PRs for traceability.

## 🔒 Security

- Never commit `.env` or `.env.production` files
- Use strong passwords in production
- Enable CSRF protection (`DISABLE_CSRF=0`)
- Configure SSL/HTTPS for production
- Keep dependencies updated
- Regular security audits

## 📦 Technology Stack

### Backend
- Python 3.11
- Django 5
- Django REST Framework
- PostgreSQL 15
- Gunicorn (production)

### Frontend
- React 18
- React Admin 4
- Vite 5
- Material-UI
- i18next (internationalization)

### Infrastructure
- Docker & Docker Compose
- Nginx (reverse proxy)
- Redis (caching)
- Let's Encrypt (SSL)

## 📝 Default Configuration

- **Business Timezone**: Europe/Chisinau
- **Currency**: MDL (Moldovan Leu)
- **Phone Country Code**: +373 (Moldova)

## 🛠️ Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker ps

# View logs
docker compose logs

# Clean slate
docker compose down -v
docker compose up --build
```

### Database connection issues

```bash
# Check database health
docker compose exec db pg_isready -U drivingschool

# Reset database
docker compose down -v
docker volume rm globant-practice-2025_postgres15_data
docker compose up
```

### Port conflicts

If ports 3000, 8000, or 5432 are already in use:
1. Stop the conflicting service
2. Or modify ports in `docker-compose.yml`

## 📞 Support

- Check documentation first
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development questions
- Open an issue on GitHub for bugs or feature requests
- Include logs and steps to reproduce when reporting issues

## 📄 License

[Add your license here]

## 👥 Authors

[Add authors/contributors here]

---

**Ready to deploy?** Start with [PRODUCTION_QUICKSTART.md](PRODUCTION_QUICKSTART.md)!
