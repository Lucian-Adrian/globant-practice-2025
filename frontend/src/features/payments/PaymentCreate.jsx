import * as React from 'react';
import { Create, SimpleForm, NumberInput, SelectInput, ReferenceInput, TextInput, required, useTranslate, AutocompleteInput } from 'react-admin';

// Build translated payment status choices
const buildStatusChoices = (t) => ([
  { id: 'PENDING', name: t('filters.pending', 'Pending') },
  { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
  { id: 'REFUNDED', name: t('filters.refunded', 'Refunded') },
  { id: 'FAILED', name: t('filters.failed', 'Failed') },
]);

// Same validation functions as in PaymentEdit
const validatePaymentAmount = (value, allValues) => {
  if (!value || value <= 0) {
    return 'Suma trebuie să fie mai mare decât 0';
  }
  
  if (allValues?.status === 'COMPLETED' && value === 0) {
    return 'Nu poți marca ca achitat o plată de 0 MDL';
  }
  
  if (value > 10000) {
    return 'Sumele mari (>10,000 MDL) necesită verificare suplimentară';
  }
  
  return undefined;
};

const validatePaymentStatus = (value, allValues) => {
  if (!value) {
    return 'Statusul este obligatoriu';
  }
  
  const amount = parseFloat(allValues?.amount || 0);
  
  switch (value) {
    case 'COMPLETED':
      if (amount <= 0) {
        return 'Nu poți marca ca achitat o plată de 0 MDL';
      }
      if (amount > 10000 && allValues?.payment_method !== 'TRANSFER') {
        return 'Sumele mari necesită transfer bancar pentru a fi marcate ca achitate';
      }
      break;
      
    case 'REFUNDED':
      if (amount <= 0) {
        return 'Nu poți rambursa o plată de 0 MDL';
      }
      break;
  }
  
  return undefined;
};

const validatePaymentMethod = (value, allValues) => {
  if (!value) {
    return 'Metoda de plată este obligatorie';
  }
  
  const amount = parseFloat(allValues?.amount || 0);
  const status = allValues?.status;
  
  if (amount > 5000 && value === 'CASH' && status === 'COMPLETED') {
    return 'Plăți mari în numerar (>5,000 MDL) necesită verificare suplimentară';
  }
  
  return undefined;
};

export default function makePaymentCreate(paymentChoices) {
  return function PaymentCreate(props) {
    const t = useTranslate();
  const STATUS_CHOICES = React.useMemo(() => buildStatusChoices(t), [t]);
  return (
      <Create {...props}>
        <SimpleForm mode="onChange" reValidateMode="onChange">
          <ReferenceInput source="enrollment_id" reference="enrollments" perPage={50}>
            <AutocompleteInput 
              label={t('resources.payments.fields.enrollment', 'Enrollment')}
              optionText={(r) => r.label || `#${r.id}`} 
              validate={[required()]} 
            />

{/*
export default function makePaymentCreate(paymentChoices) {
  return function PaymentCreate(props) {
    const translate = useTranslate();
    return (
      <Create {...props} title={translate('ra.page.create', { defaultValue: 'Create' })}>
        <SimpleForm>
          <ReferenceInput label={translate('resources.payments.fields.enrollment', { defaultValue: 'Enrollment' })} source="enrollment_id" reference="enrollments" perPage={50}>
            <SelectInput optionText={(r) => r.label || `#${r.id}`} />
*/}
          </ReferenceInput>
          
          <NumberInput 
            source="amount"
            label={t('resources.payments.fields.amount', 'Amount')}
            validate={[required(), validatePaymentAmount]}
          />
          
          <SelectInput 
            source="payment_method"
            label={t('resources.payments.fields.payment_method', 'Payment method')}
            choices={paymentChoices} 
            validate={[required(), validatePaymentMethod]}
          />
          
          <SelectInput
            source="status"
            label={t('resources.payments.fields.status', 'Status')}
            choices={buildStatusChoices(t)}
            validate={[required(), validatePaymentStatus]}
            defaultValue="PENDING"
          />
          
          <TextInput 
            source="description"
            label={t('resources.payments.fields.description', 'Description')}
            multiline
            rows={3}
          />
        </SimpleForm>
      </Create>
    );
  };
}
