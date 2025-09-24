import * as React from 'react';
import { Button, useNotify, useRefresh } from 'react-admin';

export default function ImportButton({ label = 'Import CSV', accept = '.csv,text/csv', onImport }) {
  const notify = useNotify();
  const refresh = useRefresh();
  const fileRef = React.useRef(null);

  const onClick = () => fileRef.current?.click();

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (typeof onImport !== 'function') throw new Error('onImport handler is required');
      const result = await onImport(file);
      if (result && typeof result.message === 'string') {
        notify(result.message, { type: 'info' });
      } else {
        notify('Import completed', { type: 'info' });
      }
      refresh();
    } catch (err) {
      notify(err.message || 'Import failed', { type: 'warning' });
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <>
      <Button label={label} onClick={onClick} />
      <input type="file" ref={fileRef} onChange={onChange} accept={accept} style={{ display: 'none' }} />
    </>
  );
}
