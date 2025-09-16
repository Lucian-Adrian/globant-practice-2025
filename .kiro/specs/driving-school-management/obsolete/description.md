Our Driving School Management System will be a comprehensive digital platform that connects students, instructors, staff, and management in one place. Students will be able to register online, pay fees securely, book theory and driving lessons, and monitor their progress through a personal portal. Instructors will manage their schedules, track attendance, and record student performance, while reception and staff will easily handle enrollments, vehicle assignments, and communication. Directors will gain real-time insights into operations, finances, and growth through intuitive dashboards and reports. The system will replace outdated paper-based processes and manual phone scheduling with a modern, multilingual (EN/RO/RU), scalable solution. Looking ahead, it will integrate online payments, advanced scheduling, automated notifications, vehicle maintenance tracking, and multi-branch support — building the future of efficient, student-first driving schools.

🎯 Final Product Vision (1 Week Execution)
The system should allow a real driving school to:
Enroll and track students (the school’s lifeblood)


Assign instructors and vehicles (core operations)


Schedule theory and driving lessons (daily activity)


Track payments (business-critical)


Provide basic notifications (student communication)


Multi-language support (real-world Moldova context)



✅ Must-Have Features (MVP Final Scope)
1. Students
Self-registration (landing page form)


Admin dashboard for CRUD


Status tracking (active, graduated, dropped)


Search + pagination


2. Instructors
CRUD in admin


Assign students


View schedules


3. Vehicles
CRUD in admin


Assign to instructors / lessons


Track availability & basic maintenance flag


4. Classes / Scheduling
CRUD for theory + driving lessons


Assign student + instructor + vehicle


Calendar / table view


(Stretch: basic attendance flag)


5. Payments
CRUD for payments (linked to student)


Track amount paid vs total course fee


Export payments (CSV/PDF for director)


6. Authentication & Roles
JWT auth


Roles: Admin, Instructor, Student


Access restrictions in frontend (e.g., students only see their info, instructors see their students, admin sees all)


7. Notifications (Basic)
Email confirmation after registration


(Stretch: reminder emails before lessons)


8. Multi-language Toggle
English, Romanian, Russian for frontend UI


Content served via i18n



🚀 Stretch Goals (if time allows)
Student portal (student logs in, sees own schedule + payments)


Instructor portal (logs in, sees assigned students + classes)


Basic reports for director (no. of students, revenue, lessons given)



💡 Why this scope makes impact
Real-world pain point solved: schools today run all of this on Excel, paper, and phone calls. This MVP replaces that with a centralized system.


Value for director: track students + payments in one place.


Value for staff: easy scheduling & assignment.


Value for students: online registration + communication.


Value for instructors: visibility on their workload.



📅 Execution Plan (Week)
Day 1–2: Finish backend models & APIs (students, instructors, vehicles, classes, payments, auth).
 Day 2–3: Build frontend CRUD & dashboards for all resources.
 Day 3–4: Implement scheduling UI + payments tracking.
 Day 4–5: Add auth roles + multi-language + notifications.
 Day 6: Bugfix, polish UI, prepare demo.
 Day 7: Buffer / documentation.
1 — High-level school workflows (how staff & students will actually use the system)
A. Student lifecycle (real world → system)
Student finds landing page → fills registration form (name, phone, email, DOB, course category) → system creates provisional student (status = PENDING), sends confirmation email (consent checkbox recorded).


Reception verifies documents (if in-person) → marks student as ACTIVE and assigns course (course = Course / category).


Reception/Director chooses package (theory, practice); payment is recorded/linked to student (manual or online later).


Student is assigned to lessons: theory is preprogrammed + practical lessons (Lesson objects) with instructor & vehicle assigned, (they will start later on, after x amount of theory lessons)


Student attends lessons; instructor records attendance, notes, outcome. System updates Lesson.status and Enrollment.status.


When course completed, Student status → GRADUATED. Director can export reports or close record.


B. Scheduling & daily operations
Reception uses calendar/table to book lessons. The system checks conflicts:


Instructor can’t have overlapping lessons.


Vehicle used in only one lesson at a time.


Lesson records include lesson duration, type (theory/practical), attendance and notes.


Instructor can view his assigned lessons and mark attendance/notes.


Reception can reassign instructor/vehicle; system logs history.


C. Payments & billing
Payments link to an Enrollment/Student. Payments can be PENDING, COMPLETED, REFUNDED.


