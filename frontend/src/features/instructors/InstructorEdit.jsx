import * as React from 'react';
import { Edit, SimpleForm, TextInput, DateInput, required, useTranslate } from 'react-admin';
import PhoneInput from '../../shared/components/PhoneInput';
import { validateEmail, validatePhoneClient } from '../../shared/validation/validators';

export default function InstructorEdit(props) {
  const translate = useTranslate();
  return (
    <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
      <SimpleForm>
        <TextInput source="first_name" validate={[required()]} />
        <TextInput source="last_name" validate={[required()]} />
        <TextInput source="email" validate={[validateEmail]} />
        <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
        <DateInput source="hire_date" validate={[required()]} />
        <TextInput source="license_categories" helperText={translate('helpers.license_categories', { defaultValue: 'Comma separated e.g. B,BE,C' })} />
      </SimpleForm>
    </Edit>
  );
}
