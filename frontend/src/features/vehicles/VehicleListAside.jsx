import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { FilterList, FilterListItem } from 'react-admin';
import { endOfYesterday, startOfWeek, subWeeks, startOfMonth, subMonths } from 'date-fns';
import { useTranslate } from 'react-admin';

const STATUS_COLORS = { OK:'#60a5fa', DUE:'#f59e0b', OVERDUE:'#ef4444' };

const StatusLabel = ({ text, colorKey }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Typography variant="body1" sx={{ fontSize: 14 }}>{text}</Typography>
    <Box component="span" sx={{ width:12, height:12, borderRadius:'50%', bgcolor: STATUS_COLORS[colorKey] || '#ddd' }} />
  </Stack>
);

export default function VehicleListAside() {
  const t = useTranslate();
  return (
    <Card sx={{ display:{ xs:'none', md:'block' }, order:-1, flex:'0 0 15em', mr:2, mt:6, alignSelf:'flex-start' }}>
      <CardContent sx={{ pt:1 }}>
        <FilterList label={t('filters.last_activity','Last activity')} icon={<AccessTimeIcon />}> 
          <FilterListItem label={t('filters.today','Today')} value={{ last_service_gte: endOfYesterday().toISOString(), last_service_lte: undefined }} />
          <FilterListItem label={t('filters.this_week','This week')} value={{ last_service_gte: startOfWeek(new Date()).toISOString(), last_service_lte: undefined }} />
          <FilterListItem label={t('filters.last_week','Last week')} value={{ last_service_gte: subWeeks(startOfWeek(new Date()),1).toISOString(), last_service_lte: startOfWeek(new Date()).toISOString() }} />
          <FilterListItem label={t('filters.this_month','This month')} value={{ last_service_gte: startOfMonth(new Date()).toISOString(), last_service_lte: undefined }} />
          <FilterListItem label={t('filters.last_month','Last month')} value={{ last_service_gte: subMonths(startOfMonth(new Date()),1).toISOString(), last_service_lte: startOfMonth(new Date()).toISOString() }} />
          <FilterListItem label={t('filters.earlier','Earlier')} value={{ last_service_gte: undefined, last_service_lte: subMonths(startOfMonth(new Date()),1).toISOString() }} />
        </FilterList>
        <FilterList label={t('filters.status','Status')} icon={<TrendingUpIcon />}> 
          <FilterListItem label={<StatusLabel text={t('vehicles.filters.ok','OK')} colorKey="OK" />} value={{ maintenance_status:'OK' }} />
          <FilterListItem label={<StatusLabel text={t('vehicles.filters.due','Due')} colorKey="DUE" />} value={{ maintenance_status:'DUE' }} />
          <FilterListItem label={<StatusLabel text={t('vehicles.filters.overdue','Overdue')} colorKey="OVERDUE" />} value={{ maintenance_status:'OVERDUE' }} />
        </FilterList>
      </CardContent>
    </Card>
  );
}
