import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField } from 'react-admin';

export default function EnrollmentList(props) {
  return (
    <List {...props}>
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <TextField source="label" label="Enrollment" />
        <DateField source="enrollment_date" />
        <TextField source="status" />
      </Datagrid>
    </List>
  );
}
