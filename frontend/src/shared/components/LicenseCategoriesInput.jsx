import * as React from 'react';
import { useInput } from 'react-admin';
import TextField from '@mui/material/TextField';
import FormHelperText from '@mui/material/FormHelperText';
import { parseLicenseCategories, validateLicenseCategoriesClient } from '../validation/validators';

// Input that allows only [A-Z0-9,], auto uppercases, and keeps trailing comma while typing.
export default function LicenseCategoriesInput({ source = 'license_categories', validate = [], label, ...rest }) {
  const {
    field,
    fieldState: { error },
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

  const helper = error ? (typeof error.message === 'string' ? error.message : String(error.message)) : rest.helperText;

  return (
    <div>
      <TextField
        {...rest}
        label={label}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        inputProps={{ pattern: '[A-Z0-9,]*' }}
        placeholder="B,BE,C"
        fullWidth
      />
      {helper ? <FormHelperText error={!!error}>{helper}</FormHelperText> : null}
    </div>
  );
}
