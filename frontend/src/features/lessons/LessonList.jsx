import * as React from 'react';
import { List, Datagrid, NumberField, TextField, DateField, ReferenceField, FunctionField, useListContext, useTranslate } from 'react-admin';
import { Chip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import LessonListAside from './LessonListAside.jsx';
import LessonListEmpty from './LessonListEmpty.jsx';
import ListImportActions from '../../shared/components/ListImportActions';

// Function to determine lesson status based solely on backend status
const getLessonStatus = (record) => {
  if (!record) return { status: 'SCHEDULED', color: 'primary' };
  if (record.status === 'COMPLETED') return { status: 'COMPLETED', color: 'success' };
  if (record.status === 'CANCELED') return { status: 'CANCELED', color: 'error' };
  // Default and any other value treated as SCHEDULED
  return { status: 'SCHEDULED', color: 'primary' };
};

// Map lesson status codes to translation keys
const statusToTranslationKey = {
  COMPLETED: 'filters.completed',
  CANCELED: 'filters.canceled',
  SCHEDULED: 'filters.scheduled',
};

const LessonStatusField = ({ record }) => {
  const t = useTranslate();
  if (!record) return null;
  const { status, color } = getLessonStatus(record);
  const labelKey = statusToTranslationKey[status] || 'unknown';
  const label = t(labelKey, { defaultValue: status });
  return <Chip label={label} color={color} size="small" />;
};

const FilteredDatagrid = (props) => {
  // This custom datagrid performs client-side filtering.
  // Note: For large datasets, server-side filtering is generally preferred.
  const { data, isLoading } = useListContext();
  const location = useLocation();
  const t = useTranslate();

  const filteredData = React.useMemo(() => {
    if (isLoading || !data) return [];
    
    const params = new URLSearchParams(location.search);
    const filterValues = JSON.parse(params.get('filter') || '{}');
    
    if (Object.keys(filterValues).length === 0) {
      return data;
    }

    return data.filter(record => {
      const { status: derivedStatus } = getLessonStatus(record);
      if (filterValues.status && derivedStatus !== filterValues.status) return false;
      if (filterValues.instructor_id && String(record.instructor.id) !== String(filterValues.instructor_id)) return false;
      // Additional filters can be added here
      return true;
    });
  }, [data, location.search, isLoading]);

  return (
    <Datagrid
      {...props}
      data={filteredData}
      rowClick="edit"
      sx={{
        '& .RaDatagrid-row': {
          '&[data-lesson-status="COMPLETED"]': { backgroundColor: '#f1f8e9', '&:hover': { backgroundColor: '#e8f5e8' } },
          '&[data-lesson-status="CANCELED"]': { backgroundColor: '#ffebee', '&:hover': { backgroundColor: '#ffcdd2' } }
        }
      }}
      rowStyle={(record) => ({ 'data-lesson-status': getLessonStatus(record).status })}
    >
      <NumberField source="id" label="ID" />
      <FunctionField
        label={t('filters.status', { defaultValue: 'Status' })}
        render={(record) => <LessonStatusField record={record} />}
        sortable={false}
      />
      <ReferenceField source="enrollment.id" reference="enrollments" label={t('resources.lessons.fields.enrollment')}>
        <TextField source="label" />
      </ReferenceField>
      <ReferenceField source="instructor.id" reference="instructors" label={t('resources.lessons.fields.instructor')}>
        <FunctionField render={record => record ? `${record.first_name} ${record.last_name}` : ''} />
      </ReferenceField>
      <TextField source="vehicle.license_plate" label={t('resources.lessons.fields.vehicle')} />
      <DateField
        source="scheduled_time"
        label={t('resources.lessons.fields.scheduled_time')}
      />
      <FunctionField
        label={t('resources.lessons.fields.time', { defaultValue: 'Time' })}
        render={(record) => {
          if (!record?.scheduled_time) return '';
          try {
            return new Date(record.scheduled_time).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
          } catch (_) {
            return new Date(record.scheduled_time).toISOString().substring(11, 16);
          }
        }}
        sortable={false}
      />
      <NumberField source="duration_minutes" label={t('resources.lessons.fields.duration_minutes')} />
    </Datagrid>
  );
};

export default function LessonList(props) {
  const t = useTranslate();
  return (
    <List 
      {...props} 
      aside={<LessonListAside />} 
      title={t('resources.lessons.name', { defaultValue: 'Lessons' })}
      actions={<ListImportActions endpoint="lessons"/>}
      empty={<LessonListEmpty />}
      // Disable server-side sorting when using client-side filtering/display
      sort={{ field: 'id', order: 'DESC' }}
    >
      <FilteredDatagrid />
    </List>
  );
}