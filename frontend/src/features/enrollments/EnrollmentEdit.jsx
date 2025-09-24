import * as React from 'react';
import { Edit, SimpleForm, ReferenceInput, SelectInput, useTranslate } from 'react-admin';

export default function EnrollmentEdit(props) {
  const translate = useTranslate();
  return (
    <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
      <SimpleForm>
        <ReferenceInput label={translate('resources.enrollments.fields.student', { defaultValue: 'Student' })} source="student_id" reference="students" perPage={50}>
          <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceInput>
        <ReferenceInput label={translate('resources.enrollments.fields.course', { defaultValue: 'Course' })} source="course_id" reference="classes" perPage={50}>
          <SelectInput optionText={(r) => r.name} />
        </ReferenceInput>
        <SelectInput
          source="status"
          choices={[
            { id: 'IN_PROGRESS', name: translate('filters.in_progress', { defaultValue: 'IN_PROGRESS' }) },
            { id: 'COMPLETED', name: translate('filters.completed', { defaultValue: 'COMPLETED' }) },
            { id: 'CANCELED', name: translate('filters.canceled', { defaultValue: 'CANCELED' }) },
          ]}
        />
      </SimpleForm>
    </Edit>
  );
}
