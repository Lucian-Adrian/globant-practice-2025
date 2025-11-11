import * as React from 'react';
import { useInput } from 'react-admin';
import TextField from '@mui/material/TextField';
import { parseLicenseCategories, validateLicenseCategoriesClient } from '../validation/validators';

// Input that allows only [A-Z0-9,], auto uppercases, and keeps trailing comma while typing.
export default function LicenseCategoriesInput({ source = 'license_categories', validate = [], label, ...rest }) {
  const {
    field,
    fieldState: { error },
    id,
    isRequired,
  } = useInput({ source, validate: [validateLicenseCategoriesClient, ...validate], ...rest });

  const value = typeof field.value === 'string' ? field.value : '';

  const sanitize = (val) => (val || '').toUpperCase().replace(/[^A-Z0-9,]/g, '');

  const handleChange = (e) => {
    const raw = e.target.value;
    field.onChange(sanitize(raw));
  };

  const handleBlur = () => {
    // On blur, normalize tokens (dedupe/remove empty) but preserve valid commas during typing
    field.onChange(parseLicenseCategories(field.value || ''));
    field.onBlur();
  };

  // Normalize RA error payloads into plain strings
  let errorText = null;
  if (error && error.message) {
    if (typeof error.message === 'string') {
      if (error.message.startsWith('@@react-admin@@')) {
        try {
          const payload = JSON.parse(error.message.replace('@@react-admin@@', ''));
          errorText = payload?.message || String(payload) || 'Invalid value';
        } catch {
          errorText = error.message.replace('@@react-admin@@', '');
        }
      } else {
        errorText = error.message;
      }
    } else if (typeof error.message?.message === 'string') {
      errorText = error.message.message;
    } else {
      errorText = 'Invalid value';
    }
  }

  return (
    <div>
      <TextField
        {...rest}
        label={label}
        id={id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        inputProps={{ pattern: '[A-Z0-9,]*' }}
        placeholder="B,BE,C"
        error={!!errorText}
        helperText={errorText || rest.helperText}
        fullWidth
      />
    </div>
  );
}
