import * as React from 'react';
import { Create, SimpleForm, ReferenceInput, SelectInput } from 'react-admin';

export default function EnrollmentCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm>
        <ReferenceInput label="Student" source="student_id" reference="students" perPage={50}>
          <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceInput>
        <ReferenceInput label="Course" source="course_id" reference="classes" perPage={50}>
          <SelectInput optionText={(r) => r.name} />
        </ReferenceInput>
        <SelectInput
          source="status"
          choices={[
            { id: 'IN_PROGRESS', name: 'IN_PROGRESS' },
            { id: 'COMPLETED', name: 'COMPLETED' },
            { id: 'CANCELED', name: 'CANCELED' },
          ]}
        />
      </SimpleForm>
    </Create>
  );
}
