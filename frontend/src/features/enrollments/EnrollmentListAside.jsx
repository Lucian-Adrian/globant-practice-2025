import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function EnrollmentListAside() {
  return (
    <ListAsideFilters
      statusItems={[
        { value: { status: 'IN_PROGRESS' }, labelKey: 'filters.in_progress', color: '#60a5fa' },
        { value: { status: 'COMPLETED' }, labelKey: 'filters.completed', color: '#10b981' },
        { value: { status: 'CANCELED' }, labelKey: 'filters.canceled', color: '#ef4444' },
      ]}
    />
  );
}
