import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { Chip, Stack } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

// Component to render status badge in filter
const StatusFilterLabel = ({ text, color, statusKey }) => (
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

// Type filter moved to toolbar

// Instructor filter moved to toolbar

// ...existing code...

export default function LessonListAside() {
  const t = useTranslate();
  // Define lesson status filters (backend statuses only)
  const lessonStatusFilters = [
    { value: { status: 'SCHEDULED' }, labelKey: 'filters.scheduled', color: 'primary', statusKey: 'SCHEDULED' },
    { value: { status: 'COMPLETED' }, labelKey: 'filters.completed', color: 'success', statusKey: 'COMPLETED' },
    { value: { status: 'CANCELED' }, labelKey: 'filters.canceled', color: 'error', statusKey: 'CANCELED' },
  ];
  // Type filter moved to toolbar

  // Instructor filter moved to toolbar

  // ...existing code...

  // Vehicle filter moved to toolbar

  return (
    <ListAsideFilters>
      {/* Lesson Status Filter Section */}
      <FilterList label={t('filters.status', 'Status')} icon={<SchoolIcon />}>
        {lessonStatusFilters.map((filter) => (
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

      {/* Type filter moved to toolbar */}

  {/* Instructor filter moved to toolbar */}

  {/* time period filter removed as requested */}
    </ListAsideFilters>
  );
}
