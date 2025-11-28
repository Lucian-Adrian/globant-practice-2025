/**
 * Instructor type definitions
 */

export interface Instructor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  hire_date: string; // ISO date string
  license_categories: string; // Comma-separated categories, e.g., "B,BE,C"
}

export interface InstructorSummary {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  name?: string; // Full name (computed)
}

export interface InstructorAvailability {
  id: number;
  instructor: number; // Instructor ID
  day: DayOfWeek;
  hours: string[]; // List of available start times in HH:MM format
}

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';
