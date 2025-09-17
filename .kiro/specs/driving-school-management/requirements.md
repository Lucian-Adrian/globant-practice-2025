# Requirements Document

## Introduction

The Driving School Management System is a comprehensive digital platform designed to modernize driving school operations by connecting students, instructors, staff, and management in one centralized system. This system will replace outdated paper-based processes and manual phone scheduling with a modern, multilingual (EN/RO/RU), scalable solution that serves the real-world needs of Moldova's driving education sector.

Building upon the existing Django backend with PostgreSQL database, the system will be enhanced with proper authentication, role-based access control, conflict detection, notification systems, and a modern React-based frontend. The system will follow Django best practices including proper project structure, advanced DRF usage, and production-ready code organization.

## Requirements

### Requirement 1: User Authentication and Role Management System

**User Story:** As a system administrator, I want to implement a comprehensive user authentication and role-based access control system, so that different types of users can securely access appropriate functionality based on their roles.

#### Acceptance Criteria

1. WHEN implementing user authentication THEN the system SHALL use a custom User model extending AbstractUser with role field
2. WHEN defining user roles THEN the system SHALL support Admin, Director, Instructor, and Reception roles using Python enums (Students are separate entities, not Django Users)
3. WHEN users authenticate THEN the system SHALL use JWT-based authentication with access and refresh tokens for staff users
4. WHEN Admin users access the system THEN the system SHALL provide full system access to all features and data
5. WHEN Director users access the system THEN the system SHALL provide access to reports, analytics, and high-level management features
6. WHEN Instructor users access the system THEN the system SHALL limit access to assigned students, personal schedule, and lesson management
7. WHEN Reception users access the system THEN the system SHALL enable student registration, scheduling, payment management, and basic operations
8. WHEN Students access the system THEN the system SHALL provide limited frontend-only access to personal information and schedule viewing through separate authentication mechanism
9. WHEN implementing instructor profiles THEN the system SHALL use OneToOneField relationship with the custom User model
10. WHEN managing user sessions THEN the system SHALL implement proper token refresh mechanisms and session management

### Requirement 2: Enhanced Student Management System

**User Story:** As a driving school administrator, I want to manage student information with enhanced features including public registration, status tracking, and GDPR compliance, so that I can efficiently handle the complete student lifecycle.

#### Acceptance Criteria

1. WHEN students register publicly THEN the system SHALL provide a landing page form with fields for first name, last name, email, phone number, date of birth, course selection, and GDPR consent checkbox
2. WHEN public registration is submitted THEN the system SHALL create a student record with PENDING status and send confirmation email
3. WHEN managing student status THEN the system SHALL support PENDING, ACTIVE, INACTIVE, GRADUATED, and DROPPED status values using Python enums
4. WHEN administrators search students THEN the system SHALL provide advanced search with filters by status, enrollment date range, course, and text search across name and email
5. WHEN displaying student lists THEN the system SHALL implement proper pagination using DRF's pagination classes
6. WHEN collecting student data THEN the system SHALL record GDPR consent with timestamp and maintain audit trail
7. WHEN exporting student data THEN the system SHALL provide CSV export functionality with filtering support
8. WHEN importing student data THEN the system SHALL support bulk CSV import with validation and error reporting
9. WHEN students are activated by staff THEN the system SHALL generate enrollment records linking them to selected courses
10. WHEN managing student records THEN the system SHALL maintain created_at and updated_at timestamps for all operations
11. WHEN tracking student communications THEN the system SHALL maintain a timeline log of all interactions including emails, SMS, WhatsApp messages, and staff notes with timestamps and responsible staff member

### Requirement 3: Instructor Management and User Integration System

**User Story:** As a driving school manager, I want to manage instructor information integrated with the user system, so that instructors can authenticate and access their assigned responsibilities.

#### Acceptance Criteria

1. WHEN creating instructor profiles THEN the system SHALL use OneToOneField relationship with the custom User model
2. WHEN managing instructor data THEN the system SHALL capture hire date, license categories, active status, and contact information
3. WHEN storing license categories THEN the system SHALL use structured data format supporting multiple vehicle categories
4. WHEN instructors authenticate THEN the system SHALL use the same JWT authentication system as other users
5. WHEN instructors access their dashboard THEN the system SHALL display assigned students, upcoming lessons, and personal schedule
6. WHEN assigning students to instructors THEN the system SHALL allow both course-level default assignments (for theory) and per-lesson instructor selection (for practice)
7. WHEN tracking instructor availability THEN the system SHALL consider active status and scheduled lessons
8. WHEN managing instructor permissions THEN the system SHALL restrict access to only assigned students and personal data
9. WHEN displaying instructor information THEN the system SHALL join User model data for complete profile information
10. WHEN deactivating instructors THEN the system SHALL maintain data integrity while preventing new assignments

