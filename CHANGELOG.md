# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/SemVer).

## [Unreleased]

### Added
- Payment status field to Payment model with enum choices (PENDING, COMPLETED, REFUNDED, FAILED)
- Payment status field to PaymentSerializer for API responses
- Payment status filtering in PaymentViewSet
- Payment status choices and validation in PaymentCreate and PaymentEdit forms
- Comprehensive React Admin translations (ra.* keys) in English, Romanian, and Russian
- AutocompleteInput for enrollment selection in payment forms
- Payment status display in PaymentList with proper color coding
- Memoization optimizations for form choices and list data
- Default values for form fields to prevent undefined options

### Changed
- Payment status display logic now uses actual database status instead of calculated business rules
- Enrollment search now uses AutocompleteInput instead of SelectInput for better UX
- Form components now have proper memoization to prevent unnecessary re-renders
- PaymentList performance optimized by removing debug console.logs and adding useMemo/useCallback

### Fixed
- JWT token expiry issues in authentication flow
- Undefined options in RadioButtonGroupInput and SelectInput components
- Missing translations for React Admin components (ra.page.error, ra.message.invalid_form, etc.)
- PaymentList performance violations from excessive console.log calls
- ReferenceError in PaymentList from incorrect variable declaration order
- Payment status display showing incorrect statuses due to complex calculation logic

### Technical Details
- **Backend Changes:**
  - Added `status` field to Payment model with PaymentStatus enum
  - Updated PaymentSerializer to include status field
  - Added status filtering to PaymentViewSet
  - Created migration for payment status field

- **Frontend Changes:**
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

### Migration Notes
- Run `python manage.py migrate` to apply the payment status field migration
- Existing payments will have PENDING status by default
- Update payment statuses manually through the admin interface as needed</content>
<parameter name="filePath">d:\uni\sem2\pbl\globant-practice-2025\CHANGELOG.md