/**
 * Capacity validation functions for scheduled classes
 */

/**
 * Check if class has capacity for additional students
 * 
 * @param {Object} params - Validation parameters
 * @param {number} params.currentCount - Current student count
 * @param {number} params.maxCapacity - Maximum capacity
 * @param {number} [params.addingCount=1] - Number of students being added
 * @param {Function} params.t - Translation function
 * @returns {string|null} Error message if over capacity, null otherwise
 */
export function checkCapacity({ currentCount, maxCapacity, addingCount = 1, t }) {
  if (!maxCapacity) return null;
  
  const newTotal = currentCount + addingCount;
  
  if (newTotal > maxCapacity) {
    return t('validation:capacityExceeded', {
      current: currentCount,
      max: maxCapacity,
      defaultValue: `Class capacity exceeded (${currentCount}/${maxCapacity})`,
    });
  }

  return null;
}

/**
 * Validate classroom capacity for scheduled class
 * 
 * @param {Object} params - Validation parameters
 * @param {number|string|null} params.classroomId - Classroom ID
 * @param {number} params.expectedStudents - Expected number of students
 * @param {Array} params.classrooms - Available classrooms list
 * @param {Function} params.t - Translation function
 * @returns {string|null} Error message if capacity issue, null otherwise
 */
export function checkClassroomCapacity({ classroomId, expectedStudents, classrooms, t }) {
  if (!classroomId || !expectedStudents) return null;
  
  const classroom = classrooms.find((c) => Number(c.id) === Number(classroomId));
  
  if (!classroom) return null;
  
  if (classroom.capacity && expectedStudents > classroom.capacity) {
    return t('validation:classroomCapacityExceeded', {
      expected: expectedStudents,
      capacity: classroom.capacity,
      defaultValue: `Classroom capacity (${classroom.capacity}) is less than expected students (${expectedStudents})`,
    });
  }

  return null;
}

/**
 * Check if student is enrolled in a course
 * 
 * @param {Object} params - Validation parameters
 * @param {number|string} params.studentId - Student ID
 * @param {number|string} params.courseId - Course ID
 * @param {Array} params.enrollments - Enrollment records
 * @param {Function} params.t - Translation function
 * @returns {string|null} Error message if not enrolled, null otherwise
 */
export function checkStudentEnrollment({ studentId, courseId, enrollments, t }) {
  if (!studentId || !courseId) return null;
  
  const enrolled = enrollments.some(
    (e) => Number(e.student) === Number(studentId) && Number(e.course) === Number(courseId)
  );

  if (!enrolled) {
    return t('validation:studentNotEnrolled', {
      defaultValue: 'Student is not enrolled in this course',
    });
  }

  return null;
}
