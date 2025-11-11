import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { useAsidePanel } from '../../shared/state/AsidePanelContext.jsx';

export default function InstructorListAside() {
  // Simplified: only reuse the shared aside filters without extra calendar/gearbox sections
  const { collapsed } = useAsidePanel();
  if (collapsed) return null;
  return <ListAsideFilters />;
}
