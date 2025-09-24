import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField, FunctionField, useListContext, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { Chip } from '@mui/material';
import PaymentListAside from './PaymentListAside.jsx';
import ListImportActions from '../../shared/components/ListImportActions';

// Function to determine payment status based on existing data
const getPaymentStatus = (record) => {
  console.log('getPaymentStatus called with record:', record); // Debug log
  
  if (!record) {
    console.log('No record provided, returning UNKNOWN');
    return { status: 'UNKNOWN', color: 'default' };
  }
  
  const paymentDate = new Date(record.payment_date);
  const now = new Date();
  const daysSincePayment = Math.floor((now - paymentDate) / (1000 * 60 * 60 * 24));
  const amount = parseFloat(record.amount);
  const method = record.payment_method;
  
  console.log('Payment analysis:', {
    paymentDate: paymentDate.toISOString(),
    now: now.toISOString(),
    daysSincePayment,
    amount,
    method
  });
  
  // Business rules for payment status determination
  
  // 1. Future payments (scheduled but not yet due)
  if (daysSincePayment < 0) {
    console.log('Future payment detected, returning SCHEDULED');
    return { status: 'SCHEDULED', color: 'info' };
  }
  
  // 2. Very recent payments (less than 24 hours) - still processing
  if (daysSincePayment < 1) {
    if (method === 'CASH') {
      console.log('Recent CASH payment, returning COMPLETED');
      return { status: 'COMPLETED', color: 'success' };
    } else if (method === 'CARD') {
      console.log('Recent CARD payment, returning PROCESSING');
      return { status: 'PROCESSING', color: 'warning' };
    } else if (method === 'TRANSFER') {
      console.log('Recent TRANSFER payment, returning PENDING');
      return { status: 'PENDING', color: 'warning' };
    }
  }
  
  // 3. Payments 1-3 days old
  if (daysSincePayment >= 1 && daysSincePayment <= 3) {
    if (method === 'TRANSFER' && amount > 500) {
      console.log('Large recent TRANSFER, returning PENDING');
      return { status: 'PENDING', color: 'warning' };
    } else if (method === 'CARD' && amount > 2000) {
      console.log('Large recent CARD, returning VERIFICATION');
      return { status: 'VERIFICATION', color: 'warning' };
    } else {
      console.log('Recent payment completed, returning COMPLETED');
      return { status: 'COMPLETED', color: 'success' };
    }
  }
  
  // 4. High-value payments (over 1000 MDL) - special handling
  if (amount >= 1000) {
    if (daysSincePayment > 7) {
      console.log('Old high-value payment, returning COMPLETED');
      return { status: 'COMPLETED', color: 'success' };
    } else if (method === 'TRANSFER') {
      console.log('High-value TRANSFER, returning VERIFICATION');
      return { status: 'VERIFICATION', color: 'warning' };
    } else {
      console.log('High-value payment, returning COMPLETED');
      return { status: 'COMPLETED', color: 'success' };
    }
  }
  
  // 5. Small payments (under 100 MDL) - usually quick processing
  if (amount < 100) {
    if (daysSincePayment > 1) {
      console.log('Small old payment, returning COMPLETED');
      return { status: 'COMPLETED', color: 'success' };
    } else {
      console.log('Small recent payment, returning PROCESSING');
      return { status: 'PROCESSING', color: 'warning' };
    }
  }
  
  // 6. Weekend/holiday considerations (simulate business rules)
  const dayOfWeek = paymentDate.getDay();
  if ((dayOfWeek === 0 || dayOfWeek === 6) && method === 'TRANSFER') {
    // Weekend bank transfers might be delayed
    if (daysSincePayment <= 2) {
      console.log('Weekend TRANSFER delay, returning PENDING');
      return { status: 'PENDING', color: 'warning' };
    }
  }
  
  // 7. Default rules based on time elapsed
  if (daysSincePayment <= 7) {
    // Recent payments - check method
    switch (method) {
      case 'CASH':
        console.log('Recent CASH, returning COMPLETED');
        return { status: 'COMPLETED', color: 'success' };
      case 'CARD':
        const cardStatus = daysSincePayment > 2 ? 'COMPLETED' : 'PROCESSING';
        console.log(`Recent CARD, returning ${cardStatus}`);
        return daysSincePayment > 2 ? 
          { status: 'COMPLETED', color: 'success' } : 
          { status: 'PROCESSING', color: 'warning' };
      case 'TRANSFER':
        const transferStatus = daysSincePayment > 3 ? 'COMPLETED' : 'PENDING';
        console.log(`Recent TRANSFER, returning ${transferStatus}`);
        return daysSincePayment > 3 ? 
          { status: 'COMPLETED', color: 'success' } : 
          { status: 'PENDING', color: 'warning' };
      default:
        console.log('Unknown payment method, returning PENDING');
        return { status: 'PENDING', color: 'warning' };
    }
  }
  
  // 8. Very old payments (over 7 days) - almost certainly completed
  if (daysSincePayment > 7) {
    // Simulate some rare cases where old payments might have issues
    if (amount > 5000 && Math.random() < 0.05) {
      console.log('High-value old payment with issues, returning FAILED');
      return { status: 'FAILED', color: 'error' };
    }
    console.log('Old payment, returning COMPLETED');
    return { status: 'COMPLETED', color: 'success' };
  }
  
  // 9. Fallback for edge cases - should handle the specific case from the screenshot
  console.log('Fallback case reached, checking data validity...');
  
  // Check if we have valid data
  if (isNaN(amount) || amount === null || amount === undefined) {
    console.log('Invalid amount detected, returning UNKNOWN');
    return { status: 'UNKNOWN', color: 'default' };
  }
  
  if (!method || method === '') {
    console.log('Invalid method detected, returning UNKNOWN');
    return { status: 'UNKNOWN', color: 'default' };
  }
  
  if (isNaN(daysSincePayment)) {
    console.log('Invalid date detected, returning UNKNOWN');
    return { status: 'UNKNOWN', color: 'default' };
  }
  
  // If we reached here with valid data, apply a basic status
  console.log('Valid data but edge case, applying basic logic');
  if (method === 'CARD' && daysSincePayment === 0) {
    console.log('Same-day CARD payment, returning PENDING');
    return { status: 'PENDING', color: 'warning' };
  }
  
  console.log('Final fallback, returning PENDING');
  return { status: 'PENDING', color: 'warning' };
};

// Component for rendering payment status badge (translated)
const PaymentStatusField = (recordOrProps) => {
  const translate = useTranslate();
  const record = recordOrProps?.record ?? recordOrProps;
  const { status, color } = getPaymentStatus(record);

  const statusKeyMap = {
    COMPLETED: 'filters.completed',
    PENDING: 'filters.pending',
    PROCESSING: 'filters.processing',
    VERIFICATION: 'filters.verification',
    SCHEDULED: 'filters.scheduled',
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
    <List {...props} aside={<PaymentListAside />} actions={<ListImportActions endpoint="payments" />}>
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

  const filtered = (data || []).filter((record) => {
    if (!record) return false;
    const d = record.payment_date ? new Date(record.payment_date) : null;
    if (!d) return true;
    if (gte && d < new Date(gte)) return false;
    if (lte && d > new Date(lte)) return false;
    return true;
  });

  const alpha = 0.1;
  return (
    <Datagrid
      {...props}
      data={filtered}
      rowClick="edit"
      rowStyle={(record) => {
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
      }}
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
