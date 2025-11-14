import * as React from 'react';
import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, TimeInput, useTranslate } from 'react-admin';
import { validateTimeFormat } from '../../shared/validation/validators';

export default function ScheduledClassPatternEdit(props) {
  const t = useTranslate();
  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  return (
    <Edit {...props}>
      <SimpleForm>
        <TextInput source="name" label="Name" />
        <ReferenceInput source="course_id" reference="classes" perPage={100}>
          <SelectInput label="Course" optionText="name" optionValue="id" />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
          <SelectInput label="Instructor" optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" />
        </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100}>
          <SelectInput label="Resource" optionText={(r) => r.name || r.license_plate} optionValue="id" />
        </ReferenceInput>
        <ArrayInput source="recurrence_days" label="Recurrence Days">
          <SimpleFormIterator>
            <SelectInput source="" choices={[
              { id: 'MONDAY', name: 'Monday' },
              { id: 'TUESDAY', name: 'Tuesday' },
              { id: 'WEDNESDAY', name: 'Wednesday' },
              { id: 'THURSDAY', name: 'Thursday' },
              { id: 'FRIDAY', name: 'Friday' },
              { id: 'SATURDAY', name: 'Saturday' },
              { id: 'SUNDAY', name: 'Sunday' },
            ]} />
          </SimpleFormIterator>
        </ArrayInput>
        <ArrayInput source="times" label="Times">
          <SimpleFormIterator>
            <TimeInput source="" label="Time" validate={[validateTimeFormat]} />
          </SimpleFormIterator>
        </ArrayInput>
        <DateInput source="start_date" label="Start Date" />
        <NumberInput source="num_lessons" label="Number of Lessons" />
        <NumberInput source="duration_minutes" label="Duration (min)" />
        <NumberInput source="max_students" label="Max Students" />
        <SelectInput source="status" label="Status" choices={statusChoices} />
        <ReferenceArrayInput source="student_ids" reference="students" perPage={100}>
          <SelectArrayInput label="Students" optionText={(r) => `${r.first_name} ${r.last_name}`} />
        </ReferenceArrayInput>
      </SimpleForm>
    </Edit>
  );
}