import * as React from 'react';
import { TextInput } from 'react-admin';

// License plate: letters & digits only, no spaces or symbols. Always uppercase.
const CLEAN = /[^A-Za-z0-9]/g;

export function LicensePlateInput(props) {
  return (
    <TextInput
      {...props}
      parse={(v) => (v ? v.replace(CLEAN, '').toUpperCase() : v)}
      onPaste={(e) => {
        const data = e.clipboardData.getData('text');
        const cleaned = data.replace(CLEAN, '').toUpperCase();
        e.preventDefault();
        const input = e.currentTarget;
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const value = input.value;
        const next = (value.slice(0, start) + cleaned + value.slice(end)).replace(CLEAN, '').toUpperCase();
        // Defer so RA state picks it up
        requestAnimationFrame(() => {
          input.value = next;
          // trigger native input event for react-hook-form
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      }}
    />
  );
}

export default LicensePlateInput;
