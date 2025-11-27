/**
 * CourseStudentsInput - Select students enrolled in the selected course
 * 
 * This component is used in ScheduledClass and ScheduledClassPattern forms
 * to select students. It automatically filters to show only students
 * enrolled in the selected course.
 */
import * as React from 'react';
import { ReferenceArrayInput, SelectArrayInput, useTranslate } from 'react-admin';
import { useWatch } from 'react-hook-form';

/**
 * Student selection input that filters by the selected course's enrollments.
 * Must be used inside a react-hook-form context with a course_id field.
 * 
 * @param {Object} props
 * @param {string} [props.source='student_ids'] - Form field source name
 * @param {string} [props.label] - Custom label (defaults to translated 'Students')
 * @param {string} [props.translationKey='resources.scheduledclasses.fields.students'] - i18n key for label
 */
const CourseStudentsInput = ({ 
  source = 'student_ids', 
  label,
  translationKey = 'resources.scheduledclasses.fields.students'
}) => {
  const t = useTranslate();
  const courseId = useWatch({ name: 'course_id' });
  
  const displayLabel = label || t(translationKey, 'Students');
  
  return (
    <ReferenceArrayInput 
      source={source}
      reference="students" 
      perPage={100}
      filter={courseId ? { enrollments: courseId } : {}}
    >
      <SelectArrayInput 
        label={displayLabel} 
        optionText={(r) => `${r.first_name} ${r.last_name}`} 
      />
    </ReferenceArrayInput>
  );
};

export default CourseStudentsInput;
