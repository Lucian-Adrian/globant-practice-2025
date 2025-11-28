/**
 * CheckSingleTimeAvailabilityButton - Check instructor availability for a single scheduled time
 * 
 * This component is used in ScheduledClass Edit forms to verify that the 
 * selected instructor is available at the specified scheduled time.
 * 
 * Unlike CheckAvailabilityButton (which checks recurrences), this checks a single datetime.
 */
import * as React from 'react';
import { Button, useTranslate, useNotify } from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { httpJson, API_PREFIX } from '../../../api/httpClient';

/**
 * Button component that checks instructor availability for a single scheduled time.
 * Must be used inside a react-hook-form context with instructor_id and scheduled_time fields.
 */
const CheckSingleTimeAvailabilityButton = () => {
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

export default CheckSingleTimeAvailabilityButton;
