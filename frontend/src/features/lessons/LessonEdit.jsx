import * as React from 'react';
import { Edit, SimpleForm, ReferenceInput, SelectInput, DateInput, NumberInput, TextInput, useTranslate, useRecordContext, required } from 'react-admin';
import { useFormContext } from 'react-hook-form';

export default function LessonEdit(props) {
  const t = useTranslate();
  // Initialize the time field from existing record.scheduled_time
  const InitTimeFromRecord = () => {
    const record = useRecordContext();
    const { setValue, getValues } = useFormContext();
    React.useEffect(() => {
      if (!record?.scheduled_time) return;
      const current = getValues('scheduled_time_only');
      if (current) return; // already set (user edited or default applied)
      try {
        const d = new Date(record.scheduled_time);
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        setValue('scheduled_time_only', `${hh}:${mi}`, { shouldValidate: false, shouldDirty: false });
      } catch (_) {
        // noop
      }
    }, [record, setValue, getValues]);
    return null;
  };
  const transform = (values) => {
    const v = { ...values };
    const dateVal = v.scheduled_time;
    const timeVal = v.scheduled_time_only || '00:00';
    if (dateVal) {
      const pad = (n) => String(n).padStart(2, '0');
      const toYmd = (dv) => {
        const d = dv instanceof Date ? dv : new Date(dv);
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        return `${yyyy}-${mm}-${dd}`;
      };
      const dateStr = typeof dateVal === 'string' && /\d{4}-\d{2}-\d{2}/.test(dateVal)
        ? dateVal
        : toYmd(dateVal);
  const [hh, mi] = String(timeVal).split(':');
  const local = new Date(`${dateStr}T00:00:00`);
  local.setHours(Number(hh || 0), Number(mi || 0), 0, 0);
  v.scheduled_time = local.toISOString();
  try { console.debug('[LessonEdit.transform]', { dateVal, timeVal, dateStr, iso: v.scheduled_time }); } catch (_) {}
    }
    delete v.scheduled_time_only;
    return v;
  };
  return (
    <Edit {...props} transform={transform}>
      <SimpleForm>
        <InitTimeFromRecord />
        <ReferenceInput source="enrollment_id" reference="enrollments" perPage={50}>
          <SelectInput label={t('resources.lessons.fields.enrollment', 'Enrollment')} optionText={(r) => r.label || `#${r.id}`} validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={50}>
          <SelectInput label={t('resources.lessons.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="vehicle" reference="vehicles" perPage={50}>
          <SelectInput label={t('resources.lessons.fields.vehicle', 'Vehicle')} optionText={(r) => `${r.license_plate}`} />
        </ReferenceInput>
  <DateInput source="scheduled_time" label={t('resources.lessons.fields.scheduled_time', 'Scheduled time')} validate={[required()]} />
  <TextInput source="scheduled_time_only" type="time" label={t('resources.lessons.fields.time', 'Time')} validate={[required()]} />
        <NumberInput source="duration_minutes" label={t('resources.lessons.fields.duration_minutes', 'Duration (min)')} />
        <SelectInput
          source="status"
          label={t('filters.status', 'Status')}
          choices={[
            { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
            { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
            { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
          ]}
        />
        <TextInput source="notes" label={t('resources.lessons.fields.notes', 'Notes')} multiline rows={2} />
      </SimpleForm>
    </Edit>
  );
}
