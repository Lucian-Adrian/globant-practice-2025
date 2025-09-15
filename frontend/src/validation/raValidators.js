import i18next from 'i18next';
import { required } from 'react-admin';
import { validateEmail, validatePhone, validateStudentDob, validateInstructorHireDate } from './validators';

const toMsg = (res) => {
  if (!res || res.ok) return undefined;
  const err = res.error;
  if (!err || !err.key) return undefined;
  return i18next.t(err.key, { ns: 'validation', ...(err.params || {}) });
};

export const raEmail = (value) => toMsg(validateEmail(value));

export const raPhone = (empties = ['+', '+373']) => (value) =>
  toMsg(validatePhone(value, { empties }));

// Student DOB RA validator -> returns localized message or undefined
export const raDob = () => (value) => toMsg(validateStudentDob(value));

// Instructor hire date RA validator with option to allow future dates
export const raHireDate = ({ allowFuture = false } = {}) => (value) =>
  toMsg(validateInstructorHireDate(value, { allowFuture }));

// Backward-compat exported names (if referenced elsewhere)
export const raStudentDob = (value) => toMsg(validateStudentDob(value));
export const raInstructorHireDate = (value) => toMsg(validateInstructorHireDate(value));

// Shared required validator with unified message
export const req = required('This field is required');
