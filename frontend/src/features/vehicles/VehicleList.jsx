import * as React from 'react';
import { List, Datagrid, NumberField, TextField, BooleanField } from 'react-admin';

export default function VehicleList(props) {
  return (
    <List {...props}>
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <TextField source="make" />
        <TextField source="model" />
        <TextField source="license_plate" />
        {/* Custom render to avoid locale thousands separator for year */}
        <TextField source="year" />
        <TextField source="category" />
        <BooleanField source="is_available" />
      </Datagrid>
    </List>
  );
}
