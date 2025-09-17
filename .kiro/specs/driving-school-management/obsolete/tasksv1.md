# Implementation Plan

*This implementation plan directly implements Nikita's specific technical recommendations from his code review session.*

## Current Status Summary

**To be done/verified**
- Django 5.x project with PostgreSQL database
- Basic models (Student, Instructor, Vehicle, Course, Enrollment, Lesson, Payment)
- Basic DRF ViewSets and Serializers
- Docker setup with database, backend, frontend
- DRF pagination configured

**FIXES NEEDED:**
1. **api.py → views.py** (violates Django convention)
2. **Individual urls.py per app** (currently all URLs in project/urls.py)
3. **Poetry.toml** (currently using requirements.txt)
4. **VehicleSerializer pattern** (exact implementation needed)
5. **DRF Spectacular** (Nikita's priority for API docs)
6. **docker-compose.override.yml** (development settings separation)
7. **services.py and utils.py** (business logic separation)
8. **get_user_model() vs settings.AUTH_USER_MODEL** (proper usage)
9. **PyJWT authentication** (not implemented)
10. **PEP 8 formatting** (Black/autopep8 setup)

- [ ] 1. Set up modern Django project with Python 3.11+ and Django 5.x
  - Replace requirements.txt with Poetry.toml for dependency management
  - Add PyJWT (https://pyjwt.readthedocs.io/en/stable/) for JWT authentication
  - Create base User model extension with role field using settings.AUTH_USER_MODEL
  - Set up Black or autopep8 for automatic PEP 8 code formatting
  - Create individual urls.py files for school app (currently all URLs in project/urls.py)
  - Create users app with individual urls.py
  - _Requirements: 6.1, 6.2_
  - _Nikita's Specific Notes: Poetry.toml, PyJWT docs, individual urls.py per app, PEP 8 formatting_

- [ ] 2. Implement core data models with advanced Django patterns and proper user model references
  - Update Student model to use settings.AUTH_USER_MODEL for ForeignKey relationships
  - Implement advanced admin.ModelAdmin configurations for Django admin interface
  - Use @property, @staticmethod, @classmethod decorators appropriately in models
  - Add utils.py and services.py files for each app to separate business logic
  - Add missing fields like GDPR consent, maintenance flags, etc.
  - _Requirements: 1.1, 1.5, 2.2, 3.2, 4.1, 5.1_
  - _Nikita's Specific Notes: settings.AUTH_USER_MODEL for ForeignKeys, advanced ModelAdmin, decorators, utils.py/services.py_

- [ ] 3. Build authentication system using get_user_model() pattern and modern JWT
  - Implement JWT token authentication using PyJWT (https://pyjwt.readthedocs.io/en/stable/)
  - Create custom permission classes for role-based access control
  - Rename api.py to views.py (currently using api.py - violates Django convention)
  - Implement user registration and login endpoints in views.py
  - Use get_user_model() in views, services, admin (not in model ForeignKeys)
  - Create middleware for token validation and user context
  - Implement Pydantic or TypedDict for request data validation
  - Write unit tests for authentication flows
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  - _Nikita's Specific Notes: CRITICAL - api.py → views.py rename, get_user_model() usage, PyJWT implementation_

- [ ] 4. Develop student management API with advanced DRF serializer patterns
  - Enhance StudentSerializer with advanced read_only, write_only fields
  - Implement nested relationships and source field mapping in serializers
  - Move from api.py to views.py (currently in api.py)
  - Create public student registration endpoint with GDPR consent handling
  - Implement status transition logic in services.py (currently no services.py)
  - Move complex business logic to services.py
  - Create individual urls.py for school app (currently in project/urls.py)
  - Write comprehensive unit tests for student operations
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - _Nikita's Specific Notes: Advanced serializer patterns, api.py → views.py, services.py separation, individual urls.py_

- [ ] 5. Build instructor management with VehicleSerializer pattern example
  - Refactor InstructorSerializer to follow Nikita's VehicleSerializer pattern:
    ```python
    class InstructorSerializer(serializers.ModelSerializer):
        license_category_name = serializers.CharField(source='license_category.name', read_only=True)
        class Meta:
            model = Instructor
            fields = ['id', 'first_name', 'last_name', 'email', 'license_category', 'license_category_name']
            extra_kwargs = {'license_category': {'write_only': True}}
    ```
  - Move from api.py to views.py
  - Add license category tracking and validation using extra_kwargs
  - Create instructor assignment logic in services.py (currently no services.py)
  - Use @staticmethod and @classmethod decorators in models
  - Write unit tests for instructor management
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - _Nikita's Specific Notes: CRITICAL - Implement exact VehicleSerializer pattern example_

- [ ] 6. Implement vehicle management following exact VehicleSerializer pattern
  - Refactor VehicleSerializer to exactly match Nikita's example:
    ```python
    class VehicleSerializer(serializers.ModelSerializer):
        category_name = serializers.CharField(source='category.name', read_only=True)
        class Meta:
            model = Vehicle
            fields = ['id', 'make', 'model', 'license_plate', 'category', 'category_name']
            extra_kwargs = {'category': {'write_only': True}}
    ```
  - Move from api.py to views.py
  - Add maintenance flag management (missing maintenance fields)
  - Create vehicle assignment logic in services.py
  - Implement conflict detection in utils.py
  - Write unit tests for vehicle operations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - _Nikita's Specific Notes: CRITICAL - Must implement exact VehicleSerializer pattern as provided_

- [ ] 7. Develop lesson scheduling with Python 3.11+ match/case and proper separation
  - Create LessonSerializer with comprehensive validation using advanced DRF patterns
  - Implement ConflictDetectionService in services.py for instructor and vehicle conflicts
  - Create LessonViewSet with scheduling logic in views.py, delegating business logic to services
  - Add calendar and table view data formatting utilities in utils.py
  - Implement attendance tracking and note recording functionality
  - Create lesson status management using Python 3.11+ match/case statements:
    ```python
    def get_lesson_status_display(status):
        match status:
            case 'SCHEDULED':
                return 'Lesson Scheduled'
            case 'COMPLETED':
                return 'Lesson Completed'
            case 'CANCELED':
                return 'Lesson Canceled'
            case 'NO_SHOW':
                return 'Student No Show'
    ```
  - Use @property decorators for computed fields on Lesson model
  - Write unit tests for scheduling logic and conflict detection
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  - _Nikita's Specific Notes: Python 3.11+ match/case statements, services.py for business logic, utils.py for utilities, @property usage_

- [ ] 8. Build payment tracking and management system
  - Create PaymentSerializer with amount and method validation
  - Implement PaymentViewSet with CRUD operations in views.py
  - Add payment status tracking (PENDING, COMPLETED, REFUNDED)
  - Create payment-to-enrollment linking logic in services.py
  - Implement payment history and total calculation features
  - Add CSV/PDF export functionality for financial reports
  - Write unit tests for payment operations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 9. Create notification system with email integration
  - Implement NotificationService in services.py for email sending
  - Create email templates for registration confirmation and lesson reminders
  - Set up SMTP configuration with environment variables
  - Add notification queue management with status tracking
  - Implement template-based messaging with i18n support
  - Create notification triggers for key events (registration, scheduling)
  - Write unit tests for notification delivery
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Implement reporting and analytics endpoints
  - Create ReportViewSet with director/admin permission restrictions in views.py
  - Implement student summary reports with date range filtering
  - Add financial analytics with revenue calculations in services.py
  - Create aggregated statistics for students, lessons, and payments
  - Implement CSV and PDF export functionality
  - Write unit tests for report generation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Set up DRF Spectacular for OpenAPI documentation (Nikita's priority recommendation)
  - Install and configure drf-spectacular for automatic OpenAPI documentation generation
  - Set up Swagger UI for interactive API documentation (FastAPI docs-like documentation)
  - Create OpenAPI.yml documentation file for API specification
  - Configure spectacular settings for comprehensive API documentation
  - Generate interactive documentation accessible at /api/docs/
  - Ensure all serializers and viewsets are properly documented for auto-generation
  - _Requirements: All requirements (API documentation)_
  - _Nikita's Specific Notes: HIGH PRIORITY - DRF Spectacular, OpenAPI.yml, FastAPI-like docs, Swagger UI_

- [ ] 12. Set up Docker with docker-compose.override.yml for development
  - Create docker-compose.override.yml for local development settings (currently everything in main docker-compose.yml)
  - Move development-specific settings to override file
  - Clean up main docker-compose.yml to be production-ready
  - Add database initialization and migration scripts
  - _Requirements: All requirements (deployment support)_
  - _Nikita's Specific Notes: CRITICAL - docker-compose.override.yml separation for clean development setup_

- [ ] 13. Build React Admin dashboard interface
  - Set up React Admin project with proper routing
  - Create Student resource with list, create, edit, and show views
  - Implement Instructor resource with CRUD operations
  - Create Vehicle resource with availability management
  - Build Lesson resource with scheduling interface and conflict handling
  - Implement Payment resource with financial tracking
  - Add search and filtering capabilities across all resources
  - _Requirements: 1.3, 2.1, 3.1, 4.5, 5.4_

- [ ] 14. Develop public landing page with student registration
  - Create React/Next.js landing page with registration form
  - Implement form validation and error handling
  - Add GDPR consent checkbox and privacy policy integration
  - Create success page with registration confirmation
  - Implement loading states and user feedback
  - Add responsive design for mobile compatibility
  - _Requirements: 1.1, 1.2, 10.1_

- [ ] 15. Implement multi-language support (i18n)
  - Set up react-i18next for frontend internationalization
  - Create translation files for English, Romanian, and Russian
  - Implement language switcher component
  - Add i18n support to Django backend for email templates
  - Create localized notification templates
  - Test language switching functionality across all interfaces
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 16. Add authentication flow to frontend applications
  - Implement login page with JWT token handling
  - Create token storage and refresh mechanisms
  - Add protected route components for authenticated areas
  - Implement role-based UI rendering and navigation
  - Create logout functionality with token cleanup
  - Add authentication error handling and user feedback
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 17. Build lesson scheduling interface with conflict detection
  - Create lesson booking modal with instructor and vehicle selection
  - Implement date/time picker with availability checking
  - Add real-time conflict detection and error display
  - Create calendar view for lesson visualization
  - Implement lesson status updates and attendance recording
  - Add lesson rescheduling and cancellation functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 18. Implement data security and GDPR compliance features
  - Add audit logging for all user actions
  - Create data export functionality for GDPR requests
  - Implement data deletion capabilities with cascade handling
  - Add consent recording and timestamp tracking
  - Create role-based data access restrictions
  - Implement secure password handling and validation
  - Write tests for security and compliance features
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 19. Create comprehensive test suite and quality assurance
  - Write unit tests for all models, serializers, and views
  - Create integration tests for API endpoints and workflows
  - Implement end-to-end tests for critical user journeys
  - Add performance tests for database queries and API responses
  - Create test data fixtures and factories
  - Set up continuous integration testing pipeline
  - _Requirements: All requirements (quality assurance)_

- [ ] 20. Implement error handling with Pydantic/TypedDict validation
  - Create custom exception classes for business logic errors
  - Implement structured error responses across all API endpoints
  - Add comprehensive logging for debugging and monitoring
  - Create error tracking and notification system
  - Implement graceful error handling in frontend applications
  - Add user-friendly error messages and recovery options
  - Use Pydantic or TypedDict for robust data validation in API endpoints
  - Implement proper exception handling using Python 3.11+ features
  - _Requirements: All requirements (error handling)_
  - _Nikita's Specific Notes: Pydantic/TypedDict for validation, modern Python exception handling_

- [ ] 21. Final integration testing and validation of Nikita's recommendations
  - Test complete student registration and enrollment workflow
  - Validate lesson scheduling with conflict detection across all scenarios
  - Test payment processing and financial reporting functionality
  - Verify multi-language support across all user interfaces
  - Validate role-based access control and security measures
  - Perform end-to-end testing of notification system
  - Create demo data and user acceptance testing scenarios
  - Validate all Nikita's specific recommendations are implemented:
    - Poetry.toml instead of requirements.txt
    - DRF Spectacular with OpenAPI.yml documentation
    - docker-compose.override.yml for development
    - api.py renamed to views.py
    - Individual urls.py files per app
    - VehicleSerializer pattern with source/read_only/write_only
    - services.py and utils.py separation
    - get_user_model() vs settings.AUTH_USER_MODEL proper usage
    - Python 3.11+ match/case statements
    - Django 5.x features
    - PEP 8 formatting with Black/autopep8
  - _Requirements: All requirements (system validation)_
  - _Nikita's Specific Notes: Comprehensive validation of all specific technical recommendations_