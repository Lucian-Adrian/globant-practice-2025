import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

// Keep this component thin: delegate layout & hide/show to ListAsideFilters,
// which already respects the global aside "collapsed" state.
export default function ResourceListAside() {
  return (
    <ListAsideFilters
      statusLabelKey="filters.availability"
      statusItems={[
        { value: { is_available: true }, labelKey: 'filters.available', color: '#10b981' },
        { value: { is_available: false }, labelKey: 'filters.unavailable', color: '#ef4444' },
      ]}
    />
  );
}