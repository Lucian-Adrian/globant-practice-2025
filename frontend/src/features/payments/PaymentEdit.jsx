import * as React from 'react';
import { Edit, SimpleForm, NumberInput, SelectInput, ReferenceInput, TextInput, required, useTranslate } from 'react-admin';

export default function makePaymentEdit(paymentChoices) {
  return function PaymentEdit(props) {
    const translate = useTranslate();
    return (
      <Edit {...props} title={translate('ra.page.edit', { defaultValue: 'Edit' })}>
        <SimpleForm>
          <ReferenceInput label={translate('resources.payments.fields.enrollment', { defaultValue: 'Enrollment' })} source="enrollment_id" reference="enrollments" perPage={50}>
            <SelectInput optionText={(r) => r.label || `#${r.id}`} />
          </ReferenceInput>
          <NumberInput source="amount" validate={[required()]} />
          <SelectInput source="payment_method" choices={paymentChoices} validate={[required()]} />
          <TextInput source="description" />
        </SimpleForm>
      </Edit>
    );
  };
}
