import * as React from 'react';
import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, required, TopToolbar, ListButton, ShowButton } from 'react-admin';
import { validateTimeFormat } from '../../shared/validation/validators';
import Breadcrumb from '../../shared/components/Breadcrumb.jsx';
import { CheckAvailabilityButton, CourseStudentsInput } from '../../shared/components/forms';

export default function ScheduledClassPatternEdit(props) {
  const t = useTranslate();

  const EditActions = () => (
    <TopToolbar>
      <ListButton />
      <ShowButton />
    </TopToolbar>
  );

  return (
    <>
      <Breadcrumb />
      <Edit {...props} actions={<EditActions />} transform={(data) => {
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
        <SimpleForm 
          defaultValues={(record) => {
            const recurrences = [];
            // Backend uses Cross Product logic (all days x all times)
            // We expand this back to pairs for the UI
            if (record.recurrence_days && record.times) {
                for (const day of record.recurrence_days) {
                    for (const time of record.times) {
                        recurrences.push({ day, time });
                    }
                }
            }
            return {
                ...record,
                recurrences
            };
          }}
        >
          <TextInput source="name" label={t('resources.scheduled-class-patterns.fields.name', 'Name')} validate={[required()]} />
          <ReferenceInput source="course_id" reference="classes" perPage={100} filter={{ type: 'THEORY' }}>
            <SelectInput label={t('resources.scheduled-class-patterns.fields.course', 'Course')} optionText="name" optionValue="id" validate={[required()]} />
          </ReferenceInput>
          <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
            <SelectInput label={t('resources.scheduled-class-patterns.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} />
          </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100} filter={{ max_capacity_gte: 3 }}>
          <SelectInput label={t('resources.scheduled-class-patterns.fields.resource', 'Resource (Classroom)')} optionText={(r) => r.name || `${r.make} ${r.model}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>          <ArrayInput source="recurrences" label={t('resources.scheduled-class-patterns.fields.recurrences', 'Recurrences')} validate={[required()]}>
            <SimpleFormIterator>
              <SelectInput source="day" label={t('resources.scheduled-class-patterns.fields.day', 'Day')} choices={[
                { id: 'MONDAY', name: t('common.days.MONDAY', 'Monday') },
                { id: 'TUESDAY', name: t('common.days.TUESDAY', 'Tuesday') },
                { id: 'WEDNESDAY', name: t('common.days.WEDNESDAY', 'Wednesday') },
                { id: 'THURSDAY', name: t('common.days.THURSDAY', 'Thursday') },
                { id: 'FRIDAY', name: t('common.days.FRIDAY', 'Friday') },
                { id: 'SATURDAY', name: t('common.days.SATURDAY', 'Saturday') },
                { id: 'SUNDAY', name: t('common.days.SUNDAY', 'Sunday') },
              ]} validate={[required()]} />
              <TextInput source="time" label={t('resources.scheduled-class-patterns.fields.time', 'Time')} validate={[required(), validateTimeFormat(t)]} />
            </SimpleFormIterator>
          </ArrayInput>

          <CheckAvailabilityButton />

          <DateInput 
            source="start_date" 
            label={t('resources.scheduled-class-patterns.fields.start_date', 'Pattern Start Date')} 
            validate={[required()]}
          />
          <NumberInput source="num_lessons" label={t('resources.scheduled-class-patterns.fields.num_lessons', 'Number of Lessons')} validate={[required()]} />
          <NumberInput source="default_duration_minutes" label={t('resources.scheduled-class-patterns.fields.default_duration_minutes', 'Default Duration (min)')} defaultValue={60} />
          <NumberInput source="default_max_students" label={t('resources.scheduled-class-patterns.fields.default_max_students', 'Default Max Students')} />
          {/* Removed: status - patterns don't have status, only generated classes do */}
          <CourseStudentsInput />
        </SimpleForm>
      </Edit>
    </>
  );
}