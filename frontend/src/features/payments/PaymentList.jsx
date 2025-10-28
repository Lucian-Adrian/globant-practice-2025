import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField, FunctionField, useListContext, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { Chip } from '@mui/material';
import PaymentListAside from './PaymentListAside.jsx';
import PaymentListEmpty from './PaymentListEmpty.jsx';
import ListImportActions from '../../shared/components/ListImportActions';

// Function to determine payment status based on stored status field
const getPaymentStatus = (record) => {
  if (!record) {
    return { status: 'UNKNOWN', color: 'default' };
  }

  const status = record.status || 'PENDING';

  // Map status to display color
  const statusColorMap = {
    'PENDING': { status: 'PENDING', color: 'warning' },
    'COMPLETED': { status: 'COMPLETED', color: 'success' },
    'REFUNDED': { status: 'REFUNDED', color: 'info' },
    'FAILED': { status: 'FAILED', color: 'error' },
  };

  return statusColorMap[status] || { status: 'UNKNOWN', color: 'default' };
};

// Component for rendering payment status badge (translated)
const PaymentStatusField = (recordOrProps) => {
  const translate = useTranslate();
  const record = recordOrProps?.record ?? recordOrProps;
  const { status, color } = React.useMemo(() => getPaymentStatus(record), [record?.status]);

  const statusKeyMap = {
    COMPLETED: 'filters.completed',
    PENDING: 'filters.pending',
    REFUNDED: 'filters.refunded',
    FAILED: 'filters.failed',
    UNKNOWN: 'filters.unknown'
  };

  const label = translate(statusKeyMap[status] || status, { _: String(status) });
  const title = translate(`${statusKeyMap[status] || 'filters.unknown'}_desc`, { _: '' });

  return (
    <Chip 
      label={label}
      color={color}
      size="small"
      variant="filled"
      title={title || ''}
      sx={{
        fontWeight: 'bold',
        minWidth: '100px',
        ...(color === 'success' && { backgroundColor: '#4caf50', color: 'white' }),
        ...(color === 'warning' && { backgroundColor: '#ff9800', color: 'white' }),
        ...(color === 'error' && { backgroundColor: '#f44336', color: 'white' }),
        ...(color === 'info' && { backgroundColor: '#2196f3', color: 'white' }),
        ...(color === 'default' && { backgroundColor: '#9e9e9e', color: 'white' })
      }}
    />
  );
};

export default function PaymentList(props) {
  return (
    <List {...props} aside={<PaymentListAside />} actions={<ListImportActions endpoint="payments" />} empty={<PaymentListEmpty />}>
      <FilteredPaymentDatagrid />
    </List>
  );
}

function FilteredPaymentDatagrid(props) {
  const location = useLocation();
  const { data } = useListContext();
  const t = useTranslate();
  const params = new URLSearchParams(location.search);
  const gte = params.get('payment_date_gte');
  const lte = params.get('payment_date_lte');

  const filtered = React.useMemo(() => (data || []).filter((record) => {
    if (!record) return false;
    const d = record.payment_date ? new Date(record.payment_date) : null;
    if (!d) return true;
    if (gte && d < new Date(gte)) return false;
    if (lte && d > new Date(lte)) return false;
    return true;
  }), [data, gte, lte]);

  const alpha = 0.1;
  const rowStyle = React.useCallback((record) => {
    const { color } = getPaymentStatus(record);
    switch (color) {
      case 'success':
        return { backgroundColor: `rgba(76, 175, 80, ${alpha})` };
      case 'warning':
        return { backgroundColor: `rgba(255, 152, 0, ${alpha})` };
      case 'error':
        return { backgroundColor: `rgba(244, 67, 54, ${alpha})` };
      case 'info':
        return { backgroundColor: `rgba(33, 150, 243, ${alpha})` };
      default:
        return {};
    }
  }, [alpha]);

  return (
    <Datagrid
      {...props}
      data={filtered}
      rowClick="edit"
      rowStyle={rowStyle}
    >
      <NumberField source="id" />
  <TextField source="enrollment.label" label={t('resources.payments.fields.enrollment', 'Enrollment')} />
      <NumberField source="amount" />
      <DateField source="payment_date" />
      <FunctionField 
        label={t('resources.payments.fields.payment_method', 'Payment method')}
        render={(record) => {
          const method = record?.payment_method || '';
          const methodKey = method ? `filters.${method.toLowerCase()}` : 'filters.payment_method';
          const label = t(methodKey, method);
          const colorMap = { CASH: '#60a5fa', CARD: '#0b5ed7', TRANSFER: '#10b981' };
          const color = colorMap[method] || '#9e9e9e';
          return (
            <span style={{ color, fontWeight: 600 }}>{label}</span>
          );
        }}
      />
      <FunctionField 
        label={t('filters.status', 'Status')}
        render={(record) => <PaymentStatusField record={record} />}
      />
      <TextField source="description" />
    </Datagrid>
  );
}
