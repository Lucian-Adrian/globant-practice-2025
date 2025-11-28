/**
 * Error message constants for validation.
 *
 * These constants define standard error message keys used across the application.
 * Using constants ensures consistency between frontend and backend error messages
 * and makes it easier to maintain and translate error messages.
 *
 * Keys follow the pattern: validation.<errorType>
 */

// Required field errors
export const REQUIRED_FIELD = 'validation.requiredField';

// Date validation errors
export const FUTURE_DATE_OF_BIRTH = 'validation.futureDateOfBirth';
export const MINIMUM_AGE = 'validation.minimumAge';
export const INVALID_DATE_FORMAT = 'validation.invalidDateFormat';
export const INVALID_TIME_FORMAT = 'validation.invalidTimeFormat';

// Uniqueness errors
export const EMAIL_ALREADY_REGISTERED = 'validation.emailAlreadyRegistered';
export const PHONE_ALREADY_REGISTERED = 'validation.phoneAlreadyRegistered';
export const LICENSE_PLATE_ALREADY_EXISTS = 'validation.licensePlateAlreadyExists';

// Name validation errors
export const NAME_INVALID_CHARACTERS = 'validation.nameInvalidCharacters';
export const NAME_TOO_LONG = 'validation.nameTooLong';

// Phone validation errors
export const PHONE_TOO_SHORT = 'validation.phoneTooShort';
export const PHONE_INVALID_FORMAT = 'validation.phoneInvalidFormat';

// Enrollment validation errors
export const PRACTICE_ENROLLMENT_REQUIRED = 'validation.practiceEnrollmentRequired';
export const STUDENT_NOT_ENROLLED = 'validation.studentNotEnrolled';
export const STUDENT_NOT_ENROLLED_TO_COURSE = 'validation.studentNotEnrolledToCourse';
export const STUDENT_NOT_ENROLLED_TO_COURSE_NAMES = 'validation.studentNotEnrolledToCourseNames';

// Resource validation errors
export const VEHICLE_RESOURCE_REQUIRED = 'validation.vehicleResourceRequired';
export const CLASSROOM_RESOURCE_REQUIRED = 'validation.classroomResourceRequired';
export const RESOURCE_UNAVAILABLE = 'validation.resourceUnavailable';
export const RESOURCE_CONFLICT = 'validation.resourceConflict';
export const CATEGORY_MISMATCH = 'validation.categoryMismatch';

// Instructor validation errors
export const INSTRUCTOR_NOT_WORKING = 'validation.instructorNotWorking';
export const INSTRUCTOR_CONFLICT = 'validation.instructorConflict';
export const INSTRUCTOR_LICENSE_MISMATCH = 'validation.instructorLicenseMismatch';
export const INSTRUCTOR_NOT_AVAILABLE_DAY = 'validation.instructorNotAvailableDay';
export const INSTRUCTOR_NOT_AVAILABLE_TIME = 'validation.instructorNotAvailableTime';
export const OUTSIDE_AVAILABILITY = 'validation.outsideAvailability';

// Student conflict errors
export const STUDENT_CONFLICT = 'validation.studentConflict';

// Capacity validation errors
export const CAPACITY_EXCEEDED = 'validation.capacityExceeded';
export const CAPACITY_BELOW_ENROLLED = 'validation.capacityBelowEnrolled';
export const CAPACITY_BELOW_SELECTED = 'validation.capacityBelowSelected';
export const SELECTED_STUDENTS_EXCEED_CAPACITY = 'validation.selectedStudentsExceedCapacity';

// Course validation errors
export const THEORY_ONLY = 'validation.theoryOnly';
export const INVALID_CATEGORIES = 'validation.invalidCategories';

// License category errors
export const LICENSE_CATEGORY_REQUIRED = 'validation.licenseCategoryRequired';
export const INVALID_LICENSE_CATEGORY = 'validation.invalidLicenseCategory';

// Generic errors
export const UNEXPECTED_ERROR = 'validation.unexpectedError';
export const INTEGRITY_ERROR = 'validation.integrityError';
