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
