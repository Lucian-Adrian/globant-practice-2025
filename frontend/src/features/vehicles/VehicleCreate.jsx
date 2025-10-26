import * as React from 'react';
import { Create, SimpleForm, TextInput, NumberInput, SelectInput, BooleanInput, required, useTranslate } from 'react-admin';
import LicensePlateInput from './LicensePlateInput';

export default function makeVehicleCreate(vehicleChoices) {
  return function VehicleCreate(props) {
    const translate = useTranslate();
    return (
      <Create {...props} title={translate('ra.page.create', { defaultValue: 'Create' })}>
        <SimpleForm>
          <TextInput source="make" validate={[required()]} />
          <TextInput source="model" validate={[required()]} />
          <LicensePlateInput source="license_plate" validate={[required(), (v) => (!/^[A-Z0-9]+$/.test(v || '') ? 'Only letters & digits' : undefined)]} />
          <NumberInput source="year" validate={[required()]} />
          <SelectInput source="category" choices={vehicleChoices} translateChoice={false} validate={[required()]} />
          <BooleanInput source="is_available" />
        </SimpleForm>
      </Create>
    );
  };
}
