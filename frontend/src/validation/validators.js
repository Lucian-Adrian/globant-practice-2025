// Shared validation utilities and constants
// Centralize form validation logic for reuse across components

import { isValidPhoneNumber, parsePhoneNumberFromString } from 'libphonenumber-js';

// Age/date constraints
export const MAX_YEARS_AGO = 125; // generic upper bound for historical dates
export const MIN_STUDENT_AGE_YEARS = 15; // Signup minimum age

// Date helpers (local, day-level)
export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const yyyyMmDdLocal = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const yearsAgo = (years, from = new Date()) => {
  const base = startOfDay(from);
  const d = new Date(base);
  d.setFullYear(d.getFullYear() - years);
  return d;
};

// Helper: return local YYYY-MM-DD representing (today - N years)
export const yyyyMmDdYearsAgo = (years, from = new Date()) => yyyyMmDdLocal(yearsAgo(years, from));

// Basic validators
export const isEmail = (v) => /^(?!\s)[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '');

// Phone input sanitization: allow one leading '+' and digits only
export const sanitizePhone = (raw) => {
  let v = String(raw ?? '').replace(/[^\d+]/g, '');
  if (v.includes('+')) v = '+' + v.replace(/\+/g, '');
  return v;
};

// Treat some values as effectively empty for phone fields (customizable per form)
export const isPhoneEmpty = (value, empties = ['+', '+373']) => {
  const v = String(value ?? '').trim();
  return !v || empties.includes(v);
};

// Phone validator
export const validatePhone = (value, { empties = ['+', '+373'] } = {}) => {
  if (isPhoneEmpty(value, empties)) return { ok: false, error: { key: 'required' } };
  const v = String(value || '').trim();
  // Enforce +373 prefix and digits only after, per product requirement
  if (!/^\+373\d+$/.test(v)) return { ok: false, error: { key: 'invalidPhone' } };
  // Optionally still run libphonenumber validation for extra safety
  return isValidPhoneNumber(v)
    ? { ok: true, error: null }
    : { ok: false, error: { key: 'invalidPhone' } };
};

// Email validator
export const validateEmail = (value) => {
  const v = String(value ?? '').trim();
  if (!v) return { ok: false, error: { key: 'required' } };
  return isEmail(v) ? { ok: true, error: null } : { ok: false, error: { key: 'invalidEmail' } };
};

// Student DOB validator with min/max age boundaries
export const validateStudentDob = (
  value,
  {
    today = startOfDay(new Date()),
    minAgeYears = MIN_STUDENT_AGE_YEARS,
    maxAgeYears = MAX_YEARS_AGO,
  } = {}
) => {
  if (!value) return { ok: false, error: { key: 'required' } };
  const dob = startOfDay(new Date(value));
  if (Number.isNaN(dob.getTime())) return { ok: false, error: { key: 'invalidDob' } };
  if (dob > today) return { ok: false, error: { key: 'invalidDob' } }; // future date not allowed

  const tooYoungCutoff = yearsAgo(minAgeYears, today); // must be <= this date
  if (dob > tooYoungCutoff) return { ok: false, error: { key: 'tooYoung', params: { years: minAgeYears } } };

  const tooOldCutoff = yearsAgo(maxAgeYears, today); // must be >= this date
  if (dob < tooOldCutoff) return { ok: false, error: { key: 'tooOld', params: { years: maxAgeYears } } };

  return { ok: true, error: null };
};

// Instructor hire date validator: not in future, and not more than MAX_YEARS_AGO years ago
export const validateInstructorHireDate = (
  value,
  { today = startOfDay(new Date()), maxYearsAgo = MAX_YEARS_AGO, allowFuture = false } = {}
) => {
  if (!value) return { ok: false, error: { key: 'required' } };
  const d = startOfDay(new Date(value));
  if (Number.isNaN(d.getTime())) return { ok: false, error: { key: 'invalidHireDate' } };
  if (!allowFuture && d > today) return { ok: false, error: { key: 'invalidHireDate' } }; // no future dates
  const oldest = yearsAgo(maxYearsAgo, today);
  if (d < oldest) return { ok: false, error: { key: 'tooOld', params: { years: maxYearsAgo } } };
  return { ok: true, error: null };
};

// Optional: expose E.164 normalization helper for submissions
export const normalizePhoneE164 = (value) => {
  try {
    const p = parsePhoneNumberFromString(value);
    return p?.isValid() ? p.number : value;
  } catch {
    return value;
  }
};
