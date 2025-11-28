/**
 * Resource type definitions
 */

import type { VehicleCategory } from './course';

export interface Resource {
  id: number;
  name: string;
  max_capacity: number;
  category: VehicleCategory | null;
  is_available: boolean;
  type: ResourceType;
  // Vehicle-specific fields (nullable for classrooms)
  license_plate: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
}

export interface ResourceSummary {
  id: number;
  name: string;
  max_capacity?: number;
  license_plate?: string;
  make?: string;
  model?: string;
}

export type ResourceType = 'VEHICLE' | 'CLASSROOM';

// Deprecated - use Resource instead
export interface Vehicle {
  id: number;
  make: string;
  model: string;
  license_plate: string;
  year: number;
  category: VehicleCategory;
  is_available: boolean;
}
