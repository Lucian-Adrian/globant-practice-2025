import * as React from 'react';
import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, DateTimeInput, NumberInput, useTranslate, required, ReferenceArrayInput, SelectArrayInput } from 'react-admin';
import { validateScheduledClass } from '../../shared/validation/lessonValidation';

export default function ScheduledClassEdit(props) {
  const t = useTranslate();
  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  return (
    <Edit {...props}>
      <SimpleForm validate={async (values) => validateScheduledClass(values, t, values?.id)}>
        <TextInput source="id" label="ID" disabled />
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
        <DateTimeInput source="scheduled_time" label={t('resources.scheduledclasses.fields.scheduled_time', 'Scheduled time')} validate={[required()]} />
        <NumberInput source="duration_minutes" label={t('resources.scheduledclasses.fields.duration_minutes', 'Duration (min)')} />
        <NumberInput source="max_students" label={t('resources.scheduledclasses.fields.max_students', 'Max students')} />
        <NumberInput source="current_enrollment" label={t('resources.scheduledclasses.fields.current_enrollment', 'Current enrollment')} disabled />
        <NumberInput source="available_spots" label={t('resources.scheduledclasses.fields.available_spots', 'Available spots')} disabled />
        <SelectInput source="status" label={t('filters.status', 'Status')} choices={statusChoices} />
        <ReferenceArrayInput source="student_ids" reference="students" perPage={100}>
          <SelectArrayInput label={t('resources.scheduledclasses.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" />
        </ReferenceArrayInput>
        {/* Placeholder for future enroll/unenroll buttons */}
      </SimpleForm>
    </Edit>
  );
}
