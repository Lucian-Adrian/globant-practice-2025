# Setup and run

## Install tools

1. Docker Desktop
2. Visual Studio Code

Make sure Docker Desktop is running

## Get code

```bash
git clone https://github.com/Lucian-Adrian/globant-practice-2025
```

## Run

```bash
docker-compose up --build
```

Services:
- Database: port 5432
- Backend: port 8000 (Python 3.11 image)
- Frontend: port 3000

## API Endpoints (development)

Base URL: `http://localhost:8000/api/`

Resources (list, retrieve, create, update – delete disabled for safety):

- Students: `/api/students/`
- Instructors: `/api/instructors/`
- Vehicles: `/api/vehicles/`
- Courses: `/api/courses/`
- Enrollments: `/api/enrollments/`
- Lessons: `/api/lessons/`
- Payments: `/api/payments/`

Creation field hints:

- Enrollment: student_id, course_id
- Lesson: enrollment_id, instructor_id, vehicle (optional id), scheduled_time (ISO), duration_minutes, status, notes
- Payment: enrollment_id, amount, payment_method, description

All endpoints currently have open access (no auth). Add authentication & permissions before production.

### API Schema & Docs (Phase 2)

OpenAPI schema and interactive docs are available once the backend is running:

- Raw schema (JSON): `http://localhost:8000/api/schema/`
- Swagger UI: `http://localhost:8000/api/docs/swagger/`
- ReDoc UI: `http://localhost:8000/api/docs/redoc/`

Use the enums meta endpoint to dynamically fetch choice lists:

```
curl http://localhost:8000/api/meta/enums/
```

## Backlog & Contribution

The structured implementation backlog lives in `tasks.md` (Phase-based: foundations, validation, docs, tooling, etc.).
Reference task IDs (e.g. `P0-STR-01`) in commit messages and PR titles to keep traceability.
Backend enums & validation work is being tracked under Phase 0 tasks. Default
currency is MDL (Moldovan Leu) and default phone country code assumption is +373.

## Stop

```bash
Ctrl + C
docker-compose down
```
