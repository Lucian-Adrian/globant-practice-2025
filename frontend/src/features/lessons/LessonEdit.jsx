import * as React from 'react';
import { 
    Edit, 
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

export default function LessonEdit(props) {
  const t = useTranslate();
  return (
    <Edit {...props}>
      <SimpleForm validate={async (values) => validateLesson(values, t, values?.id)}>
        <ReferenceInput source="enrollment_id" reference="enrollments" perPage={50} filter={{ type: 'PRACTICE' }}>
          <SelectInput 
            label={t('resources.lessons.fields.enrollment', 'Enrollment')} 
            optionText={(r) => r.label || `#${r.id}`} 
            optionValue="id"
            emptyText={t('validation.requiredField')}
            parse={(v) => (v === '' ? null : Number(v))}
            format={(v) => (v == null ? '' : String(v))}
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
        <ReferenceInput
          source="resource_id"
          reference="resources"
          perPage={200}
          filter={{ max_capacity: 2 }}
          sort={{ field: 'license_plate', order: 'ASC' }}
        >
          <SelectInput
            label={t('resources.lessons.fields.resource', 'Resource')}
            optionText={(r) => r.license_plate || r.name || '—'}
            optionValue="id"
            emptyText={t('resources.lessons.fields.resource', 'Resource')}
            parse={(v) => (v === '' ? null : Number(v))}
            format={(v) => (v == null ? '' : String(v))}
            SelectProps={{ MenuProps: { keepMounted: true } }}
            validate={[required()]}
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
        />
        
        <SelectInput
          source="status"
          label={t('filters.status', 'Status')}
          choices={[
            { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
            { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
            { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
          ]}
          SelectProps={{ MenuProps: { keepMounted: true } }}
        />
        <TextInput 
          source="notes" 
          label={t('resources.lessons.fields.notes', 'Notes')} 
          multiline 
          rows={2} 
        />
      </SimpleForm>
    </Edit>
  );
}