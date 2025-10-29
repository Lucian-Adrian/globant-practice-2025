import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput, required, RadioButtonGroupInput, useTranslate } from 'react-admin';
import PhoneInput from '../../shared/components/PhoneInput';
import { validateEmail, validatePhoneClient } from '../../shared/validation/validators';

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
        <TextInput source="first_name" label={t('resources.instructors.fields.first_name')} validate={[required()]} />
        <TextInput source="last_name" label={t('resources.instructors.fields.last_name')} validate={[required()]} />
        <TextInput source="email" label={t('resources.instructors.fields.email')} validate={[validateEmail, required()]} />
        <PhoneInput source="phone_number" label={t('resources.instructors.fields.phone_number')} validate={[validatePhoneClient]} />
        <DateInput source="hire_date" label={t('resources.instructors.fields.hire_date')} validate={[required()]} />
        <TextInput
          source="license_categories"
          label={t('resources.instructors.fields.license_categories')}
          helperText={t('resources.instructors.fields.license_categories_hint')}
          validate={[required()]}
        />
        <RadioButtonGroupInput
          source="car_category"
          label={t('resources.vehicles.fields.category')}
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
