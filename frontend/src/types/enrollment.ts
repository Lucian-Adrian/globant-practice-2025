/**
 * Enrollment type definitions
 */

import type { StudentSummary } from './student';
import type { CourseSummary } from './course';

export interface Enrollment {
  id: number;
  student: StudentSummary;
  student_id?: number;
  course: CourseSummary;
  course_id?: number;
  enrollment_date: string; // ISO datetime string
  status: EnrollmentStatus;
  completed_lessons: number;
  notes: string | null;
  // Type can be derived from course.type
  type?: string;
}

export interface EnrollmentSummary {
  id: number;
  student?: StudentSummary;
  student_id?: number;
  course?: CourseSummary;
  course_id?: number;
  status?: EnrollmentStatus;
}

export type EnrollmentStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DROPPED';
