import i18n from './i18n';

/**
 * React-Admin i18n provider using i18next
 * Maps RA translation keys to our i18next namespaces
 */
const isReal = (val, key, def) => val && val !== key && val !== def;

const translate = (key, options = {}) => {
  // Route explicit namespace prefixes
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
  if (key.startsWith('errors.')) {
    const k = key.slice(7);
    const res = i18n.t(k, { ns: 'errors', ...options, defaultValue: key });
    if (isReal(res, k, key)) return res;
  }

  // Direct attempt
  let res = i18n.t(key, { ...options, defaultValue: key });
  if (isReal(res, key, key)) return res;

  // Try admin namespace
  res = i18n.t(key, { ns: 'admin', ...options, defaultValue: key });
  if (isReal(res, key, key)) return res;

  // Try admin.fields for simple labels
  res = i18n.t(`fields.${key}`, { ns: 'admin', ...options, defaultValue: key });
  if (isReal(res, `admin.fields.${key}`, key)) return res;

  // Try common namespace
  res = i18n.t(`common.${key}`, { ...options, defaultValue: key });
  if (isReal(res, `common.${key}`, key)) return res;

  // Pattern remaps for RA resource queries
  const resourceMatch = key.match(/^resources\.([^.]+)\.name$/);
  if (resourceMatch) {
    const res = i18n.t(`resources.${resourceMatch[1]}.name`, { ns: 'admin', ...options, defaultValue: resourceMatch[1] });
    if (isReal(res, `admin.resources.${resourceMatch[1]}.name`, resourceMatch[1])) return res;
  }

  const emptyMatch = key.match(/^resources\.([^.]+)\.empty$/);
  if (emptyMatch) {
    const resource = emptyMatch[1];
    res = i18n.t(`empty.${resource}`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.empty.${resource}`, key)) return res;
    res = i18n.t(`resources.${resource}.empty`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.resources.${resource}.empty`, key)) return res;
  }

  const inviteMatch = key.match(/^resources\.([^.]+)\.invite$/);
  if (inviteMatch) {
    const resource = inviteMatch[1];
    res = i18n.t(`invite.${resource}`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.invite.${resource}`, key)) return res;
    res = i18n.t(`empty.${resource}`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.empty.${resource}`, key)) return res;
  }

  const fieldMatch = key.match(/^resources\.([^.]+)\.fields\.(.+)$/);
  if (fieldMatch) {
    const baseField = String(fieldMatch[2]).split('.')[0];
    res = i18n.t(`fields.${baseField}`, { ns: 'admin', ...options, defaultValue: baseField });
    if (isReal(res, `admin.fields.${baseField}`, baseField)) return res;
  }

  return key; // fallback
};

/**
 * Change locale function
 * @param {string} locale - New locale
 * @returns {Promise} Promise that resolves when locale is changed
 */
const changeLocale = (locale) => {
  i18n.changeLanguage(locale);
  return Promise.resolve();
};

/**
 * Get current locale
 * @returns {string} Current locale
 */
const getLocale = () => i18n.language;

/**
 * React-Admin i18n provider object
 */
const raI18nProvider = {
  translate,
  changeLocale,
  getLocale,
};

export default raI18nProvider;