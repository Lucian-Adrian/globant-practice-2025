import * as React from 'react';
import { List, Datagrid, NumberField, TextField, EmailField, DateField, FunctionField, useTranslate } from 'react-admin';
import { Chip } from '@mui/material';
import StudentListAside from './StudentListAside';
import StudentListActions from './StudentListActions';

// Function to get student status with color coding
// Helper to normalize and return canonical hex colors used in the aside
const hexToRgba = (hex, alpha = 1) => {
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned.length === 3 ? cleaned.split('').map(c=>c+c).join('') : cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getStudentStatus = (record) => {
  // Console debug removed for cleanliness
  if (!record || !record.status) {
    return { status: 'UNKNOWN', colorHex: '#9ca3af' };
  }

  // Clean the status value to handle any whitespace or case issues
  const status = String(record.status).trim().toUpperCase();

  // Colors mirror the StudentListAside definitions
  switch (status) {
    case 'ACTIVE':
      return { status: 'ACTIVE', colorHex: '#3b82f6' };
    case 'INACTIVE':
      return { status: 'INACTIVE', colorHex: '#f59e0b' };
    case 'GRADUATED':
      return { status: 'GRADUATED', colorHex: '#10b981' };
    case 'PENDING':
      return { status: 'PENDING', colorHex: '#9333ea' };
    default:
      console.warn('Unknown student status:', record.status, 'Normalized to:', status);
      return { status: status || String(record.status), colorHex: '#9ca3af' };
  }
};

// Status field component with colored chips (translated labels)
const StudentStatusField = (recordOrProps) => {
  // FunctionField may call render with the record directly or with an object like { record }
  const record = recordOrProps?.record ?? recordOrProps;
  const translate = useTranslate();
  const { status, colorHex } = getStudentStatus(record);

  // Map normalized status values to translation keys
  const statusKeyMap = {
    ACTIVE: 'filters.active',
    INACTIVE: 'filters.inactive',
    GRADUATED: 'filters.graduated',
    PENDING: 'filters.pending'
  };

  const labelKey = statusKeyMap[status] || 'filters.unknown';
  const label = translate(labelKey, { _: String(status) });

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 'bold',
        minWidth: '100px',
        backgroundColor: colorHex,
        color: 'white'
      }}
    />
  );
};

const studentRowStyle = (record) => {
  if (!record) return {};
  const { colorHex } = getStudentStatus(record);
  const alpha = 0.12; // subtle row background
  return {
    backgroundColor: hexToRgba(colorHex, alpha),
    borderLeft: `6px solid ${colorHex}`
  };
};

export default function makeStudentList() {
  return function StudentList(props) {
    const translate = useTranslate();
    return (
      <List {...props} aside={<StudentListAside />} filters={[]} actions={<StudentListActions />}>
        <Datagrid rowClick="edit" rowStyle={studentRowStyle}>
          <NumberField source="id" />
          <TextField source="first_name" />
          <TextField source="last_name" />
          <EmailField source="email" />
          <TextField source="phone_number" />
          <DateField source="date_of_birth" />
          <DateField source="enrollment_date" />
          <FunctionField 
            label={translate('resources.students.fields.status', { _: 'Status' })} 
            render={(record) => <StudentStatusField record={record} />}
          />
        </Datagrid>
      </List>
    );
  };
}
