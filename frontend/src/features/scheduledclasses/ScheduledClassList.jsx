import * as React from 'react';
import { List, Datagrid, TextField, FunctionField, NumberField, DateField, useTranslate, useListContext } from 'react-admin';
import { useLocation } from 'react-router-dom';
import ScheduledClassListEmpty from './ScheduledClassListEmpty.jsx';
import ScheduledClassListAside from './ScheduledClassListAside.jsx';
import ListImportActions from '../../shared/components/ListImportActions.jsx';
import { useAsidePanel } from '../../shared/state/AsidePanelContext.jsx';
import InstructorFilterInput from '../../shared/components/InstructorFilterInput.jsx';
import ResourceFilterInput from '../../shared/components/ResourceFilterInput.jsx';

// Client-side filtered datagrid (mirrors Lessons approach, without type filter)
const FilteredDatagrid = (props) => {
  const { data, isLoading } = useListContext();
  const location = useLocation();
  const t = useTranslate();

  const filteredData = React.useMemo(() => {
    if (isLoading || !data) return [];
    const params = new URLSearchParams(location.search);
    const filterValues = JSON.parse(params.get('filter') || '{}');

    if (Object.keys(filterValues).length === 0) return data;

    return data.filter((record) => {
      if (!record) return false;
      // status exact match
      if (filterValues.status && String(record.status) !== String(filterValues.status)) return false;
      // instructor id match
      if (filterValues.instructor_id && String(record?.instructor?.id) !== String(filterValues.instructor_id)) return false;
      // resource license_plate OR name match
      if (filterValues.resource_id) {
        const rid = record?.resource?.id;
        if (String(rid) !== String(filterValues.resource_id)) return false;
      }
      return true;
    });
  }, [data, location.search, isLoading]);

  return (
    <Datagrid {...props} data={filteredData} rowClick="edit">
      <NumberField source="id" label="ID" />
      <TextField source="name" label={t('resources.scheduledclasses.fields.name', 'Name')} />
      <TextField source="pattern.course.name" label={t('resources.scheduledclasses.fields.course', 'Course')} />
      <FunctionField
        label={t('resources.scheduledclasses.fields.instructor', 'Instructor')}
        render={(record) => (record?.instructor ? `${record.instructor.first_name || ''} ${record.instructor.last_name || ''}`.trim() : '')}
        sortable={false}
      />
      <FunctionField
        label={t('resources.scheduledclasses.fields.resource', 'Resource')}
        render={(record) => {
          if (!record?.resource) return '';
          return record.resource.license_plate || record.resource.name || '';
        }}
        sortable={false}
      />
      <DateField source="scheduled_time" label={t('resources.scheduledclasses.fields.scheduled_time', 'Scheduled time')} />
      <NumberField source="duration_minutes" label={t('resources.scheduledclasses.fields.duration_minutes', 'Duration (min)')} />
      <NumberField source="current_enrollment" label={t('resources.scheduledclasses.fields.current_enrollment', 'Current enrollment')} />
      <NumberField source="available_spots" label={t('resources.scheduledclasses.fields.available_spots', 'Available spots')} />
      <NumberField source="max_students" label={t('resources.scheduledclasses.fields.max_students', 'Max students')} />
      <FunctionField
        label={t('filters.status', { defaultValue: 'Status' })}
        render={(record) => {
          if (!record) return '';
          const status = String(record.status || '').toUpperCase();
          const key =
            status === 'SCHEDULED'
              ? 'filters.scheduled'
              : status === 'COMPLETED'
              ? 'filters.completed'
              : status === 'CANCELED'
              ? 'filters.canceled'
              : '';
          return key ? t(key, { defaultValue: record.status }) : record.status;
        }}
        sortable={false}
      />
    </Datagrid>
  );
};

export default function ScheduledClassList(props) {
  const t = useTranslate();
  const { collapsed } = useAsidePanel();
  const filters = [
    <InstructorFilterInput key="instructor" alwaysOn />,
    <ResourceFilterInput key="resource_id" source="resource_id" alwaysOn onlyClassrooms />,
  ];

  return (
    <List
      {...props}
      filters={filters}
      aside={collapsed ? null : <ScheduledClassListAside />}
      actions={<ListImportActions endpoint="scheduled-classes" />}
      exporter={false}
      title={t('resources.scheduledclasses.name', { defaultValue: 'Scheduled Classes' })}
      empty={<ScheduledClassListEmpty />}
      sort={{ field: 'id', order: 'DESC' }}
    >
      <FilteredDatagrid />
    </List>
  );
}
