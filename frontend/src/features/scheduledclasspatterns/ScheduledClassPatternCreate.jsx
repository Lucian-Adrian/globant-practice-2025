import * as React from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, ReferenceArrayInput, SelectArrayInput, required } from 'react-admin';
import { useTranslation } from 'react-i18next';
import { validateTimeFormat } from '../../shared/validation/validators';

const RecurrenceArrayInput = () => {
  const { t } = useTranslation();
  const translate = useTranslate();
  return (
    <ArrayInput source="recurrences" inputProps={{ 'data-testid': 'recurrences' }}>
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
        <TextInput source="time" label={t('resources.scheduledclasspatterns.fields.time', 'Time')} validate={[validateTimeFormat(translate), required()]} />
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
        <TextInput source="name" label={t('resources.scheduledclasspatterns.fields.name', 'Name')} validate={[required()]} inputProps={{ 'data-testid': 'name' }} />
        <ReferenceInput source="course_id" reference="classes" perPage={100}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.course', 'Course')} optionText="name" optionValue="id" validate={[required()]} inputProps={{ 'data-testid': 'course_id' }} />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} inputProps={{ 'data-testid': 'instructor_id' }} />
        </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.resource', 'Resource')} optionText={(r) => r.name || r.license_plate} optionValue="id" validate={[required()]} inputProps={{ 'data-testid': 'resource_id' }} />
        </ReferenceInput>
        <RecurrenceArrayInput />
        <DateInput 
          source="start_date" 
          label={t('resources.scheduledclasspatterns.fields.start_date', 'Pattern Start Date')} 
          validate={[required()]}
          inputProps={{ 'data-testid': 'start_date' }}
        />
        <NumberInput source="num_lessons" label={t('resources.scheduledclasspatterns.fields.num_lessons', 'Number of Lessons')} validate={[required()]} inputProps={{ 'data-testid': 'num_lessons' }} />
        <NumberInput source="duration_minutes" label={t('resources.scheduledclasspatterns.fields.duration_minutes', 'Duration (min)')} defaultValue={60} inputProps={{ 'data-testid': 'duration_minutes' }} />
        <NumberInput source="max_students" label={t('resources.scheduledclasspatterns.fields.max_students', 'Max Students')} inputProps={{ 'data-testid': 'max_students' }} />
        <SelectInput source="status" label={t('resources.scheduledclasspatterns.fields.status', 'Status')} choices={statusChoices} defaultValue="SCHEDULED" inputProps={{ 'data-testid': 'status' }} />
        <ReferenceArrayInput source="student_ids" reference="students" perPage={100}>
          <SelectArrayInput label={t('resources.scheduledclasspatterns.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} inputProps={{ 'data-testid': 'student_ids' }} />
        </ReferenceArrayInput>
      </SimpleForm>
    </Create>
  );
}