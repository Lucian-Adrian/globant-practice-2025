import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField } from 'react-admin';
import PaymentListAside from './PaymentListAside.jsx';

export default function PaymentList(props) {
  return (
    <List {...props} aside={<PaymentListAside />}> 
      <Datagrid rowClick="edit">
        <NumberField source="id" />
        <TextField source="enrollment.label" label="Enrollment" />
        <NumberField source="amount" />
        <DateField source="payment_date" />
        <TextField source="payment_method" />
        <TextField source="description" />
      </Datagrid>
    </List>
  );
}