### Requirement 4: Course and Enrollment Management System

**User Story:** As a driving school administrator, I want to manage course offerings and student enrollments with proper lesson allocation, so that I can track student progress and ensure proper course completion requirements.

#### Acceptance Criteria

1. WHEN defining courses THEN the system SHALL capture name, category, description, price, theory_required_lessons, and practice_required_lessons
2. WHEN creating enrollments THEN the system SHALL link students to courses with enrollment date and status tracking
3. WHEN assigning default instructors THEN the system SHALL allow optional instructor assignment at enrollment level for theory lessons
4. WHEN tracking enrollment progress THEN the system SHALL maintain counters for theory_lessons_taken and practice_lessons_taken
5. WHEN validating course completion THEN the system SHALL compare lessons taken against required lessons for both theory and practice
6. WHEN managing enrollment status THEN the system SHALL support IN_PROGRESS, COMPLETED, and DROPPED status values
7. WHEN calculating course fees THEN the system SHALL use course price as basis for payment validation and balance calculations
8. WHEN displaying enrollment information THEN the system SHALL show progress percentages and remaining lesson requirements
9. WHEN updating enrollment status THEN the system SHALL automatically update based on lesson completion and payment status
10. WHEN managing course categories THEN the system SHALL align with vehicle license categories for proper instructor and vehicle matching
11. WHEN offering lesson packages THEN the system SHALL support both standard course packages and individual lesson sales with flexible pricing
12. WHEN configuring lesson types THEN the system SHALL distinguish between individual lessons and group sessions with different capacity and pricing models

### Requirement 5: Enhanced Vehicle Management System

**User Story:** As a driving school operations manager, I want to manage the vehicle fleet with maintenance tracking and availability management, so that I can ensure proper vehicle allocation and maintenance compliance.

#### Acceptance Criteria

1. WHEN managing vehicles THEN the system SHALL provide full CRUD operations with proper validation
2. WHEN creating vehicle records THEN the system SHALL capture make, model, license plate, year, category, availability status, and maintenance information
3. WHEN tracking maintenance THEN the system SHALL record last_maintenance_date and maintenance_due boolean flag
4. WHEN assigning vehicles to lessons THEN the system SHALL check availability status and prevent double-booking
5. WHEN managing vehicle categories THEN the system SHALL use Python enums matching driving license categories
6. WHEN updating vehicle status THEN the system SHALL maintain audit trail of availability changes
7. WHEN scheduling maintenance THEN the system SHALL automatically update availability status
8. WHEN displaying vehicle information THEN the system SHALL show current assignment status and next maintenance due
9. WHEN filtering vehicles THEN the system SHALL support filtering by availability, category, and maintenance status
10. WHEN validating vehicle data THEN the system SHALL ensure unique license plates and proper category matching

### Requirement 6: Advanced Lesson Scheduling System with Conflict Detection

**User Story:** As a reception staff member, I want to schedule lessons with automatic conflict detection and resolution, so that I can efficiently coordinate student learning activities without scheduling conflicts.

#### Acceptance Criteria

1. WHEN scheduling lessons THEN the system SHALL implement comprehensive conflict detection for instructor and vehicle availability
2. WHEN creating lessons THEN the system SHALL validate that instructor is not double-booked for the requested time slot
3. WHEN assigning vehicles THEN the system SHALL ensure vehicle is available and not assigned to another lesson at the same time
4. WHEN conflict is detected THEN the system SHALL return HTTP 409 status with detailed conflict information including resource type and conflicting time
5. WHEN calculating conflicts THEN the system SHALL consider lesson duration and overlap scenarios using proper time range queries
6. WHEN scheduling practical lessons THEN the system SHALL require both instructor and vehicle assignment
7. WHEN scheduling individual theory lessons THEN the system SHALL require instructor assignment but vehicle assignment is optional
8. WHEN scheduling group theory sessions THEN the system SHALL support multiple students per session with configurable capacity limits and classroom assignment
9. WHEN displaying schedules THEN the system SHALL provide calendar view and table view interfaces
10. WHEN scheduling theory lessons THEN the system SHALL default to the assigned instructor from enrollment, unless manually changed by authorized staff
11. WHEN scheduling practice lessons THEN the system SHALL allow selecting any available instructor, subject to administrative approval if different from the default
12. WHEN updating lesson status THEN the system SHALL support SCHEDULED, COMPLETED, CANCELED, and NO_SHOW status values
13. WHEN recording lesson completion THEN the system SHALL enable attendance tracking, notes recording, and status updates
14. WHEN implementing lesson policies THEN the system SHALL define cancellation rules (minimum hours before lesson), no-show policies, and rescheduling constraints
15. WHEN handling missed lessons THEN the system SHALL count NO_SHOW lessons against student balance and enrollment progress unless marked as excused by authorized staff
16. WHEN querying lessons THEN the system SHALL optimize database queries using select_related for instructor, vehicle, and enrollment data
17. WHEN implementing conflict detection THEN the system SHALL use database-level queries with proper indexing for performance

