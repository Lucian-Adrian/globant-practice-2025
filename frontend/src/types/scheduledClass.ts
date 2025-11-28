/**
 * ScheduledClass and ScheduledClassPattern type definitions
 */

import type { CourseSummary } from './course';
import type { InstructorSummary, DayOfWeek } from './instructor';
import type { ResourceSummary } from './resource';
import type { StudentSummary } from './student';
import type { EnrollmentSummary } from './enrollment';

export interface ScheduledClass {
  id: number;
  pattern: ScheduledClassPatternSummary | null;
  pattern_id?: number | null;
  course: CourseSummary;
  course_id?: number;
  instructor: InstructorSummary;
  instructor_id?: number;
  resource: ResourceSummary;
  resource_id?: number;
  scheduled_time: string; // ISO datetime string
  duration_minutes: number;
  max_students: number;
  current_enrollment: number;
  status: ScheduledClassStatus;
  students: StudentSummary[] | number[];
  enrollments?: EnrollmentSummary[];
}

export interface ScheduledClassSummary {
  id: number;
  scheduled_time: string;
  duration_minutes?: number;
  status?: ScheduledClassStatus;
  instructor?: InstructorSummary;
  resource?: ResourceSummary;
  pattern?: ScheduledClassPatternSummary;
  students?: StudentSummary[] | number[];
}

export type ScheduledClassStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED';

export interface ScheduledClassPattern {
  id: number;
  name: string;
  course: CourseSummary;
  course_id?: number;
  instructor: InstructorSummary;
  instructor_id?: number;
  resource: ResourceSummary;
  resource_id?: number;
  students: StudentSummary[] | number[];
  recurrence_days: DayOfWeek[];
  times: string[]; // List of start times in HH:MM format
  start_date: string; // ISO date string
  num_lessons: number;
  default_duration_minutes: number;
  default_max_students: number;
  created_at: string; // ISO datetime string
}

export interface ScheduledClassPatternSummary {
  id: number;
  name?: string;
  course?: CourseSummary;
  instructor?: InstructorSummary;
  resource?: ResourceSummary;
  students?: StudentSummary[] | number[];
  recurrence_days?: DayOfWeek[];
  times?: string[];
}
