/**
 * Validation module exports
 * 
 * This file provides a centralized export point for all validation utilities
 * used across the application.
 */

// Core validators (form field validation)
export * from './validators';

// Lesson and scheduled class validation
export { validateLesson, validateScheduledClass } from './lessonValidation';

// Time utilities
export {
  BUSINESS_TZ,
  DAY_ENUM,
  addMinutes,
  overlap,
  minutesOf,
  formatInBusinessTZParts,
} from './timeUtils';

// HTTP utilities for validation
export { getJson } from './httpUtils';

// Availability validation
export {
  checkInstructorAvailability,
  fetchInstructorAvailability,
} from './availabilityValidation';

// Conflict detection
export {
  checkInstructorConflicts,
  checkResourceConflicts,
  checkStudentConflicts,
} from './conflictValidation';

// Capacity validation
export {
  checkCapacity,
  checkClassroomCapacity,
  checkStudentEnrollment,
} from './capacityValidation';
