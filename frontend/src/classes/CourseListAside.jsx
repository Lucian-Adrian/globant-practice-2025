import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { FilterList, FilterListItem } from 'react-admin';
import { endOfYesterday, startOfWeek, subWeeks, startOfMonth, subMonths } from 'date-fns';
import { LanguageContext } from '../i18n';

export default function CourseListAside() {
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
            value={{ updated_at_gte: endOfYesterday().toISOString(), updated_at_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.this_week')}
            value={{ updated_at_gte: startOfWeek(new Date()).toISOString(), updated_at_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.last_week')}
            value={{
              updated_at_gte: subWeeks(startOfWeek(new Date()), 1).toISOString(),
              updated_at_lte: startOfWeek(new Date()).toISOString(),
            }}
          />
          <FilterListItem
            label={t('filters.this_month')}
            value={{ updated_at_gte: startOfMonth(new Date()).toISOString(), updated_at_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.last_month')}
            value={{
              updated_at_gte: subMonths(startOfMonth(new Date()), 1).toISOString(),
              updated_at_lte: startOfMonth(new Date()).toISOString(),
            }}
          />
          <FilterListItem
            label={t('filters.earlier')}
            value={{ updated_at_gte: undefined, updated_at_lte: subMonths(startOfMonth(new Date()), 1).toISOString() }}
          />
        </FilterList>

        <FilterList label={t('filters.status')} icon={<TrendingUpIcon />}>
          <FilterListItem
            label={t('filters.active')}
            value={{}}
          />
          <FilterListItem
            label={t('filters.inactive')}
            value={{}}
          />
        </FilterList>
      </CardContent>
    </Card>
  );
}
