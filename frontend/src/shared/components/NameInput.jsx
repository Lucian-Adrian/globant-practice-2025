import * as React from 'react';
import { TextInput } from 'react-admin';

// Reusable name input enforcing allowed characters (letters, spaces, hyphen, apostrophe)
const NAME_ALLOWED = /[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g;

export function NameInput(props) {
  return (
    <TextInput
      {...props}
      parse={(v) => (v ? v.replace(NAME_ALLOWED, '') : v)}
    />
  );
}

export default NameInput;
