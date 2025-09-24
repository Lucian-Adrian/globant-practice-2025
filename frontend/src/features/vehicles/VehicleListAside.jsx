import * as React from 'react';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { Card, CardContent } from '@mui/material';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';

export default function VehicleListAside() {
  const t = useTranslate();
  return (
    <Card sx={{ display:{ xs:'none', md:'block' }, order:-1, flex:'0 0 16em', mr:2, mt:6, alignSelf:'flex-start' }}>
      <CardContent sx={{ pt:1 }}>
        <ListAsideFilters
          hideDate
          statusLabelKey="filters.availability"
          statusItems={[
            { value: { is_available: true }, labelKey: 'filters.available', color: '#10b981' },
            { value: { is_available: false }, labelKey: 'filters.unavailable', color: '#ef4444' },
          ]}
        />
        <FilterList label={t('filters.category','Category')}>
          {['AM','A1','A2','A','B1','B','C1','C','D1','D','BE','C1E','CE','D1E','DE'].map(cat => (
            <FilterListItem key={cat} label={cat} value={{ category: cat }} />
          ))}
        </FilterList>
      </CardContent>
    </Card>
  );
}

