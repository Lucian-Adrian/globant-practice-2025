import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function PaymentListAside() {
  return (
    <ListAsideFilters
      dateField="payment_date"
      statusLabelKey="filters.payment_method"
      statusItems={[
        { value: { payment_method: 'CASH' }, labelKey: 'filters.cash', color: '#60a5fa' },
        { value: { payment_method: 'CARD' }, labelKey: 'filters.card', color: '#6366f1' },
        { value: { payment_method: 'TRANSFER' }, labelKey: 'filters.transfer', color: '#10b981' },
      ]}
    />
  );
}
