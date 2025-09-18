import * as React from 'react';
import { List, Datagrid, NumberField, TextField, EmailField, DateField } from 'react-admin';

export default function InstructorList(props) {
  return (
    <List {...props}>
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <TextField source="first_name" />
        <TextField source="last_name" />
        <EmailField source="email" />
        <TextField source="phone_number" />
        <DateField source="hire_date" />
        <TextField source="license_categories" />
      </Datagrid>
    </List>
  );
}
