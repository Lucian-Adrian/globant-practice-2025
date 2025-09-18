import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput, required } from 'react-admin';
import PhoneInput from '../../shared/components/PhoneInput';
import { validateEmail, validatePhoneClient } from '../../shared/validation/validators';

export default function InstructorCreate(props) {
  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="first_name" validate={[required()]} />
        <TextInput source="last_name" validate={[required()]} />
        <TextInput source="email" validate={[validateEmail]} />
        <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
        <DateInput source="hire_date" validate={[required()]} />
        <TextInput source="license_categories" helperText="Comma separated e.g. B,BE,C" />
      </SimpleForm>
    </Create>
  );
}
