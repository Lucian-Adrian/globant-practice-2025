import * as React from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, ReferenceArrayInput, SelectArrayInput, required } from 'react-admin';
import { useTranslation } from 'react-i18next';
import { validateTimeFormat } from '../../shared/validation/validators';

export default function ScheduledClassPatternCreate(props) {
  const t = useTranslate();
  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

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
        <ReferenceInput source="course_id" reference="classes" perPage={100}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.course', 'Course')} optionText="name" optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100} filter={{ max_capacity_gte: 10 }}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.resource', 'Resource')} optionText={(r) => r.name || r.license_plate} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        
        <ArrayInput source="recurrences" label={t('resources.scheduledclasspatterns.fields.recurrences', 'Recurrences')} validate={[required()]}>
          <SimpleFormIterator>
            <SelectInput source="day" label={t('resources.scheduledclasspatterns.fields.day', 'Day')} choices={[
              { id: 'MONDAY', name: 'Monday' },
              { id: 'TUESDAY', name: 'Tuesday' },
              { id: 'WEDNESDAY', name: 'Wednesday' },
              { id: 'THURSDAY', name: 'Thursday' },
              { id: 'FRIDAY', name: 'Friday' },
              { id: 'SATURDAY', name: 'Saturday' },
              { id: 'SUNDAY', name: 'Sunday' },
            ]} validate={[required()]} />
            <TextInput source="time" label={t('resources.scheduledclasspatterns.fields.time', 'Time')} validate={[required(), validateTimeFormat(t)]} />
          </SimpleFormIterator>
        </ArrayInput>

        <DateInput 
          source="start_date" 
          label={t('resources.scheduledclasspatterns.fields.start_date', 'Pattern Start Date')} 
          validate={[required()]}
        />
        <NumberInput source="num_lessons" label={t('resources.scheduledclasspatterns.fields.num_lessons', 'Number of Lessons')} validate={[required()]} />
        <NumberInput source="default_duration_minutes" label={t('resources.scheduledclasspatterns.fields.default_duration_minutes', 'Default Duration (min)')} defaultValue={60} />
        <NumberInput source="default_max_students" label={t('resources.scheduledclasspatterns.fields.default_max_students', 'Default Max Students')} />
        {/* Removed: status - patterns don't have status, only generated classes do */}
        <ReferenceArrayInput source="student_ids" reference="students" perPage={100}>
          <SelectArrayInput label={t('resources.scheduledclasspatterns.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceArrayInput>
      </SimpleForm>
    </Create>
  );
}