Director can run financial reports (payments by period, outstanding balances).


For now: manual entry; later: replace with payment gateway integration.


D. Notifications / Communications
On key events (signup, lesson scheduled, lesson reminder, payment received) the system will queue email (and later SMS) messages.


Notification engine is asynchronous (Celery/worker). Templated messages with i18n.


E. Roles & responsibilities (permissions)
Admin — full system access (all data, reports, user administration).


Director — high-level reports and management (financial & staff), but no user-admin unless also Admin.


Instructor — view assigned students & lessons; record attendance & notes; view personal schedule.


Reception — register students, schedule lessons, manage payments; assign instructors/vehicles.


Student — (in MVP limited) see own registration confirmation; later: login to student portal to view schedule & payments.



2 — Data model (DB tables, fields, constraints, indexes)
Below is the canonical model. Some of this overlaps with your existing models; I include additions / recommended fields.
Use PostgreSQL. Add created_at, updated_at timestamps on applicable tables.
users
id (PK)


username (unique)


email (unique)


password


first_name, last_name


role ENUM: admin, director, instructor, reception


is_active, is_staff


created_at, updated_at
 Indexes: email (unique)


students
id (PK)


first_name, last_name


email (unique)


phone_number


date_of_birth (date)


register_date(datetime)


status ENUM: PENDING, ACTIVE, INACTIVE, GRADUATED, DROPPED


course_id (FK → courses) — assigned course/package


consent_recorded boolean (GDPR)


notes TEXT


created_at, updated_at
 Indexes: email, status, course_id


instructors
instructors should be a profile extension of users, not a duplicate.


So:

 instructors
id (PK, also FK → users.id, one-to-one)
hire_date
license_categories TEXT
active boolean
created_at, updated_at


Then when you query an instructor, you join with users to get name, email, phone.


This way:


No risk of inconsistency (users says “John Doe”, instructors says “Johnny D.”).


Works nicely with role = instructor.


Easier permission checks


vehicles
id, make, model


license_plate (unique)


year (int)


category VARCHAR (vehicle categories)


is_available boolean


last_maintenance_date datetime


maintenance_due boolean or next_maintenance_date


created_at, updated_at
 Indexes: license_plate, is_available


courses (Course model)
id, name, category (one of vehicle categories)


description, price (decimal)


required_lessons (int)
type


created_at, updated_at


enrollments (student-course)
id, student_id (FK students), course_id (FK courses)


enrollment_date datetime


status ENUM: IN_PROGRESS, COMPLETED, DROPPED


total_lessons_allocated int


lessons_taken_count int (cached)


created_at, updated_at
 Constraints: unique (student_id, course_id)
 Indexes: student_id, course_id, status


lessons (scheduled lessons)
id (PK)


enrollment_id (FK → enrollments)


instructor_id (FK → instructors)


vehicle_id (FK → vehicles, nullable)


scheduled_time (datetime)


duration_minutes int (default 50)


status ENUM: SCHEDULED, COMPLETED, CANCELED, NO_SHOW


attendance boolean (nullable)


notes TEXT+



created_by (FK users)


created_at, updated_at
 Indexes: scheduled_time, composite (instructor_id, scheduled_time), (vehicle_id, scheduled_time)


payments
id, enrollment_id (FK), amount decimal, payment_date datetime


payment_method ENUM: CASH, CARD, TRANSFER


status ENUM: PENDING, COMPLETED, REFUNDED


transaction_reference varchar (nullable)


description varchar


created_at, updated_at
 Indexes: enrollment_id, payment_date


notifications (queued)
id, recipient_user_id, recipient_email, channel (email, sms)


template_key (string)


payload JSON


status ENUM: PENDING, SENT, FAILED


scheduled_at datetime (for reminders)


sent_at datetime


created_at, updated_at


audit_logs (optional but useful)
id, actor_user_id, action_type (CREATE/UPDATE/DELETE), object_type, object_id, changes JSON, created_at



3 — API contract (exact endpoints, example request/response, permissions)
Use DRF ViewSets + routers. All API paths use prefix /api/.
Pagination: page and page_size. Filters by query params. Always return DRF-standard { count, next, previous, results: [...] }.
Authentication
POST /api/token/ → {username, password} → returns {access, refresh}


POST /api/token/refresh/ → refresh token


