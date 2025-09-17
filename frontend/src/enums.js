// Static enum definitions (Phase 0). These will be replaced by a dynamic
// fetch to /api/meta/enums/ in a later phase (P8-FE-01).

export const VEHICLE_CATEGORIES = [
  'AM','A1','A2','A','B1','B','C1','C','D1','D','BE','C1E','CE','D1E','DE',
].map(v => ({ id: v, name: v }));

export const STUDENT_STATUS = [
  'ACTIVE','INACTIVE','GRADUATED',
].map(v => ({ id: v, name: v }));

export const ENROLLMENT_STATUS = [
  'IN_PROGRESS','COMPLETED','DROPPED',
].map(v => ({ id: v, name: v }));

export const LESSON_STATUS = [
  'SCHEDULED','COMPLETED','CANCELED',
].map(v => ({ id: v, name: v }));

export const PAYMENT_METHODS = [
  'CASH','CARD','TRANSFER',
].map(v => ({ id: v, name: v }));

// Currency & locale defaults for Moldova
export const DEFAULT_COUNTRY_CODE = '+373';
export const CURRENCY_CODE = 'MDL';
