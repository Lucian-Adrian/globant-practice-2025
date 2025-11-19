import * as React from 'react';
import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, ReferenceArrayInput, SelectArrayInput, required, useRecordContext, TopToolbar, ListButton, ShowButton } from 'react-admin';
import { useTranslation } from 'react-i18next';
import { validateTimeFormat } from '../../shared/validation/validators';
import Breadcrumb from '../../shared/components/Breadcrumb.jsx';

export default function ScheduledClassPatternEdit(props) {
  const t = useTranslate();
  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  const EditActions = () => (
    <TopToolbar>
      <ListButton />
      <ShowButton />
    </TopToolbar>
  );

  return (
    <>
      <Breadcrumb />
      <Edit {...props} actions={<EditActions />}>
        <SimpleForm 
          defaultValues={(record) => ({
            ...record,
            times_objects: record.times ? record.times.map(t => ({ time: t })) : []
          })}
          transform={(data) => {
            const timesObjects = data.times_objects || [];
            if (!timesObjects.length) {
              throw new Error(t('validation.atLeastOneTime', 'At least one time is required'));
            }
            return {
              ...data,
              times: timesObjects.map(t => t.time),
              times_objects: undefined,
            };
          }}
        >
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
          
          <SelectArrayInput source="recurrence_days" label={t('resources.scheduledclasspatterns.fields.recurrence_days', 'Recurrence Days')} choices={[
            { id: 'MONDAY', name: 'Monday' },
            { id: 'TUESDAY', name: 'Tuesday' },
            { id: 'WEDNESDAY', name: 'Wednesday' },
            { id: 'THURSDAY', name: 'Thursday' },
            { id: 'FRIDAY', name: 'Friday' },
            { id: 'SATURDAY', name: 'Saturday' },
            { id: 'SUNDAY', name: 'Sunday' },
          ]} validate={[required()]} inputProps={{ 'data-testid': 'recurrence_days' }} />

          <ArrayInput source="times_objects" label={t('resources.scheduledclasspatterns.fields.times', 'Times')} validate={[required()]}>
            <SimpleFormIterator>
              <TextInput source="time" label={t('resources.scheduledclasspatterns.fields.time', 'Time')} validate={[required(), validateTimeFormat(t)]} />
            </SimpleFormIterator>
          </ArrayInput>

          <DateInput 
            source="start_date" 
            label={t('resources.scheduledclasspatterns.fields.start_date', 'Pattern Start Date')} 
            validate={[required()]}
            inputProps={{ 'data-testid': 'start_date' }}
          />
          <NumberInput source="num_lessons" label={t('resources.scheduledclasspatterns.fields.num_lessons', 'Number of Lessons')} validate={[required()]} inputProps={{ 'data-testid': 'num_lessons' }} />
          <NumberInput source="default_duration_minutes" label={t('resources.scheduledclasspatterns.fields.default_duration_minutes', 'Default Duration (min)')} defaultValue={60} inputProps={{ 'data-testid': 'default_duration_minutes' }} />
          <NumberInput source="default_max_students" label={t('resources.scheduledclasspatterns.fields.default_max_students', 'Default Max Students')} inputProps={{ 'data-testid': 'default_max_students' }} />
          {/* Removed: status - patterns don't have status, only generated classes do */}
          <ReferenceArrayInput source="student_ids" reference="students" perPage={100}>
            <SelectArrayInput label={t('resources.scheduledclasspatterns.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} inputProps={{ 'data-testid': 'student_ids' }} />
          </ReferenceArrayInput>
        </SimpleForm>
      </Edit>
    </>
  );
}