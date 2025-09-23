import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput } from 'react-admin';
import NameInput from '../../shared/components/NameInput';
import PhoneInput from '../../shared/components/PhoneInput';
import { validateDOB, validateEmail, validatePhoneClient } from '../../shared/validation/validators';

export default function makeStudentCreate() {
  return function StudentCreate(props) {
    const validatePassword = (value) => {
      if (!value) return 'Password is required';
      if (String(value).length < 6) return 'Password must be at least 6 characters';
      return undefined;
    };
    const validateConfirmPassword = (value, allValues) => {
      if (!value) return 'Please confirm the password';
      if (value !== allValues.password) return 'Passwords do not match';
      return undefined;
    };
    const transformCreate = (data) => {
      const out = { ...data };
      // Remove confirm_password, backend expects only `password`
      delete out.confirm_password;
      return out;
    };
    return (
      <Create {...props} redirect="list" transform={transformCreate}>
        <SimpleForm redirect="list">
          <NameInput source="first_name" validate={[v => (!v ? 'First name is required' : undefined)]} />
          <NameInput source="last_name" validate={[v => (!v ? 'Last name is required' : undefined)]} />
          <TextInput source="email" validate={[validateEmail]} />
          <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
          <DateInput source="date_of_birth" validate={[validateDOB]} />
          <TextInput source="password" type="password" validate={[validatePassword]} />
          <TextInput source="confirm_password" label="Confirm password" type="password" validate={[validateConfirmPassword]} />
          {/* New students auto set to PENDING – hide field on create */}
        </SimpleForm>
      </Create>
    );
  };
}
