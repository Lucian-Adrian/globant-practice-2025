import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { FilterList, FilterListItem } from 'react-admin';
import { endOfYesterday, startOfWeek, subWeeks, startOfMonth, subMonths } from 'date-fns';
import { LanguageContext } from '../i18n';

const STATUS_COLORS = {
  ACTIVE: '#60a5fa',
  INACTIVE: '#fbbf24',
  GRADUATED: '#86efac',
};

const StatusLabel = ({ text, colorKey }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Typography variant="body1" sx={{ fontSize: 16 }}>{text}</Typography>
    <Box
      component="span"
      sx={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        bgcolor: STATUS_COLORS[colorKey] || '#ddd',
        display: 'inline-block',
      }}
    />
  </Stack>
);

export default function InstructorListAside() {
  const { t } = React.useContext(LanguageContext);

  return (
    <Card
      sx={{
        display: { xs: 'none', md: 'block' },
        order: -1,
        flex: '0 0 15em',
        mr: 2,
        mt: 6,
        alignSelf: 'flex-start',
      }}
    >
      <CardContent sx={{ pt: 1 }}>
        <FilterList label={t('filters.last_activity')} icon={<AccessTimeIcon />}>
          <FilterListItem
            label={t('filters.today')}
            value={{ hire_date_gte: endOfYesterday().toISOString(), hire_date_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.this_week')}
            value={{ hire_date_gte: startOfWeek(new Date()).toISOString(), hire_date_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.last_week')}
            value={{
              hire_date_gte: subWeeks(startOfWeek(new Date()), 1).toISOString(),
              hire_date_lte: startOfWeek(new Date()).toISOString(),
            }}
          />
          <FilterListItem
            label={t('filters.this_month')}
            value={{ hire_date_gte: startOfMonth(new Date()).toISOString(), hire_date_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.last_month')}
            value={{
              hire_date_gte: subMonths(startOfMonth(new Date()), 1).toISOString(),
              hire_date_lte: startOfMonth(new Date()).toISOString(),
            }}
          />
          <FilterListItem
            label={t('filters.earlier')}
            value={{ hire_date_gte: undefined, hire_date_lte: subMonths(startOfMonth(new Date()), 1).toISOString() }}
          />
        </FilterList>

        <FilterList label={t('filters.status')} icon={<TrendingUpIcon />}>
          <FilterListItem
            label={<StatusLabel text={t('filters.active')} colorKey="ACTIVE" />}
            value={{ status: 'ACTIVE' }}
          />
          <FilterListItem
            label={<StatusLabel text={t('filters.inactive')} colorKey="INACTIVE" />}
            value={{ status: 'INACTIVE' }}
          />
        </FilterList>
      </CardContent>
    </Card>
  );
}
