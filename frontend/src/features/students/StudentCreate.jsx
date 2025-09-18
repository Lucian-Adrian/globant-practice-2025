import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput } from 'react-admin';
import NameInput from '../../shared/components/NameInput';
import PhoneInput from '../../shared/components/PhoneInput';
import { validateDOB, validateEmail, validatePhoneClient } from '../../shared/validation/validators';

export default function makeStudentCreate() {
  return function StudentCreate(props) {
    return (
      <Create {...props} redirect="list">
        <SimpleForm redirect="list">
          <NameInput source="first_name" validate={[v => (!v ? 'First name is required' : undefined)]} />
          <NameInput source="last_name" validate={[v => (!v ? 'Last name is required' : undefined)]} />
          <TextInput source="email" validate={[validateEmail]} />
          <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
          <DateInput source="date_of_birth" validate={[validateDOB]} />
          {/* New students auto set to PENDING – hide field on create */}
        </SimpleForm>
      </Create>
    );
  };
}
