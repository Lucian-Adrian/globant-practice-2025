import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function CourseListAside() {
  return (
    <ListAsideFilters
      dateField="updated_at" // future field (if audit added); still provides translated UI
      statusItems={[
        { value: { status: 'ACTIVE' }, labelKey: 'filters.active', color: '#60a5fa' },
        { value: { status: 'INACTIVE' }, labelKey: 'filters.inactive', color: '#fbbf24' },
      ]}
    />
  );
}

