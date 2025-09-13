import * as React from 'react';
import translations from './translations';

export const LanguageContext = React.createContext({
  locale: 'en',
  setLocale: () => {},
  t: (k) => k,
});

export const translateMessage = (locale, key) => {
  if (!locale || !key) return key;
  const parts = key.split('.');
  let cur = translations[locale];
  for (const p of parts) {
    if (!cur) return key;
    cur = cur[p];
  }
  return cur ?? key;
};

export default {
  LanguageContext,
  translateMessage,
};
