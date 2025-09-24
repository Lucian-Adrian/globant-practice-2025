import * as React from 'react';
import ListAsideFilters from '../../shared/components/ListAsideFilters.jsx';
import { FilterList, FilterListItem, useGetList, useTranslate } from 'react-admin';
import { Chip, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookIcon from '@mui/icons-material/Book';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

// Component to render status badge in filter
const StatusFilterLabel = ({ text, color, statusKey }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
    <Chip 
      label={text}
      color={color}
      size="small"
      variant="filled"
      sx={{ 
        minWidth: '90px',
        fontSize: '11px',
        height: '24px',
        fontWeight: 'bold',
        ...(color === 'success' && { backgroundColor: '#4caf50', color: 'white' }),
        ...(color === 'primary' && { backgroundColor: '#2196f3', color: 'white' }),
        ...(color === 'info' && { backgroundColor: '#00bcd4', color: 'white' }),
        ...(color === 'warning' && { backgroundColor: '#ff9800', color: 'white' }),
        ...(color === 'error' && { backgroundColor: '#f44336', color: 'white' }),
        ...(color === 'secondary' && { backgroundColor: '#9c27b0', color: 'white' }),
        ...(color === 'default' && { backgroundColor: '#9e9e9e', color: 'white' })
      }}
    />
  </Stack>
);

// Component to render lesson type badge in filter
const LessonTypeFilterLabel = ({ text, color, icon }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
    {icon}
    <Chip 
      label={text}
      size="small"
      variant="outlined"
      sx={{ 
        minWidth: '80px',
        fontSize: '11px',
        height: '24px',
        borderColor: color,
        color: color,
        fontWeight: 'bold'
      }}
    />
  </Stack>
);

// Component to render instructor filter label
const InstructorFilterLabel = ({ name, experience }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
    <PersonIcon sx={{ fontSize: '16px', color: '#666' }} />
    <Stack direction="column" spacing={0}>
      <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 'bold' }}>
        {name}
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '10px', color: '#888' }}>
        {experience}
      </Typography>
    </Stack>
  </Stack>
);

// ...existing code...

export default function LessonListAside() {
  const t = useTranslate();
  // Fetch registered vehicles from the vehicles resource
  const { data: vehicles = {}, total, loaded } = useGetList('vehicles', { pagination: { page: 1, perPage: 1000 }, sort: { field: 'id', order: 'ASC' }, filter: {} });
  // Define lesson status filters (use translation keys)
  const lessonStatusFilters = [
    { value: { status_filter: 'COMPLETED' }, labelKey: 'filters.completed', color: 'success', statusKey: 'COMPLETED' },
    { value: { status_filter: 'SCHEDULED' }, labelKey: 'filters.scheduled', color: 'primary', statusKey: 'SCHEDULED' },
    { value: { status_filter: 'TODAY' }, labelKey: 'filters.today', color: 'info', statusKey: 'TODAY' },
  { value: { status_filter: 'IMMINENT' }, labelKey: 'filters_extra_local.imminent', color: 'warning', statusKey: 'IMMINENT' },
    { value: { status_filter: 'CANCELED' }, labelKey: 'filters.canceled', color: 'error', statusKey: 'CANCELED' },
  { value: { status_filter: 'PLANNED' }, labelKey: 'filters_extra_local.planned', color: 'secondary', statusKey: 'PLANNED' }
  ];

  // Define lesson type filters (use translation keys)
  const lessonTypeFilters = [
    { value: { lesson_type: 'Theory' }, labelKey: 'filters.theory', color: '#4caf50', icon: <BookIcon sx={{ fontSize: '16px', color: '#4caf50' }} /> },
    { value: { lesson_type: 'Driving' }, labelKey: 'filters.practice', color: '#2196f3', icon: <DriveEtaIcon sx={{ fontSize: '16px', color: '#2196f3' }} /> }
  ];

  // Fetch instructors dynamically so only registered instructors appear
  const { data: instructors = {}, total: instructorsTotal } = useGetList('instructors', { pagination: { page: 1, perPage: 1000 }, sort: { field: 'id', order: 'ASC' }, filter: {} });
  const instructorFilters = Object.values(instructors || {}).map((ins, i) => ({
    value: { instructor: ins.id },
    name: `${ins.first_name || ''} ${ins.last_name || ''}`.trim(),
    experience: ins.years_experience ? `${ins.years_experience} ani exp.` : (ins.experience || '' )
  }));

  // ...existing code...

  // Build statusItems from fetched vehicles (only registered vehicles)
  const vehicleItems = Object.values(vehicles || {}).map((v, i) => {
    const label = v.license_plate ? `${v.make || ''} ${v.model || ''} - ${v.license_plate}`.trim() : `${v.make || ''} ${v.model || ''}`.trim();
    const value = { vehicle: v.license_plate || label };
    // cycle colors for variety
    const palette = ['#60a5fa', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#9c27b0'];
    return { value, labelKey: label, color: palette[i % palette.length] };
  });

  return (
    <ListAsideFilters
      dateField="scheduled_time"
      statusLabelKey={t('resources.vehicles.name', 'Vehicle')}
      statusItems={vehicleItems}
    >
      {/* Lesson Status Filter Section */}
      <FilterList label={t('filters.status', 'Status')} icon={<SchoolIcon />}>
        {lessonStatusFilters.map((filter) => (
          <FilterListItem 
            key={filter.statusKey}
            label={
              <StatusFilterLabel 
                text={t(filter.labelKey, filter.labelKey)} 
                color={filter.color}
                statusKey={filter.statusKey}
              />
            }
            value={filter.value}
          />
        ))}
      </FilterList>

      {/* Lesson Type Filter Section */}
      <FilterList label={t('filters.type', 'Type')} icon={<BookIcon />}>
        {lessonTypeFilters.map((filter, index) => (
          <FilterListItem 
            key={index}
            label={
              <LessonTypeFilterLabel 
                text={t(filter.labelKey, filter.labelKey)} 
                color={filter.color}
                icon={filter.icon}
              />
            }
            value={filter.value}
          />
        ))}
      </FilterList>

      {/* Instructor Filter Section */}
      <FilterList label={t('resources.instructors.name', 'Instructor')} icon={<PersonIcon />}>
        {instructorFilters.map((filter, index) => (
          <FilterListItem 
            key={filter.value.instructor || index}
            label={
              <InstructorFilterLabel 
                name={filter.name}
                experience={filter.experience}
              />
            }
            value={filter.value}
          />
        ))}
      </FilterList>

  {/* time period filter removed as requested */}
    </ListAsideFilters>
  );
}
