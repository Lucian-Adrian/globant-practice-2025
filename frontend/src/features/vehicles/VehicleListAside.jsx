import * as React from 'react';
import { Card, CardContent } from '@mui/material';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { useAsidePanel } from '../../shared/state/AsidePanelContext.jsx';

export default function VehicleListAside() {
  const { collapsed } = useAsidePanel();
  if (collapsed) return null;
  return (
    <Card sx={{ display:{ xs:'none', md:'block' }, order:-1, flex:'0 0 16em', mr:2, mt:6, alignSelf:'flex-start' }}>
      <CardContent sx={{ pt:1 }}>
        <ListAsideFilters
          statusLabelKey="filters.availability"
          statusItems={[
            { value: { is_available: true }, labelKey: 'filters.available', color: '#10b981' },
            { value: { is_available: false }, labelKey: 'filters.unavailable', color: '#ef4444' },
          ]}
        />
      </CardContent>
    </Card>
  );
}

