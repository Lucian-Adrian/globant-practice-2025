import * as React from 'react';
import { List, Datagrid, NumberField, TextField, EditButton, FunctionField, useListContext, useTranslate } from 'react-admin';
import { useLocation } from 'react-router-dom';
import { Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CourseListAside from './CourseListAside.jsx';
import ListImportActions from '../../shared/components/ListImportActions';

// Function to determine course status based on available data
// Status -> color map. Keep in sync with CourseListAside statusItems
const statusColorMap = {
  ACTIVE: '#60a5fa', // matches CourseListAside
  INACTIVE: '#fbbf24',
  UNKNOWN: '#9e9e9e',
};

const getCourseStatus = (record) => {
  if (!record) return { status: 'UNKNOWN', hex: statusColorMap.UNKNOWN };

  // If backend provides an explicit status, use it
  if (record.status) {
    const s = String(record.status).toUpperCase();
    return { status: s, hex: statusColorMap[s] || statusColorMap.UNKNOWN };
  }

  // Heuristic: THEORY/PRACTICE or paid courses considered ACTIVE
  if (record.type === 'THEORY' || record.type === 'PRACTICE' || (record.price && record.price > 0)) {
    return { status: 'ACTIVE', hex: statusColorMap.ACTIVE };
  }

  return { status: 'INACTIVE', hex: statusColorMap.INACTIVE };
};

const hexToRgba = (hex, alpha = 0.15) => {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Status field component with colored chips
const CourseStatusField = (recordOrProps) => {
  const record = recordOrProps?.record ?? recordOrProps;
  const { status, hex } = getCourseStatus(record);
  const t = useTranslate();
  const labelKey = status === 'ACTIVE' ? 'filters.active' : status === 'INACTIVE' ? 'filters.inactive' : 'unknown';
  const label = t(labelKey, status);
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontWeight: 'bold',
        minWidth: '80px',
        backgroundColor: hex,
        color: 'white'
      }}
    />
  );
};

// Custom button to view class details
const ViewDetailsButton = ({ record }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/classes/${record.id}/details`);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '6px 12px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '0.875rem',
        cursor: 'pointer',
        marginRight: '8px'
      }}
    >
      Vezi Detalii
    </button>
  );
};

export default function CourseList(props) {
  return (
    <List {...props} aside={<CourseListAside />} actions={<ListImportActions endpoint="courses" />}>
      <FilteredCourseDatagrid />
    </List>
  );
}

function FilteredCourseDatagrid(props) {
  const location = useLocation();
  const { data } = useListContext();
  const params = new URLSearchParams(location.search);
  const gte = params.get('updated_at_gte');
  const lte = params.get('updated_at_lte');

  const filtered = (data || []).filter((record) => {
    if (!record) return false;
    const d = record.updated_at ? new Date(record.updated_at) : null;
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
      sx={{ tableLayout: 'fixed' }}
      rowStyle={(record) => {
        const { hex } = getCourseStatus(record);
        return {
          backgroundColor: hexToRgba(hex, alpha),
          borderLeft: `4px solid ${hex}`
        };
      }}
    >
      <NumberField source="id" sx={{ maxWidth: 80 }} />
      <TextField source="name" sx={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
      <TextField source="category" sx={{ maxWidth: 140 }} />
      <TextField source="type" sx={{ maxWidth: 120 }} />
      <TextField source="description" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
      <NumberField source="price" sx={{ maxWidth: 100 }} />
      <NumberField source="required_lessons" sx={{ maxWidth: 120 }} />
      <FunctionField 
        label={t('filters.status', 'Status')}
        render={(record) => <CourseStatusField record={record} />}
      />
      <EditButton />
    </Datagrid>
  );
}
