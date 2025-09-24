import * as React from 'react';
import { Create, SimpleForm, ReferenceInput, SelectInput, DateInput, NumberInput, TextInput, useTranslate, required } from 'react-admin';

export default function LessonCreate(props) {
  const t = useTranslate();

  const transform = (values) => {
    const v = { ...values };
    // Combine date from scheduled_time (DateInput) with time from scheduled_time_only,
    // then convert to an absolute instant (UTC) so it roundtrips correctly.
    const dateVal = v.scheduled_time; // string YYYY-MM-DD or Date
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
  try { console.debug('[LessonCreate.transform]', { dateVal, timeVal, dateStr, iso: v.scheduled_time }); } catch (_) {}
    }
    delete v.scheduled_time_only;
    return v;
  };

  return (
    <Create {...props} transform={transform}>
      <SimpleForm>
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
        <NumberInput source="duration_minutes" label={t('resources.lessons.fields.duration_minutes', 'Duration (min)')} defaultValue={50} />
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
    </Create>
  );
}
