import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function StudentListAside() {
  return (
    <ListAsideFilters
      dateField="enrollment_date"
      statusItems={[
        { value: { status: 'PENDING' }, labelKey: 'filters.pending', color: '#9ca3af' },
        { value: { status: 'ACTIVE' }, labelKey: 'filters.active', color: '#60a5fa' },
        { value: { status: 'INACTIVE' }, labelKey: 'filters.inactive', color: '#fbbf24' },
        { value: { status: 'GRADUATED' }, labelKey: 'filters.graduated', color: '#86efac' },
      ]}
    />
  );
}

