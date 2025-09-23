import * as React from 'react';
import { Create, SimpleForm, ReferenceInput, SelectInput, DateInput, NumberInput, TextInput } from 'react-admin';

export default function LessonCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm>
        <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
          <SelectInput optionText={(r) => r.label || `#${r.id}`} />
        </ReferenceInput>
        <ReferenceInput label="Instructor" source="instructor_id" reference="instructors" perPage={50}>
          <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceInput>
        <ReferenceInput label="Vehicle" source="vehicle_id" reference="vehicles" perPage={50}>
          <SelectInput optionText={(r) => `${r.license_plate}`} />
        </ReferenceInput>
        <DateInput source="scheduled_time" />
        <NumberInput source="duration_minutes" defaultValue={50} />
        <SelectInput
          source="status"
          choices={[
            { id: 'SCHEDULED', name: 'SCHEDULED' },
            { id: 'COMPLETED', name: 'COMPLETED' },
            { id: 'CANCELED', name: 'CANCELED' },
          ]}
        />
        <TextInput source="notes" multiline rows={2} />
      </SimpleForm>
    </Create>
  );
}
