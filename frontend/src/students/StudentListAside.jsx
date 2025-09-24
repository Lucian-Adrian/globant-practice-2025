import * as React from 'react';
import { CalendarPicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTranslate } from 'react-admin';
import { useGetLocale } from 'react-admin';
import roLocale from 'date-fns/locale/ro';
import ruLocale from 'date-fns/locale/ru';
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
  const t = useTranslate();
  const getLocale = useGetLocale();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  // Use react-admin's i18n language for calendar
  const raLang = getLocale();
  let locale = undefined;
  if (raLang === 'ro') locale = roLocale;
  if (raLang === 'ru') locale = ruLocale;
  // fallback: undefined (en)
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
        <FilterList label={t('filters.last_activity', 'Last activity')} icon={<AccessTimeIcon />}>
          <FilterListItem
            label={t('filters.first_name', 'First name')}
            value={{ first_name: '' }}
          />
          <FilterListItem
            label={t('filters.last_name', 'Last name')}
            value={{ last_name: '' }}
          />
          <FilterListItem
            label={t('filters.license_categories', 'License categories')}
            value={{ license_categories: '' }}
          />
        </FilterList>
        {/* CALENDAR SECTION */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('calendar.title', raLang === 'ro' ? 'Calendar lecții practice' : raLang === 'ru' ? 'Календарь практических занятий' : 'Calendar')}</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
            <CalendarPicker
              date={selectedDate}
              onChange={setSelectedDate}
              views={['day']}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>
        </Box>
      </CardContent>
    </Card>
  );
}
