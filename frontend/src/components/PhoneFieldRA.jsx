import React from 'react';
import { TextInput } from 'react-admin';
import { sanitizePhone } from '../validation/validators';

const PhoneFieldRA = ({ defaultValue = '+373', ...props }) => {
  const parse = (value) => sanitizePhone(value ?? '');
  const onBlur = (event) => {
    const v = event.target.value;
    if (!v || v === '+') {
      // Reset to default prefix
      event.target.value = defaultValue;
      // Trigger change event for react-hook-form
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(event.target, defaultValue);
      event.target.dispatchEvent(new Event('input', { bubbles: true }));
    }
    props.onBlur && props.onBlur(event);
  };
  // Prevent non-digit and non-plus characters via inputMode and sanitization
  return (
    <TextInput
      {...props}
      inputMode="tel"
      defaultValue={defaultValue}
      parse={parse}
      onBlur={onBlur}
    />
  );
};

export default PhoneFieldRA;
