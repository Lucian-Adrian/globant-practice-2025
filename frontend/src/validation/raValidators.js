import i18next from 'i18next';
import {
  validateEmail,
  validatePhone,
  validateStudentDob,
  validateInstructorHireDate,
} from './validators';

const toMsg = (res) => {
  if (!res || res.ok) return undefined;
  const err = res.error;
  if (!err || !err.key) return undefined;
  return i18next.t(err.key, { ns: 'validation', ...(err.params || {}) });
};

export const raEmail = (value) => toMsg(validateEmail(value));

export const raPhone = (empties = ['+', '+373']) => (value) =>
  toMsg(validatePhone(value, { empties }));

export const raStudentDob = (value) => toMsg(validateStudentDob(value));

export const raInstructorHireDate = (value) => toMsg(validateInstructorHireDate(value));
