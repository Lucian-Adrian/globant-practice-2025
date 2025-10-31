# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/SemVer).

## [Unreleased]

### Added
- BUSINESS_TZ setting (default Europe/Chisinau) for business-local availability rules.
- vehicle_id filter on LessonViewSet for efficient conflict checks.
- Client-side preflight for lessons (interval availability and server existence checks using page_size=1).
- Validation keys for EN and RO: requiredField, instructorConflict, studentConflict, vehicleConflict, outsideAvailability, categoryMismatch, instructorLicenseMismatch, vehicleUnavailable.

- Payment status field to Payment model with enum choices (PENDING, COMPLETED, REFUNDED, FAILED)
- Payment status field to PaymentSerializer for API responses
- Payment status filtering in PaymentViewSet
- Payment status choices and validation in PaymentCreate and PaymentEdit forms
- Comprehensive React Admin translations (ra.* keys) in English, Romanian, and Russian
- AutocompleteInput for enrollment selection in payment forms
- Payment status display in PaymentList with proper color coding
- Memoization optimizations for form choices and list data
- Default values for form fields to prevent undefined options

- Resource model that unifies vehicles and classrooms with max_capacity field
- ScheduledClass model for group theory classes with direct student enrollment
- API endpoints for resources and scheduled classes with enrollment actions
- Data migration that preserves all existing vehicle and lesson data
- Comprehensive tests for new models and enrollment logic

### Changed
- LessonSerializer now validates instructor, student, and vehicle conflicts; enforces business-local interval availability (any-minute start within [t[i], t[i+1]) or exact last slot); checks vehicle.is_available for scheduled lessons; verifies instructor license vs. course category; defaults to 90-minute lessons.
- Admin now sends scheduled_time as UTC ISO and performs aligned client-side availability/conflict checks.
- Inline translated field errors replace toast notifications in Admin.
- Vehicle list improved with detail drawer and safe row-click handling.

- Payment status display logic now uses actual database status instead of calculated business rules
- Enrollment search now uses AutocompleteInput instead of SelectInput for better UX
- Form components now have proper memoization to prevent unnecessary re-renders
- PaymentList performance optimized by removing debug console.logs and adding useMemo/useCallback

- Lesson model now uses Resource instead of Vehicle field
- Database migration updates all existing lessons to reference resources
- Admin interface updated to display new Resource and ScheduledClass models

### Changed
- LessonSerializer now validates instructor, student, and vehicle conflicts; enforces business-local interval availability (any-minute start within [t[i], t[i+1]) or exact last slot); checks vehicle.is_available for scheduled lessons; verifies instructor license vs. course category; defaults to 90-minute lessons.
- Admin now sends scheduled_time as UTC ISO and performs aligned client-side availability/conflict checks.
- Inline translated field errors replace toast notifications in Admin.
- Vehicle list improved with detail drawer and safe row-click handling.

- Payment status display logic now uses actual database status instead of calculated business rules
- Enrollment search now uses AutocompleteInput instead of SelectInput for better UX
- Form components now have proper memoization to prevent unnecessary re-renders
- PaymentList performance optimized by removing debug console.logs and adding useMemo/useCallback

### Fixed
- Inline translation for validation.vehicleUnavailable under Vehicle field.
- Stable MUI Select menus using keepMounted to prevent flicker.
- Lesson list row styling changed to CSS classes.

- JWT token expiry issues in authentication flow
- Undefined options in RadioButtonGroupInput and SelectInput components
- Missing translations for React Admin components (ra.page.error, ra.message.invalid_form, etc.)
- PaymentList performance violations from excessive console.log calls
- ReferenceError in PaymentList from incorrect variable declaration order
- Payment status display showing incorrect statuses due to complex calculation logic

### Technical Details
- **Backend Changes:**
  - BUSINESS_TZ (default `Europe/Chisinau`) added; LessonSerializer enforces interval-based business-local availability and conflict rules (instructor/student/vehicle); validations return i18n-safe keys (`validation.*`).
  - LessonViewSet: added `vehicle_id` filter to support efficient preflight/conflict checks from clients.

  - Added `status` field to Payment model with PaymentStatus enum
  - Updated PaymentSerializer to include status field
  - Added status filtering to PaymentViewSet
  - Created migration for payment status field

  - Created Resource model with max_capacity field (2 for vehicles, 30+ for classrooms)
  - Created ScheduledClass model with M2M relationship to students
  - Updated Lesson model to use Resource instead of Vehicle
  - Migration 0009 handles data migration from Vehicle to Resource model
  - Added ResourceViewSet and ScheduledClassViewSet with enrollment actions
  - Created comprehensive test suite for new models

- **Frontend Changes:**
  - Admin dataProvider: converts `scheduled_time` to UTC ISO on create/update for lessons.
  - Admin client: client-side preflight uses `page_size=1` existence checks and `vehicle_id` filter; validation.* keys are translated and surfaced as inline field errors (no toasts).
  - Added validation keys in EN/RO locales and wired Admin to display translated inline errors.
  - LessonList and VehicleList: visual/UX improvements (row class styling, detail drawer, safe row-click handling).

  - Updated PaymentList to use database status field
  - Added memoization to PaymentStatusField component
  - Optimized FilteredPaymentDatagrid with useMemo for filtered data
  - Added useCallback for rowStyle function
  - Enhanced form validation for payment status business rules
  - Added comprehensive i18n translations for React Admin

- **Performance Improvements:**
  - Removed 100+ console.log statements from PaymentList
  - Added React.useMemo for expensive calculations
  - Implemented proper memoization patterns throughout forms and lists

**Notes:** Business rules use `BUSINESS_TZ` (default `Europe/Chisinau`) for human scheduling decisions while storing datetimes in UTC. Student Portal alignment with these rules is deferred to a follow-up. Vehicle vs. classroom/resource unification has been completed with the Resource model.

### Migration Notes
- Run `python manage.py migrate` to apply the payment status field migration
- Existing payments will have PENDING status by default
- Update payment statuses manually through the admin interface as needed

- Run `python manage.py migrate` to apply the Resource and ScheduledClass model changes
- Migration 0009 safely migrates all existing Vehicle data to Resource model
- All existing Lesson records are updated to reference Resources instead of Vehicles
- Default classrooms are created automatically during migration</content>
<parameter name="filePath">d:\uni\sem2\pbl\globant-practice-2025\CHANGELOG.md