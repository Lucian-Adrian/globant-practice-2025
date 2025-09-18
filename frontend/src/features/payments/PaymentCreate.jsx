import * as React from 'react';
import { Create, SimpleForm, NumberInput, SelectInput, ReferenceInput, TextInput, required } from 'react-admin';

export default function makePaymentCreate(paymentChoices) {
  return function PaymentCreate(props) {
    return (
      <Create {...props}>
        <SimpleForm>
          <ReferenceInput label="Enrollment" source="enrollment_id" reference="enrollments" perPage={50}>
            <SelectInput optionText={(r) => r.label || `#${r.id}`} />
          </ReferenceInput>
          <NumberInput source="amount" validate={[required()]} />
          <SelectInput source="payment_method" choices={paymentChoices} validate={[required()]} />
          <TextInput source="description" />
        </SimpleForm>
      </Create>
    );
  };
}
