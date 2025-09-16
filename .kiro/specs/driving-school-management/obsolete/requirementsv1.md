# Requirements Document

## Introduction

The Driving School Management System is a comprehensive digital platform designed to modernize driving school operations by connecting students, instructors, staff, and management in one centralized system. This system replaces outdated paper-based processes and manual phone scheduling with a modern, multilingual (EN/RO/RU), scalable solution that serves the real-world needs of Moldova's driving education sector.

The system enables driving schools to efficiently manage student enrollment and tracking, instructor and vehicle assignments, lesson scheduling, payment processing, and basic notifications while providing multi-language support for diverse user bases.

## Requirements

### Requirement 1: Student Management System

**User Story:** As a driving school administrator, I want to manage student information and enrollment processes, so that I can efficiently track students throughout their learning journey and maintain organized records.

#### Acceptance Criteria

1. WHEN a student visits the landing page THEN the system SHALL provide a self-registration form with fields for first name, last name, email, phone number, date of birth, course selection, and GDPR consent
2. WHEN a student submits the registration form THEN the system SHALL create a student record with PENDING status and send a confirmation email
3. WHEN an administrator accesses the student management dashboard THEN the system SHALL display all students with full CRUD operations (Create, Read, Update, Delete)
4. WHEN an administrator searches for students THEN the system SHALL provide search functionality with pagination support
5. WHEN a student's status changes THEN the system SHALL track status transitions (PENDING, ACTIVE, GRADUATED, DROPPED)
6. WHEN student data is collected THEN the system SHALL record GDPR consent compliance with timestamps

### Requirement 2: Instructor Management System

**User Story:** As a driving school manager, I want to manage instructor information and assignments, so that I can efficiently allocate teaching resources and track instructor availability.

#### Acceptance Criteria

1. WHEN an administrator manages instructors THEN the system SHALL provide complete CRUD operations for instructor records
2. WHEN creating an instructor profile THEN the system SHALL capture first name, last name, email, phone number, hire date, and license categories
3. WHEN assigning students to instructors THEN the system SHALL enable student assignment capabilities
4. WHEN an instructor views their schedule THEN the system SHALL display assigned lessons and student information
5. WHEN tracking instructor qualifications THEN the system SHALL maintain license category information for proper assignment matching

### Requirement 3: Vehicle Management System

**User Story:** As a driving school operations manager, I want to manage the vehicle fleet, so that I can ensure proper vehicle allocation for lessons and track maintenance requirements.

#### Acceptance Criteria

1. WHEN managing vehicles THEN the system SHALL provide full CRUD operations for vehicle records
2. WHEN creating vehicle records THEN the system SHALL capture make, model, license plate, year, category, and availability status
3. WHEN assigning vehicles to lessons THEN the system SHALL enable instructor and lesson assignments
4. WHEN tracking vehicle status THEN the system SHALL monitor availability and maintenance flags
5. WHEN scheduling lessons THEN the system SHALL prevent double-booking of vehicles through availability tracking

### Requirement 4: Lesson Scheduling System

**User Story:** As a reception staff member, I want to schedule theory and driving lessons, so that I can coordinate student learning activities with available instructors and vehicles.

#### Acceptance Criteria

1. WHEN scheduling lessons THEN the system SHALL support both theory and driving lesson types
2. WHEN creating a lesson THEN the system SHALL require student enrollment, instructor assignment, scheduled time, and duration
3. WHEN scheduling driving lessons THEN the system SHALL require vehicle assignment in addition to instructor
4. WHEN checking availability THEN the system SHALL detect and prevent scheduling conflicts for instructors and vehicles
5. WHEN viewing schedules THEN the system SHALL provide calendar and table view interfaces
6. WHEN lessons are completed THEN the system SHALL enable attendance tracking and note recording
7. WHEN conflicts occur THEN the system SHALL return clear error messages indicating the nature of the conflict

### Requirement 5: Payment Tracking System

**User Story:** As a driving school director, I want to track student payments and course fees, so that I can monitor financial performance and ensure proper billing management.

