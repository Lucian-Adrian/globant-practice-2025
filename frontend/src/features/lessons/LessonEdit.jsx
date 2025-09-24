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

export default function LessonEdit(props) {
  const t = useTranslate();
  return (
    <Edit {...props}>
      <SimpleForm>
        <ReferenceInput source="enrollment_id" reference="enrollments" perPage={50}>
          <SelectInput 
            label={t('resources.lessons.fields.enrollment', 'Enrollment')} 
            optionText={(r) => r.label || `#${r.id}`} 
            validate={[required()]} 
          />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={50}>
          <SelectInput 
            label={t('resources.lessons.fields.instructor', 'Instructor')} 
            optionText={(r) => `${r.first_name} ${r.last_name}`} 
            validate={[required()]} 
          />
        </ReferenceInput>
        <ReferenceInput source="vehicle_id" reference="vehicles" perPage={50}>
          <SelectInput 
            label={t('resources.lessons.fields.vehicle', 'Vehicle')} 
            optionText={(r) => `${r.license_plate}`} 
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