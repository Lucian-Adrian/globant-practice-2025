Student endpoints:

## Student Signup

**Endpoint:** `POST /api/students/`

**Description:** Creates a new student account. The student status is set to PENDING by default.

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone_number": "string",
  "date_of_birth": "YYYY-MM-DD",
  "password": "string"
}
```

**Response (Success - 201 Created):**
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone_number": "+37360123456",
  "date_of_birth": "2000-01-01",
  "enrollment_date": "2025-09-23",
  "status": "PENDING"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "errors": {
    "email": ["Email already registered"],
    "phone_number": ["Phone number already registered"],
    "date_of_birth": ["Date of birth cannot be in the future"]
  }
}
```

## Student Login

**Endpoint:** `POST /api/student/login/`

**Description:** Authenticates a student and returns JWT tokens. Only students with ACTIVE status can log in.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (Success - 200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (Error - 401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```
or for inactive status:
```json
{
  "error": "Account is not active"
}
```

## Student Dashboard

**Endpoint:** `GET /api/student/dashboard/`

**Description:** Retrieves the logged-in student's information, assigned instructors, and enrolled courses.

**Authentication:** Bearer Token (JWT access token in Authorization header)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (Success - 200 OK):**
```json
{
  "student": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone_number": "+37360123456",
    "date_of_birth": "2000-01-01",
    "enrollment_date": "2025-09-23",
    "status": "ACTIVE"
  },
  "instructors": [
    {
      "id": 1,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane.smith@example.com",
      "phone_number": "+37360987654"
    }
  ],
  "courses": [
    {
      "id": 1,
      "name": "Driving Course A",
      "category": "B",
      "course_type": "THEORY",
      "price": 500.00
    }
  ]
}
```

**Response (Error - 401 Unauthorized):**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

## Scheduled Class Patterns

### List/Create Scheduled Class Patterns

**Endpoints:**
- `GET /api/scheduled-class-patterns/` - List all patterns
- `POST /api/scheduled-class-patterns/` - Create new pattern

**Authentication:** Admin required for POST

**Query Parameters (GET):**
- `course` - Filter by course ID
- `instructor` - Filter by instructor ID
- `resource` - Filter by resource ID
- `status` - Filter by status
- `start_date__gte` - Filter by start date greater than or equal
- `start_date__lte` - Filter by start date less than or equal

**Request Body (POST):**
```json
{
  "name": "Monday/Wednesday Theory Classes",
  "course_id": 1,
  "instructor_id": 1,
  "resource_id": 1,
  "student_ids": [1, 2, 3],
  "recurrence_days": ["MONDAY", "WEDNESDAY"],
  "times": ["10:00", "14:00"],
  "start_date": "2024-10-01",
  "num_lessons": 20,
  "duration_minutes": 60,
  "max_students": 15,
  "status": "SCHEDULED"
}
```

**Response (Success - 201 Created):**
```json
{
  "id": 1,
  "name": "Monday/Wednesday Theory Classes",
  "course": {
    "id": 1,
    "name": "Driving Theory Course B",
    "category": "B",
    "type": "THEORY"
  },
  "instructor": {
    "id": 1,
    "first_name": "John",
    "last_name": "Smith",
    "email": "john.smith@example.com"
  },
  "resource": {
    "id": 1,
    "name": "Classroom A",
    "category": "CLASSROOM"
  },
  "students": [
    {
      "id": 1,
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice@example.com"
    }
  ],
  "recurrence_days": ["MONDAY", "WEDNESDAY"],
  "times": ["10:00", "14:00"],
  "start_date": "2024-10-01",
  "num_lessons": 20,
  "duration_minutes": 60,
  "max_students": 15,
  "status": "SCHEDULED",
  "created_at": "2024-09-15T10:30:00Z"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "recurrence_days": ["Recurrence days cannot be empty."],
  "times": ["Times cannot be empty."],
  "start_date": ["Start date cannot be in the past."]
}
```

### Get/Update/Delete Scheduled Class Pattern

**Endpoints:**
- `GET /api/scheduled-class-patterns/{id}/` - Get pattern details
- `PUT /api/scheduled-class-patterns/{id}/` - Update pattern
- `DELETE /api/scheduled-class-patterns/{id}/` - Delete pattern

**Authentication:** Admin required for PUT/DELETE

### Generate Classes from Pattern

**Endpoint:** `POST /api/scheduled-class-patterns/{id}/generate-classes/`

**Description:** Generate ScheduledClass instances based on the pattern's recurrence rules.

**Authentication:** Admin required

**Response (Success - 200 OK):**
```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "name": "Monday/Wednesday Theory Classes - 2024-10-01 10:00",
      "scheduled_time": "2024-10-01T10:00:00Z",
      "duration_minutes": 60,
      "max_students": 15,
      "status": "SCHEDULED"
    }
  ]
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "detail": "Overlap detected for instructor at 2024-10-01 10:00:00+00:00."
}
```

### Regenerate Classes from Pattern

**Endpoint:** `POST /api/scheduled-class-patterns/{id}/regenerate-classes/`

**Description:** Delete existing generated classes and create new ones.

**Authentication:** Admin required

**Response (Success - 200 OK):**
```json
{
  "deleted_count": 20,
  "generated_count": 20,
  "results": [...]
}
```

### Get Pattern Statistics

**Endpoint:** `GET /api/scheduled-class-patterns/{id}/statistics/`

**Description:** Get statistics for a scheduled class pattern.

**Authentication:** Authenticated user

**Response (Success - 200 OK):**
```json
{
  "pattern_id": 1,
  "pattern_name": "Monday/Wednesday Theory Classes",
  "total_classes": 20,
  "scheduled_classes": 18,
  "completed_classes": 2,
  "cancelled_classes": 0,
  "total_enrolled_students": 12,
  "average_students_per_class": 12.0,
  "capacity_utilization_percent": 80.0
}
```

### Export Patterns

**Endpoint:** `GET /api/scheduled-class-patterns/export/`

**Description:** Export scheduled class patterns to CSV.

**Authentication:** Admin required

**Response:** CSV file download

## Scheduled Classes

### List/Create Scheduled Classes

**Endpoints:**
- `GET /api/scheduled-classes/` - List all classes
- `POST /api/scheduled-classes/` - Create new class

**Query Parameters (GET):**
- `pattern__course` - Filter by course ID
- `pattern__instructor` - Filter by instructor ID
- `pattern__resource` - Filter by resource ID
- `status` - Filter by status
- `scheduled_time__date` - Filter by date
- `scheduled_time__gte` - Filter by start time
- `scheduled_time__lte` - Filter by end time

**Request Body (POST):**
```json
{
  "pattern_id": 1,
  "name": "Custom Class",
  "scheduled_time": "2024-10-01T10:00:00Z",
  "duration_minutes": 60,
  "max_students": 15,
  "status": "SCHEDULED"
}
```

### Get/Update/Delete Scheduled Class

**Endpoints:**
- `GET /api/scheduled-classes/{id}/` - Get class details
- `PUT /api/scheduled-classes/{id}/` - Update class
- `DELETE /api/scheduled-classes/{id}/` - Delete class

**Authentication:** Admin required for PUT/DELETE

### Enroll Student in Class

**Endpoint:** `POST /api/scheduled-classes/{id}/enroll/`

**Request Body:**
```json
{
  "student_id": 1
}
```

**Response (Success - 200 OK):**
```json
{
  "id": 1,
  "name": "Monday Theory Class",
  "scheduled_time": "2024-10-01T10:00:00Z",
  "students": [
    {
      "id": 1,
      "first_name": "Alice",
      "last_name": "Johnson"
    }
  ]
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "detail": "Student already enrolled"
}
```

### Unenroll Student from Class

**Endpoint:** `POST /api/scheduled-classes/{id}/unenroll/`

**Request Body:**
```json
{
  "student_id": 1
}
```

### Export Classes

**Endpoint:** `GET /api/scheduled-classes/export/`

**Description:** Export scheduled classes to CSV.

**Authentication:** Admin required

**Response:** CSV file download

### Import Classes

**Endpoint:** `POST /api/scheduled-classes/import/`

**Description:** Import scheduled classes from CSV.

**Authentication:** Admin required

**Request:** Multipart form data with CSV file

**Response (Success - 200 OK):**
```json
{
  "created": 5,
  "updated": 2,
  "created_ids": [1, 2, 3, 4, 5],
  "updated_ids": [6, 7],
  "errors": []
}
```


## School Configuration

### Get School Configuration

**Endpoint:** `GET /api/school/config/`

**Description:** Retrieves the singleton school configuration settings.

**Response (Success - 200 OK):**
```json
{
  "id": 1,
  "school_name": "Learn Drive Shine",
  "school_logo": "http://localhost:8000/media/logos/logo.png",
  "business_hours": "Mon-Fri: 9AM-6PM",
  "email": "contact@school.com",
  "contact_phone1": "+37360123456",
  "contact_phone2": "+37360654321",
  "landing_image": "http://localhost:8000/media/landing/hero.jpg",
  "landing_text": {"en": "Welcome", "ro": "Bun venit"},
  "social_links": {"facebook": "https://...", "instagram": "https://..."},
  "rules": {"min_theory_hours_before_practice": 20},
  "available_categories": ["A", "B", "C"],
  "addresses": [
    {"id": 1, "street": "Main St 123", "city": "Chisinau"}
  ]
}
```

**Phone Number Format:**
- `contact_phone1` and `contact_phone2` use international E.164 format
- Examples: `+37360123456`, `+1234567890`
- Local numbers are automatically converted (e.g., `060123456` → `+37360123456`)
- Validates country code, area code, and number length

### Update School Configuration

**Endpoint:** `PUT /api/school/config/1/`

**Description:** Updates the school configuration (singleton instance).

**Request Body:**
```json
{
  "school_name": "New School Name",
  "contact_phone1": "+37360123456",
  "contact_phone2": "+37360654321",
  "business_hours": "Mon-Sun: 8AM-8PM",
  "email": "newemail@school.com",
  "address_ids": [1, 2]
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "contact_phone1": ["Enter a valid phone number (e.g. +12125552368)."],
  "contact_phone2": ["The phone number entered is not valid."]
}
```

**Phone Validation Rules:**
- Must include country code (+ prefix)
- Minimum 8 digits, maximum 16 digits
- No letters or special characters except '+'
- International format preferred: +[country][area][number]

### Upload School Logo

**Endpoint:** `POST /api/school/config/upload_logo/`

**Description:** Upload or replace school logo image.

**Request:** Multipart form-data

**Form Fields:**
- `logo`: Image file (required)

**File Requirements:**
- Maximum size: 5MB
- Allowed formats: JPG, PNG, GIF, WEBP
- Must be valid, non-corrupted image

**Response (Success - 200 OK):**
```json
{
  "message": "Logo uploaded successfully",
  "school_logo": "http://localhost:8000/media/logos/school-logo.png"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "File size must not exceed 5MB (current: 7.32MB)"
}
```

```json
{
  "error": "Invalid file extension '.txt'. Allowed: .jpg, .jpeg, .png, .gif, .webp"
}
```

### Upload Landing Image

**Endpoint:** `POST /api/school/config/upload_landing_image/`

**Description:** Upload or replace landing page hero image.

**Request:** Multipart form-data

**Form Fields:**
- `image`: Image file (required)

**File Requirements:** Same as logo upload

**Response:** Same format as logo upload

