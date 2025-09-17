import React from 'react';
import { CreateButton } from 'react-admin';
import ImportButton from './ImportButton';

// Generic empty state for a resource.
// Props: endpoint (string), message (string)
export default function ResourceEmptyState({ endpoint, message }) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '3rem 1rem',
    gap: '1.25rem',
  };
  const buttonsStyle = {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap', // will stack on narrow viewports
    alignItems: 'center',
    justifyContent: 'center',
  };
  return (
    <div style={containerStyle}>
      <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{message}</h2>
      <div style={buttonsStyle}>
        <CreateButton />
        <ImportButton endpoint={endpoint} />
      </div>
    </div>
  );
}
