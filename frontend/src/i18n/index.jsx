import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import React from 'react';

// Import admin translations from JSON files
import enAdmin from './locales/en-admin.json';
import roAdmin from './locales/ro-admin.json';
import ruAdmin from './locales/ru-admin.json';

// Import portal translations from JSON files
import portalEn from './locales/en.json';
import portalRo from './locales/ro.json';
import portalRu from './locales/ru.json';

/**
 * Fix placeholder format for i18next compatibility
 * Converts %{var} to {{var}} format
 */
const fixPlaceholders = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const recur = (o) => Object.fromEntries(
    Object.entries(o).map(([k, v]) => {
      if (typeof v === 'string') {
        return [k, v.replace(/%\{(.*?)\}/g, '{{$1}}')];
      }
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        return [k, recur(v)];
      }
      return [k, v];
    })
  );

  return recur(obj);
};

// Language storage key
const LS_KEY = 'app_lang';
const storedLang = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;

/**
 * Build language resources from imported JSON files
 * Combines admin (RA) translations with portal translations
 */
const buildLanguageData = () => {
  const adminMessages = {
    en: fixPlaceholders(enAdmin),
    ro: fixPlaceholders(roAdmin),
    ru: fixPlaceholders(ruAdmin),
  };

  const portalMessages = {
    en: portalEn,
    ro: portalRo,
    ru: portalRu,
  };

  const languageData = {};

  ['en', 'ro', 'ru'].forEach((lng) => {
    const admin = adminMessages[lng] || adminMessages.en;
    const portal = portalMessages[lng] || portalMessages.en;

    languageData[lng] = {
      ra: admin.ra || {},
      common: {
        ...(admin.common || {}),
        // Keep configuration keys under the 'configuration' subtree
        configuration: admin.configuration || {},
        resources: admin.resources || {},
      },
      validation: admin.validation || {},
      admin: {
        resources: admin.resources || {},
      },
      resources: admin.resources || {},
      portal: portal,
    };
  });

  return languageData;
};

const languageData = buildLanguageData();

/**
 * Dynamically load portal bundle for a language
 */
async function ensurePortalBundle(lng) {
  try {
    if (!i18n || !lng) return;
    const base = (lng || 'en').split('-')[0];

    // Try dynamic import for portal locale
    let data = null;
    try {
      const modDyn = await import(`./locales/${base}.json`).catch(() => null);
      data = modDyn && (modDyn.default || modDyn);
    } catch (_) {
      data = null;
    }

    if (data && Object.keys(data).length) {
      i18n.addResourceBundle(base, 'portal', data, true, true);
      if (lng !== base) i18n.addResourceBundle(lng, 'portal', data, true, true);
      try {
        await i18n.reloadResources([base, lng], ['portal']);
      } catch (_) {}
    } else {
      i18n.emit && i18n.emit('loaded', {});
    }
  } catch (err) {
    // Silent fail for portal bundle loading
  }
}

/**
 * Initialize i18next with all language resources
 */
export function initI18n(lang = storedLang || 'en') {
  if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
      resources: languageData,
      lng: lang,
      fallbackLng: 'en',
      supportedLngs: ['en', 'ro', 'ru'],
      load: 'languageOnly',
      nonExplicitSupportedLngs: true,
      cleanCode: true,
      ns: ['ra', 'common', 'validation', 'admin', 'resources', 'portal'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      react: {
        bindI18n: 'languageChanged loaded added',
      },
    });

    ensurePortalBundle(lang);
    i18n.on('languageChanged', (lng) => {
      try {
        window.localStorage.setItem(LS_KEY, lng);
      } catch (_) {}
      ensurePortalBundle(lng);
    });
  }
  return i18n;
}

// Initialize on module load
initI18n();

/**
 * Hook to force re-render on language changes
 */
