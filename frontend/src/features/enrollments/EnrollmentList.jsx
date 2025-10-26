import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField, FunctionField, useListContext, useTranslate } from 'react-admin';
import CategoryFilterInput from '../../shared/components/CategoryFilterInput.jsx';
import TypeFilterInput from '../../shared/components/TypeFilterInput.jsx';
import { useLocation } from 'react-router-dom';
import { Chip } from '@mui/material';
import EnrollmentListAside from './EnrollmentListAside.jsx';
import EnrollmentListEmpty from './EnrollmentListEmpty.jsx';
import ListImportActions from '../../shared/components/ListImportActions';

// Function to get enrollment status with color coding
const getEnrollmentStatus = (record) => {
  if (!record || !record.status) {
    return { status: 'UNKNOWN', color: 'default' };
  }
  
  switch (record.status) {
    case 'IN_PROGRESS':
      return { status: 'IN_PROGRESS', color: 'info' };
    case 'COMPLETED':
      return { status: 'COMPLETED', color: 'success' };
    case 'CANCELED':
      return { status: 'CANCELED', color: 'error' };
    default:
      return { status: 'UNKNOWN', color: 'default' };
  }
};

// Status field component with colored chips
const EnrollmentStatusField = (recordOrProps) => {
  const t = useTranslate();
  const record = recordOrProps?.record ?? recordOrProps;
  const { status, color } = getEnrollmentStatus(record);
  const keyMap = {
    IN_PROGRESS: 'filters.in_progress',
    COMPLETED: 'filters.completed',
    CANCELED: 'filters.canceled',
    UNKNOWN: 'filters.unknown'
  };
  const label = t(keyMap[status] || 'filters.unknown', status);
  
  return (
    <Chip
      label={label}
      size="small"
      style={{
        fontWeight: 'bold',
        minWidth: '100px',
        ...(color === 'success' && {
          backgroundColor: '#4caf50',
          color: 'white'
        }),
        ...(color === 'info' && {
          backgroundColor: '#2196f3',
          color: 'white'
        }),
        ...(color === 'error' && {
          backgroundColor: '#f44336',
          color: 'white'
        }),
        ...(color === 'default' && {
          backgroundColor: '#9e9e9e',
          color: 'white'
        })
      }}
    />
  );
};

export default function EnrollmentList(props) {
  const filters = [
    <CategoryFilterInput key="category" source="course__category" alwaysOn />,
    <TypeFilterInput key="type" source="type" alwaysOn />,
  ];
  return (
    <List {...props} filters={filters} aside={<EnrollmentListAside />} actions={<ListImportActions endpoint="enrollments" />} empty={<EnrollmentListEmpty />}>
      <FilteredEnrollmentDatagrid />
    </List>
  );
}

function FilteredEnrollmentDatagrid(props) {
  const location = useLocation();
  const { data } = useListContext();
  const params = new URLSearchParams(location.search);
  const gte = params.get('enrollment_date_gte');
  const lte = params.get('enrollment_date_lte');

  const filtered = (data || []).filter((record) => {
    if (!record) return false;
    const d = record.enrollment_date ? new Date(record.enrollment_date) : null;
    if (!d) return true;
    if (gte && d < new Date(gte)) return false;
    if (lte && d > new Date(lte)) return false;
    return true;
  });

  const alpha = 0.15;
  const t = useTranslate();
  return (
    <Datagrid 
      {...props}
      data={filtered}
      rowClick="edit"
      rowStyle={(record) => {
        const { color } = getEnrollmentStatus(record);
        switch (color) {
          case 'success':
            return { 
              backgroundColor: `rgba(76, 175, 80, ${alpha})`,
              borderLeft: '4px solid #4caf50'
            };
          case 'info':
            return { 
              backgroundColor: `rgba(33, 150, 243, ${alpha})`,
              borderLeft: '4px solid #2196f3'
            };
          case 'error':
            return { 
              backgroundColor: `rgba(244, 67, 54, ${alpha})`,
              borderLeft: '4px solid #f44336'
            };
          default:
            return {};
        }
      }}
    >
      <NumberField source="id" />
  <TextField source="label" label={t('resources.enrollments.name', 'Enrollment')} />
      <DateField source="enrollment_date" />
      <FunctionField 
        label={t('filters.status', 'Status')} 
        render={(record) => <EnrollmentStatusField record={record} />}
      />
    </Datagrid>
  );
}
