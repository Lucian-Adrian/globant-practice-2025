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
      }}
    />
  </Stack>
);

export default function PaymentListAside() {
  const t = useTranslate();
  // Define payment status filters (use translation keys)
  const paymentStatusFilters = [
    { value: { status: 'COMPLETED' }, labelKey: 'filters.completed', color: 'success', statusKey: 'COMPLETED' },
    { value: { status: 'PENDING' }, labelKey: 'filters.pending', color: 'warning', statusKey: 'PENDING' },
    { value: { status: 'REFUNDED' }, labelKey: 'filters.refunded', color: 'info', statusKey: 'REFUNDED' },
    { value: { status: 'FAILED' }, labelKey: 'filters.failed', color: 'error', statusKey: 'FAILED' },
  ];

  return (
    <ListAsideFilters
      statusLabelKey="filters.payment_method"
      statusItems={[
        { value: { payment_method: 'CASH' }, labelKey: 'filters.cash', color: '#60a5fa' },
        { value: { payment_method: 'CARD' }, labelKey: 'filters.card', color: '#6366f1' },
        { value: { payment_method: 'TRANSFER' }, labelKey: 'filters.transfer', color: '#10b981' },
      ]}
    >
      {/* Payment status filter section */}
      <FilterList label={t('filters.status', 'Status')} icon={<PaymentIcon />}>
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
