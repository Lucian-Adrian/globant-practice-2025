// ...existing code...
import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography, Button } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { endOfYesterday, startOfWeek, subWeeks } from 'date-fns';
import { startOfMonth, subMonths } from 'date-fns';

export default function InstructorListAside() {
  const t = useTranslate();
  return (
    <Card sx={{ display: { xs: 'none', md: 'block' }, order: -1, flex: '0 0 22em', maxWidth: '22em', mr: 2, mt: 6, alignSelf: 'flex-start' }}>
      <CardContent sx={{ pt: 1 }}>
        {/* LAST ACTIVITY FILTERS */}
        <FilterList label={t('filters.last_activity', 'Last activity')} icon={<AccessTimeIcon />}>
          <FilterListItem
            label={t('filters.today', 'Today')}
            value={{ hire_date_gte: endOfYesterday().toISOString(), hire_date_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.this_week', 'This week')}
            value={{ hire_date_gte: startOfWeek(new Date()).toISOString(), hire_date_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.last_week', 'Last week')}
            value={{ hire_date_gte: subWeeks(startOfWeek(new Date()), 1).toISOString(), hire_date_lte: startOfWeek(new Date()).toISOString() }}
          />
          <FilterListItem
            label={t('filters.this_month', 'This month')}
            value={{ hire_date_gte: startOfMonth(new Date()).toISOString(), hire_date_lte: undefined }}
          />
          <FilterListItem
            label={t('filters.last_month', 'Last month')}
            value={{ hire_date_gte: subMonths(startOfMonth(new Date()), 1).toISOString(), hire_date_lte: startOfMonth(new Date()).toISOString() }}
          />
          <FilterListItem
            label={t('filters.earlier', 'Earlier')}
            value={{ hire_date_gte: undefined, hire_date_lte: subMonths(startOfMonth(new Date()), 1).toISOString() }}
          />
        </FilterList>
        {/* CALENDAR SECTION BELOW FILTERS */}
        <Box sx={{ mt: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, px: 2, py: 2 }}>
          <iframe
            title="Calendar lecții practice"
            src="https://calendar.google.com/calendar/embed?src=your_calendar_id&ctz=Europe%2FBucharest"
            style={{ border: '1px solid #e0e0e0', borderRadius: '12px', width: '100%', height: 320, minHeight: 320, minWidth: '100%', background: 'transparent', marginBottom: 0 }}
            frameBorder="0"
            scrolling="no"
          />
        </Box>
        {/* Gearbox selector below calendar */}
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <GearboxSelector />
          </Box>
          <Button variant="contained" color="primary" sx={{
            borderRadius: '32px',
            fontWeight: 700,
            px: 0,
            py: 1.5,
            fontSize: 18,
            width: '100%',
            bgcolor: '#232366',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#232366', opacity: 0.9 },
          }}>
            FREE INSTRUCTORS
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function GearboxSelector() {
  const [gearbox, setGearbox] = React.useState('manual');
  return (
    <Box>
      <Button
        variant={gearbox === 'manual' ? 'contained' : 'outlined'}
        sx={{
          px: 3,
          fontWeight: 700,
          borderRadius: '32px',
          border: '2px solid #232366',
          color: gearbox === 'manual' ? '#fff' : '#232366',
          bgcolor: gearbox === 'manual' ? '#232366' : '#fff',
          mr: 1,
        }}
        onClick={() => setGearbox('manual')}
      >
        MANUAL
      </Button>
      <Button
        variant={gearbox === 'automatic' ? 'contained' : 'outlined'}
        sx={{
          px: 3,
          fontWeight: 700,
          borderRadius: '32px',
          border: '2px solid #232366',
          color: gearbox === 'automatic' ? '#fff' : '#232366',
          bgcolor: gearbox === 'automatic' ? '#232366' : '#fff',
        }}
        onClick={() => setGearbox('automatic')}
      >
        AUTOMATIC
      </Button>
    </Box>
  );
}
