# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Payment status field to Payment model with enum choices (PENDING, COMPLETED, REFUNDED, FAILED).
- Payment status filtering in PaymentViewSet.
- Payment status display in PaymentList with color-coded badges.
- AutocompleteInput for enrollment selection in payment forms.
- Default values for form fields to prevent undefined options.

([#44](https://github.com/Lucian-Adrian/globant-practice-2025/pull/44))
- Comprehensive React Admin translations (ra.* keys) in English, Romanian, and Russian.

([#43](https://github.com/Lucian-Adrian/globant-practice-2025/pull/43))
- Filtering, searching, and sorting capabilities for backend API viewsets.

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

([#31](https://github.com/Lucian-Adrian/globant-practice-2025/pull/31), [#32](https://github.com/Lucian-Adrian/globant-practice-2025/pull/32))
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

[unreleased]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Lucian-Adrian/globant-practice-2025/releases/tag/v0.1.0</content>
<parameter name="filePath">d:\uni\sem2\pbl\globant-practice-2025\CHANGELOG.md