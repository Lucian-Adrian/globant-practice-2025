// i18n scaffolding (deferred)
// Note: This file is not imported yet to avoid adding new dependencies prematurely.
// When ready, install packages: i18next, react-i18next, and add language resources.

/*
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // add keys progressively, ported from translations.js
    },
  },
  ro: {
    translation: {
      // Romanian keys here
    },
  },
};

export function initI18n(lang = 'en') {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: lang,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      });
  }
  return i18n;
}

export default i18n;
*/

// Placeholder exports to avoid import errors if referenced before wiring
export function initI18n() {
  // noop placeholder; replace with real init when packages are added
}
