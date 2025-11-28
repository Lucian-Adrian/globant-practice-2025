/**
 * Payment type definitions
 */

import type { EnrollmentSummary } from './enrollment';

export interface Payment {
  id: number;
  enrollment: EnrollmentSummary;
  enrollment_id?: number;
  amount: string; // Decimal as string
  payment_date: string; // ISO datetime string
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
}

export interface PaymentSummary {
  id: number;
  amount?: string;
  payment_date?: string;
  method?: PaymentMethod;
  status?: PaymentStatus;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