Permissions:
Default: IsAuthenticated for admin/instructor/reception endpoints.


Public: POST /api/students/register/ (landing-page registration) — no auth but with CAPTCHA or rate limiting.



Students
GET /api/students/ — list (query params: search, status, course, page, page_size)


Permissions: admin, director, reception, instructor (instructor limited to assigned students)


POST /api/students/ — create (admin/reception)


Payload example:


{
  "first_name":"Ana",
  "last_name":"Pop",
  "email":"ana@example.com",
  "phone_number":"+3736...",
  "date_of_birth":"1998-02-10",
  "status":"ACTIVE",
  "course_id": 2
}

POST /api/students/register/ — public signup (landing)


Creates student with status=PENDING and consent_recorded: true/false.


GET /api/students/{id}/ — detailed view (includes enrollments, payments, lessons count)


PUT /api/students/{id}/, PATCH /api/students/{id}/, DELETE /api/students/{id}/


Backend tasks: add filters search by first,last,email; add assigned_instructor filter for instructors.

Instructors
GET /api/instructors/ — list (filters: active, license_category)


POST /api/instructors/ — create


GET/PUT/PATCH/DELETE /api/instructors/{id}/



Vehicles
GET /api/vehicles/ — list (filter: is_available, category)


POST /api/vehicles/ — create


GET/PUT/PATCH/DELETE /api/vehicles/{id}/



Courses
GET /api/courses/


POST /api/courses/


GET /api/courses/{id}/ etc.



Enrollments
GET /api/enrollments/ (include student, course, lessons_taken_count)


POST /api/enrollments/ — create start enrollment for a student


GET/PUT/PATCH/DELETE /api/enrollments/{id}/
 Note: POST may be triggered by reception after payment confirmation or by auto-creation from landing signup by admin.



Lessons (scheduling)
GET /api/lessons/ — filters: instructor_id, student_id, date_from, date_to, status


POST /api/lessons/ — scheduling API (must check conflicts)


Payload:


{
  "enrollment_id": 5,
  "instructor_id": 3,
  "vehicle_id": 2,
  "scheduled_time": "2025-09-10T14:00:00Z",
  "duration_minutes": 50,
  "type": "PRACTICAL"
}

On POST: server checks conflicts:


Query for lessons with overlapping time for the selected instructor or vehicle. If conflict → return 400 with { detail: "Instructor conflict at this time" }.


PATCH /api/lessons/{id}/ to update status (COMPLETED/NO_SHOW) and record attendance/notes.



Payments
GET /api/payments/ — filters by student_id, from, to


POST /api/payments/ — record payment


POST /api/payments/webhook/ — placeholder for payment gateway



Notifications
GET/POST /api/notifications/ to queue notifications (admin/reception). Worker consumes PENDING notifications.



Reports
GET /api/reports/students-summary?from=&to= — returns aggregated counts, revenue total. Permissions: director, admin.



4 — Frontend: exact screens/components & behaviour (React + React Admin)
Use React Admin for all admin screens. Use plain React / Next.js for landing page.
Admin screens (React Admin resources)
Each Resource: List, Create, Edit, Show (where useful).
Students Resource
List: columns: id, first_name, last_name, email, phone, course, status, enrollment_date


Features: Search toolbar (first_name, last_name, email), filter by status, course. Pagination.


Create/Edit: fields with validation:


first_name (required), last_name (required)


email (required + email format)


phone_number (pattern), date_of_birth (datepicker)


course_id (reference input), status (select)


consent checkbox (if created via landing page)


Show: expandable panel with enrollments, payments, lessons (list subcomponents).


Instructors Resource
List: id, name, email, phone, license_categories, active


Create/Edit: license categories (multi-select), hire_date datepicker.


Vehicles Resource
List: license_plate, make, model, category, is_available


Create/Edit: last_maintenance_date, maintenance flag.


Lessons / Calendar
Calendar view (full-calendar) or table view for date range.


Create inline booking modal (select student → pick timeslot → select instructor & vehicle).


Conflict detection UI: show warnings inline if server returned conflict.


Payments
Student detail shows payments list.


Payments resource to record manual payment (link to enrollment; show transaction reference).


Authentication / RBAC on front
Login page configured to post to /api/token/.


Store token, attach Authorization: Bearer <token>.


On frontend: hide menu items if permission missing. E.g., Students accessible to reception/admin; instructors view limited for instructors.


