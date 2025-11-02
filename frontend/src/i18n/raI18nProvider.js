import i18n from './index.js';

// Bridge for React-Admin i18n provider using i18next
// Attempt keys in order: direct, admin.<key>, common.<key>
const isReal = (val, attemptedKey, defaultVal) => val && val !== attemptedKey && val !== defaultVal;

// Export commonly used keys so components can import without hardcoding strings
export const UI_KEYS = Object.freeze({
  SHOW_FILTERS: 'common.show_filters',
  HIDE_FILTERS: 'common.hide_filters',
});

const translate = (key, options = {}) => {
  // Special-case fallback: if RA action keys are missing in 'ra', map to 'common'
  if (key === 'ra.action.show_filters' || key === 'ra.action.hide_filters') {
    const alias = key.endsWith('show_filters') ? 'show_filters' : 'hide_filters';
    const rCommon = i18n.t(alias, { ns: 'common', ...options, defaultValue: options.defaultValue || alias });
    if (isReal(rCommon, alias, options.defaultValue || alias)) return rCommon;
  }
  if (key.startsWith('ra.')) {
    const k = key.slice(3);
    const res = i18n.t(k, { ns: 'ra', ...options, defaultValue: key });
    if (isReal(res, k, key)) return res;
  }
  if (key.startsWith('admin.')) {
    const k = key.slice(6);
    const res = i18n.t(k, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, k, key)) return res;
  }
  if (key.startsWith('common.')) {
    const k = key.slice(7);
    const res = i18n.t(k, { ns: 'common', ...options, defaultValue: key });
    if (isReal(res, k, key)) return res;
  }
  if (key.startsWith('validation.')) {
    const k = key.slice(11);
    const res = i18n.t(k, { ns: 'validation', ...options, defaultValue: key });
    if (isReal(res, k, key)) return res;
  }

  // Direct key
  let res = i18n.t(key, { ...options, defaultValue: key });
  if (isReal(res, key, key)) return res;

  // Try namespaced fallbacks
  res = i18n.t(key, { ns: 'admin', ...options, defaultValue: key });
  if (isReal(res, key, key)) return res;
  res = i18n.t(`fields.${key}`, { ns: 'admin', ...options, defaultValue: key });
  if (isReal(res, `admin.fields.${key}`, key)) return res;
  res = i18n.t(`common.${key}`, { ...options, defaultValue: key });
  if (isReal(res, `common.${key}`, key)) return res;

  const m = key.match(/^resources\.([^.]+)\.name/);
  if (m) {
    const resource = m[1];
    res = i18n.t(`resources.${resource}.name`, { ns: 'admin', ...options, defaultValue: resource });
    if (isReal(res, `admin.resources.${resource}.name`, resource)) return res;
    // Also try the default namespace (common)
    res = i18n.t(`resources.${resource}.name`, { ...options, defaultValue: resource });
    if (isReal(res, `resources.${resource}.name`, resource)) return res;
  }

  // Check for resource field keys like resources.resources.fields.id
  const fieldMatch = key.match(/^resources\.([^.]+)\.fields\.(.+)$/);
  if (fieldMatch) {
    const resource = fieldMatch[1];
    const field = fieldMatch[2];
    res = i18n.t(`resources.${resource}.fields.${field}`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.resources.${resource}.fields.${field}`, key)) return res;
    // Also try the default namespace (common)
    res = i18n.t(`resources.${resource}.fields.${field}`, { ...options, defaultValue: key });
    if (isReal(res, `resources.${resource}.fields.${field}`, key)) return res;
  }
  return key;
};

const changeLocale = (locale) => { i18n.changeLanguage(locale); return Promise.resolve(); };
const getLocale = () => i18n.language;

export default { translate, changeLocale, getLocale };
