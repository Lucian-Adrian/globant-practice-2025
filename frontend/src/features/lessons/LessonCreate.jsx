import * as React from 'react';
import { Create, SimpleForm, ReferenceInput, SelectInput, DateTimeInput, NumberInput, TextInput, useTranslate } from 'react-admin';

export default function LessonCreate(props) {
  const translate = useTranslate();
  return (
    <Create {...props} title={translate('ra.page.create', { defaultValue: 'Create' })}>
      <SimpleForm>
        <ReferenceInput label={translate('resources.lessons.fields.enrollment', { defaultValue: 'Enrollment' })} source="enrollment_id" reference="enrollments" perPage={50}>
          <SelectInput optionText={(r) => r.label || `#${r.id}`} />
        </ReferenceInput>
        <ReferenceInput label={translate('resources.lessons.fields.instructor', { defaultValue: 'Instructor' })} source="instructor_id" reference="instructors" perPage={50}>
          <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceInput>
        <ReferenceInput label={translate('resources.lessons.fields.vehicle', { defaultValue: 'Vehicle' })} source="vehicle_id" reference="vehicles" perPage={50}>
          <SelectInput optionText={(r) => `${r.license_plate}`} />
        </ReferenceInput>
        <DateTimeInput source="scheduled_time" />
        <NumberInput source="duration_minutes" defaultValue={60} />
        <SelectInput
          source="status"
          choices={[
            { id: 'SCHEDULED', name: translate('filters.scheduled', { defaultValue: 'SCHEDULED' }) },
            { id: 'COMPLETED', name: translate('filters.completed', { defaultValue: 'COMPLETED' }) },
            { id: 'CANCELED', name: translate('filters.canceled', { defaultValue: 'CANCELED' }) },
          ]}
        />
        <TextInput source="notes" multiline rows={2} />
      </SimpleForm>
    </Create>
  );
}