Landing page (public)
Signup form (fields: first_name, last_name, email, phone, dob, course preference, consent checkbox)


On submit → POST /api/students/register/


Show success page with steps (what to expect next)


i18n
Use react-i18next. Extract all strings into keys. Provide language picker in topbar.



MUST-DO (finish in 1 week) — Backend tasks
B1 — Users & Roles setup
What: Extend Django User with role field (choices) and add is_active, admin view.


Files: backend/project/settings.py (AUTH_USER_MODEL if custom), backend/school/models.py or backend/users/models.py.


Acceptance: API /api/users/ lists users; creating user with role works. Tests for role-based permission access.


B2 — Student endpoints & public register
What: Implement StudentSerializer, StudentViewSet, add router endpoints:


POST /api/students/register/ (public) → creates Student with status=PENDING and consent_recorded.


GET /api/students/ + search & pagination.


Files: backend/school/serializers.py, views.py, api.py or urls.py


Acceptance:


POST /api/students/register/ with proper JSON returns 201 and { id, status }.


GET /api/students/?search=ana returns results.


B3 — Instructor API (CRUD)
What: Model/Serializer/ViewSet/Router; validations for unique email.


Files: models.py (if not present), serializers.py, views.py, migrations.


Acceptance: Create instructor, list, update, delete endpoints work with tests.



B4 — Vehicle API (CRUD)
What: Model/Serializer/ViewSet/Router; unique license_plate, maintenance fields.


Acceptance: CRUD endpoints testable via Postman.



B5 — Lesson scheduling endpoints + conflict checks
What: POST /api/lessons/ creates lesson, but must check:


No overlapping lesson for same instructor (WHERE scheduled_time < end AND end > start).


No overlapping lesson for same vehicle (if vehicle selected).


Files: views.py, helper scheduling.py (conflict check function).


Acceptance:


Valid slot → 201.


Conflict → 400 JSON {detail: "Instructor conflict: ..."}



B6 — Enrollment model and endpoints
What: Ensure Enrollment exists; endpoints GET/POST for enrollments. Update lessons to reference enrollment_id on creation.


Acceptance: POST /api/enrollments/ creates enrollment and returns id.



B7 — Payments endpoints
What: POST /api/payments/ record payment, track status. Add GET /api/payments?student_id= filter.


Acceptance: Payment linked to enrollment; queries return aggregated totals.



B8 — Notifications queue & worker trigger
What: Add notifications table and Celery tasks to send email. Provide API to queue notification on registration and lesson creation.


Acceptance: On student registration, a notification row is created and worker processes it (or logs at minimum).



B9 — Reports endpoints
What: GET /api/reports/students-summary?from=YYYY-MM-DD&to=... returning counts and revenue.


Acceptance: Returns JSON summary for director.


Owner: Aurelian (Director can test)



MUST-DO — Frontend tasks (React Admin + landing)
F1 — Setup React Admin resources for Students/Instructors/Vehicles/Payments/Lessons
What: frontend/src/App.jsx add Resource for students, instructors, vehicles, lessons, payments.


List: use ListGuesser for quick MVP; customize students list to show columns.


Acceptance: Admin can GET lists and POST creates; forms have validation (email pattern).



F2 — Landing page signup
What: public Landing component with form POST to /api/students/register/.


UX: show spinner and success page with next steps.


Acceptance: Submitting creates a PENDING student and shows confirmation message.


F3 — Lesson booking UI & conflict handling
What: Modal that fills enrollment_id, selects instructor, selects vehicle, picks datetime, calls POST /api/lessons/.


On Conflict: show server 400 error message; highlight conflicting resource on calendar.


Acceptance: Successful booking is added to calendar.

F4 — Student detail page (list payments, lessons)
What: Student show page with tabs: Overview, Lessons, Payments, Notes.


Acceptance: Sections fetch relevant endpoints; payments list shows totals.





F5 — Auth flow (login, token attach)
What: Login page to /api/token/, store access token in memory or localStorage; refresh token flow.


Acceptance: After login, protected routes accessible. Token attached to requests.



F6 — i18n integration
What: Add react-i18next; add translations for landing and admin strings (EN/RO/RU). Language switcher top-right.


Acceptance: Changing language updates labels without reload.






INFRA / Ops / Dev tasks
I1 — Docker compose update and environment values
What: Ensure services: db, backend, frontend, celery (worker), redis (broker). Add environment EMAIL_HOST, EMAIL_PORT, etc.


