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
- Backend: port 8000
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

## Stop

```bash
Ctrl + C
docker-compose down
```
