import * as React from 'react';
import { List, Datagrid, TextField,  FunctionField, NumberField, DateField, useTranslate } from 'react-admin';
import ScheduledClassListEmpty from './ScheduledClassListEmpty.jsx';
import ListImportActions from '../../shared/components/ListImportActions.jsx';

export default function ScheduledClassList(props) {
  const t = useTranslate();
  // No filters or aside panel for this list per requirements

  return (
    <List 
      {...props}
      actions={<ListImportActions endpoint="scheduled-classes" />}
      exporter={false}
      title={t('resources.scheduledclasses.name', { defaultValue: 'Scheduled Classes' })}
      empty={<ScheduledClassListEmpty />}
      sort={{ field: 'scheduled_time', order: 'DESC' }}
    >
      <Datagrid rowClick="edit">
        <TextField source="name" label={t('resources.scheduledclasses.fields.name', 'Name')} />
        <TextField source="course.name" label={t('resources.scheduledclasses.fields.course', 'Course')} />
        <TextField source="instructor.full_name" label={t('resources.scheduledclasses.fields.instructor', 'Instructor')} />
        <TextField source="resource.name" label={t('resources.scheduledclasses.fields.resource', 'Resource')} />
        <DateField source="scheduled_time" label={t('resources.scheduledclasses.fields.scheduled_time', 'Scheduled time')} />
        <NumberField source="duration_minutes" label={t('resources.scheduledclasses.fields.duration_minutes', 'Duration (min)')} />
        <NumberField source="current_enrollment" label={t('resources.scheduledclasses.fields.current_enrollment', 'Current enrollment')} />
        <NumberField source="available_spots" label={t('resources.scheduledclasses.fields.available_spots', 'Available spots')} />
        <NumberField source="max_students" label={t('resources.scheduledclasses.fields.max_students', 'Max students')} />
        <FunctionField
            label={t('filters.status', { defaultValue: 'Status' })}
            render={(record) => {
                if (!record) return '';
                const key = (record.status || '').toLowerCase();
                return t(`filters.${key}`, { defaultValue: record.status });
            }}
            />
      </Datagrid>
    </List>
  );
}
