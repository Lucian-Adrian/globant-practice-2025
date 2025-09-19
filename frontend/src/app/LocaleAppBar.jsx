import * as React from 'react';
import { AppBar, TitlePortal, useLocaleState, useTranslate } from 'react-admin';
import { Box, FormControl, Select, MenuItem } from '@mui/material';

export default function LocaleAppBar(props) {
  const [locale, setLocale] = useLocaleState();
  const t = useTranslate();
  return (
    <AppBar {...props} sx={{ '& .RaAppBar-toolbar': { gap: 1 } }}>
      <TitlePortal />
      <Box sx={{ flexGrow: 1 }} />
      <FormControl size="small" variant="outlined" sx={{ mr: 1, minWidth: 110, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' } }}>
        <Select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          sx={{ color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}
        >
          <MenuItem value="en">{t('common.languages.en')}</MenuItem>
          <MenuItem value="ro">{t('common.languages.ro')}</MenuItem>
          <MenuItem value="ru">{t('common.languages.ru')}</MenuItem>
        </Select>
      </FormControl>
    </AppBar>
  );
}
