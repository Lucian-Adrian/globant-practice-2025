import * as React from 'react';
import { Edit, SimpleForm, TextInput, DateInput, SelectInput, useTranslate } from 'react-admin';
import NameInput from '../../shared/components/NameInput';
import PhoneInput from '../../shared/components/PhoneInput';
import { validateDOB, validateEmail, validatePhoneClient } from '../../shared/validation/validators';

export default function makeStudentEdit(studentChoices) {
  return function StudentEdit(props) {
    const translate = useTranslate();
    return (
      <Edit {...props} mutationMode="pessimistic" redirect="list" title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
        <SimpleForm redirect="list">
          <NameInput source="first_name" validate={[v => (!v ? translate('validation.required', { defaultValue: 'This field is required' }) : undefined)]} />
          <NameInput source="last_name" validate={[v => (!v ? translate('validation.required', { defaultValue: 'This field is required' }) : undefined)]} />
          <TextInput source="email" validate={[validateEmail]} />
          <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
          <DateInput source="date_of_birth" validate={[validateDOB]} />
          <SelectInput source="status" choices={studentChoices.filter(c => c.id !== 'PENDING')} emptyText="PENDING (auto)" />
        </SimpleForm>
      </Edit>
    );
  };
}
