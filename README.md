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

### For Production Deployment

See [PRODUCTION_QUICKSTART.md](PRODUCTION_QUICKSTART.md) for a 5-minute production setup guide.

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

For production deployment:

- **Quick Start**: [PRODUCTION_QUICKSTART.md](PRODUCTION_QUICKSTART.md) - 5-minute setup
- **Cloud Deployment**: [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md) - AWS, DigitalOcean, Azure
- **Google Cloud Platform**: [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md) - Detailed GCP guide
- **Home Server (Ubuntu/Linux)**: [HOME_SERVER_DEPLOYMENT.md](HOME_SERVER_DEPLOYMENT.md) - Port forwarding guide
- **Windows Home Server**: [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) - No dual boot needed!
- **CI/CD Setup**: [CI_CD_SETUP.md](CI_CD_SETUP.md) - Automated deployments

### Deployment Options

**Cloud Platforms:**
- ✅ AWS EC2 / ECS - [Guide](CLOUD_DEPLOYMENT.md#aws-deployment)
- ✅ DigitalOcean Droplets - [Guide](CLOUD_DEPLOYMENT.md#digitalocean-deployment)
- ✅ Azure Container Instances - [Guide](CLOUD_DEPLOYMENT.md#azure-deployment)
- ✅ Google Cloud Platform - [Detailed Guide](GCP_DEPLOYMENT.md)

**Self-Hosted:**
- ✅ Ubuntu/Linux Server - [Guide](HOME_SERVER_DEPLOYMENT.md)
- ✅ Windows Desktop (Docker Desktop) - [Guide](WINDOWS_DEPLOYMENT.md) 🪟
- ✅ Any server with Docker support

### Production Features

- ✅ Multi-stage Docker builds for optimization
- ✅ Nginx reverse proxy with SSL support
- ✅ Non-root containers for security
- ✅ Health checks and monitoring
- ✅ Automated backups
- ✅ CI/CD with GitHub Actions
- ✅ Redis caching support

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file - overview and quick start |
| [PRODUCTION_QUICKSTART.md](PRODUCTION_QUICKSTART.md) | 5-minute production deployment guide |
| [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md) | AWS, DigitalOcean, Azure deployment guides |
| [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md) | Google Cloud Platform deployment guide |
| [HOME_SERVER_DEPLOYMENT.md](HOME_SERVER_DEPLOYMENT.md) | Ubuntu/Linux self-hosted deployment |
| [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) | Windows home server (no dual boot needed!) |
| [CI_CD_SETUP.md](CI_CD_SETUP.md) | CI/CD pipeline setup with GitHub Actions |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Docker Compose deployment guide |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Pre-deployment checklist |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributing guidelines and workflow |
| [CHANGELOG.md](CHANGELOG.md) | Version history and changes |

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
