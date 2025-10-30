import * as React from 'react';
import { 
  Create, 
  SimpleForm, 
  ReferenceInput, 
  SelectInput, 
  DateTimeInput, 
  NumberInput, 
  TextInput, 
  useTranslate, 
  required 
} from 'react-admin';
import { validateLesson } from '../../shared/validation/lessonValidation';

export default function LessonCreate(props) {
  const t = useTranslate();
  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  return (
    
    <Create {...props}>
      <SimpleForm validate={async (values) => validateLesson(values, t)}>
        <ReferenceInput source="enrollment_id" reference="enrollments" perPage={50}>
          <SelectInput 
            label={t('resources.lessons.fields.enrollment', 'Enrollment')} 
            optionText={(r) => r.label || `#${r.id}`} 
            optionValue="id"
            emptyText={t('validation.requiredField')}
            parse={(v) => (v === '' ? null : Number(v))}
            format={(v) => (v == null ? '' : String(v))}
            SelectProps={{ MenuProps: { keepMounted: true } }}
            validate={[required()]}
          />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={50}>
          <SelectInput 
            label={t('resources.lessons.fields.instructor', 'Instructor')} 
            optionText={(r) => `${r.first_name} ${r.last_name}`} 
            optionValue="id"
            emptyText={t('validation.requiredField')}
            parse={(v) => (v === '' ? null : Number(v))}
            format={(v) => (v == null ? '' : String(v))}
            SelectProps={{ MenuProps: { keepMounted: true } }}
            validate={[required()]} 
          />
        </ReferenceInput>

        <ReferenceInput source="vehicle_id" reference="vehicles" perPage={50}>
          <SelectInput 
            label={t('resources.lessons.fields.vehicle', 'Vehicle')} 
            optionText={(r) => `${r.license_plate}`} 
            optionValue="id"
            emptyText={t('resources.lessons.fields.vehicle', 'Vehicle')}
            parse={(v) => (v === '' ? null : Number(v))}
            format={(v) => (v == null ? '' : String(v))}
            SelectProps={{ MenuProps: { keepMounted: true } }}
          />
        </ReferenceInput>

        <DateTimeInput 
          source="scheduled_time" 
          label={t('resources.lessons.fields.scheduled_time', 'Scheduled time')} 
          validate={[required()]} 
        />
        
        <NumberInput 
          source="duration_minutes" 
          label={t('resources.lessons.fields.duration_minutes', 'Duration (min)')} 
          defaultValue={90} 
        />
        
        <SelectInput
          source="status"
          label={t('filters.status', 'Status')}
          choices={statusChoices}
          defaultValue="SCHEDULED"
          SelectProps={{ MenuProps: { keepMounted: true } }}
        />
        <TextInput 
          source="notes" 
          label={t('resources.lessons.fields.notes', 'Notes')} 
          multiline 
          rows={2} 
        />
      </SimpleForm>
    </Create>
  );
}