import * as React from 'react';
import { Create, SimpleForm, TextInput, DateInput, required, RadioButtonGroupInput, useTranslate } from 'react-admin';
import PhoneInput from '../../shared/components/PhoneInput';
import { validateEmail, validatePhoneClient } from '../../shared/validation/validators';

export default function InstructorCreate(props) {
  const translate = useTranslate();
  return (
    <Create {...props} title={translate('ra.page.create', { defaultValue: 'Create' })}>
  <SimpleForm>
        <TextInput source="first_name" validate={[required()]} />
        <TextInput source="last_name" validate={[required()]} />
        <TextInput source="email" validate={[validateEmail]} />
        <PhoneInput source="phone_number" validate={[validatePhoneClient]} />
        <DateInput source="hire_date" validate={[required()]} />
        <TextInput source="license_categories" helperText={translate('helpers.license_categories', { defaultValue: 'Comma separated e.g. B,BE,C' })} />
        <RadioButtonGroupInput
          source="car_category"
          label={translate('resources.instructors.fields.car_category', { defaultValue: 'Car Category' })}
          choices={[
            { id: 'manual', name: translate('car.manual', { defaultValue: 'Manual' }) },
            { id: 'automatic', name: translate('car.automatic', { defaultValue: 'Automatic' }) },
            { id: 'both', name: translate('car.both', { defaultValue: 'Both' }) },
          ]}
          optionText="name"
          optionValue="id"
        />
      </SimpleForm>
    </Create>
  );
}
