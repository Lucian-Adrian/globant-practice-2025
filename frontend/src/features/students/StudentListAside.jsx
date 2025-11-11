import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { useAsidePanel } from '../../shared/state/AsidePanelContext.jsx';

export default function StudentListAside() {
  const { collapsed } = useAsidePanel();
  if (collapsed) return null;
  return (
    <ListAsideFilters
      statusLabelKey="filters.status"
      statusItems={[
        { value: { status: 'ACTIVE' }, labelKey: 'filters.active', color: '#3b82f6' },
        { value: { status: 'INACTIVE' }, labelKey: 'filters.inactive', color: '#f59e0b' },
        { value: { status: 'GRADUATED' }, labelKey: 'filters.graduated', color: '#10b981' },
        { value: { status: 'PENDING' }, labelKey: 'filters.pending', color: '#9333ea' },
      ]}
    />
  );
}

