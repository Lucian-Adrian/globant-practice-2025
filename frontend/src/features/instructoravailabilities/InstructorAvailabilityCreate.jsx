import React from 'react';
import { Create, useTranslate } from 'react-admin';
import InstructorAvailabilityForm from './InstructorAvailabilityForm';

export default function InstructorAvailabilityCreate(props) {
  const translate = useTranslate();
  return (
    <Create {...props} title={translate('ra.page.create', { defaultValue: 'Create' })}>
      <InstructorAvailabilityForm />
    </Create>
  );
}
