/**
 * Type definitions index
 * 
 * Centralized exports for all TypeScript types used in the application.
 */

// Core entities
export type { Student, StudentSummary, StudentStatus } from './student';
export type { Instructor, InstructorSummary, InstructorAvailability, DayOfWeek } from './instructor';
export type { Course, CourseSummary, CourseType, VehicleCategory } from './course';
export type { Resource, ResourceSummary, ResourceType, Vehicle } from './resource';
export type { Enrollment, EnrollmentSummary, EnrollmentStatus } from './enrollment';
export type { Lesson, LessonSummary, LessonStatus } from './lesson';
export type {
  ScheduledClass,
  ScheduledClassSummary,
  ScheduledClassStatus,
  ScheduledClassPattern,
  ScheduledClassPatternSummary,
} from './scheduledClass';
export type { Payment, PaymentSummary, PaymentMethod, PaymentStatus } from './payment';

// Portal-specific types
export type {
  StudentDashboardResponse,
  PortalLesson,
  PortalEnrollment,
} from './portal';
