import * as React from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput, DateTimeInput, NumberInput, useTranslate, ReferenceArrayInput, SelectArrayInput, required } from 'react-admin';

export default function ScheduledClassCreate(props) {
  const t = useTranslate();

  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="name" label={t('resources.scheduledclasses.fields.name', 'Name')} validate={[required()]} />
        <ReferenceInput source="course_id" reference="classes" perPage={100} filter={{ type: 'THEORY' }}>
          <SelectInput label={t('resources.scheduledclasses.fields.course', 'Course')} optionText={(r) => r.name} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
          <SelectInput label={t('resources.scheduledclasses.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>
                <ReferenceInput source="resource_id" reference="resources" perPage={100} filter={{ max_capacity_gt: 2 }}>
          <SelectInput label={t('resources.scheduledclasses.fields.resource', 'Resource')} optionText={(r) => r.name || r.license_plate} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <DateTimeInput source="scheduled_time" label={t('resources.scheduledclasses.fields.scheduled_time', 'Scheduled Time')} validate={[required()]} />
        <NumberInput source="duration_minutes" label={t('resources.scheduledclasses.fields.duration_minutes', 'Duration (min)')} defaultValue={60} validate={[required()]} />
        <NumberInput source="max_students" label={t('resources.scheduledclasses.fields.max_students', 'Max Students')} validate={[required()]} />
        <SelectInput source="status" label={t('resources.scheduledclasses.fields.status', 'Status')} choices={statusChoices} defaultValue="SCHEDULED" />
        <ReferenceArrayInput source="student_ids" reference="students" perPage={100}>
          <SelectArrayInput label={t('resources.scheduledclasses.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" />
        </ReferenceArrayInput>
        <ReferenceInput source="pattern_id" reference="scheduled-class-patterns" perPage={100}>
          <SelectInput label={t('resources.scheduledclasses.fields.pattern', 'Pattern (Optional)')} optionText={(r) => r.name} optionValue="id" allowEmpty />
        </ReferenceInput>
      </SimpleForm>
    </Create>
  );
}
