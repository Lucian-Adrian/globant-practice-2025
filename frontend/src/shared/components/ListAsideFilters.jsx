import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { endOfYesterday, startOfWeek, subWeeks, startOfMonth, subMonths } from 'date-fns';

/**
 * Generic reusable aside filter panel for React-Admin List pages.
 * Props:
 *  - dateField: (string) base datetime field; builds *_gte / *_lte filters (ISO).
 *  - statusItems: array of { value: object, labelKey: string, color?: string }.
 *  - hideDate: skip rendering the date filter section even if dateField provided.
 *  - dateLabelKey / statusLabelKey: translation keys for section headers.
 *  - dateIcon / statusIcon: override icons.
 *  - children: optional extra <FilterList> sections appended after defaults.
 */
export default function ListAsideFilters({
  dateField,
  statusItems = [],
  hideDate = false,
  dateLabelKey = 'filters.last_activity',
  statusLabelKey = 'filters.status',
  dateIcon = <AccessTimeIcon />,
  statusIcon = <TrendingUpIcon />,
  children,
}) {
  const t = useTranslate();

  const dateFilters = React.useMemo(() => {
    if (!dateField) return [];
    const today = new Date();
    const sow = startOfWeek(today);
    const som = startOfMonth(today);
    const previousMonthStart = subMonths(som, 1);
    return [
      { k: 'filters.today', v: { [`${dateField}_gte`]: endOfYesterday().toISOString(), [`${dateField}_lte`]: undefined } },
      { k: 'filters.this_week', v: { [`${dateField}_gte`]: sow.toISOString(), [`${dateField}_lte`]: undefined } },
      { k: 'filters.last_week', v: { [`${dateField}_gte`]: subWeeks(sow, 1).toISOString(), [`${dateField}_lte`]: sow.toISOString() } },
      { k: 'filters.this_month', v: { [`${dateField}_gte`]: som.toISOString(), [`${dateField}_lte`]: undefined } },
      { k: 'filters.last_month', v: { [`${dateField}_gte`]: previousMonthStart.toISOString(), [`${dateField}_lte`]: som.toISOString() } },
      { k: 'filters.earlier', v: { [`${dateField}_gte`]: undefined, [`${dateField}_lte`]: previousMonthStart.toISOString() } },
    ];
  }, [dateField]);

  const StatusLabel = ({ text, color }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2" sx={{ fontSize: 14 }}>{text}</Typography>
      {color && (<Box component="span" sx={{ width:12, height:12, borderRadius:'50%', bgcolor: color }} />)}
    </Stack>
  );

  return (
    <Card sx={{ display:{ xs:'none', md:'block' }, order:-1, flex:'0 0 16em', mr:2, mt:6, alignSelf:'flex-start' }}>
      <CardContent sx={{ pt:1 }}>
        {!hideDate && dateField && (
          <FilterList label={t(dateLabelKey, dateLabelKey)} icon={dateIcon}>
            {dateFilters.map(df => (
              <FilterListItem key={df.k} label={t(df.k, df.k)} value={df.v} />
            ))}
          </FilterList>
        )}
        {statusItems.length > 0 && (
          <FilterList label={t(statusLabelKey, statusLabelKey)} icon={statusIcon}>
            {statusItems.map((s, i) => {
              const text = t(s.labelKey, s.labelKey);
              const color = s.color === false ? null : s.color || ['#60a5fa','#fbbf24','#86efac','#f59e0b','#ef4444','#6366f1'][i % 6];
              const label = color ? <StatusLabel text={text} color={color} /> : text;
              return <FilterListItem key={s.labelKey+JSON.stringify(s.value)} label={label} value={s.value} />;
            })}
          </FilterList>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
