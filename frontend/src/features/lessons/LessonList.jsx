import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField, ReferenceField, FunctionField, useListContext, useTranslate } from 'react-admin';
import { Chip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import LessonListAside from './LessonListAside.jsx';
import ListImportActions from '../../shared/components/ListImportActions';

// Function to determine lesson status based on existing data
const getLessonStatus = (record) => {
  console.log('getLessonStatus called with record:', record); // Debug log
  
  if (!record) {
    console.log('No record provided, returning UNKNOWN');
    return { status: 'UNKNOWN', color: 'default' };
  }
  
  const scheduledTime = new Date(record.scheduled_time);
  const now = new Date();
  const hoursUntilLesson = (scheduledTime - now) / (1000 * 60 * 60);
  const daysUntilLesson = hoursUntilLesson / 24;
  
  console.log('Lesson analysis:', {
    scheduledTime: scheduledTime.toISOString(),
    now: now.toISOString(),
    hoursUntilLesson,
    daysUntilLesson,
    originalStatus: record.status
  });
  
  // If lesson has an explicit status from backend, check if it's completed or canceled
  if (record.status === 'COMPLETED') {
    console.log('Lesson explicitly marked as COMPLETED');
    return { status: 'COMPLETED', color: 'success' };
  }
  
  if (record.status === 'CANCELED') {
    console.log('Lesson explicitly marked as CANCELED');
    return { status: 'CANCELED', color: 'error' };
  }
  
  // Business rules for lesson status determination based on time
  
  // 1. Past lessons that aren't explicitly marked
  if (hoursUntilLesson < 0) {
    // Lesson time has passed
    if (Math.abs(hoursUntilLesson) < 2) {
      // Just finished (within 2 hours)
      console.log('Recently finished lesson, returning COMPLETED');
      return { status: 'COMPLETED', color: 'success' };
    } else {
      // Older lesson, assume completed
      console.log('Past lesson, returning COMPLETED');
      return { status: 'COMPLETED', color: 'success' };
    }
  }
  
  // 2. Very soon lessons (under 2 hours)
  if (hoursUntilLesson < 2) {
    console.log('Lesson very soon (under 2h), returning IMMINENT');
    return { status: 'IMMINENT', color: 'warning' };
  }
  
  // 3. Today's lessons (same day, but more than 2 hours away)
  if (hoursUntilLesson < 24) {
    console.log('Lesson today, returning TODAY');
    return { status: 'TODAY', color: 'info' };
  }
  
  // 4. This week's lessons (within 7 days)
  if (daysUntilLesson <= 7) {
    console.log('Lesson this week, returning SCHEDULED');
    return { status: 'SCHEDULED', color: 'primary' };
  }
  
  // 5. Future lessons (more than 7 days away)
  if (daysUntilLesson > 7) {
    console.log('Lesson far in future, returning PLANNED');
    return { status: 'PLANNED', color: 'secondary' };
  }
  
  // 6. Fallback
  console.log('Fallback case, returning SCHEDULED');
  return { status: 'SCHEDULED', color: 'primary' };
};

// Component for rendering lesson status badge (translated)
// Map lesson status codes to translation keys
const statusToTranslationKey = {
  COMPLETED: 'filters.completed',
  CANCELED: 'filters.canceled',
  IMMINENT: 'filters.imminent',
  TODAY: 'filters.today',
  SCHEDULED: 'filters.scheduled',
  PLANNED: 'filters.planned',
  UNKNOWN: 'filters.unknown',
};

const LessonStatusField = ({ record }) => {
  const t = useTranslate();
  if (!record) return null;
  const { status, color } = getLessonStatus(record);
  const labelKey = statusToTranslationKey[status] || 'filters.unknown';
  const label = t(labelKey, status);
  return <Chip label={label} color={color} size="small" />;
};

const FilteredDatagrid = (props) => {
  const { data } = useListContext();
  const location = useLocation();
  const t = useTranslate();

  // Read possible filters either from URL params or from list context (fallback)
  const params = new URLSearchParams(location.search);
  const statusFilter = params.get('status') || null;
  const lessonTypeFilter = params.get('lesson_type') || params.get('type') || null;
  const instructorFilter = params.get('instructor') || null;
  const timeFilter = params.get('time') || null;

  const filterLessons = (lessons) => {
    if (!lessons) return [];
    return lessons.filter(record => {
      if (statusFilter) {
        const { status } = getLessonStatus(record);
        if (status !== statusFilter) return false;
      }
      if (lessonTypeFilter) {
        const recordType = record.type || record.lesson_type || '';
        if (recordType !== lessonTypeFilter) return false;
      }
      if (instructorFilter) {
        const instructorId = record.instructor?.id || record.instructor_id || '';
        if (String(instructorId) !== String(instructorFilter)) return false;
      }
      // timeFilter matching can be implemented later if needed
      return true;
    });
  };

  const filteredData = filterLessons(data);

  const statusLabel = t('filters.status', 'Status');

  return (
    <Datagrid 
      {...props}
      data={filteredData}
      rowClick="edit"
      sx={{
        '& .RaDatagrid-rowEven, & .RaDatagrid-rowOdd': {
          '&[data-lesson-status="COMPLETED"]': {
            backgroundColor: '#f1f8e9',
            '&:hover': { backgroundColor: '#e8f5e8' }
          },
          '&[data-lesson-status="TODAY"]': {
            backgroundColor: '#e3f2fd',
            '&:hover': { backgroundColor: '#e1f5fe' }
          },
          '&[data-lesson-status="IMMINENT"]': {
            backgroundColor: '#fff3e0',
            '&:hover': { backgroundColor: '#ffe0b2' }
          },
          '&[data-lesson-status="CANCELED"]': {
            backgroundColor: '#ffebee',
            '&:hover': { backgroundColor: '#ffcdd2' }
          }
        }
      }}
      rowStyle={(record) => {
        const { status } = getLessonStatus(record || {});
        return { 'data-lesson-status': status };
      }}
    >
      <NumberField source="id" label="ID" />
      <FunctionField 
        label={statusLabel}
        render={(record) => <LessonStatusField record={record} />}
        sortable={false}
      />
      <ReferenceField source="enrollment.id" reference="enrollments" label={t('resources.enrollments.name', 'Enrollment')}>
        <TextField source="label" />
      </ReferenceField>
      <ReferenceField source="instructor.id" reference="instructors" label={t('resources.instructors.name', 'Instructor')} />
      <TextField source="vehicle" label={t('resources.vehicles.name', 'Vehicle')} />
      {/* Show only the date in this column */}
      <DateField
        source="scheduled_time"
        label={t('resources.lessons.fields.scheduled_time', 'Scheduled date')}
      />
      {/* Separate time column (HH:mm), not sortable */}
  <FunctionField
        label={t('resources.lessons.fields.time', 'Time')}
        render={(record) => {
          if (!record?.scheduled_time) return '';
          const d = new Date(record.scheduled_time);
          try {
    // Use 24-hour format for clarity across locales
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
          } catch (_) {
            return d.toISOString().substring(11, 16); // Fallback HH:mm
          }
        }}
        sortable={false}
      />
      <NumberField source="duration_minutes" label={t('resources.lessons.fields.duration_minutes', 'Duration (min)')} />
    </Datagrid>
  );
};

export default function LessonList(props) {
  return (
    <List {...props} aside={<LessonListAside />} title="Listă Lecții" actions={<ListImportActions endpoint="lessons"/>}> 
      <FilteredDatagrid />
    </List>
  );
}
