import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { useAsidePanel } from '../../shared/state/AsidePanelContext.jsx';

export default function CourseListAside() {
  const { collapsed } = useAsidePanel();
  if (collapsed) return null;
  return <ListAsideFilters />;
}

