import React, { useEffect } from 'react';
import { Toolbar, SaveButton } from 'react-admin';
import { useFormState, useFormContext } from 'react-hook-form';

const DisabledUntilValidToolbar = ({ isEdit = false, ...props }) => {
  const { control, trigger } = useFormContext();
  const { isValid, isSubmitting, isDirty, errors } = useFormState({
    control,
    subscription: { isValid: true, isSubmitting: true, isDirty: true },
  });
  const disabled = (!isValid) || isSubmitting || (isEdit && !isDirty);
  // Ensure initial validation runs so isValid reflects current values (e.g., Edit forms)
  useEffect(() => {
    // Fire after fields register
    const t = setTimeout(() => { trigger(); }, 0);
    return () => clearTimeout(t);
  }, [trigger]);
  // Temporary debug log of toolbar state
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('Toolbar state:', { isValid, isDirty, isSubmitting, errors });
  }, [isValid, isDirty, isSubmitting, errors]);
  return (
    <Toolbar {...props}>
      <SaveButton disabled={disabled} />
    </Toolbar>
  );
};

export default DisabledUntilValidToolbar;
