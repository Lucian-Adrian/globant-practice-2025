// Shared client-side validators

export const validateDOB = (value) => {
  if (!value) return 'Date of birth is required';
  const date = new Date(value + 'T00:00:00');
  const today = new Date();
  if (date > today) return 'Date of birth cannot be in the future';
  const age =
    today.getFullYear() -
    date.getFullYear() -
    (today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())
      ? 1
      : 0);
  if (age < 15) return 'Must be at least 15 years old';
};

export const validateEmail = (value) => {
  if (!value) return 'Email is required';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Enter a valid email address';
};

export const validatePhoneClient = (value) => {
  if (!value) return 'Phone number is required';
  if (!/^\+?\d[\d ]{7,15}$/.test(value)) return 'Invalid phone number format';
};

// Allowed vehicle categories – keep in sync with backend VehicleCategory
const ALLOWED_CATEGORIES = [
  'AM','A1','A2','A','B1','B','C1','C','D1','D','BE','C1E','CE','D1E','DE'
];

// Sanitize input while typing: allow only letters, digits, commas; auto-uppercase;
// keep a trailing comma so users can start typing the next token.
export const parseLicenseCategories = (value) => {
  if (value == null) return '';
  let s = String(value).toUpperCase();
  s = s.replace(/[^A-Z0-9,]/g, '');         // restrict characters
  s = s.replace(/,{2,}/g, ',');              // collapse multiple commas
  s = s.replace(/^,/, '');                   // remove leading comma
  // do NOT trim trailing comma
  return s;
};

export const validateLicenseCategoriesClient = (value) => {
  const sanitized = parseLicenseCategories(value);
  const str = sanitized.endsWith(',') ? sanitized.slice(0, -1) : sanitized;
  if (!str) return 'At least one category is required';
  const invalid = str.split(',').filter((p) => p && !ALLOWED_CATEGORIES.includes(p));
  if (invalid.length) return `Invalid categories: ${invalid.join(', ')}`;
  return undefined;
};
