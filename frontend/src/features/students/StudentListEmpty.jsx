import * as React from 'react';
import { useTranslate, CreateButton } from 'react-admin';
import { Box, Typography, Stack } from '@mui/material';
import ImportButton from '../../shared/components/ImportButton';
import { rawFetch, API_PREFIX } from '../../api/httpClient';

// Reuse same onImport logic as actions (kept inline to avoid circular import)
export default function StudentListEmpty() {
  const t = useTranslate();
  const baseApi = API_PREFIX;

  const onImport = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const resp = await rawFetch(`${baseApi}/students/import/`, { method: 'POST', body: form });
    if (!resp.ok) {
      let detail = 'Import failed';
      try { const err = await resp.json(); detail = err.detail || detail; } catch (_) {}
      throw new Error(detail);
    }
    const json = await resp.json();
    // If backend returns errors, fabricate a downloadable CSV summarizing them (row + field messages)
    if (json.errors && json.errors.length) {
      const header = 'row,field,error';
      const lines = json.errors.flatMap(e => {
        const rowNum = e.row ?? '';
        return Object.entries(e.errors || {}).map(([field, msgs]) => {
          const msgStr = Array.isArray(msgs) ? msgs.join('|') : String(msgs);
          return `${rowNum},${field},"${msgStr.replace(/"/g,'""')}`;
        });
      });
      const csv = [header, ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'student_import_errors.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return { message: t('resources.students.import_helper') + ` Imported ${json.created} / errors: ${json.errors.length}` };
    }
    return { message: `Imported ${json.created} students` };
  };

  return (
    <Box width="100%" mt={4} display="flex" justifyContent="center">
      <Stack spacing={2} maxWidth={600} textAlign="center">
        <Typography variant="h5">{t('resources.students.empty')}</Typography>
        <Typography variant="body1" color="text.secondary">{t('resources.students.import_helper')}</Typography>
        <Typography variant="caption" color="text.secondary">{t('resources.students.import_format_hint')}</Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <CreateButton />
          <ImportButton label={t('ra.custom.import_csv')} onImport={onImport} />
        </Stack>
      </Stack>
    </Box>
  );
}
