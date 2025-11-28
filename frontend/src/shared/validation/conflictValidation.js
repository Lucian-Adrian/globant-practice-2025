/**
 * Conflict detection validation functions
 */

import { addMinutes, overlap } from './timeUtils';

/**
 * Check for instructor schedule conflicts
 * 
 * @param {Object} params - Validation parameters
 * @param {Date} params.start - Lesson start time
 * @param {Date} params.end - Lesson end time
 * @param {number|string} params.instructorId - Instructor ID
 * @param {number|string|null} params.excludeId - ID to exclude (current record when editing)
 * @param {Array} params.lessons - Existing lessons
 * @param {Array} params.scheduledClasses - Existing scheduled classes
 * @param {Function} params.t - Translation function
 * @returns {string|null} Error message if conflict found, null otherwise
 */
export function checkInstructorConflicts({
  start,
  end,
  instructorId,
  excludeId,
  lessons,
  scheduledClasses,
  t,
}) {
  // Check lesson conflicts
  const lessonConflict = lessons.find((l) => {
    if (excludeId && l.id === excludeId) return false;
    if (Number(l.instructor) !== Number(instructorId)) return false;
    const lStart = new Date(l.scheduled_time);
    const lEnd = addMinutes(lStart, l.duration_minutes || 60);
    return overlap(start, end, lStart, lEnd);
  });

  if (lessonConflict) {
    return t('validation:instructorLessonConflict', {
      defaultValue: 'Instructor has a conflicting lesson at this time',
    });
  }

  // Check scheduled class conflicts
  const classConflict = scheduledClasses.find((sc) => {
    if (excludeId && sc.id === excludeId) return false;
    if (Number(sc.instructor) !== Number(instructorId)) return false;
    const scStart = new Date(sc.scheduled_time);
    const scEnd = addMinutes(scStart, sc.duration_minutes || 60);
    return overlap(start, end, scStart, scEnd);
  });

  if (classConflict) {
    return t('validation:instructorClassConflict', {
      defaultValue: 'Instructor has a conflicting class at this time',
    });
  }

  return null;
}

/**
 * Check for classroom/vehicle resource conflicts
 * 
 * @param {Object} params - Validation parameters
 * @param {Date} params.start - Lesson start time
 * @param {Date} params.end - Lesson end time
 * @param {number|string|null} params.classroomId - Classroom ID (for theory)
 * @param {number|string|null} params.vehicleId - Vehicle ID (for driving)
 * @param {number|string|null} params.excludeId - ID to exclude (current record when editing)
 * @param {Array} params.lessons - Existing lessons
 * @param {Array} params.scheduledClasses - Existing scheduled classes
 * @param {Function} params.t - Translation function
 * @returns {string|null} Error message if conflict found, null otherwise
 */
export function checkResourceConflicts({
  start,
  end,
  classroomId,
  vehicleId,
  excludeId,
  lessons,
  scheduledClasses,
  t,
}) {
  // Check classroom conflicts
  if (classroomId) {
    const classroomConflict = scheduledClasses.find((sc) => {
      if (excludeId && sc.id === excludeId) return false;
      if (Number(sc.classroom) !== Number(classroomId)) return false;
      const scStart = new Date(sc.scheduled_time);
      const scEnd = addMinutes(scStart, sc.duration_minutes || 60);
      return overlap(start, end, scStart, scEnd);
    });

    if (classroomConflict) {
      return t('validation:classroomConflict', {
        defaultValue: 'Classroom is already booked at this time',
      });
    }
  }

  // Check vehicle conflicts
  if (vehicleId) {
    const vehicleConflict = lessons.find((l) => {
      if (excludeId && l.id === excludeId) return false;
      if (Number(l.vehicle) !== Number(vehicleId)) return false;
      const lStart = new Date(l.scheduled_time);
      const lEnd = addMinutes(lStart, l.duration_minutes || 60);
      return overlap(start, end, lStart, lEnd);
    });

    if (vehicleConflict) {
      return t('validation:vehicleConflict', {
        defaultValue: 'Vehicle is already booked at this time',
      });
    }
  }

  return null;
}

/**
 * Check for student enrollment conflicts (double-booking)
 * 
 * @param {Object} params - Validation parameters
 * @param {Date} params.start - Lesson start time
 * @param {Date} params.end - Lesson end time
 * @param {number|string} params.studentId - Student ID
 * @param {number|string|null} params.excludeId - ID to exclude (current record when editing)
 * @param {Array} params.lessons - Existing lessons
 * @param {Function} params.t - Translation function
 * @returns {string|null} Error message if conflict found, null otherwise
 */
export function checkStudentConflicts({ start, end, studentId, excludeId, lessons, t }) {
  const conflict = lessons.find((l) => {
    if (excludeId && l.id === excludeId) return false;
    if (Number(l.student) !== Number(studentId)) return false;
    const lStart = new Date(l.scheduled_time);
    const lEnd = addMinutes(lStart, l.duration_minutes || 60);
    return overlap(start, end, lStart, lEnd);
  });

  if (conflict) {
    return t('validation:studentConflict', {
      defaultValue: 'Student has another lesson at this time',
    });
  }

  return null;
}
