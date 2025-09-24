import React from 'react';
import { Button, useNotify, useRefresh } from 'react-admin';

// Reusable Import button component reusing the previous inline logic from App.jsx.
// Props:
// - endpoint (string) required: API endpoint segment e.g. "students"
// - label (string) optional: button label (defaults to "Import")
// NOTE: Keeps the exact behavior (FormData POST to /api/<endpoint>/import/ then refresh + notify)
export default function ImportButton({ endpoint, label = 'Import', disabled }) {
  const fileInputRef = React.useRef(null);
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = React.useState(false);

  const onClick = () => fileInputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      const form = new FormData();
      form.append('file', file);
      const resp = await fetch(`/api/${endpoint}/import/`, { method: 'POST', body: form });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Import failed');
      }
      const json = await resp.json();
      notify(`Imported ${json.created} ${endpoint}`, { type: 'info' });
      refresh();
    } catch (err) {
      notify(err.message || 'Import failed', { type: 'warning' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLoading(false);
    }
  };

  return (
    <>
      <Button label={label} onClick={onClick} disabled={disabled || loading} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".csv,text/csv"
        style={{ display: 'none' }}
      />
    </>
  );
}