### Requirement 7: Enhanced Payment Tracking System

**User Story:** As a driving school director, I want to track student payments with comprehensive financial reporting, so that I can monitor financial performance and ensure proper billing management.

#### Acceptance Criteria

1. WHEN recording payments THEN the system SHALL link payments to enrollments with amount, date, method, and status tracking
2. WHEN processing payments THEN the system SHALL support CASH, CARD, and TRANSFER payment methods using Python enums
3. WHEN managing payment status THEN the system SHALL track PENDING, COMPLETED, and REFUNDED status values
4. WHEN calculating balances THEN the system SHALL compare total payments against course fees to show outstanding amounts
5. WHEN generating financial reports THEN the system SHALL provide export capabilities in CSV and PDF formats
6. WHEN filtering payments THEN the system SHALL support filtering by student, date range, payment method, and status
7. WHEN displaying payment history THEN the system SHALL show transaction references, descriptions, and related enrollment information
8. WHEN creating payment records THEN the system SHALL validate amounts against course price and support partial payments, installment payments, and extra lesson fees beyond the standard package
9. WHEN implementing payment integration THEN the system SHALL provide foundation for future integration with MAIB/PayNet payment gateways
10. WHEN accessing payment data THEN the system SHALL restrict access based on user roles (Director and Admin full access, Reception limited access)
11. WHEN aggregating financial data THEN the system SHALL provide summary statistics for revenue analysis and reporting

### Requirement 8: Notification and Communication System

**User Story:** As a driving school staff member, I want to send automated notifications to students and staff, so that I can improve communication and reduce missed appointments.

#### Acceptance Criteria

1. WHEN students register THEN the system SHALL automatically send email confirmation with registration details
2. WHEN lessons are scheduled THEN the system SHALL send lesson confirmation notifications to students and instructors
3. WHEN sending notifications THEN the system SHALL use template-based messaging with multi-language support
4. WHEN implementing notification channels THEN the system SHALL design abstract notification system supporting email, SMS, and WhatsApp channels
5. WHEN configuring email THEN the system SHALL support SMTP configuration with environment-based settings
6. WHEN managing notification queue THEN the system SHALL track notification status as PENDING, SENT, or FAILED
7. WHEN processing notifications THEN the system SHALL implement asynchronous processing using Celery or similar task queue
8. WHEN creating notification templates THEN the system SHALL support internationalization for EN, RO, and RU languages
9. WHEN handling notification failures THEN the system SHALL implement retry mechanisms and error logging
10. WHEN scheduling reminder notifications THEN the system SHALL support time-based scheduling for lesson reminders
11. WHEN managing notification preferences THEN the system SHALL allow users to configure notification settings and preferred channels

### Requirement 9: Multi-language Support System

**User Story:** As a driving school serving diverse communities, I want to provide the system in multiple languages, so that I can accommodate English, Romanian, and Russian-speaking users effectively.

#### Acceptance Criteria

1. WHEN users access the interface THEN the system SHALL support English, Romanian, and Russian languages
2. WHEN implementing frontend internationalization THEN the system SHALL use react-i18next with proper language resource files
3. WHEN switching languages THEN the system SHALL provide language toggle functionality without page reload
4. WHEN displaying backend content THEN the system SHALL serve localized content for API responses where applicable
5. WHEN sending notifications THEN the system SHALL use language-specific email templates
6. WHEN storing user preferences THEN the system SHALL remember language selection across sessions
7. WHEN handling Cyrillic text THEN the system SHALL properly support UTF-8 encoding for Russian content
8. WHEN translating interface elements THEN the system SHALL provide complete translations for all user-facing text
9. WHEN managing translation resources THEN the system SHALL organize translation files by feature and language
10. WHEN implementing language fallback THEN the system SHALL default to English if translations are missing

### Requirement 10: Basic Reporting System

**User Story:** As a driving school director, I want to access basic operational reports, so that I can monitor essential business metrics and performance.

#### Acceptance Criteria

