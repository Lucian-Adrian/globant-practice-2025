// ...existing code...
import * as React from 'react';
import { Card, CardContent, Box, Stack, Typography, Button } from '@mui/material';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { FilterList, FilterListItem, useTranslate } from 'react-admin';
import { endOfYesterday, startOfWeek, subWeeks } from 'date-fns';
import { startOfMonth, subMonths } from 'date-fns';

export default function InstructorListAside() {
  const t = useTranslate();
  return (
    <Card sx={{ display: { xs: 'none', md: 'block' }, order: -1, flex: '0 0 22em', maxWidth: '22em', mr: 2, mt: 6, alignSelf: 'flex-start' }}>
      <CardContent sx={{ pt: 1 }}>
        <ListAsideFilters
          dateField="hire_date"
          statusItems={[
            { value: { experience_level: 'NEW' }, labelKey: 'filters_extra.new', color: '#60a5fa' },
            { value: { experience_level: 'EXPERIENCED' }, labelKey: 'filters_extra.experienced', color: '#10b981' },
            { value: { experience_level: 'SENIOR' }, labelKey: 'filters_extra.senior', color: '#ef4444' },
          ]}
        >
          {/* Keep calendar and gearbox below - moved inside children */}
          <Box sx={{ mt: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, px: 2, py: 2 }}>
            <iframe
              title="Calendar lecții practice"
              src="https://calendar.google.com/calendar/embed?src=your_calendar_id&ctz=Europe%2FBucharest"
              style={{ border: '1px solid #e0e0e0', borderRadius: '12px', width: '100%', height: 320, minHeight: 320, minWidth: '100%', background: 'transparent', marginBottom: 0 }}
              frameBorder="0"
              scrolling="no"
            />
          </Box>
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
              {t('instructors.free_instructors', 'FREE INSTRUCTORS')}
            </Button>
          </Box>
        </ListAsideFilters>
      </CardContent>
    </Card>
  );
}

function GearboxSelector() {
  const t = useTranslate();
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
  {t('instructors.gearbox.manual', 'MANUAL')}
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
  {t('instructors.gearbox.automatic', 'AUTOMATIC')}
      </Button>
    </Box>
  );
}
