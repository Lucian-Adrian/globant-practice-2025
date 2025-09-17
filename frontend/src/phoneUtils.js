// Basic phone utilities for composing and validating E.164-ish numbers.
// Very lightweight; backend will also normalize so this is just UX help.

export function toE164(countryCode, localDigits) {
  const cc = (countryCode || '').replace(/[^+0-9]/g, '');
  const local = (localDigits || '').replace(/[^0-9]/g, '');
  if (!cc.startsWith('+')) return `+${cc}${local}`;
  return `${cc}${local}`;
}

export function validatePhone(countryCode, localDigits) {
  const local = (localDigits || '').replace(/[^0-9]/g, '');
  // Simple length heuristic: 6-12 digits local part
  if (local.length < 6 || local.length > 12) return false;
  // Entire combined length (without +) 8-16 digits
  const combined = `${countryCode || ''}${local}`.replace(/[^0-9]/g, '');
  if (combined.length < 8 || combined.length > 16) return false;
  return true;
}