1. WHEN generating student reports THEN the system SHALL provide basic student summary reports with filtering by date range and status
2. WHEN analyzing financial data THEN the system SHALL calculate revenue totals and payment statistics
3. WHEN generating utilization reports THEN the system SHALL provide instructor hours and vehicle usage statistics for resource management
4. WHEN exporting basic reports THEN the system SHALL support CSV export format
5. WHEN restricting report access THEN the system SHALL limit report functionality to Director and Admin roles
6. WHEN calculating aggregated data THEN the system SHALL use efficient database queries with proper indexing

### Requirement 11: Data Security and Compliance System

**User Story:** As a driving school owner, I want to ensure data protection and regulatory compliance, so that I can protect student privacy and meet legal requirements.

#### Acceptance Criteria

1. WHEN collecting student data THEN the system SHALL record GDPR-compliant consent with timestamps and audit trail
2. WHEN users perform actions THEN the system SHALL maintain basic audit logging for critical operations
3. WHEN handling data requests THEN the system SHALL provide basic data export capabilities for GDPR compliance
4. WHEN implementing access control THEN the system SHALL enforce role-based data access restrictions at API level
5. WHEN storing sensitive information THEN the system SHALL implement appropriate security measures including password hashing
6. WHEN managing user sessions THEN the system SHALL implement secure JWT token handling with proper expiration
7. WHEN logging system events THEN the system SHALL record critical user actions and data changes
9. WHEN handling authentication THEN the system SHALL implement rate limiting and brute force protection
10. WHEN managing database access THEN the system SHALL use environment-based configuration for sensitive credentials

### Requirement 12: System Architecture and Code Quality Enhancement

**User Story:** As a development team, I want to implement modern Django best practices and code organization, so that the system is maintainable, scalable, and follows industry standards.

#### Acceptance Criteria

1. WHEN organizing project structure THEN the system SHALL implement modular URLs with each app having its own urls.py file
2. WHEN implementing API views THEN the system SHALL rename api.py to views.py following Django conventions
3. WHEN organizing business logic THEN the system SHALL implement services.py for complex business logic and utils.py for helper functions
4. WHEN implementing serializers THEN the system SHALL use advanced DRF serializer features including nested serializers and custom validations
5. WHEN managing dependencies THEN the system SHALL consider migration to Poetry for modern dependency management
6. WHEN formatting code THEN the system SHALL implement PEP 8 compliance with automated formatting tools
7. WHEN using Python features THEN the system SHALL leverage Python 3.11+ features including match/case statements where appropriate
8. WHEN implementing model relationships THEN the system SHALL use get_user_model() in code and settings.AUTH_USER_MODEL in ForeignKeys
9. WHEN defining choices THEN the system SHALL use Python enums instead of tuple-based choices for better type safety
10. WHEN implementing API documentation THEN the system SHALL integrate drf-spectacular for automatic OpenAPI documentation generation
11. WHEN configuring development environment THEN the system SHALL implement docker-compose.override.yml for local development settings
12. WHEN implementing pagination THEN the system SHALL use DRF's built-in pagination classes with proper configuration

### Requirement 13: Frontend Development and User Experience

**User Story:** As an end user, I want to interact with a modern, responsive, and intuitive interface, so that I can efficiently perform my tasks regardless of my role in the system.

#### Acceptance Criteria

1. WHEN implementing admin interface THEN the system SHALL use React Admin for comprehensive resource management
2. WHEN creating public interfaces THEN the system SHALL use React/Next.js for landing page and student portal
3. WHEN implementing authentication flow THEN the system SHALL provide secure login with JWT token management
4. WHEN displaying data lists THEN the system SHALL implement proper pagination, filtering, and search functionality
5. WHEN creating forms THEN the system SHALL provide comprehensive validation with user-friendly error messages
6. WHEN implementing calendar views THEN the system SHALL provide interactive lesson scheduling with conflict visualization
7. WHEN designing responsive layouts THEN the system SHALL ensure mobile-friendly interfaces across all components
8. WHEN implementing accessibility THEN the system SHALL follow WCAG guidelines for inclusive design
9. WHEN managing application state THEN the system SHALL implement proper state management for complex interactions
10. WHEN optimizing performance THEN the system SHALL implement code splitting and lazy loading for better user experience
11. WHEN implementing student portal THEN the system SHALL provide visual progress tracking showing lessons completed vs remaining for both theory and practice
12. WHEN displaying student schedules THEN the system SHALL provide calendar view of scheduled lessons with lesson details
13. WHEN showing payment information THEN the system SHALL display paid lessons vs outstanding balance with clear financial status
14. WHEN providing enrollment details THEN the system SHALL show course information, enrollment status, and completion requirements
15. WHEN enabling student self-service THEN the system SHALL allow students to view their complete learning journey and reduce administrative inquiries