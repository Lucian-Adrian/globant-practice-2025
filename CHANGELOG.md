# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Reusable `EmailInput` component with automatic lowercase & shared validation
- Strict server-side validation for Student & Instructor (name, phone, email) with model-level validators
- Unique constraint enforced for `Instructor.phone_number`
- Shared frontend usage of `NameInput`, `PhoneInput`, `EmailInput` across student/instructor create/edit forms
([#60](https://github.com/Lucian-Adrian/globant-practice-2025/pull/60))
- Manual instructor and vehicle pickers in booking interface.
- 30-minute time slots derived from instructor availability.
- Shared validateLesson() utility for consistent validation across components.
- license_plate display in resource selectors.
- Standard lesson duration set to 90 minutes.

([#59](https://github.com/Lucian-Adrian/globant-practice-2025/pull/59))
- CSV import/export endpoints for Resource model.
- Vehicle/classroom identifiers, normalization, and internationalization.
- Backend validation rule: only vehicle-type resources can be assigned to lessons.

([#58](https://github.com/Lucian-Adrian/globant-practice-2025/pull/58))
- Optional column support in CSV imports for all models.
- Intelligent validation system distinguishing between required and optional fields.
- Automatic model default application when optional fields are omitted.

([#57](https://github.com/Lucian-Adrian/globant-practice-2025/pull/57))
- Collapsible filters panel in Admin interface with toggle button.
- Persistent filter visibility state using localStorage (aside_collapsed key).
- React context provider to share collapsed state across Admin pages.
- Localized toggle button text for all supported languages (EN/RO/RU).

([#50](https://github.com/Lucian-Adrian/globant-practice-2025/pull/50))
- Missing Admin translation keys: ra.action.show_filters, ra.action.hide_filters.
- Fallback resolution logic for automatic translation display when namespace fails to load.
- Lazy-loading of i18n bundles for improved performance.

([#61](https://github.com/Lucian-Adrian/globant-practice-2025/pull/61))
- Payment form functionality in student portal.
- Integration with enrollment and payment API endpoints.

([#38](https://github.com/Lucian-Adrian/globant-practice-2025/pull/38))
- Student portal pages for lesson booking and account management.
- Navigation structure for authenticated student users.

([#52](https://github.com/Lucian-Adrian/globant-practice-2025/pull/52))
- Student API endpoint to retrieve lessons for authenticated students.
- Lesson filtering and pagination for student dashboard.
- Integration with student progress tracking.

([#54](https://github.com/Lucian-Adrian/globant-practice-2025/pull/54))
- Comprehensive CONTRIBUTING.md file with development workflow guidelines.
- Branch naming conventions and pull request templates.
- Code review and merge process documentation.

([#53](https://github.com/Lucian-Adrian/globant-practice-2025/pull/53))
- CHANGELOG.md with proper formatting and version history.
- Semantic versioning guidelines for future releases.
- PR link formatting standardization.

([#55](https://github.com/Lucian-Adrian/globant-practice-2025/pull/55))
- Updated CHANGELOG.md with correct version links and formatting.
- Fixed PR reference inconsistencies.
- Improved changelog structure and readability.

([#56](https://github.com/Lucian-Adrian/globant-practice-2025/pull/56))
- Enhanced CONTRIBUTING.md with dev branch workflow.
- Updated documentation links and repository structure.
- Added team collaboration guidelines.

### Changed
([#60](https://github.com/Lucian-Adrian/globant-practice-2025/pull/60))
- Booking and calendar components refactored for clearer state management and validation UX.
- Conflict handling aligned with backend validation rules.
- Frontend/backend lesson duration synchronized to 90 minutes.

([#59](https://github.com/Lucian-Adrian/globant-practice-2025/pull/59))
- Lesson create/edit forms now filter only vehicle-type resources.
- Backend and portal unified to use Resource model everywhere (resource_id, /api/resources/*).
- Vehicle naming replaced with resource terminology throughout codebase.

([#58](https://github.com/Lucian-Adrian/globant-practice-2025/pull/58))
- CSV import system uses upsert logic (update-or-create) to prevent duplicates.
- Import responses now include detailed metrics: created count, updated count, and error list.
- CourseSerializer, EnrollmentSerializer, and PaymentSerializer enhanced with flexible validation.

([#57](https://github.com/Lucian-Adrian/globant-practice-2025/pull/57))
- List pages (PaymentList, ResourceList, LessonList) dynamically render based on collapsed state.
- Layout switches between full and collapsed side panels using aside prop.
- Component re-renders optimized for smoother UI transitions.

([#50](https://github.com/Lucian-Adrian/globant-practice-2025/pull/50))
- All Admin components updated to use translate() with defaultValue to prevent raw key display.
- i18n configuration refactored to ensure shared namespaces between Admin and Portal.
- Translation key naming conventions unified across student-related components.

### Fixed
- Prevent acceptance of malformed phone numbers and non-alphabetic names in admin & API layers
([#64](https://github.com/Lucian-Adrian/globant-practice-2025/pull/64))
- Dropdowns in edit forms now pre-fill with current values instead of being empty

([#62](https://github.com/Lucian-Adrian/globant-practice-2025/pull/62))
- React Admin lessons list DOM warnings by using rowStyle instead of inline styles.
- Admin enums bootstrap effect now guards against post-unmount updates.
- Memory leak warnings during navigation suppressed.

([#60](https://github.com/Lucian-Adrian/globant-practice-2025/pull/60))
- Availability rendering glitches in instructor calendar.
- Race conditions during availability data fetch.
- Frontend/backend duration mismatch causing validation errors.

([#59](https://github.com/Lucian-Adrian/globant-practice-2025/pull/59))
- Vehicle vs resource naming inconsistencies across frontend and backend.
- Conflict and availability checks that referenced deprecated vehicle fields.
- Validation error mappings updated for resource-based architecture.

([#57](https://github.com/Lucian-Adrian/globant-practice-2025/pull/57))
- Sidebar flicker issues during page reload.
- Inconsistent filter visibility between page navigations.
- Spacing and alignment glitches after panel collapse.

([#50](https://github.com/Lucian-Adrian/globant-practice-2025/pull/50))
- Raw i18n keys visible in sidebar and toolbar.
- Missing translations for EN/RO/RU in Admin views (Courses, Lessons, Payments).
- Incorrect fallback behavior when async translation bundles loaded late.

### Internal
- Repository cleanup: migrated all branches from demo to new dev branch.
- Deleted 15+ obsolete feature branches (f, filters, admin_translations, import_export, etc.).
- Established dev branch as single source of truth for team collaboration.
- Merged 15+ pull requests to consolidate team members' work into unified codebase.

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

[unreleased]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Lucian-Adrian/globant-practice-2025/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Lucian-Adrian/globant-practice-2025/releases/tag/v0.1.0```