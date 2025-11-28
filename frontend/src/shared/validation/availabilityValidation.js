/**
 * Instructor availability validation functions
 */

import { DAY_ENUM, minutesOf, formatInBusinessTZParts } from './timeUtils';

/**
 * Check if a lesson/class time falls within instructor's availability
 * 
 * @param {Object} params - Validation parameters
 * @param {Date} params.start - Lesson start time
 * @param {Date} params.end - Lesson end time
 * @param {Array} params.availability - Instructor availability records
 * @param {Function} params.t - Translation function
 * @returns {string|null} Error message if unavailable, null if available
 */
export function checkInstructorAvailability({ start, end, availability, t }) {
  if (!availability || availability.length === 0) {
    return null; // No availability restrictions
  }

  const { dayIndex: dayIdxStart, hhmm: startHHMM } = formatInBusinessTZParts(start);
  const { dayIndex: dayIdxEnd, hhmm: endHHMM } = formatInBusinessTZParts(end);

  // If lesson spans multiple days, we only check the start day for simplicity
  const lessonDayEnum = DAY_ENUM[dayIdxStart];
  const lessonStartMins = minutesOf(startHHMM);
  const lessonEndMins = dayIdxStart === dayIdxEnd ? minutesOf(endHHMM) : 24 * 60;

  // Filter availability slots for this day
  const daySlots = availability.filter((slot) => slot.day_of_week === lessonDayEnum);

  if (daySlots.length === 0) {
    return t('validation:instructorNotAvailableDay', {
      day: lessonDayEnum,
      defaultValue: `Instructor is not available on ${lessonDayEnum}`,
    });
  }

  // Check if lesson time falls within any availability slot
  const covered = daySlots.some((slot) => {
    const slotStart = minutesOf(slot.start_time);
    const slotEnd = minutesOf(slot.end_time);
    return lessonStartMins >= slotStart && lessonEndMins <= slotEnd;
  });

  if (!covered) {
    return t('validation:instructorNotAvailableTime', {
      time: `${startHHMM}-${endHHMM}`,
      defaultValue: `Instructor is not available at ${startHHMM}-${endHHMM}`,
    });
  }

  return null;
}

/**
 * Fetch instructor availability from API
 * 
 * @param {number|string} instructorId - Instructor ID
 * @param {Function} getJson - HTTP fetch function
 * @returns {Promise<Array>} Availability records
 */
export async function fetchInstructorAvailability(instructorId, getJson) {
  if (!instructorId) return [];
  return getJson(`/api/instructor-availability/?instructor=${instructorId}`);
}
