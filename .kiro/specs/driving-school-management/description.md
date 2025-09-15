# 🚘 Driving School Management System - Complete Project Specification

## 🎯 Final Product Vision (1 Week Execution)

A comprehensive digital platform that modernizes driving school operations by connecting students, instructors, staff, and management in one centralized system. This replaces outdated paper-based processes and manual phone scheduling with a modern, multilingual (EN/RO/RU), scalable solution.

**The system allows a real driving school to:**
- Enroll and track students (the school's lifeblood)
- Assign instructors and vehicles (core operations) 
- Schedule theory and driving lessons (daily activity)
- Track payments (business-critical)
- Provide basic notifications (student communication)
- Multi-language support (real-world Moldova context)

## 🚀 Core Value Proposition

**For Students**: Online registration, secure payments, lesson booking, and progress tracking through a personal portal.

**For Instructors**: Schedule management, attendance tracking, and student performance recording.

**For Staff/Reception**: Easy enrollment handling, vehicle assignments, and streamlined communication.

**For Directors**: Real-time operational insights, financial tracking, and growth analytics through intuitive dashboards.

## ✅ MVP Features (1 Week Execution)

### 1. Student Management
- Self-registration via landing page form
- Admin dashboard with full CRUD operations
- Status tracking (PENDING, ACTIVE, GRADUATED, DROPPED)
- Search functionality with  pagination
- GDPR-compliant consent recording

### 2. Instructor Management
- Complete CRUD operations in admin panel
- Student assignment capabilities
- Schedule viewing and management
- License category tracking

### 3. Vehicle Management
- Full CRUD operations
- Instructor/lesson assignments
- Availability tracking
- Basic maintenance flag system

### 4. Lesson Scheduling System
- Theory and driving lesson management
- Student + instructor + vehicle assignment
- Calendar/table view interface
- Conflict detection and prevention
- Attendance tracking capabilities

### 5. Payment Tracking
- Payment CRUD linked to students
- Amount tracking vs total course fees
- Multiple payment methods (CASH, CARD, TRANSFER)
- Export capabilities (CSV/PDF) for directors
- Payment status management (PENDING, COMPLETED, REFUNDED)

### 6. Authentication & Authorization
- JWT-based authentication
- Role-based access control:
  - **Admin**: Full system access
  - **Director**: Reports and high-level management
  - **Instructor**: Assigned students and personal schedule
  - **Reception**: Student registration, scheduling, payments
  - **Student**: Personal information and portal access

### 7. Notification System
- Email confirmation after registration
- Lesson reminder notifications
- Simple email sending via Django
- Template-based messaging with i18n support

### 8. Multi-language Support
- English, Romanian, Russian UI
- Content served via i18n
- Language toggle functionality

## 🏗️ Technical Architecture

### Backend Stack
- **Framework**: Django + Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Email**: SMTP configuration

### Frontend Stack
- **Admin Interface**: React Admin
- **Landing Page**: React/Next.js
- **Internationalization**: react-i18next
- **State Management**: React Admin built-in

### Infrastructure
- **Containerization**: Docker Compose
- **Services**: Database, Backend, Frontend
- **Environment**: Configurable via environment variables

## 🔌 API Contract (Exact Endpoints, Request/Response, Permissions)

**Base**: All API paths use prefix `/api/`. DRF ViewSets + routers. Pagination: page and page_size. Always return DRF-standard `{ count, next, previous, results: [...] }`.

### Authentication
```
POST /api/token/ → {username, password} → returns {access, refresh}
POST /api/token/refresh/ → refresh token
```

### Students
```
GET /api/students/ — list (query params: search, status, course, page, page_size)
Permissions: admin, director, reception, instructor (instructor limited to assigned students)

POST /api/students/ — create (admin/reception)
Payload: {"first_name":"Ana","last_name":"Pop","email":"ana@example.com","phone_number":"+3736...","date_of_birth":"1998-02-10","status":"ACTIVE","course_id": 2}

POST /api/students/register/ — public signup (landing)
Creates student with status=PENDING and consent_recorded: true/false

GET /api/students/{id}/ — detailed view (includes enrollments, payments, lessons count)
PUT/PATCH/DELETE /api/students/{id}/
```

### Instructors
```
GET /api/instructors/ — list (filters: active, license_category)
POST /api/instructors/ — create
GET/PUT/PATCH/DELETE /api/instructors/{id}/
```

### Vehicles
```
GET /api/vehicles/ — list (filter: is_available, category)
POST /api/vehicles/ — create
GET/PUT/PATCH/DELETE /api/vehicles/{id}/
```

### Lessons (Scheduling)
```
GET /api/lessons/ — filters: instructor_id, student_id, date_from, date_to, status
POST /api/lessons/ — scheduling API (must check conflicts)
Payload: {"enrollment_id": 5,"instructor_id": 3,"vehicle_id": 2,"scheduled_time": "2025-09-10T14:00:00Z","duration_minutes": 50,"type": "PRACTICAL"}

On POST: server checks conflicts:
- Query for lessons with overlapping time for selected instructor or vehicle
- If conflict → return 400 with { detail: "Instructor conflict at this time" }

PATCH /api/lessons/{id}/ — update status (COMPLETED/NO_SHOW) and record attendance/notes
```

### Payments
```
GET /api/payments/ — filters by student_id, from, to
POST /api/payments/ — record payment
POST /api/payments/webhook/ — placeholder for payment gateway
```

### Reports
```
GET /api/reports/students-summary?from=&to= — returns aggregated counts, revenue total
Permissions: director, admin
```

## 📊 Data Model (DB Tables, Fields, Constraints, Indexes)

**Database**: PostgreSQL with created_at, updated_at timestamps on all tables.

### Core Tables

**users** (extends Django User)
```
id (PK), username (unique), email (unique), password
first_name, last_name
role ENUM: admin, director, instructor, reception, student
is_active, is_staff, created_at, updated_at
Indexes: email (unique)
```

**students**
```
id (PK), user_id (FK → users, nullable for guest signups)
first_name, last_name, email (unique), phone_number
date_of_birth (date), enrollment_date (datetime)
status ENUM: PENDING, ACTIVE, INACTIVE, GRADUATED, DROPPED
course_id (FK → courses), consent_recorded boolean (GDPR)
notes TEXT, created_at, updated_at
Indexes: email, status, course_id
```

**instructors**
```
id, first_name, last_name, email (unique), phone_number
hire_date (date), license_categories TEXT (comma separated)
active boolean, created_at, updated_at
Indexes: email
```

**vehicles**
```
id, make, model, license_plate (unique), year (int)
category VARCHAR (vehicle categories), is_available boolean
last_maintenance_date datetime, maintenance_due boolean
created_at, updated_at
Indexes: license_plate, is_available
```

**courses**
```
id, name, category (vehicle categories), description
price (decimal), required_lessons (int), type
created_at, updated_at
```

**enrollments** (student-course relationships)
```
id, student_id (FK students), course_id (FK courses)
enrollment_date datetime
status ENUM: IN_PROGRESS, COMPLETED, DROPPED
total_lessons_allocated int, lessons_taken_count int (cached)
created_at, updated_at
Constraints: unique (student_id, course_id)
Indexes: student_id, course_id, status
```

**lessons** (scheduled lessons)
```
id (PK), enrollment_id (FK → enrollments)
instructor_id (FK → instructors), vehicle_id (FK → vehicles, nullable)
scheduled_time (datetime), duration_minutes int (default 50)
status ENUM: SCHEDULED, COMPLETED, CANCELED, NO_SHOW
attendance boolean (nullable), notes TEXT
created_by (FK users), created_at, updated_at
Indexes: scheduled_time, composite (instructor_id, scheduled_time), (vehicle_id, scheduled_time)
```

**payments**
```
id, enrollment_id (FK), amount decimal, payment_date datetime
payment_method ENUM: CASH, CARD, TRANSFER
status ENUM: PENDING, COMPLETED, REFUNDED
transaction_reference varchar (nullable), description varchar
created_at, updated_at
Indexes: enrollment_id, payment_date
```

**notifications** (queued)
```
id, recipient_user_id, recipient_email, channel (email, sms)
template_key (string), payload JSON
status ENUM: PENDING, SENT, FAILED
scheduled_at datetime (for reminders), sent_at datetime
created_at, updated_at
```

**audit_logs** (optional but useful)
```
id, actor_user_id, action_type (CREATE/UPDATE/DELETE)
object_type, object_id, changes JSON, created_at
```

### Key Relationships
- Students → Enrollments → Lessons
- Instructors ↔ Lessons ↔ Vehicles  
- Payments → Enrollments → Students

## 🔄 High-Level School Workflows (Real-World Usage)

### A. Student Lifecycle (Real World → System)
1. **Registration**: Student finds landing page → fills form (name, phone, email, DOB, course category) → system creates PENDING student with consent recorded → sends confirmation email
2. **Activation**: Reception verifies documents → marks student ACTIVE → assigns course package
3. **Payment Setup**: Reception/Director chooses package (theory, practice) → payment recorded/linked to student
4. **Lesson Assignment**: Student assigned to lessons (theory preprogrammed + practical with instructor & vehicle)
5. **Learning Process**: Student attends lessons → instructor records attendance, notes, outcome → system updates Lesson.status and Enrollment.status
6. **Completion**: Course completed → Student status → GRADUATED → Director exports reports

### B. Scheduling & Daily Operations
- Reception uses calendar/table to book lessons
- System checks conflicts: Instructor can't have overlapping lessons, Vehicle used in only one lesson at a time
- Lesson records include duration, type (theory/practical), attendance and notes
- Instructor views assigned lessons and marks attendance/notes
- Reception can reassign instructor/vehicle; system logs history

### C. Payments & Billing
- Payments link to Enrollment/Student
- Payment statuses: PENDING, COMPLETED, REFUNDED
- Director runs financial reports (payments by period, outstanding balances)
- Manual entry for now; later payment gateway integration

### D. Notifications / Communications
- Key events trigger notifications: signup, lesson scheduled, lesson reminder, payment received
- System sends email (and later SMS) messages directly
- Simple email sending via Django SMTP
- Templated messages with i18n support

### E. Roles & Responsibilities (Permissions)
- **Admin**: Full system access (all data, reports, user administration)
- **Director**: High-level reports and management (financial & staff), no user-admin unless also Admin
- **Instructor**: View assigned students & lessons; record attendance & notes; view personal schedule
- **Reception**: Register students, schedule lessons, manage payments; assign instructors/vehicles
- **Student**: (MVP limited) See own registration confirmation; later: login to portal for schedule & payments

## 🛡️ Security & Compliance

### Data Protection
- GDPR-compliant consent recording
- Audit logging for user actions
- Data export and deletion capabilities
- Role-based data access restrictions

### Authentication Security
- JWT token-based authentication
- Refresh token mechanism
- Protected API endpoints
- Frontend route protection

## 📈 Future Enhancements (Post-MVP)

### Advanced Features
- Online payment gateway integration
- Advanced scheduling algorithms
- Automated notification workflows
- Vehicle maintenance tracking
- Multi-branch support
- Student/Instructor portals
- Advanced reporting and analytics

### Integration Possibilities
- SMS gateway for reminders
- Calendar export (.ics files)
- Telephony integration
- AI-powered scheduling optimization

## 🎯 Success Metrics

### Operational Efficiency
- Reduction in manual scheduling time
- Decreased registration processing time
- Improved payment tracking accuracy
- Enhanced communication effectiveness

### User Satisfaction
- Student registration completion rate
- Instructor schedule management ease
- Staff operational efficiency
- Director insight accessibility

## 📋 Detailed Implementation Plan (7-Day Execution)

### MUST-DO Backend Tasks

**B1 — Users & Roles Setup**
- Extend Django User with role field (choices) and add is_active, admin view
- Files: `backend/project/settings.py`, `backend/school/models.py`
- Acceptance: API `/api/users/` lists users; creating user with role works

**B2 — Student Endpoints & Public Register**
- Implement StudentSerializer, StudentViewSet, router endpoints
- `POST /api/students/register/` (public) → creates Student with status=PENDING
- `GET /api/students/` + search & pagination
- Acceptance: Registration returns 201 and `{ id, status }`

**B3 — Instructor API (CRUD)**
- Model/Serializer/ViewSet/Router; validations for unique email
- Acceptance: Create, list, update, delete endpoints work with tests

**B4 — Vehicle API (CRUD)**
- Model/Serializer/ViewSet/Router; unique license_plate, maintenance fields
- Acceptance: CRUD endpoints testable via Postman

**B5 — Lesson Scheduling + Conflict Checks**
- `POST /api/lessons/` creates lesson with conflict validation
- Check: No overlapping lesson for same instructor/vehicle
- Acceptance: Valid slot → 201. Conflict → 400 JSON `{detail: "Instructor conflict: ..."}`

**B6 — Enrollment Model and Endpoints**
- Ensure Enrollment exists; endpoints GET/POST for enrollments
- Update lessons to reference enrollment_id
- Acceptance: `POST /api/enrollments/` creates enrollment and returns id

**B7 — Payments Endpoints**
- `POST /api/payments/` record payment, track status
- `GET /api/payments?student_id=` filter
- Acceptance: Payment linked to enrollment; queries return aggregated totals

**B8 — Notifications & Email**
- Add notifications table and Django email sending
- API to send notification on registration and lesson creation
- Acceptance: Registration triggers email sending directly via Django SMTP

**B9 — Reports Endpoints**
- `GET /api/reports/students-summary?from=YYYY-MM-DD&to=...`
- Returns counts and revenue for director
- Acceptance: Returns JSON summary for director

### MUST-DO Frontend Tasks

**F1 — React Admin Resources Setup**
- `frontend/src/App.jsx` add Resource for students, instructors, vehicles, lessons, payments
- List: use ListGuesser for quick MVP; customize students list
- Acceptance: Admin can GET lists and POST creates; forms have validation

**F2 — Landing Page Signup**
- Public Landing component with form POST to `/api/students/register/`
- UX: show spinner and success page with next steps
- Acceptance: Submitting creates PENDING student and shows confirmation

**F3 — Lesson Booking UI & Conflict Handling**
- Modal that fills enrollment_id, selects instructor, vehicle, datetime
- Calls `POST /api/lessons/`; on conflict shows server 400 error message
- Acceptance: Successful booking added to calendar

**F4 — Student Detail Page**
- Student show page with tabs: Overview, Lessons, Payments, Notes
- Acceptance: Sections fetch relevant endpoints; payments list shows totals

**F5 — Auth Flow**
- Login page to `/api/token/`, store access token, refresh token flow
- Acceptance: After login, protected routes accessible. Token attached to requests

**F6 — i18n Integration**
- Add react-i18next; translations for landing and admin strings (EN/RO/RU)
- Language switcher top-right
- Acceptance: Changing language updates labels without reload

### Infrastructure Tasks

**I1 — Docker Compose Update**
- Services: db, backend, frontend
- Environment: EMAIL_HOST, EMAIL_PORT, etc.
- Acceptance: `docker compose up` starts all services; emails sent via SMTP

**I2 — Email Configuration & SMTP**
- Configure SMTP in Django settings.py for dev (console/email file)
- Configurable env var for prod SMTP
- Acceptance: Registration triggers email

**I3 — Backups & DB Migrations**
- Add `make migrate` and `make backup` scripts
- Document migration process
- Acceptance: Team can run migrations safely

### Day-by-Day Schedule

**Day 1 (Backend Heavy)**
- B1 Users & Roles
- B2 Student endpoints & public register  
- B3 Instructor API skeleton
- I1 Docker compose update

**Day 2 (Frontend Bootstrapping)**
- F1 Add Student resource + list + create
- F2 Landing page signup
- B4 Vehicle API

**Day 3 (Scheduling & Lessons)**
- B5 Lesson scheduling + conflict check
- F3 Lesson booking modal + calendar
- Q1 Postman collection

**Day 4 (Payments & Notifications)**
- B7 Payments endpoints
- B8 Notifications & email sending
- F4 Student detail

**Day 5 (Auth + i18n + Polishing)**
- B9 Reports endpoints
- F5 Auth flow + protect routes
- F6 i18n integration
- Q2 Smoke E2E test

**Day 6 (Buffer & Fixes)**
- Fix blockers, merge PRs, finalize UI polish
- Run all tests, prepare demo dataset

**Day 7 (Demo Prep & Documentation)**
- Prepare demo script, screenshots, export CSV sample
- Short docs for ops (how to run compose up)
- Handover to AI week team

## 🧪 Acceptance Criteria & Test Cases

### Test Case: Landing Signup → Admin View
1. Submit `POST /api/students/register/` with valid JSON → status 201 + `{id, status:PENDING}`
2. `GET /api/students/?search=<email>` returns the student
3. Admin changes status to ACTIVE and assigns course → `POST /api/enrollments/` → 201

### Test Case: Schedule Lesson Conflict
1. Create lesson A: instructor=1, vehicle=2, start=2025-09-11T10:00, duration 60
2. Try to create lesson B: instructor=1, start=2025-09-11T10:30, duration 60
3. Expected: 400 with message "Instructor conflict"

### Test Case: Payment Record
1. `POST /api/payments/` with valid enrollment_id and amount → 201
2. Payment appears in student's payments list

## 🔧 Implementation Details & Code Snippets

### Conflict Checking SQL (Lesson Creation)
```sql
-- Find overlapping lessons for instructor
SELECT 1 FROM lessons
WHERE instructor_id = :instructor_id
AND scheduled_time < (:scheduled_time + interval ':duration minutes')
AND (scheduled_time + interval 'duration_minutes minutes') > :scheduled_time
LIMIT 1;
```

### Database Index Recommendations
```sql
CREATE INDEX idx_lessons_instructor_time ON lessons (instructor_id, scheduled_time);
CREATE INDEX idx_lessons_vehicle_time ON lessons (vehicle_id, scheduled_time);
CREATE INDEX idx_students_email ON students (email);
CREATE INDEX idx_enrollments_student ON enrollments (student_id);
```

### Example Registration Request/Response
**Request:**
```json
POST /api/students/register/
Content-Type: application/json
{
  "first_name": "Ana",
  "last_name": "Pop", 
  "email": "ana+test@example.com",
  "phone_number": "+3736...",
  "date_of_birth": "1998-02-10",
  "course_id": 1,
  "consent": true
}
```

**Response:**
```json
HTTP/1.1 201 Created
{
  "id": 123,
  "status": "PENDING", 
  "message": "Thank you. We will contact you within 24 hours."
}
```

## 🛡️ Data Retention & Privacy (GDPR Compliance)

### Must-Have Privacy Features
- Landing signup presents consent checkbox
- Save `consent_recorded` and timestamp in students table
- Audit logs for user actions (delete, create)
- Simple data export & deletion endpoint for GDPR "right to be forgotten" requests

## 🔌 Integration Points & Future Enhancements

### Optional Extras (If Time Allows)
- **SMS Gateway**: Twilio/Plivo integration for reminders
- **Calendar Export**: `GET /api/lessons/{id}/ics` to create .ics files
- **CSV Export**: For payments & students (director convenience)
- **Telephony**: `POST /api/calls/` endpoint for call transcripts

## 💡 Why This Scope Makes Impact

**Real-world pain point solved**: Schools today run all of this on Excel, paper, and phone calls. This MVP replaces that with a centralized system.

**Value delivered:**
- **Director**: Track students + payments in one place
- **Staff**: Easy scheduling & assignment  
- **Students**: Online registration + communication
- **Instructors**: Visibility on their workload

## 📝 Final Implementation Notes

### Technical Best Practices
- Keep endpoints RESTful and predictable — React Admin integrates without surprises
- Use trailing slashes for DRF
- Keep server-side validation defensive — frontend validation is UX, backend is authoritative
- Prioritize lesson conflict logic and public registration for demo — these prove "this is a real system"

### Project Management
- For one-week deadline, avoid building deep AI/integration
- Prepare API hooks and backlog tasks for later AI week
- Focus on core workflows that demonstrate real business value

---

*This system transforms traditional driving school operations into a modern, efficient, and scalable digital platform that serves the real-world needs of Moldova's driving education sector.*