# Mock Data for Driving School Management System

This directory contains comprehensive mock data files for testing and development of the driving school management system. All data follows the validation rules and business logic of the application.

## Data Files

### Core Entities
- `students.csv` - 20 students with various statuses (ACTIVE, PENDING, GRADUATED)
- `instructors.csv` - 10 instructors with different license categories
- `courses.csv` - 10 courses covering theory and practice for different vehicle categories
- `resources.csv` - 14 resources (4 classrooms + 10 vehicles)

### Relationships & Transactions
- `enrollments.csv` - 20 enrollments linking students to courses
- `instructor_availabilities.csv` - Availability schedules for instructors
- `scheduled_class_patterns.csv` - 8 recurring class patterns
- `scheduled_classes.csv` - 10 individual scheduled classes
- `payments.csv` - 20 payment records with different statuses
- `lessons.csv` - 20 individual lessons

## Data Validation Standards

### Phone Numbers
- All phone numbers use +373 prefix (Moldova)
- Format: +373XXXXXXXX (8-16 digits total)
- Follows `normalize_phone()` validation rules

### Names
- Letters, spaces, and hyphens only
- Maximum 50 characters
- Follows `validate_name()` rules

### License Categories
- Valid enum values: AM, A1, A2, A, B1, B, C1, C, D1, D, BE, C1E, CE, D1E, DE
- Comma-separated, uppercase
- Follows `validate_license_categories()` rules

### Categories & Types
- Course categories match vehicle categories
- Course types: THEORY or PRACTICE
- Enrollment types match course types

### Dates & Times
- Realistic date ranges (2025)
- Proper ISO format with timezone
- Future dates for scheduled events

### Relationships
- Foreign keys are valid and consistent
- Students enrolled in appropriate courses
- Instructors have matching license categories
- Resources match course categories
- Lessons use appropriate vehicles/classrooms

## Business Rules Applied

### Enrollment Logic
- Students can enroll in theory and practice courses
- Practice enrollments require theory completion
- Status progression: PENDING → IN_PROGRESS → COMPLETED

### Resource Allocation
- Theory classes use classrooms (capacity > 2)
- Practice classes use vehicles (capacity = 2)
- Resource categories match course categories

### Instructor Availability
- Realistic working hours (8 AM - 6 PM)
- Multiple time slots per day
- Consistent across weekdays

### Payment Logic
- Theory courses: 1200-1500 MDL
- Practice courses: 1500-2500 MDL
- Various payment methods and statuses

## Usage

Import these CSV files in the correct order to maintain referential integrity:

1. `students.csv`
2. `instructors.csv`
3. `courses.csv`
4. `resources.csv`
5. `enrollments.csv`
6. `instructor_availabilities.csv`
7. `scheduled_class_patterns.csv`
8. `scheduled_classes.csv`
9. `payments.csv`
10. `lessons.csv`

Use the Django admin import functionality or custom management commands to load this data.</content>
<parameter name="filePath">d:\Programming\drive-admin\globant-practice-2025\docs\mock\README.md