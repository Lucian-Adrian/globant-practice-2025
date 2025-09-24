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
