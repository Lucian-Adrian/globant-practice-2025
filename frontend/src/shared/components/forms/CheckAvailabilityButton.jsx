/**
 * CheckAvailabilityButton - Check instructor availability for recurrences
 * 
 * This component is used in ScheduledClass and ScheduledClassPattern forms
 * to verify that the selected instructor is available at the specified times.
 */
import * as React from 'react';
import { Button, useTranslate, useNotify } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { httpJson, API_PREFIX } from '../../../api/httpClient';

/**
 * Button component that checks instructor availability for the selected recurrences.
 * Must be used inside a react-hook-form context.
 */
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

export default CheckAvailabilityButton;
