import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { CreateButton, useTranslate } from 'react-admin';
import ImportButton from '../../shared/components/ImportButton';
import { rawFetch, API_PREFIX } from '../../api/httpClient';

export default function ResourceListEmpty() {
  const t = useTranslate();
  const onImport = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const resp = await rawFetch(`${API_PREFIX}/resources/import/`, { method: 'POST', body: form });
    if (!resp.ok) {
      let detail = 'Import failed';
      try { const err = await resp.json(); detail = err.detail || detail; } catch (_) {}
      throw new Error(detail);
    }
    const json = await resp.json();
    if (json.errors && json.errors.length) {
      const header = 'row,field,error';
      const lines = json.errors.flatMap(e => {
        const rowNum = e.row ?? '';
        return Object.entries(e.errors || {}).map(([field, msgs]) => {
          const msgStr = Array.isArray(msgs) ? msgs.join('|') : String(msgs);
          return `${rowNum},${field},"${msgStr.replace(/"/g,'""')}"`;
        });
      });
      const csv = [header, ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'resource_import_errors.csv';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      return { message: `Imported ${json.created} / errors: ${json.errors.length}` };
    }
    return { message: `Imported ${json.created} resources` };
  };

  return (
    <Box width="100%" mt={4} display="flex" justifyContent="center">
      <Stack spacing={2} maxWidth={600} textAlign="center">
        <Typography variant="h5">{t('resources.resources.empty', 'No resources yet')}</Typography>
        <Typography variant="body1" color="text.secondary">{t('resources.resources.import_helper', 'Import resources via CSV or create manually.')}</Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <CreateButton />
          <ImportButton label={t('ra.custom.import_csv', 'Import CSV')} onImport={onImport} />
        </Stack>
      </Stack>
    </Box>
  );
}