import * as React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput, BooleanInput, required, useTranslate } from 'react-admin';
import LicensePlateInput from './LicensePlateInput';

export default function makeResourceEdit(resourceChoices) {
  return function ResourceEdit(props) {
    const translate = useTranslate();
    return (
      <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
        <SimpleForm>
          <TextInput source="name" validate={[required()]} />
          <NumberInput source="max_capacity" validate={[required()]} min={1} />
          <SelectInput source="category" choices={resourceChoices} validate={[required()]} />
          <BooleanInput source="is_available" />
          {/* Vehicle-specific fields (optional for classrooms) */}
          <TextInput source="make" />
          <TextInput source="model" />
          <LicensePlateInput source="license_plate" validate={(v) => (!v || /^[A-Z0-9]+$/.test(v) ? undefined : 'Only letters & digits')} />
          <NumberInput source="year" min={1900} max={2030} />
        </SimpleForm>
      </Edit>
    );
  };
}