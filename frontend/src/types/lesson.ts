/**
 * Lesson type definitions
 */

import type { InstructorSummary } from './instructor';
import type { ResourceSummary } from './resource';
import type { EnrollmentSummary } from './enrollment';

export interface Lesson {
  id: number;
  enrollment: EnrollmentSummary;
  enrollment_id?: number;
  instructor: InstructorSummary;
  instructor_id?: number;
  resource: ResourceSummary | null;
  resource_id?: number | null;
  scheduled_time: string; // ISO datetime string
  duration_minutes: number;
  status: LessonStatus;
  notes: string | null;
}

export interface LessonSummary {
  id: number;
  scheduled_time: string;
  duration_minutes?: number;
  status?: LessonStatus;
  instructor?: InstructorSummary;
  resource?: ResourceSummary;
}

export type LessonStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'NO_SHOW';
