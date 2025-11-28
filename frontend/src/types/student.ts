/**
 * Student type definitions
 */

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string; // ISO date string
  enrollment_date: string; // ISO datetime string
  status: StudentStatus;
}

export type StudentStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'GRADUATED';

export interface StudentSummary {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}
