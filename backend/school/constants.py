"""
Error message constants for the school application.

These constants define standard error messages used across the application.
Using constants ensures consistency between frontend and backend error messages
and makes it easier to maintain and translate error messages.

Keys follow the pattern: validation.<errorType>
"""

# Required field errors
REQUIRED_FIELD = "validation.requiredField"

# Date validation errors
FUTURE_DATE_OF_BIRTH = "validation.futureDateOfBirth"
MINIMUM_AGE = "validation.minimumAge"
INVALID_DATE_FORMAT = "validation.invalidDateFormat"
INVALID_TIME_FORMAT = "validation.invalidTimeFormat"

# Uniqueness errors
EMAIL_ALREADY_REGISTERED = "validation.emailAlreadyRegistered"
PHONE_ALREADY_REGISTERED = "validation.phoneAlreadyRegistered"
LICENSE_PLATE_ALREADY_EXISTS = "validation.licensePlateAlreadyExists"

# Name validation errors
NAME_INVALID_CHARACTERS = "validation.nameInvalidCharacters"
NAME_TOO_LONG = "validation.nameTooLong"

# Phone validation errors
PHONE_TOO_SHORT = "validation.phoneTooShort"
PHONE_INVALID_FORMAT = "validation.phoneInvalidFormat"

# Enrollment validation errors
PRACTICE_ENROLLMENT_REQUIRED = "validation.practiceEnrollmentRequired"
STUDENT_NOT_ENROLLED = "validation.studentNotEnrolled"
STUDENT_NOT_ENROLLED_TO_COURSE = "validation.studentNotEnrolledToCourse"
STUDENT_NOT_ENROLLED_TO_COURSE_NAMES = "validation.studentNotEnrolledToCourseNames"

# Resource validation errors
VEHICLE_RESOURCE_REQUIRED = "validation.vehicleResourceRequired"
CLASSROOM_RESOURCE_REQUIRED = "validation.classroomResourceRequired"
RESOURCE_UNAVAILABLE = "validation.resourceUnavailable"
RESOURCE_CONFLICT = "validation.resourceConflict"
CATEGORY_MISMATCH = "validation.categoryMismatch"

# Instructor validation errors
INSTRUCTOR_NOT_WORKING = "validation.instructorNotWorking"
INSTRUCTOR_CONFLICT = "validation.instructorConflict"
INSTRUCTOR_LICENSE_MISMATCH = "validation.instructorLicenseMismatch"
INSTRUCTOR_NOT_AVAILABLE_DAY = "validation.instructorNotAvailableDay"
INSTRUCTOR_NOT_AVAILABLE_TIME = "validation.instructorNotAvailableTime"
OUTSIDE_AVAILABILITY = "validation.outsideAvailability"

# Student conflict errors
STUDENT_CONFLICT = "validation.studentConflict"

# Capacity validation errors
CAPACITY_EXCEEDED = "validation.capacityExceeded"
CAPACITY_BELOW_ENROLLED = "validation.capacityBelowEnrolled"
CAPACITY_BELOW_SELECTED = "validation.capacityBelowSelected"
SELECTED_STUDENTS_EXCEED_CAPACITY = "validation.selectedStudentsExceedCapacity"

# Course validation errors
THEORY_ONLY = "validation.theoryOnly"
INVALID_CATEGORIES = "validation.invalidCategories"

# License category errors
LICENSE_CATEGORY_REQUIRED = "validation.licenseCategoryRequired"
INVALID_LICENSE_CATEGORY = "validation.invalidLicenseCategory"

# Generic errors
UNEXPECTED_ERROR = "validation.unexpectedError"
INTEGRITY_ERROR = "validation.integrityError"
