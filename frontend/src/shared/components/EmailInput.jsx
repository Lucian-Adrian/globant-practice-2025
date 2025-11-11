import * as React from 'react';
import { TextInput } from 'react-admin';
import { validateEmail } from '../validation/validators';

// Reusable Email input: forces lowercase on parse and applies shared validator
export default function EmailInput(props) {
  return (
    <TextInput
      {...props}
      type="email"
      validate={[validateEmail, ...(props.validate || [])]}
      parse={(v) => (v ? String(v).trim().toLowerCase() : v)}
    />
  );
}