Acceptance: docker compose up starts both backend and front and worker; notifications processed by worker.



I2 — Email configuration & SMTP stub
What: Configure SMTP in Django settings.py for dev (console/email file) and provide configurable env var for prod SMTP.


Acceptance: Registration triggers email (console or SMTP).



I3 — Backups & DB migrations strategy
What: Add make migrate and make backup scripts; document migration process.


Acceptance: Team can run migrations safely.





QA / Testing tasks (must)
Q1: Create Postman collection with sample requests for all endpoints (students/create, lessons/create, payments/create).


Q2: E2E smoke test: Sign up from landing → admin sees student → create enrollment → schedule lesson → record payment.


Q3: Unit tests for conflict detection logic (no overlapping lessons).


Owners: All — assign small bits to each dev.



6 — Acceptance criteria & test cases (sample)
Test case: Landing signup → admin view
Submit POST /api/students/register/ with valid JSON → status 201 + {id, status:PENDING}


GET /api/students/?search=<email> returns the student.


Admin changes status to ACTIVE and assigns course → POST /api/enrollments/ → 201.


Test case: Schedule lesson conflict
Create lesson A: instructor=1, vehicle=2, start=2025-09-11T10:00, duration 60


Try to create lesson B: instructor=1, start=2025-09-11T10:30, duration 60 → expected 400 with message "Instructor conflict".


Test case: Payment record
POST /api/payments/ with valid enrollment_id and amount → 201 and payment appears in student's payments list.



7 — Data retention & privacy (must-have)
On landing signup present consent checkbox. Save consent_recorded and timestamp in students.


Audit logs for user actions (delete, create).


Provide simple data export & deletion endpoint for GDPR "right to be forgotten" requests.



8 — Integration points & optional extras (if time)
SMS gateway for reminders (Twilio/Plivo) — implement placeholder POST /api/notifications/ to queue SMS.


Calendar export: GET /api/lessons/{id}/ics to create .ics file for students/instructors.


CSV export: for payments & students (director ease).


Telephony: create POST /api/calls/ endpoint to store call transcripts for future conversational assistant.



9 — Prioritized 7-day execution plan (day-by-day)
Day 1 (Backend heavy)
B1 Users & Roles


B2 Student endpoints & public register


B3 Instructor API skeleton


I1 Docker compose update
Day 2 (Frontend bootstrapping)
F1 Add Student resource + list + create 


F2 Landing page signup


B4 Vehicle API


Day 3 (Scheduling & Lessons)
B5 Lesson scheduling + conflict check


F3 Lesson booking modal + calendar


Q1 Postman collection


Day 4 (Payments & Notifications)
B7 Payments endpoints


B8 Notifications queue & email stubs


F4 Student detail


Day 5 (Auth + i18n + polishing)
B9 Reports endpoints


F5 Auth flow + protect routes


F6 i18n integration


Q2 Smoke E2E test


Day 6 (Buffer & Fixes)
Fix blockers, merge PRs, finalize UI polish, run all tests, prepare demo dataset


Day 7 (Demo prep & documentation)
Prepare demo script, screenshots, export CSV sample, short docs for ops (how to run compose up), handover to AI week team.



10 — Extra implementation details & snippets you can hand to devs
Conflict checking pseudo-SQL (use in lesson creation)
-- find overlapping lessons for instructor
SELECT 1 FROM lessons
WHERE instructor_id = :instructor_id
  AND scheduled_time < (:scheduled_time + interval ':duration minutes')
  AND (scheduled_time + interval 'duration_minutes minutes') > :scheduled_time
LIMIT 1;

DB Index recommendations
CREATE INDEX idx_lessons_instructor_time ON lessons (instructor_id, scheduled_time);
CREATE INDEX idx_lessons_vehicle_time ON lessons (vehicle_id, scheduled_time);
CREATE INDEX idx_students_email ON students (email);
CREATE INDEX idx_enrollments_student ON enrollments (student_id);

Example registration POST (landing)
Request:
POST /api/students/register/
Content-Type: application/json

{
  "first_name":"Ana",
  "last_name":"Pop",
  "email":"ana+test@example.com",
  "phone_number":"+3736...",
  "date_of_birth":"1998-02-10",
  "course_id":1,
  "consent": true
}

