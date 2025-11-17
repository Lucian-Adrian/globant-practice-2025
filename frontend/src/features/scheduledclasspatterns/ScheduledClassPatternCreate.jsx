import * as React from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, ReferenceArrayInput, SelectArrayInput, required } from 'react-admin';
import { validateTimeFormat } from '../../shared/validation/validators';

const RecurrenceArrayInput = () => {
  const translate = useTranslate();
  return (
    <ArrayInput source="recurrences">
      <SimpleFormIterator>
        <SelectInput source="day" label={t('resources.scheduledclasses.fields.day', 'Day')} choices={[
          { id: 'MONDAY', name: 'Monday' },
          { id: 'TUESDAY', name: 'Tuesday' },
          { id: 'WEDNESDAY', name: 'Wednesday' },
          { id: 'THURSDAY', name: 'Thursday' },
          { id: 'FRIDAY', name: 'Friday' },
          { id: 'SATURDAY', name: 'Saturday' },
          { id: 'SUNDAY', name: 'Sunday' },
        ]} validate={[required()]} />
        <TextInput source="time" label={t('resources.scheduledclasses.fields.time', 'Time')} validate={[validateTimeFormat(translate), required()]} />
      </SimpleFormIterator>
    </ArrayInput>
  );
};

export default function ScheduledClassPatternCreate(props) {
  const t = useTranslate();
  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  return (
    <Create {...props}>
      <SimpleForm transform={(data) => {
        const recurrences = data.recurrences || [];
        if (!recurrences.length) {
          throw new Error(t('validation.atLeastOneRecurrence', 'At least one recurrence is required'));
        }
        return {
          ...data,
          recurrence_days: recurrences.map(r => r.day),
          times: recurrences.map(r => r.time),
        };
      }}>
        <TextInput source="name" label={t('resources.scheduledclasses.fields.name', 'Name')} validate={[required()]} />
        <ReferenceInput source="course_id" reference="classes" perPage={100}>
          <SelectInput label={t('resources.scheduledclasses.fields.course', 'Course')} optionText="name" optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
          <SelectInput label={t('resources.scheduledclasses.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100}>
          <SelectInput label={t('resources.scheduledclasses.fields.resource', 'Resource')} optionText={(r) => r.name || r.license_plate} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <RecurrenceArrayInput source="recurrences" label={t('resources.scheduledclasses.fields.recurrences', 'Recurrences')} />
        <DateInput 
          source="start_date" 
          label={t('resources.scheduledclasspatterns.fields.start_date', 'Pattern Start Date')} 
          validate={[required()]}
        />
        <NumberInput source="num_lessons" label={t('resources.scheduledclasses.fields.num_lessons', 'Number of Lessons')} validate={[required()]} />
        <NumberInput source="duration_minutes" label={t('resources.scheduledclasses.fields.duration_minutes', 'Duration (min)')} defaultValue={60} />
        <NumberInput source="max_students" label={t('resources.scheduledclasses.fields.max_students', 'Max Students')} />
        <SelectInput source="status" label={t('resources.scheduledclasses.fields.status', 'Status')} choices={statusChoices} defaultValue="SCHEDULED" />
        <ReferenceArrayInput source="student_ids" reference="students" perPage={100}>
          <SelectArrayInput label={t('resources.scheduledclasses.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceArrayInput>
      </SimpleForm>
    </Create>
  );
}