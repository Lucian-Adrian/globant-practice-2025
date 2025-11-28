import * as React from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, required } from 'react-admin';
import { validateTimeFormat } from '../../shared/validation/validators';
import { CheckAvailabilityButton, CourseStudentsInput } from '../../shared/components/forms';

export default function ScheduledClassPatternCreate(props) {
  const t = useTranslate();

  return (
    <Create {...props} transform={(data) => {
        const recurrences = data.recurrences || [];
        if (!recurrences.length) {
          throw new Error(t('validation.atLeastOneRecurrence', 'At least one recurrence is required'));
        }
        // Extract unique days and times using Set to avoid duplicates
        const uniqueDays = [...new Set(recurrences.map(r => r.day))];
        const uniqueTimes = [...new Set(recurrences.map(r => r.time))];
        
        return {
          ...data,
          recurrence_days: uniqueDays,
          times: uniqueTimes,
          recurrences: undefined, // clean up
        };
      }}>
      <SimpleForm>
        <TextInput source="name" label={t('resources.scheduledclasspatterns.fields.name', 'Name')} validate={[required()]} />
        <ReferenceInput source="course_id" reference="classes" perPage={100} filter={{ type: 'THEORY' }}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.course', 'Course')} optionText="name" optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100} filter={{ max_capacity_gte: 3 }}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.resource', 'Resource (Classroom)')} optionText={(r) => r.name || `${r.make} ${r.model}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        
        <ArrayInput source="recurrences" label={t('resources.scheduledclasspatterns.fields.recurrences', 'Recurrences')} validate={[required()]}>
          <SimpleFormIterator>
            <SelectInput source="day" label={t('resources.scheduledclasspatterns.fields.day', 'Day')} choices={[
              { id: 'MONDAY', name: t('common.days.MONDAY', 'Monday') },
              { id: 'TUESDAY', name: t('common.days.TUESDAY', 'Tuesday') },
              { id: 'WEDNESDAY', name: t('common.days.WEDNESDAY', 'Wednesday') },
              { id: 'THURSDAY', name: t('common.days.THURSDAY', 'Thursday') },
              { id: 'FRIDAY', name: t('common.days.FRIDAY', 'Friday') },
              { id: 'SATURDAY', name: t('common.days.SATURDAY', 'Saturday') },
              { id: 'SUNDAY', name: t('common.days.SUNDAY', 'Sunday') },
            ]} validate={[required()]} />
            <TextInput source="time" label={t('resources.scheduledclasspatterns.fields.time', 'Time')} validate={[required(), validateTimeFormat(t)]} />
          </SimpleFormIterator>
        </ArrayInput>

        <CheckAvailabilityButton />

        <DateInput 
          source="start_date" 
          label={t('scheduledclasspatterncreate.patternStartDate', 'Pattern Start Date')} 
          validate={[required()]}
        />
        <NumberInput source="num_lessons" label={t('scheduledclasspatterncreate.numberOfLessons', 'Number of Lessons')} validate={[required()]} />
        <NumberInput source="default_duration_minutes" label={t('scheduledclasspatterncreate.defaultDurationMin', 'Default Duration (min)')} defaultValue={60} />
        <NumberInput source="default_max_students" label={t('scheduledclasspatterncreate.defaultMaxStudents', 'Default Max Students')} />
        {/* Removed: status - patterns don't have status, only generated classes do */}
        <CourseStudentsInput translationKey="resources.scheduledclasspatterns.fields.students" />
      </SimpleForm>
    </Create>
  );
}