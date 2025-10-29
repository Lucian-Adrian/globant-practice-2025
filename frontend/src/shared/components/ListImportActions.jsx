import * as React from 'react';
import { TopToolbar, CreateButton, Button, useListContext, useNotify, useRefresh } from 'react-admin';
import ImportButton from './ImportButton';
import { rawFetch, API_PREFIX } from '../../api/httpClient';

export default function ListImportActions({ endpoint, label = 'ra.custom.import_csv', accept = '.csv,text/csv' }) {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();
  const fetchAuthed = rawFetch;

  const buildFilterSortQuery = (filterValues, sort) => {
    const query = new URLSearchParams();
    if (filterValues) {
      Object.entries(filterValues).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        const m = k.match(/^(.*)_(gte|lte|gt|lt)$/);
        const key = m ? `${m[1]}__${m[2]}` : k;
        query.set(key, String(v));
      });
    }
    if (sort && sort.field) {
      const { field, order } = sort;
      const ordering = order === 'DESC' ? `-${field}` : field;
      query.set('ordering', ordering);
    }
    return query.toString();
  };

  const onImport = async (file) => {
    try {
      const form = new FormData();
      form.append('file', file);
      const resp = await fetchAuthed(`${API_PREFIX}/${endpoint}/import/`, { method: 'POST', body: form });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Import failed');
      }
      const json = await resp.json();
      return { message: `Imported ${json.created || json.count || 0} records` };
    } catch (err) {
      throw err;
    }
  };

  const onExport = async () => {
    try {
      const qs = buildFilterSortQuery(filterValues, sort);
      const url = `${API_PREFIX}/${endpoint}/export/${qs ? `?${qs}` : ''}`;
      const resp = await fetchAuthed(url, { method: 'GET' });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Export failed');
      }
      const blob = await resp.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `${endpoint}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
    } catch (e) {
      notify(e.message || 'Export failed', { type: 'warning' });
    }
  };

  return (
    <TopToolbar>
      <CreateButton />
  <ImportButton label={label} accept={accept} onImport={onImport} />
  <Button label="ra.custom.export_csv" onClick={onExport} />
    </TopToolbar>
  );
}
