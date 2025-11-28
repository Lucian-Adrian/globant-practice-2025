/**
 * Portal-specific type definitions
 * 
 * These types are used in the student portal components and may include
 * dashboard-specific response shapes.
 */

import type { Lesson, LessonSummary } from './lesson';
import type { Enrollment, EnrollmentSummary } from './enrollment';
import type { ScheduledClass, ScheduledClassSummary, ScheduledClassPattern } from './scheduledClass';
import type { Payment, PaymentSummary } from './payment';

/**
 * Student dashboard API response
 */
export interface StudentDashboardResponse {
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  enrollments: Enrollment[];
  lessons: Lesson[];
  scheduled_classes: ScheduledClass[];
  patterns: ScheduledClassPattern[];
  payments: Payment[];
  stats?: {
    total_lessons: number;
    completed_lessons: number;
    upcoming_lessons: number;
  };
}

/**
 * Portal lesson list item (simplified for display)
 */
export interface PortalLesson extends LessonSummary {
  enrollment?: EnrollmentSummary;
}

/**
 * Portal enrollment with computed progress
 */
export interface PortalEnrollment extends Enrollment {
  progress_percentage?: number;
  remaining_lessons?: number;
}

// Re-export commonly used types for portal components
export type { 
  Lesson, 
  LessonSummary,
  Enrollment, 
  EnrollmentSummary,
  ScheduledClass, 
  ScheduledClassSummary,
  ScheduledClassPattern,
  Payment,
  PaymentSummary,
};
