import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function LessonListAside() {
  return (
    <ListAsideFilters
      dateField="scheduled_time"
      statusItems={[
        { value: { status: 'SCHEDULED' }, labelKey: 'filters.scheduled', color: '#60a5fa' },
        { value: { status: 'COMPLETED' }, labelKey: 'filters.completed', color: '#10b981' },
        { value: { status: 'CANCELED' }, labelKey: 'filters.canceled', color: '#ef4444' },
      ]}
    />
  );
}
