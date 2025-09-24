import * as React from 'react';
import { Edit, SimpleForm, TextInput, NumberInput, SelectInput, BooleanInput, required, useTranslate } from 'react-admin';
import LicensePlateInput from './LicensePlateInput';

export default function makeVehicleEdit(vehicleChoices) {
  return function VehicleEdit(props) {
    const translate = useTranslate();
    return (
      <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
        <SimpleForm>
          <TextInput source="make" validate={[required()]} />
          <TextInput source="model" validate={[required()]} />
          <LicensePlateInput source="license_plate" validate={[required(), (v) => (!/^[A-Z0-9]+$/.test(v || '') ? 'Only letters & digits' : undefined)]} />
          <NumberInput source="year" validate={[required()]} />
          <SelectInput source="category" choices={vehicleChoices} validate={[required()]} />
          <BooleanInput source="is_available" />
        </SimpleForm>
      </Edit>
    );
  };
}