#### Acceptance Criteria

1. WHEN recording payments THEN the system SHALL link payments to student enrollments with amount, date, and method tracking
2. WHEN processing payments THEN the system SHALL support multiple payment methods (CASH, CARD, TRANSFER)
3. WHEN managing payment status THEN the system SHALL track payment states (PENDING, COMPLETED, REFUNDED)
4. WHEN generating reports THEN the system SHALL provide export capabilities (CSV/PDF) for financial analysis
5. WHEN calculating totals THEN the system SHALL compare payment amounts against total course fees
6. WHEN viewing payment history THEN the system SHALL display transaction references and descriptions

### Requirement 6: Authentication and Authorization System

**User Story:** As a system administrator, I want to control user access and permissions, so that I can ensure data security and appropriate role-based functionality.

#### Acceptance Criteria

1. WHEN users authenticate THEN the system SHALL use JWT-based authentication with access and refresh tokens
2. WHEN assigning roles THEN the system SHALL support Admin, Director, Instructor, Reception, and Student roles
3. WHEN Admin users access the system THEN the system SHALL provide full system access to all features and data
4. WHEN Director users access the system THEN the system SHALL provide reports and high-level management capabilities
5. WHEN Instructor users access the system THEN the system SHALL limit access to assigned students and personal schedule
6. WHEN Reception users access the system THEN the system SHALL enable student registration, scheduling, and payment management
7. WHEN Student users access the system THEN the system SHALL provide access to personal information and portal features

### Requirement 7: Notification System

**User Story:** As a driving school staff member, I want to send automated notifications to students, so that I can improve communication and reduce missed appointments.

#### Acceptance Criteria

1. WHEN a student registers THEN the system SHALL send an email confirmation automatically
2. WHEN lessons are scheduled THEN the system SHALL send lesson reminder notifications
3. WHEN sending notifications THEN the system SHALL use template-based messaging with internationalization support
4. WHEN configuring email THEN the system SHALL support SMTP configuration for email delivery
5. WHEN managing notifications THEN the system SHALL track notification status (PENDING, SENT, FAILED)

### Requirement 8: Multi-language Support System

**User Story:** As a driving school serving diverse communities, I want to provide the system in multiple languages, so that I can accommodate English, Romanian, and Russian-speaking users.

#### Acceptance Criteria

1. WHEN users access the interface THEN the system SHALL support English, Romanian, and Russian languages
2. WHEN switching languages THEN the system SHALL provide a language toggle functionality
3. WHEN displaying content THEN the system SHALL serve localized content via internationalization (i18n)
4. WHEN sending notifications THEN the system SHALL support multi-language templates
5. WHEN users change language preferences THEN the system SHALL update the interface without requiring page reload

### Requirement 9: Reporting and Analytics System

**User Story:** As a driving school director, I want to access operational reports and analytics, so that I can make informed business decisions and track school performance.

#### Acceptance Criteria

1. WHEN generating student reports THEN the system SHALL provide student summary reports with date range filtering
2. WHEN analyzing financial data THEN the system SHALL calculate revenue totals and payment statistics
3. WHEN accessing reports THEN the system SHALL restrict report access to Director and Admin roles
4. WHEN exporting data THEN the system SHALL support CSV and PDF export formats
5. WHEN viewing analytics THEN the system SHALL display aggregated counts for students, lessons, and payments

### Requirement 10: Data Security and Compliance System

**User Story:** As a driving school owner, I want to ensure data protection and regulatory compliance, so that I can protect student privacy and meet legal requirements.

#### Acceptance Criteria

1. WHEN collecting student data THEN the system SHALL record GDPR-compliant consent with timestamps
2. WHEN users perform actions THEN the system SHALL maintain audit logging for accountability
3. WHEN handling data requests THEN the system SHALL provide data export and deletion capabilities
4. WHEN accessing data THEN the system SHALL enforce role-based data access restrictions
5. WHEN storing sensitive information THEN the system SHALL implement appropriate security measures for data protection