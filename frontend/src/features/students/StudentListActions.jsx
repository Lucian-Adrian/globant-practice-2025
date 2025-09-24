import * as React from 'react';
import { TopToolbar, Button, CreateButton, useListContext, useNotify, useRefresh } from 'react-admin';
// Prefer centralized http client for token injection
import { rawFetch, API_PREFIX } from '../../api/httpClient';
import ImportButton from '../../shared/components/ImportButton';

// Use relative base URL for endpoints
const baseApi = API_PREFIX;

// Build only filter + sort query (no pagination)
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

export default function StudentListActions() {
  const { filterValues, sort } = useListContext();
  const notify = useNotify();
  const refresh = useRefresh();

  const fetchAuthed = rawFetch; // already injects Authorization header

  const onExport = async () => {
    try {
      const qs = buildFilterSortQuery(filterValues, sort);
      const url = `${baseApi}/students/export/${qs ? `?${qs}` : ''}`;
      const resp = await fetchAuthed(url, { method: 'GET' });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || 'Export failed');
      }
      const blob = await resp.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = 'students.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dlUrl);
    } catch (e) {
      notify(e.message || 'Export failed', { type: 'warning' });
    }
  };

  const onImport = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const resp = await fetchAuthed(`${baseApi}/students/import/`, {
      method: 'POST',
      body: form,
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.detail || 'Import failed');
    }
    const json = await resp.json();
    return { message: `Imported ${json.created} students` };
  };

  return (
    <TopToolbar>
      <CreateButton />
      <ImportButton label="Import CSV" accept=".csv,text/csv" onImport={onImport} />
      <Button label="Export CSV" onClick={onExport} />
    </TopToolbar>
  );
}
