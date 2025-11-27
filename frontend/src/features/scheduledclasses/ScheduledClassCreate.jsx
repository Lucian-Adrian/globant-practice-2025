import * as React from 'react';
import { Create, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, ReferenceArrayInput, SelectArrayInput, useCreate, useRedirect, useNotify, required, Button } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';
import { httpJson, API_PREFIX } from '../../api/httpClient';
import { validateScheduledClass } from '../../shared/validation/lessonValidation';

const CheckAvailabilityButton = () => {
  const t = useTranslate();
  const notify = useNotify();
  const { getValues } = useFormContext();

  const checkAvailability = async () => {
    const values = getValues();
    const instructorId = values.instructor_id;
    const recurrences = values.recurrences || [];
    if (!instructorId) {
      notify(t('validation.selectInstructorFirst', 'Please select an instructor first'), { type: 'warning' });
      return;
    }
    if (!recurrences.length) {
      notify(t('validation.atLeastOneRecurrence', 'At least one recurrence is required'), { type: 'warning' });
      return;
    }
    try {
      const results = await Promise.all(recurrences.map(async (rec) => {
        const day = rec.day;
        const time = rec.time;
        const response = await httpJson(`${API_PREFIX}/instructor-availabilities/?instructor_id=${instructorId}&day=${day}`);
        const json = response.json;
        const availabilities = (json && Array.isArray(json.results)) ? json.results : (Array.isArray(json) ? json : []);
        const isAvailable = availabilities.some(avail => avail.hours.includes(time));
        return { day, time, isAvailable };
      }));
      const unavailable = results.filter(r => !r.isAvailable);
      if (unavailable.length === 0) {
        notify(t('availability.allAvailable', 'All selected times are available'), { type: 'success' });
      } else {
        const msg = unavailable.map(r => `${r.day} ${r.time}`).join(', ');
        notify(t('availability.notAvailable', `Not available: ${msg}`), { type: 'warning' });
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

export default function ScheduledClassCreate(props) {
  const t = useTranslate();
  const [create] = useCreate();
  const redirect = useRedirect();
  const notify = useNotify();

  const statusChoices = React.useMemo(() => [
    { id: 'SCHEDULED', name: t('filters.scheduled', 'Scheduled') },
    { id: 'COMPLETED', name: t('filters.completed', 'Completed') },
    { id: 'CANCELED', name: t('filters.canceled', 'Canceled') },
  ], [t]);

  const handleSubmit = (data) => {
    const recurrences = data.recurrences || [];
    const recurrence_days = recurrences.map(r => r.day);
    const times = recurrences.map(r => r.time);

    // Create the pattern
    const patternData = {
      name: data.name,
      course_id: data.course_id,
      instructor_id: data.instructor_id,
      resource_id: data.resource_id,
      recurrence_days: recurrence_days,
      times: times,
      start_date: data.start_date,
      num_lessons: data.num_lessons,
      duration_minutes: data.duration_minutes || 60,
      max_students: data.max_students,
      status: data.status || 'SCHEDULED',
      student_ids: data.student_ids || [],
    };

    create('scheduledclasspatterns', { data: patternData }, {
      onSuccess: (pattern) => {
        // Generate the ScheduledClasses using direct HTTP call to action
        const generateUrl = `${API_PREFIX}/scheduled-class-patterns/${pattern.id}/generate-classes/`;
        httpJson(generateUrl, { method: 'POST' })
          .then(() => {
            notify(t('scheduledclasscreate.patternCreatedSuccess', 'Pattern and scheduled classes created successfully.'), { type: 'success' });
            redirect('/scheduledclasses');
          })
          .catch(() => {
            notify(t('scheduledclasscreate.patternCreatedError', 'Pattern created but failed to generate classes.'), { type: 'error' });
          });
      },
      onError: (error) => {
        notify(t('scheduledclasscreate.patternCreateError', 'Error creating pattern'), { type: 'error' });
      },
    });
  };

  return (
    <Create {...props}>
      <SimpleForm onSubmit={handleSubmit}>
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
        <ArrayInput source="recurrences" label={t('resources.scheduledclasses.fields.recurrences', 'Recurrences')} validate={[required()]}>
          <SimpleFormIterator>
            <SelectInput source="day" label={t('resources.scheduledclasses.fields.day', 'Day')} choices={[
              { id: 'MONDAY', name: 'Monday' },
              { id: 'TUESDAY', name: 'Tuesday' },
              { id: 'WEDNESDAY', name: 'Wednesday' },
              { id: 'THURSDAY', name: 'Thursday' },
              { id: 'FRIDAY', name: 'Friday' },
              { id: 'SATURDAY', name: 'Saturday' },
              { id: 'SUNDAY', name: 'Sunday' },
            ]} validate={[required()]} />
            <TextInput source="time" label={t('resources.scheduledclasses.fields.time', 'Time')} placeholder="HH:MM" validate={[required()]} />
          </SimpleFormIterator>
        </ArrayInput>
        <CheckAvailabilityButton />
        <DateInput source="start_date" label="Start Date" validate={[required()]} />
        <NumberInput source="num_lessons" label="Number of Lessons" validate={[required()]} />
        <NumberInput source="duration_minutes" label="Duration (min)" defaultValue={60} />
        <NumberInput source="max_students" label="Max Students" />
        <SelectInput source="status" label="Status" choices={statusChoices} defaultValue="SCHEDULED" />
        <StudentsInput />
      </SimpleForm>
    </Create>
  );
}