export function useI18nForceUpdate() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    i18n.on('languageChanged', bump);
    i18n.on('loaded', bump);
    i18n.on('added', bump);
    return () => {
      i18n.off('languageChanged', bump);
      i18n.off('loaded', bump);
      i18n.off('added', bump);
    };
  }, []);
}

// Expose i18n globally for debugging
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  window.i18next = i18n;
}

// Current locale tracking for RA provider
let currentLocale = i18n.language || 'en';

/**
 * React-Admin i18n provider bridge
 * Maps RA / common / resources prefixed keys to proper namespaces
 */
export const raI18nProvider = {
  translate: (key, options = {}) => {
    if (!key) return '';

    const tryKey = (k, ns) => {
      const { _, defaultValue, ...rest } = options || {};
      const r = i18n.t(k, { ns, lng: currentLocale, defaultValue: defaultValue ?? _ ?? k, ...rest });
      return r && r !== k ? r : null;
    };

    // Handle ra.* keys
    if (key.startsWith('ra.')) {
      const path = key.slice(3);
      const r = tryKey(path, 'ra');
      if (r) return r;
    }

    // Handle RA.* keys (case insensitive)
    if (key.startsWith('RA.')) {
      const lower = key.toLowerCase();
      const path = lower.slice(3);
      const r = tryKey(path, 'ra');
      if (r) return r;
    }

    // Handle common.* keys
    if (key.startsWith('common.')) {
      const path = key.slice(7);
      const r = tryKey(path, 'common');
      if (r) return r;
    }

    // Handle validation.* keys
    if (key.startsWith('validation.')) {
      const path = key.slice(11);
      const r = tryKey(path, 'validation');
      if (r) return r;
    }

    // Handle resources.* keys
    if (key.startsWith('resources.')) {
      // First try in resources namespace directly (without the "resources." prefix)
      const withoutPrefix = key.slice(10); // remove "resources."
      const rResources = tryKey(withoutPrefix, 'resources');
      if (rResources) return rResources;
      // Then try in admin namespace with full key (admin.resources.xxx)
      const rAdmin = tryKey(key, 'admin');
      if (rAdmin) return rAdmin;
      // Then try in common namespace with full key (common.resources.xxx)
      const rCommon = tryKey(key, 'common');
      if (rCommon) return rCommon;
      // Try admin with key without prefix
      const rAdmin2 = tryKey(withoutPrefix, 'admin');
      if (rAdmin2) return rAdmin2;
      // Try common with key without prefix  
      const rCommon2 = tryKey(withoutPrefix, 'common');
      if (rCommon2) return rCommon2;
    }

    // Try direct lookup
    const { _, defaultValue, ...rest } = options || {};
    const direct = i18n.t(key, { ...rest, lng: currentLocale, defaultValue: defaultValue ?? _ ?? key });
    if (direct && direct !== key) return direct;
    return key;
  },
  changeLocale: (locale) => {
    currentLocale = locale;
    return i18n.changeLanguage(locale);
  },
  getLocale: () => currentLocale,
};

export default i18n;

/**
 * App locale state hook for components
 */
const APP_LOCALE_KEY = 'app_lang';
export function useAppLocaleState() {
  const getBase = (lng) => (lng || 'en').split('-')[0];
  const [locale, setLocaleState] = React.useState(getBase(i18n.resolvedLanguage || i18n.language));

  React.useEffect(() => {
    const onLang = (lng) => setLocaleState(getBase(lng));
    i18n.on('languageChanged', onLang);
    return () => {
      i18n.off('languageChanged', onLang);
    };
  }, []);

  const setLocale = React.useCallback((lng) => {
    const base = getBase(lng);
    const allowed = ['en', 'ro', 'ru'];
    const next = allowed.includes(base) ? base : 'en';
    try {
      window.localStorage.setItem(APP_LOCALE_KEY, next);
    } catch {}
    i18n.changeLanguage(next);
  }, []);

  return [locale, setLocale];
}
