import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { CreateButton, useTranslate } from 'react-admin';

export default function ScheduledClassListEmpty() {
  const t = useTranslate();
  return (
    <Box width="100%" mt={4} display="flex" justifyContent="center">
      <Stack spacing={2} maxWidth={600} textAlign="center">
        <Typography variant="h5">{t('resources.scheduledclasses.empty', { defaultValue: 'No scheduled classes yet' })}</Typography>
        <Typography variant="body1" color="text.secondary">{t('resources.scheduledclasses.helper', { defaultValue: 'Create a scheduled class to start planning lessons.' })}</Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <CreateButton label={t('resources.scheduledclasses.create', { defaultValue: 'Create Scheduled Class' })} />
        </Stack>
      </Stack>
    </Box>
  );
}
