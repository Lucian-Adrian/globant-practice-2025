# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-10-31

### Added

- BUSINESS_TZ setting (default Europe/Chisinau) for business-local availability rules.
- vehicle_id filter on LessonViewSet for efficient conflict checks.
- Client-side preflight validation for lessons with interval availability checks.
- Server existence checks using page_size=1 for efficient queries.
- Validation keys for EN and RO translations: requiredField, instructorConflict, studentConflict, vehicleConflict, outsideAvailability, categoryMismatch, instructorLicenseMismatch, vehicleUnavailable.
- Payment status field to Payment model with enum choices (PENDING, COMPLETED, REFUNDED, FAILED).
- Payment status filtering in PaymentViewSet.
- Comprehensive React Admin translations (ra.* keys) in English, Romanian, and Russian.
- AutocompleteInput for enrollment selection in payment forms.
- Payment status display in PaymentList with color-coded badges.
- Default values for form fields to prevent undefined options.
- Resource model unifying vehicles and classrooms with max_capacity field.
- ScheduledClass model for group theory classes with direct student enrollment.
- API endpoints for resources (/api/resources/) and scheduled classes (/api/scheduled-classes/).
- Data migration preserving all existing vehicle and lesson data.
- Comprehensive test suite for Resource and ScheduledClass models.

### Changed

- LessonSerializer validates instructor, student, and vehicle conflicts.
- LessonSerializer enforces business-local interval availability (any-minute start within [t[i], t[i+1]) or exact last slot).
- LessonSerializer checks vehicle.is_available for scheduled lessons.
- LessonSerializer verifies instructor license matches course category.
- LessonSerializer defaults to 90-minute lesson duration.
- Admin scheduled_time sent as UTC ISO format.
- Admin performs client-side availability and conflict checks.
- Field errors now display inline with translations instead of toast notifications.
- Vehicle list UI improved with detail drawer and safe row-click handling.
- Payment status display uses database status field instead of calculated business rules.
- Enrollment search upgraded from SelectInput to AutocompleteInput.
- Form components use memoization to prevent unnecessary re-renders.
- PaymentList optimized with useMemo and useCallback hooks.
- Lesson model uses Resource field instead of Vehicle field.
- Admin interface displays new Resource and ScheduledClass models.

### Fixed

- Inline translation for validation.vehicleUnavailable under Vehicle field.
- MUI Select menu flicker resolved using keepMounted property.
- Lesson list row styling uses CSS classes instead of inline styles.
- JWT token expiry issues in authentication flow.
- Undefined options in RadioButtonGroupInput and SelectInput components.
- Missing React Admin component translations (ra.page.error, ra.message.invalid_form, etc.).
- PaymentList performance violations from excessive console.log calls (removed 100+ instances).
- ReferenceError in PaymentList from incorrect variable declaration order.
- Payment status display showing incorrect statuses.

## [0.2.0] - 2025-10-30

### Added

- Payment model with enrollment, amount, payment_method, and description fields.
- Payment serializer and API endpoints at /api/payments/.
- Enrollment model linking students to courses.
- Lesson model with instructor, vehicle, scheduled_time, and status fields.
- Vehicle model with license_plate, category, and availability tracking.
- Instructor model with license categories.
- Course model with category and theory/practical hour requirements.
- Student model with personal information fields.

### Changed

- Database schema uses PostgreSQL on port 5432.
- Backend API runs on port 8000 using Django Rest Framework.
- Frontend React Admin application runs on port 3000.

## [0.1.0] - 2025-10-29

### Added

- Initial project structure with Docker Compose configuration.
- Django backend with Python 3.11.
- React Admin frontend with Vite.
- PostgreSQL database service.
- Development environment setup documentation in README.md.
- Basic API endpoint structure.

[unreleased]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Lucian-Adrian/globant-practice-2025/releases/tag/v0.1.0</content>
