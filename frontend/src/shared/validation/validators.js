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
  if (!/^\+?\d[\d ]{7,15}$/.test(value)) return 'Invalid phone number';
};

// Allowed vehicle categories – keep in sync with backend VehicleCategory
const ALLOWED_CATEGORIES = [
  'AM','A1','A2','A','B1','B','C1','C','D1','D','BE','C1E','CE','D1E','DE'
];

export const parseLicenseCategories = (value) => {
  if (value == null) return '';
  // Keep only letters, numbers and commas, make uppercase
  const cleaned = String(value).toUpperCase().replace(/[^A-Z0-9,]/g, '');
  // Allow trailing comma while typing; normalize only tokens
  const rawParts = cleaned.endsWith(',') ? cleaned.slice(0, -1) : cleaned;
  const parts = rawParts
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const seen = [];
  parts.forEach((p) => { if (!seen.includes(p)) seen.push(p); });
  const normalized = seen.join(',');
  // Preserve trailing comma to not block typing the next token
  return cleaned.endsWith(',') ? (normalized ? normalized + ',' : ',') : normalized;
};

export const validateLicenseCategoriesClient = (value) => {
  const str = parseLicenseCategories(value);
  if (!str) return 'At least one category is required';
  const invalid = str.split(',').filter((p) => !ALLOWED_CATEGORIES.includes(p));
  if (invalid.length) return `Invalid categories: ${invalid.join(', ')}`;
  return undefined;
};

// Validate time format (HH:MM)
export const validateTimeFormat = (value) => {
  if (!value) return undefined; // Allow empty values, use required() for mandatory fields
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(value)) {
    return 'Time must be in HH:MM format (e.g., 09:30 or 14:00)';
  }
  return undefined;
};
