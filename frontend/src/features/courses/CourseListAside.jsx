import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function CourseListAside() {
  return (
    <ListAsideFilters
      dateField="updated_at" // keep only last-activity (date) filters in sidebar
    />
  );
}

