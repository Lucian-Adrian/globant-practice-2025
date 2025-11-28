/**
 * Course type definitions
 */

export interface Course {
  id: number;
  name: string;
  category: VehicleCategory;
  type: CourseType;
  description: string;
  price: string; // Decimal as string
  required_lessons: number;
}

export interface CourseSummary {
  id: number;
  name: string;
  category?: VehicleCategory;
  type?: CourseType;
}

export type CourseType = 'THEORY' | 'PRACTICE';

export type VehicleCategory = 'A' | 'A1' | 'A2' | 'AM' | 'B' | 'B1' | 'BE' | 'C' | 'C1' | 'CE' | 'C1E' | 'D' | 'D1' | 'DE' | 'D1E';
