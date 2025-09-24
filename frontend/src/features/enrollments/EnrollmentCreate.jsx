import * as React from 'react';
import { Create, SimpleForm, ReferenceInput, SelectInput, useTranslate } from 'react-admin';

export default function EnrollmentCreate(props) {
  const t = useTranslate();
{/*
  const translate = useTranslate();
*/}  

  return (
    <Create {...props} title={translate('ra.page.create', { defaultValue: 'Create' })}>
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
{/*       
        <ReferenceInput label={translate('resources.enrollments.fields.student', { defaultValue: 'Student' })} source="student_id" reference="students" perPage={50}>
          <SelectInput optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceInput>
        <ReferenceInput label={translate('resources.enrollments.fields.course', { defaultValue: 'Course' })} source="course_id" reference="classes" perPage={50}>
          <SelectInput optionText={(r) => r.name} />  
*/}
        <SelectInput
          source="status"
          label={t('filters.status', 'Status')}
          choices={[
            { id: 'IN_PROGRESS', name: t('filters.in_progress', 'In progress') },
            { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
            { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
{/* 
            { id: 'IN_PROGRESS', name: translate('filters.in_progress', { defaultValue: 'IN_PROGRESS' }) },
            { id: 'COMPLETED', name: translate('filters.completed', { defaultValue: 'COMPLETED' }) },
            { id: 'CANCELED', name: translate('filters.canceled', { defaultValue: 'CANCELED' }) },
*/}
          ]}
        />
      </SimpleForm>
    </Create>
  );
}
