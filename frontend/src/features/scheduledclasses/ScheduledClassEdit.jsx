import * as React from 'react';
import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, DateTimeInput, NumberInput, useTranslate, required, ReferenceArrayInput, SelectArrayInput, Button, useNotify } from 'react-admin';
import { useWatch } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { validateScheduledClass } from '../../shared/validation/lessonValidation';
import { httpJson, API_PREFIX } from '../../api/httpClient';

const CheckAvailabilityButton = () => {
  const t = useTranslate();
  const notify = useNotify();
  const { getValues } = useFormContext();

  const checkAvailability = async () => {
    const values = getValues();
    const instructorId = values.instructor_id;
    const scheduledTime = values.scheduled_time;
    if (!instructorId) {
      notify(t('validation.selectInstructorFirst', 'Please select an instructor first'), { type: 'warning' });
      return;
    }
    if (!scheduledTime) {
      notify(t('validation.selectTimeFirst', 'Please select a scheduled time first'), { type: 'warning' });
      return;
    }
    try {
      // Extract day and time from scheduled_time
      const date = new Date(scheduledTime);
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const day = days[date.getDay()];
      const time = date.toTimeString().slice(0, 5); // HH:MM
      const response = await httpJson(`${API_PREFIX}/instructor-availabilities/?instructor_id=${instructorId}&day=${day}`);
      const json = response.json;
      const availabilities = (json && Array.isArray(json.results)) ? json.results : (Array.isArray(json) ? json : []);
      const isAvailable = availabilities.some(avail => avail.hours.includes(time));
      if (isAvailable) {
        notify(t('availability.available', 'Instructor is available at this time'), { type: 'success' });
      } else {
        notify(t('availability.notAvailable', 'Instructor is not available at this time'), { type: 'warning' });
      }
    } catch (error) {
      console.error('Availability check failed:', error);
      notify(t('availability.checkFailed', `Failed to check availability: ${error.message}`), { type: 'error' });
    }
  };

  return <Button label={t('buttons.checkAvailability', 'Check Availability')} onClick={checkAvailability} />;
};

const StudentsInput = () => {
  const t = useTranslate();
  const courseId = useWatch({ name: 'course_id' });
  return (
    <ReferenceArrayInput 
      source="student_ids" 
      reference="students" 
      perPage={100}
      filter={courseId ? { enrollments: courseId } : {}}
    >
      <SelectArrayInput label={t('resources.scheduledclasses.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} />
    </ReferenceArrayInput>
  );
};

export default function ScheduledClassEdit(props) {
  const t = useTranslate();
  const notify = useNotify();
  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  return (
    <Edit {...props}>
      <SimpleForm validate={async (values) => validateScheduledClass(values, t, values?.id)}>
        <TextInput source="id" label="ID" disabled />
        <TextInput source="name" label={t('resources.scheduledclasses.fields.name', 'Name')} validate={[required()]} />
        <ReferenceInput source="course_id" reference="classes" perPage={100} filter={{ type: 'THEORY' }}>
          <SelectInput label={t('resources.scheduledclasses.fields.course', 'Course')} optionText={(r) => r.name} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
          <SelectInput label={t('resources.scheduledclasses.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100} filter={{ max_capacity_gte: 3 }}>
          <SelectInput label={t('resources.scheduledclasses.fields.resource', 'Resource (Classroom)')} optionText={(r) => r.name || `${r.make} ${r.model}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>
        <DateTimeInput source="scheduled_time" label={t('resources.scheduledclasses.fields.scheduled_time', 'Scheduled time')} validate={[required()]} />
        <CheckAvailabilityButton />
        <NumberInput source="duration_minutes" label={t('resources.scheduledclasses.fields.duration_minutes', 'Duration (min)')} />
        <NumberInput source="max_students" label={t('resources.scheduledclasses.fields.max_students', 'Max students')} />
        <NumberInput source="current_enrollment" label={t('resources.scheduledclasses.fields.current_enrollment', 'Current enrollment')} disabled />
        <NumberInput source="available_spots" label={t('resources.scheduledclasses.fields.available_spots', 'Available spots')} disabled />
        <SelectInput source="status" label={t('filters.status', 'Status')} choices={statusChoices} />
        <StudentsInput />
        {/* Placeholder for future enroll/unenroll buttons */}
      </SimpleForm>
    </Edit>
  );
}
