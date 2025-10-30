import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';

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
  statusItems = [],
  statusLabelKey = 'filters.status',
  statusIcon = <TrendingUpIcon />,
  children,
}) {
  const t = useTranslate();

  const StatusLabel = ({ text, color }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant="body2" sx={{ fontSize: 14 }}>{text}</Typography>
      {color && (<Box component="span" sx={{ width:12, height:12, borderRadius:'50%', bgcolor: color }} />)}
    </Stack>
  );

  return (
    <Card sx={{ display:{ xs:'none', md:'block' }, order:-1, flex:'0 0 22em', maxWidth:'22em', mr:2, mt:6, alignSelf:'flex-start' }}>
      <CardContent sx={{ pt:1 }}>
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
