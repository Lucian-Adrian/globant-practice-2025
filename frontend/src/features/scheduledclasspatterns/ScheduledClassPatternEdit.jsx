import * as React from 'react';
import { Edit, SimpleForm, TextInput, ReferenceInput, SelectInput, DateInput, NumberInput, ArrayInput, SimpleFormIterator, useTranslate, ReferenceArrayInput, SelectArrayInput, required, TopToolbar, ListButton, ShowButton, Button, useNotify } from 'react-admin';
import { useWatch, useFormContext } from 'react-hook-form';
import { validateTimeFormat } from '../../shared/validation/validators';
import Breadcrumb from '../../shared/components/Breadcrumb.jsx';
import { httpJson, API_PREFIX } from '../../api/httpClient';

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
      <SelectArrayInput label={t('resources.scheduledclasspatterns.fields.students', 'Students')} optionText={(r) => `${r.first_name} ${r.last_name}`} />
    </ReferenceArrayInput>
  );
};

export default function ScheduledClassPatternEdit(props) {
  const t = useTranslate();
  const notify = useNotify();

  const EditActions = () => (
    <TopToolbar>
      <ListButton />
      <ShowButton />
    </TopToolbar>
  );

  return (
    <>
      <Breadcrumb />
      <Edit {...props} actions={<EditActions />} transform={(data) => {
            const recurrences = data.recurrences || [];
            if (!recurrences.length) {
              throw new Error(t('validation.atLeastOneRecurrence', 'At least one recurrence is required'));
            }
            // Extract unique days and times using Set to avoid duplicates
            const uniqueDays = [...new Set(recurrences.map(r => r.day))];
            const uniqueTimes = [...new Set(recurrences.map(r => r.time))];

            return {
              ...data,
              recurrence_days: uniqueDays,
              times: uniqueTimes,
              recurrences: undefined, // clean up
            };
          }}>
        <SimpleForm 
          defaultValues={(record) => {
            const recurrences = [];
            // Backend uses Cross Product logic (all days x all times)
            // We expand this back to pairs for the UI
            if (record.recurrence_days && record.times) {
                for (const day of record.recurrence_days) {
                    for (const time of record.times) {
                        recurrences.push({ day, time });
                    }
                }
            }
            return {
                ...record,
                recurrences
            };
          }}
        >
          <TextInput source="name" label={t('resources.scheduledclasspatterns.fields.name', 'Name')} validate={[required()]} />
          <ReferenceInput source="course_id" reference="classes" perPage={100} filter={{ type: 'THEORY' }}>
            <SelectInput label={t('resources.scheduledclasspatterns.fields.course', 'Course')} optionText="name" optionValue="id" validate={[required()]} />
          </ReferenceInput>
          <ReferenceInput source="instructor_id" reference="instructors" perPage={100}>
            <SelectInput label={t('resources.scheduledclasspatterns.fields.instructor', 'Instructor')} optionText={(r) => `${r.first_name} ${r.last_name}`} optionValue="id" validate={[required()]} />
          </ReferenceInput>
        <ReferenceInput source="resource_id" reference="resources" perPage={100} filter={{ max_capacity_gte: 3 }}>
          <SelectInput label={t('resources.scheduledclasspatterns.fields.resource', 'Resource (Classroom)')} optionText={(r) => r.name || `${r.make} ${r.model}`} optionValue="id" validate={[required()]} />
        </ReferenceInput>          <ArrayInput source="recurrences" label={t('resources.scheduledclasspatterns.fields.recurrences', 'Recurrences')} validate={[required()]}>
            <SimpleFormIterator>
              <SelectInput source="day" label={t('resources.scheduledclasspatterns.fields.day', 'Day')} choices={[
                { id: 'MONDAY', name: t('common.days.MONDAY', 'Monday') },
                { id: 'TUESDAY', name: t('common.days.TUESDAY', 'Tuesday') },
                { id: 'WEDNESDAY', name: t('common.days.WEDNESDAY', 'Wednesday') },
                { id: 'THURSDAY', name: t('common.days.THURSDAY', 'Thursday') },
                { id: 'FRIDAY', name: t('common.days.FRIDAY', 'Friday') },
                { id: 'SATURDAY', name: t('common.days.SATURDAY', 'Saturday') },
                { id: 'SUNDAY', name: t('common.days.SUNDAY', 'Sunday') },
              ]} validate={[required()]} />
              <TextInput source="time" label={t('resources.scheduledclasspatterns.fields.time', 'Time')} validate={[required(), validateTimeFormat(t)]} />
            </SimpleFormIterator>
          </ArrayInput>

          <CheckAvailabilityButton />

          <DateInput 
            source="start_date" 
            label={t('scheduledclasspatterncreate.patternStartDate', 'Pattern Start Date')} 
            validate={[required()]}
          />
          <NumberInput source="num_lessons" label={t('scheduledclasspatterncreate.numberOfLessons', 'Number of Lessons')} validate={[required()]} />
          <NumberInput source="default_duration_minutes" label={t('scheduledclasspatterncreate.defaultDurationMin', 'Default Duration (min)')} defaultValue={60} />
          <NumberInput source="default_max_students" label={t('scheduledclasspatterncreate.defaultMaxStudents', 'Default Max Students')} />
          {/* Removed: status - patterns don't have status, only generated classes do */}
          <StudentsInput />
        </SimpleForm>
      </Edit>
    </>
  );
}