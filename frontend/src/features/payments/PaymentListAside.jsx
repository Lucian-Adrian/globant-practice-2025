import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { Chip, Stack, Typography } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';

// Component to render status badge in filter
const StatusFilterLabel = ({ text, color, statusKey }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
    <Chip 
      label={text}
      color={color}
      size="small"
      variant="filled"
      sx={{ 
        minWidth: '80px',
        fontSize: '11px',
        height: '24px',
        ...(color === 'success' && { backgroundColor: '#4caf50', color: 'white' }),
        ...(color === 'warning' && { backgroundColor: '#ff9800', color: 'white' }),
        ...(color === 'error' && { backgroundColor: '#f44336', color: 'white' }),
        ...(color === 'info' && { backgroundColor: '#2196f3', color: 'white' }),
        ...(color === 'default' && { backgroundColor: '#9e9e9e', color: 'white' })
      }}
    />
  </Stack>
);

export default function PaymentListAside() {
  const t = useTranslate();
  // Define payment status filters (use translation keys)
  const paymentStatusFilters = [
    { value: { status_filter: 'COMPLETED' }, labelKey: 'filters.completed', color: 'success', statusKey: 'COMPLETED' },
    { value: { status_filter: 'PENDING' }, labelKey: 'filters.pending', color: 'warning', statusKey: 'PENDING' },
    { value: { status_filter: 'PROCESSING' }, labelKey: 'filters.processing', color: 'warning', statusKey: 'PROCESSING' },
    { value: { status_filter: 'VERIFICATION' }, labelKey: 'filters.verification', color: 'warning', statusKey: 'VERIFICATION' },
    { value: { status_filter: 'SCHEDULED' }, labelKey: 'filters.scheduled', color: 'info', statusKey: 'SCHEDULED' },
    { value: { status_filter: 'FAILED' }, labelKey: 'filters.failed', color: 'error', statusKey: 'FAILED' },
  ];

  return (
    <ListAsideFilters
      dateField="payment_date"
      statusLabelKey="filters.payment_method"
      statusItems={[
        { value: { payment_method: 'CASH' }, labelKey: 'filters.cash', color: '#60a5fa' },
        { value: { payment_method: 'CARD' }, labelKey: 'filters.card', color: '#6366f1' },
        { value: { payment_method: 'TRANSFER' }, labelKey: 'filters.transfer', color: '#10b981' },
      ]}
    >
      {/* Add custom payment status filter section */}
      <FilterList label={t('filters.payment_method', 'Payment method')} icon={<PaymentIcon />}>
        {paymentStatusFilters.map((filter) => (
          <FilterListItem 
            key={filter.statusKey}
            label={
              <StatusFilterLabel 
                text={t(filter.labelKey, filter.labelKey)} 
                color={filter.color}
                statusKey={filter.statusKey}
              />
            }
            value={filter.value}
          />
        ))}
      </FilterList>
    </ListAsideFilters>
  );
}
