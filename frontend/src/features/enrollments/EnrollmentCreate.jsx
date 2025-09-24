import * as React from 'react';
import { Create, SimpleForm, ReferenceInput, SelectInput, useTranslate } from 'react-admin';

export default function EnrollmentCreate(props) {
  const t = useTranslate();
  return (
    <Create {...props}>
      <SimpleForm>
        <ReferenceInput source="student_id" reference="students" perPage={50}>
          <SelectInput 
            label={t('resources.enrollments.fields.student', 'Student')}
            optionText={(r) => `${r.first_name} ${r.last_name}`} 
          />
        </ReferenceInput>
        <ReferenceInput source="course_id" reference="classes" perPage={50}>
          <SelectInput 
            label={t('resources.enrollments.fields.course', 'Course')}
            optionText={(r) => r.name} 
          />
        </ReferenceInput>
        <SelectInput
          source="status"
          label={t('filters.status', 'Status')}
          choices={[
            { id: 'IN_PROGRESS', name: t('filters.in_progress', 'In progress') },
            { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
            { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
          ]}
        />
      </SimpleForm>
    </Create>
  );
}
