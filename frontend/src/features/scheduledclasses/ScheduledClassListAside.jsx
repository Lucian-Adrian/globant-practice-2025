import * as React from 'react';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { Chip, Stack } from '@mui/material';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import SchoolIcon from '@mui/icons-material/School';

// Small chip label like LessonListAside
const StatusFilterLabel = ({ text, color }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
    <Chip
      label={text}
      color={color}
      size="small"
      variant="filled"
      sx={{
        minWidth: '90px',
        fontSize: '11px',
        height: '24px',
        fontWeight: 'bold',
        ...(color === 'success' && { backgroundColor: '#4caf50', color: 'white' }),
        ...(color === 'primary' && { backgroundColor: '#2196f3', color: 'white' }),
        ...(color === 'info' && { backgroundColor: '#00bcd4', color: 'white' }),
        ...(color === 'warning' && { backgroundColor: '#ff9800', color: 'white' }),
        ...(color === 'error' && { backgroundColor: '#f44336', color: 'white' }),
        ...(color === 'secondary' && { backgroundColor: '#9c27b0', color: 'white' }),
        ...(color === 'default' && { backgroundColor: '#9e9e9e', color: 'white' })
      }}
    />
  </Stack>
);

export default function ScheduledClassListAside() {
  const t = useTranslate();
  const statusFilters = [
    { value: { status: 'SCHEDULED' }, labelKey: 'filters.scheduled', color: 'primary' },
    { value: { status: 'COMPLETED' }, labelKey: 'filters.completed', color: 'success' },
    { value: { status: 'CANCELED' }, labelKey: 'filters.canceled', color: 'error' },
  ];
  return (
    <ListAsideFilters>
      <FilterList label={t('filters.status', { defaultValue: 'Status' })} icon={<SchoolIcon />}> 
        {statusFilters.map((f) => (
          <FilterListItem
            key={f.value.status}
            value={f.value}
            label={<StatusFilterLabel text={t(f.labelKey, { defaultValue: f.value.status })} color={f.color} />}
          />
        ))}
      </FilterList>
    </ListAsideFilters>
  );
}
