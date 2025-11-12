import * as React from 'react';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import SchoolIcon from '@mui/icons-material/School';

// Placeholder quick range filters (non-functional for now)
const QuickRangeSection = () => null; // to flesh out later

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
        {statusFilters.map(f => (
          <FilterListItem key={f.value.status} value={f.value} label={t(f.labelKey, { defaultValue: f.value.status })} />
        ))}
      </FilterList>
      <QuickRangeSection />
    </ListAsideFilters>
  );
}
