import * as React from 'react';
import { Edit, SimpleForm, DateInput, TextInput, required, useTranslate } from 'react-admin';
import NameInput from '../../shared/components/NameInput';
import PhoneInput from '../../shared/components/PhoneInput';
import EmailInput from '../../shared/components/EmailInput';
import { validatePhoneClient, validateLicenseCategoriesClient, parseLicenseCategories } from '../../shared/validation/validators';
import LicenseCategoriesInput from '../../shared/components/LicenseCategoriesInput.jsx';

export default function InstructorEdit(props) {
  const translate = useTranslate();
  return (
    <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
      <SimpleForm>
        <NameInput source="first_name" validate={[required()]} />
        <NameInput source="last_name" validate={[required()]} />
  <EmailInput source="email" label={translate('resources.instructors.fields.email')} validate={[required()]} />
        <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
        <DateInput source="hire_date" validate={[required()]} />
        <LicenseCategoriesInput
          source="license_categories"
          label={translate('resources.instructors.fields.license_categories', { defaultValue: 'License categories' })}
          helperText={translate('helpers.license_categories', { defaultValue: 'Comma separated e.g. B,BE,C' })}
        />
      </SimpleForm>
    </Edit>
  );
}
