import * as React from 'react';
import { Edit, SimpleForm, DateInput, TextInput, required, useTranslate } from 'react-admin';
import NameInput from '../../shared/components/NameInput';
import PhoneInput from '../../shared/components/PhoneInput';
import EmailInput from '../../shared/components/EmailInput';
import { validatePhoneClient } from '../../shared/validation/validators';

export default function InstructorEdit(props) {
  const translate = useTranslate();
  return (
    <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
      <SimpleForm>
        <NameInput source="first_name" validate={[required()]} />
        <NameInput source="last_name" validate={[required()]} />
        <EmailInput source="email" />
        <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
        <DateInput source="hire_date" validate={[required()]} />
        <TextInput source="license_categories" helperText={translate('helpers.license_categories', { defaultValue: 'Comma separated e.g. B,BE,C' })} />
      </SimpleForm>
    </Edit>
  );
}
