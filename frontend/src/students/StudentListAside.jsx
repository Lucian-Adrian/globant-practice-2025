import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { FilterList, FilterListItem } from 'react-admin';
import { endOfYesterday, startOfWeek, subWeeks, startOfMonth, subMonths } from 'date-fns';

// Culori pentru status-urile studenților
const STATUS_COLORS = {
  ACTIVE: '#60a5fa',     // albastru
  INACTIVE: '#fbbf24',  // galben
  GRADUATED: '#86efac', // verde
};

// Componentă pentru afișat text + bulină colorată
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

export default function StudentListAside() {
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
        {/* LAST ACTIVITY */}
        <FilterList label="Last activity" icon={<AccessTimeIcon />}>
          <FilterListItem
            label="Today"
            value={{
              enrollment_date_gte: endOfYesterday().toISOString(),
              enrollment_date_lte: undefined,
            }}
          />
          <FilterListItem
            label="This week"
            value={{
              enrollment_date_gte: startOfWeek(new Date()).toISOString(),
              enrollment_date_lte: undefined,
            }}
          />
          <FilterListItem
            label="Last week"
            value={{
              enrollment_date_gte: subWeeks(startOfWeek(new Date()), 1).toISOString(),
              enrollment_date_lte: startOfWeek(new Date()).toISOString(),
            }}
          />
          <FilterListItem
            label="This month"
            value={{
              enrollment_date_gte: startOfMonth(new Date()).toISOString(),
              enrollment_date_lte: undefined,
            }}
          />
          <FilterListItem
            label="Last month"
            value={{
              enrollment_date_gte: subMonths(startOfMonth(new Date()), 1).toISOString(),
              enrollment_date_lte: startOfMonth(new Date()).toISOString(),
            }}
          />
          <FilterListItem
            label="Earlier"
            value={{
              enrollment_date_gte: undefined,
              enrollment_date_lte: subMonths(startOfMonth(new Date()), 1).toISOString(),
            }}
          />
        </FilterList>

        {/* STATUS */}
        <FilterList label="STATUS" icon={<TrendingUpIcon />}>
          <FilterListItem
            label={<StatusLabel text="Active" colorKey="ACTIVE" />}
            value={{ status: 'ACTIVE' }}
          />
          <FilterListItem
            label={<StatusLabel text="Inactive" colorKey="INACTIVE" />}
            value={{ status: 'INACTIVE' }}
          />
          <FilterListItem
            label={<StatusLabel text="Graduated" colorKey="GRADUATED" />}
            value={{ status: 'GRADUATED' }}
          />
        </FilterList>
      </CardContent>
    </Card>
  );
}