Response:
HTTP/1.1 201 Created
{
  "id": 123,
  "status": "PENDING",
  "message":"Thank you. We will contact you within 24 hours."
}


11 — Final notes (practical & managerial)
Keep endpoints RESTful and predictable — React Admin integrates without surprises. Use trailing slashes for DRF.


Keep server side validation defensive — front-end validation is UX, back-end is authoritative.


Prioritize lesson conflict logic and public registration for demo — these are the visible operations that prove “this is a real system” to stakeholders.


For the one-week deadline, avoid building deep AI/integration. Prepare API hooks and backlog tasks for later AI week.

:

🚘 Driving School Management System — Final Vision (Internship MVP)
1. System Overview
A web-based platform to replace Excel, paper, and phone calls in a driving school.
 It digitizes enrollment, scheduling, instructors, vehicles, payments, and communication with role-based access (Admin, Director, Reception, Instructor, Student).
This MVP can be deployed on-premise and already supports multi-language (English, Romanian, Russian).

2. Core Workflows
🎓 Student Lifecycle
Student signs up via landing page form → creates PENDING Student with consent recorded.


Reception verifies & activates → assigns course.


Lessons scheduled (theory & practice).


Payments tracked against fee.


Graduation → status updated.


📅 Scheduling (daily operations)
Reception books lessons (theory/practical).


System prevents instructor/vehicle conflicts.


Instructors see their schedules.


Attendance + notes recorded.


💵 Payments
Reception records payments (manual entry).


Tracks balances vs total fee.


Director can export payments (CSV/PDF).


📢 Notifications
Email confirmation on signup.


(Stretch) Lesson reminders.



3. Must-Have Features (MVP Scope)
Students


Self-registration (landing page).


CRUD in admin.


Status tracking (PENDING, ACTIVE, GRADUATED).


Search + pagination.


Instructors


CRUD in admin.


Assign students.


View schedule.


Vehicles


CRUD in admin.


Assign to instructors/lessons.


Track availability + maintenance flag.


Classes / Lessons


CRUD for lessons.


Assign student + instructor + vehicle.


Calendar/table view.


Conflict detection.


Payments


CRUD linked to student.


Track balances.


Export CSV/PDF.


Authentication & Roles


JWT auth.


Roles: Admin, Reception, Instructor, Student.


Role-based UI.


Notifications


Signup confirmation email.


Multi-language


i18n toggle (EN/RO/RU).



4. Data Model (Simplified)
Users: id, email, role.


Students: id, name, email, phone, dob, status, course, consent.


Instructors: id, name, email, phone, active, license_categories.


Vehicles: id, license_plate, make, model, category, available, maintenance flag.


Courses: id, name, price, category, lessons_required.


Enrollments: id, student_id, course_id, status.


Lessons: id, enrollment_id, instructor_id, vehicle_id, time, duration, status.


Payments: id, enrollment_id, amount, date, status.


Notifications: id, recipient, template, payload, status.



5. APIs (Django REST)
Students:


POST /api/students/register/ (public)


GET /api/students/?search=… (with pagination)


CRUD /api/students/{id}/


Instructors, Vehicles, Courses: CRUD.


Lessons:


POST /api/lessons/ (conflict check).


GET /api/lessons/?instructor=…&date=….


Payments: CRUD, filter by student.


Auth: JWT (/api/token/, /api/token/refresh/).


Reports: /api/reports/students-summary.



6. Frontend (React + React Admin)
Admin Panel (React Admin):


Resources: Students, Instructors, Vehicles, Lessons, Payments.


Student detail page: tabs for Lessons & Payments.


Calendar view for lessons.


Landing Page (React/Next.js):


Self-registration form (EN/RO/RU).


Consent checkbox.


Success message.


Auth Flow: Login via /api/token/, token stored, role-based UI.


Multi-language: react-i18next with toggle.



7. Execution Plan (1 Week)
Day 1–2: Backend models & APIs (students, instructors, vehicles, lessons, payments, auth).


Day 2–3: Frontend CRUD (students, instructors, vehicles).


Day 3–4: Lesson scheduling + calendar + conflict detection.


Day 4–5: Payments, reports, notifications.


Day 5–6: Auth roles, i18n, polish.


Day 7: QA + Demo prep.



8. Impact
Replaces paper/Excel workflows with one system.


School directors track students & payments.


Reception manages scheduling efficiently.


Instructors see workload transparently.


Students register online.
