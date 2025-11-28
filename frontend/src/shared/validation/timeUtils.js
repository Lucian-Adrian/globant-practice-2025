/**
 * Time utility functions for validation
 */

// Business-local timezone for availability checks (must match backend settings BUSINESS_TZ)
export const BUSINESS_TZ = 'Europe/Chisinau';
export const DAY_ENUM = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

/**
 * Add minutes to a date
 * @param {Date|string} date - The base date
 * @param {number} mins - Minutes to add
 * @returns {Date} New date with added minutes
 */
export const addMinutes = (date, mins) => new Date(new Date(date).getTime() + mins * 60000);

/**
 * Check if two time ranges overlap (adjacency is allowed)
 * @param {Date} startA - Start of first range
 * @param {Date} endA - End of first range
 * @param {Date} startB - Start of second range
 * @param {Date} endB - End of second range
 * @returns {boolean} True if ranges overlap
 */
export const overlap = (startA, endA, startB, endB) => startA < endB && startB < endA;

/**
 * Convert HH:MM string to minutes since midnight
 * @param {string} hhmm - Time string in HH:MM format
 * @returns {number} Minutes since midnight
 */
export function minutesOf(hhmm) {
  const [h, m] = String(hhmm)
    .split(':')
    .map((x) => parseInt(x, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Format a date into business timezone day and time parts
 * @param {Date|string} date - The date to format
 * @returns {{dayIndex: number, hhmm: string}} Day index (0=Monday) and HH:MM time
 */
export function formatInBusinessTZParts(date) {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: BUSINESS_TZ,
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(date);
    const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const weekdayShort = (byType.weekday || '').slice(0, 3).toLowerCase();
    const map = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
    const dayIndex = map[weekdayShort] ?? 0;
    const hh = String(byType.hour || '00').padStart(2, '0');
    const mm = String(byType.minute || '00').padStart(2, '0');
    return { dayIndex, hhmm: `${hh}:${mm}` };
  } catch {
    // Fallback to local if Intl fails
    const d = new Date(date);
    const dayIndex = (d.getDay() + 6) % 7;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return { dayIndex, hhmm: `${hh}:${mm}` };
  }
}
