import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function CourseListAside() {
  return (
    <ListAsideFilters
      dateField="updated_at" // reuses same last-activity UI for courses
      statusItems={[
        { value: { status: 'ACTIVE' }, labelKey: 'filters.active', color: '#60a5fa' },
        { value: { status: 'INACTIVE' }, labelKey: 'filters.inactive', color: '#fbbf24' },
      ]}
    />
  );
}

