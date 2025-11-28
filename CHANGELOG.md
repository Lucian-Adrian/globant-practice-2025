# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2025-11-28

### Added

#### Student Portal Enhancements
([#102](https://github.com/Lucian-Adrian/globant-practice-2025/pull/102))
- Student portal scheduled classes view with calendar and list tabs
- Scheduled class enrollment and class details display
- Integration with student dashboard for upcoming classes

([#94](https://github.com/Lucian-Adrian/globant-practice-2025/pull/94))
- Enrollment details modal for student progress tracking
- Visual progress indicators for lesson completion
- Integration with enrollment API endpoints

([#92](https://github.com/Lucian-Adrian/globant-practice-2025/pull/92))
- Enrollment-based progress tracking system
- Migration from lesson-count to enrollment-based progress
- Student dashboard progress visualization

#### Admin Interface Features
([#101](https://github.com/Lucian-Adrian/globant-practice-2025/pull/101))
- Scheduled Class Patterns with auto-enrollment and notifications
- Pattern-based recurring class generation
- Email and SMS notification support for scheduled classes

([#97](https://github.com/Lucian-Adrian/globant-practice-2025/pull/97))
- Quick Add Component for rapid data entry
- Streamlined admin workflow for common operations

([#98](https://github.com/Lucian-Adrian/globant-practice-2025/pull/98))
- School configuration page form
- Customizable school settings interface

([#96](https://github.com/Lucian-Adrian/globant-practice-2025/pull/96))
- Complete React Admin translation system
- Comprehensive i18n support for EN/RO/RU locales
- Admin panel fully internationalized

([#81](https://github.com/Lucian-Adrian/globant-practice-2025/pull/81))
- Scheduled Classes admin module
- CRUD operations for scheduled theory classes
- Student enrollment management for classes

#### Backend API Features
([#90](https://github.com/Lucian-Adrian/globant-practice-2025/pull/90)), ([#91](https://github.com/Lucian-Adrian/globant-practice-2025/pull/91)), ([#95](https://github.com/Lucian-Adrian/globant-practice-2025/pull/95))
- SchoolConfig model for school-wide settings
- Address model with media file support
- SchoolConfig API endpoints with logo and landing image upload
- Serializers and viewsets for configuration management

([#82](https://github.com/Lucian-Adrian/globant-practice-2025/pull/82)), ([#84](https://github.com/Lucian-Adrian/globant-practice-2025/pull/84)), ([#85](https://github.com/Lucian-Adrian/globant-practice-2025/pull/85))
- Recurring scheduled classes feature
- Pattern-based class generation with configurable recurrence
- Multi-student selection for scheduled class patterns

#### TypeScript & Type Safety
([#111](https://github.com/Lucian-Adrian/globant-practice-2025/pull/111))
- TypeScript interfaces for all domain models (Student, Instructor, Course, Enrollment, Lesson, Payment, Resource, ScheduledClass)
- Portal-specific type definitions for dashboard responses
- Improved type safety in portal components

([#113](https://github.com/Lucian-Adrian/globant-practice-2025/pull/113))
- Centralized error message constants for frontend and backend consistency
- i18n-compatible validation error keys

### Changed

#### Code Architecture Refactoring
([#103](https://github.com/Lucian-Adrian/globant-practice-2025/pull/103))
- Removed debug console.log statements from portal components
- Cleaned up unused imports across codebase

([#104](https://github.com/Lucian-Adrian/globant-practice-2025/pull/104)), ([#106](https://github.com/Lucian-Adrian/globant-practice-2025/pull/106)), ([#107](https://github.com/Lucian-Adrian/globant-practice-2025/pull/107)), ([#108](https://github.com/Lucian-Adrian/globant-practice-2025/pull/108))
- Split monolithic `views.py` into modular ViewSet packages:
  - `views/base.py`: FullCrudViewSet, permissions, utilities
  - `views/student_views.py`: StudentViewSet
  - `views/instructor_views.py`: InstructorViewSet, InstructorAvailabilityViewSet
  - `views/lesson_views.py`: LessonViewSet
  - `views/payment_views.py`: PaymentViewSet
  - `views/course_views.py`: CourseViewSet, EnrollmentViewSet
  - `views/resource_views.py`: ResourceViewSet, VehicleViewSet
  - `views/scheduled_views.py`: ScheduledClassPatternViewSet, ScheduledClassViewSet

([#105](https://github.com/Lucian-Adrian/globant-practice-2025/pull/105))
- Extracted reusable form components:
  - `CheckAvailabilityButton` for instructor availability checks
  - `CheckSingleTimeAvailabilityButton` for single time slot validation
  - `CourseStudentsInput` for course-filtered student selection

([#109](https://github.com/Lucian-Adrian/globant-practice-2025/pull/109))
- Extracted i18n messages to separate JSON files
- Reduced `i18n/index.jsx` from 1136 to 258 lines (~77% reduction)
- Created `locales/en-admin.json`, `locales/ro-admin.json`, `locales/ru-admin.json`

([#110](https://github.com/Lucian-Adrian/globant-practice-2025/pull/110))
- Split `lessonValidation.js` into focused modules:
  - `timeUtils.js`: Date/time utilities with BUSINESS_TZ constant
  - `httpUtils.js`: API fetch helpers
  - `availabilityValidation.js`: Instructor availability checks
  - `conflictValidation.js`: Schedule conflict detection
  - `capacityValidation.js`: Capacity and enrollment validation

([#112](https://github.com/Lucian-Adrian/globant-practice-2025/pull/112))
- Extracted serializer validation to dedicated helper functions
- Added `MINIMUM_STUDENT_AGE` constant
- Created `validate_date_of_birth()`, `validate_unique_email()`, `validate_unique_phone()` helpers

#### UI/UX Improvements
([#86](https://github.com/Lucian-Adrian/globant-practice-2025/pull/86))
- Replaced TextInput with TimeInput for time fields
- Added time format validation

([#87](https://github.com/Lucian-Adrian/globant-practice-2025/pull/87))
- Fixed multiple student selection in scheduled class pattern forms
- Improved student selection UX

### Fixed

#### Validation & Data Integrity
([#64](https://github.com/Lucian-Adrian/globant-practice-2025/pull/64))
- Dropdowns in edit forms now pre-fill with current values
- Fixed dropdown prefill issues in admin edit forms

([#65](https://github.com/Lucian-Adrian/globant-practice-2025/pull/65))
- Admin form validation improvements
- Enhanced client-side validation feedback

([#67](https://github.com/Lucian-Adrian/globant-practice-2025/pull/67)), ([#73](https://github.com/Lucian-Adrian/globant-practice-2025/pull/73))
- Fixed duplicate `django_validate_license_categories` function definition
- Removed duplicate `validate_license_categories` method definitions

([#89](https://github.com/Lucian-Adrian/globant-practice-2025/pull/89))
- Lesson and scheduled class validation fixes
- Improved conflict detection and availability checks

#### Code Quality
([#68](https://github.com/Lucian-Adrian/globant-practice-2025/pull/68))
- Fixed typo in lessonValidation comment

([#69](https://github.com/Lucian-Adrian/globant-practice-2025/pull/69)), ([#70](https://github.com/Lucian-Adrian/globant-practice-2025/pull/70)), ([#72](https://github.com/Lucian-Adrian/globant-practice-2025/pull/72))
- Removed unused TextInput imports from instructor forms
- Removed unused imports from instructor form components

([#71](https://github.com/Lucian-Adrian/globant-practice-2025/pull/71))
- Removed unused query parameters from `available_resources` endpoint

([#74](https://github.com/Lucian-Adrian/globant-practice-2025/pull/74)), ([#75](https://github.com/Lucian-Adrian/globant-practice-2025/pull/75))
- Added explanatory comments to exception handlers
- Improved code documentation

([#76](https://github.com/Lucian-Adrian/globant-practice-2025/pull/76)), ([#77](https://github.com/Lucian-Adrian/globant-practice-2025/pull/77))
- Addressed code review feedback
- Resolved all review comments from dev pull request

([#79](https://github.com/Lucian-Adrian/globant-practice-2025/pull/79))
- Reverted dev branch to stable state
- Repository cleanup and stabilization

### Internal
- Merged 50 pull requests consolidating team work
- Established modular code architecture for better maintainability
- Created comprehensive TypeScript type system for portal components
- Implemented consistent error handling across frontend and backend

## [0.1.3] - 2025-10-31

### Added
([#51](https://github.com/Lucian-Adrian/globant-practice-2025/pull/51))
- Resource model unifying vehicles and classrooms with max_capacity field.
- ScheduledClass model for group theory classes with direct student enrollment.
- API endpoints for resources (/api/resources/) and scheduled classes (/api/scheduled-classes/).
- Data migration preserving all existing vehicle and lesson data.
- Comprehensive test suite for Resource and ScheduledClass models.

([#49](https://github.com/Lucian-Adrian/globant-practice-2025/pull/49))
- Student list UI with status sorting support.
- Missing translations for student status and action buttons.

([#48](https://github.com/Lucian-Adrian/globant-practice-2025/pull/48))
- Instant language switching for portal and admin interfaces.
- Consistent translation key usage across components.

### Changed
([#51](https://github.com/Lucian-Adrian/globant-practice-2025/pull/51))
- Lesson model uses Resource field instead of Vehicle field.
- Admin interface displays new Resource and ScheduledClass models.

([#48](https://github.com/Lucian-Adrian/globant-practice-2025/pull/48))
- Language switching logic improved for immediate UI updates.

### Fixed
([#52](https://github.com/Lucian-Adrian/globant-practice-2025/pull/52))
- CSV import duplicates prevented with upsert logic for all models.
- Import responses now include created/updated counts and IDs.

## [0.1.2] - 2025-10-30

### Added
([#39](https://github.com/Lucian-Adrian/globant-practice-2025/pull/39))
- BUSINESS_TZ setting (default Europe/Chisinau) for business-local availability rules.
- vehicle_id filter on LessonViewSet for efficient conflict checks.
- Client-side preflight validation for lessons with interval availability checks.
- Server existence checks using page_size=1 for efficient queries.
- Validation keys for EN and RO translations: requiredField, instructorConflict, studentConflict, vehicleConflict, outsideAvailability, categoryMismatch, instructorLicenseMismatch, vehicleUnavailable.

([#46](https://github.com/Lucian-Adrian/globant-practice-2025/pull/46))
- Shared SearchInput (q param) with debounced typing for improved search performance.
- Toolbar filters for instructor, vehicle, lesson type, and date range across admin lists.
- Shared CategoryFilterInput and TypeFilterInput components for consistent filtering.
- Date-range filters for courses and lessons with proper inclusion logic.
- Backend-driven QSearchFilter for unified filtering across admin and portal endpoints.
- Dynamic sidebar filters fetched from backend instead of hardcoded data.
- Removed redundant inline filters and deprecated local filtering logic.

([#44](https://github.com/Lucian-Adrian/globant-practice-2025/pull/44))
- Comprehensive React Admin translations (ra.* keys) in English, Romanian, and Russian.

([#43](https://github.com/Lucian-Adrian/globant-practice-2025/pull/43))
- Central QSearchFilter using `q` parameter for unified search across admin and portal endpoints.
- Enabled DjangoFilterBackend and ordering backends on Instructor, Lesson, Course, and Enrollment viewsets.
- Internationalized "no_results" message for filtered views.
- Unified instructor and vehicle search field handling.
- Consistent query parameter aliases (q vs search) across all endpoints.

### Changed
([#39](https://github.com/Lucian-Adrian/globant-practice-2025/pull/39))
- LessonSerializer validates instructor, student, and vehicle conflicts.
- LessonSerializer enforces business-local interval availability (any-minute start within [t[i], t[i+1]) or exact last slot).
- LessonSerializer checks vehicle.is_available for scheduled lessons.
- LessonSerializer verifies instructor license matches course category.
- LessonSerializer defaults to 90-minute lesson duration.
- Admin scheduled_time sent as UTC ISO format.
- Admin performs client-side availability and conflict checks.
- Field errors now display inline with translations instead of toast notifications.

([#46](https://github.com/Lucian-Adrian/globant-practice-2025/pull/46))
- Payment status display uses database status field instead of calculated business rules.
- Enrollment search upgraded from SelectInput to AutocompleteInput.
- Form components use memoization to prevent unnecessary re-renders.
- PaymentList optimized with useMemo and useCallback hooks.

([#45](https://github.com/Lucian-Adrian/globant-practice-2025/pull/45))
- Vehicle list UI improved with detail drawer and safe row-click handling.

### Fixed
([#39](https://github.com/Lucian-Adrian/globant-practice-2025/pull/39))
- Inline translation for validation.vehicleUnavailable under Vehicle field.
- MUI Select menu flicker resolved using keepMounted property.
- Lesson list row styling uses CSS classes instead of inline styles.
- JWT token expiry issues in authentication flow.

([#46](https://github.com/Lucian-Adrian/globant-practice-2025/pull/46))
- Undefined options in RadioButtonGroupInput and SelectInput components.
- Payment status display showing incorrect statuses.

([#44](https://github.com/Lucian-Adrian/globant-practice-2025/pull/44))
- Missing React Admin component translations (ra.page.error, ra.message.invalid_form, etc.).

([#45](https://github.com/Lucian-Adrian/globant-practice-2025/pull/45))
- PaymentList performance violations from excessive console.log calls (removed 100+ instances).
- ReferenceError in PaymentList from incorrect variable declaration order.

## [0.1.1] - 2025-10-29

### Added
([#47](https://github.com/Lucian-Adrian/globant-practice-2025/pull/47))
- Payment model with enrollment, amount, payment_method, and description fields.
- Payment serializer and API endpoints at /api/payments/.

([#26](https://github.com/Lucian-Adrian/globant-practice-2025/pull/26))
- CSV import/export endpoints for instructors, vehicles, courses, enrollments, lessons, and payments.
- Empty list components for courses, enrollments, and instructors with CSV import functionality.

([#33](https://github.com/Lucian-Adrian/globant-practice-2025/pull/33))
- Password hash preservation in student CSV import/export.

([#31](https://github.com/Lucian-Adrian/globant-practice-2025/pull/31)), ([#32](https://github.com/Lucian-Adrian/globant-practice-2025/pull/32))
- Internationalization support for booking, instructor availability, and landing page components.
- Language selector on public landing page.

([#13](https://github.com/Lucian-Adrian/globant-practice-2025/pull/13))
- Kanban board for managing students by status.
- Admin dashboard improvements.

### Changed
([#47](https://github.com/Lucian-Adrian/globant-practice-2025/pull/47))
- Database schema uses PostgreSQL on port 5432.
- Backend API runs on port 8000 using Django Rest Framework.
- Frontend React Admin application runs on port 3000.

([#26](https://github.com/Lucian-Adrian/globant-practice-2025/pull/26))
- Improved error handling and user feedback for import operations.

### Fixed
([#34](https://github.com/Lucian-Adrian/globant-practice-2025/pull/34))
- CSV import functionality for enrollments, lessons, and payments.

## [0.1.0] - 2025-10-28

### Added
([#4](https://github.com/Lucian-Adrian/globant-practice-2025/pull/4))
- Enrollment model linking students to courses.
- Lesson model with instructor, vehicle, scheduled_time, and status fields.
- Vehicle model with license_plate, category, and availability tracking.
- Instructor model with license categories.
- Course model with category and theory/practical hour requirements.
- Student model with personal information fields.
- Filtering and pagination for student management.
- Student list sidebar with quick filters and visual status indicators.

([#2](https://github.com/Lucian-Adrian/globant-practice-2025/pull/2))
- Multilingual student signup flow with landing page.
- Language selection support (English, Romanian, Russian).
- Phone number validation using libphonenumber-js.

([#5](https://github.com/Lucian-Adrian/globant-practice-2025/pull/5))
- Initial project structure with Docker Compose configuration.
- Django backend with Python 3.11.
- React Admin frontend with Vite.
- PostgreSQL database service.
- Development environment setup documentation in README.md.
- Basic API endpoint structure.

[unreleased]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Lucian-Adrian/globant-practice-2025/releases/tag/v0.1.0