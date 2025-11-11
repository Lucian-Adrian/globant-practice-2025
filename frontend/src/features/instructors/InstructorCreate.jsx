import * as React from 'react';
import { Create, SimpleForm, DateInput, TextInput, required, RadioButtonGroupInput, useTranslate } from 'react-admin';
import NameInput from '../../shared/components/NameInput';
import PhoneInput from '../../shared/components/PhoneInput';
import EmailInput from '../../shared/components/EmailInput';
import { validatePhoneClient, validateLicenseCategoriesClient, parseLicenseCategories } from '../../shared/validation/validators';

export default function InstructorCreate(props) {
  const t = useTranslate();
  const choices = React.useMemo(() => [
    { id: 'manual', name: t('instructors.gearbox.manual') },
    { id: 'automatic', name: t('instructors.gearbox.automatic') },
    { id: 'both', name: t('instructors.gearbox.both') },
  ], [t]);
  return (
    <Create {...props}>
      <SimpleForm>
  <NameInput source="first_name" label={t('resources.instructors.fields.first_name')} validate={[required()]} />
  <NameInput source="last_name" label={t('resources.instructors.fields.last_name')} validate={[required()]} />
  <EmailInput source="email" label={t('resources.instructors.fields.email')} validate={[required()]} />
        <PhoneInput source="phone_number" label={t('resources.instructors.fields.phone_number')} validate={[validatePhoneClient]} />
        <DateInput source="hire_date" label={t('resources.instructors.fields.hire_date')} validate={[required()]} />
        <TextInput
          source="license_categories"
          label={t('resources.instructors.fields.license_categories') + ' *'}
          helperText={t('resources.instructors.fields.license_categories_hint')}
          parse={parseLicenseCategories}
          validate={[required(), validateLicenseCategoriesClient]}
          inputProps={{ inputMode: 'text', pattern: '[A-Za-z0-9,]*' }}
        />
        <RadioButtonGroupInput
          source="car_category"
          label={t('instructors.gearbox.label', 'Gearbox')}
          validate={[required()]}
          defaultValue="both"
          choices={choices}
          optionText="name"
          optionValue="id"
        />
      </SimpleForm>
    </Create>
  );
}
