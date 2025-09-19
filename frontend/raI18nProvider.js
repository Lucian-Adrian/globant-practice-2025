import i18n from './i18n';

// Bridge for React-Admin i18n provider using i18next
// We attempt keys in order: exact, admin.<key>, common.<key>
// React-Admin typically queries: 'ra.action.*', 'resources.<res>.name', 'resources.<res>.fields.<field>' etc.
// We'll map resource/field patterns to our admin namespace if direct match fails.

const isReal = (val, attemptedKey, defaultVal) => val && val !== attemptedKey && val !== defaultVal;

const translate = (key, options = {}) => {
  // Route explicit namespace prefixes to correct i18next namespace
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

  // Direct attempt without explicit namespace
  let res = i18n.t(key, { ...options, defaultValue: key });
  if (isReal(res, key, key)) return res;

  // Try admin.<key>
  res = i18n.t(key, { ns: 'admin', ...options, defaultValue: key });
  if (isReal(res, key, key)) return res;

  // Try admin.fields.<key> (useful for simple label props like label="enrollment")
  res = i18n.t(`fields.${key}`, { ns: 'admin', ...options, defaultValue: key });
  if (isReal(res, `admin.fields.${key}`, key)) return res;

  // Try common.<key>
  res = i18n.t(`common.${key}`, { ...options, defaultValue: key });
  if (isReal(res, `common.${key}`, key)) return res;

  // Pattern remaps: resources.students.name -> admin.resources.students.name
  const m = key.match(/^resources\.([^.]+)\.name/);
  if (m) {
    const resource = m[1];
    res = i18n.t(`resources.${resource}.name`, { ns: 'admin', ...options, defaultValue: resource });
    if (isReal(res, `admin.resources.${resource}.name`, resource)) return res;
  }

  // Remap resources.<res>.empty -> admin.empty.<res> (or admin.resources.<res>.empty as fallback)
  const mEmpty = key.match(/^resources\.([^.]+)\.empty$/);
  if (mEmpty) {
    const resource = mEmpty[1];
    res = i18n.t(`empty.${resource}`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.empty.${resource}`, key)) return res;
    res = i18n.t(`resources.${resource}.empty`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.resources.${resource}.empty`, key)) return res;
  }

  // Remap resources.<res>.invite -> admin.invite.<res> (fallback admin.empty.<res>)
  const mInvite = key.match(/^resources\.([^.]+)\.invite$/);
  if (mInvite) {
    const resource = mInvite[1];
    res = i18n.t(`invite.${resource}`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.invite.${resource}`, key)) return res;
    res = i18n.t(`empty.${resource}`, { ns: 'admin', ...options, defaultValue: key });
    if (isReal(res, `admin.empty.${resource}`, key)) return res;
  }
  const fieldMatch = key.match(/^resources\.([^.]+)\.fields\.(.+)$/);
  if (fieldMatch) {
    const field = fieldMatch[2];
    // For nested sources like "enrollment.id", map to base field name "enrollment"
    const baseField = String(field).split('.')[0];
    res = i18n.t(`fields.${baseField}`, { ns: 'admin', ...options, defaultValue: baseField });
    if (isReal(res, `admin.fields.${baseField}`, baseField)) return res;
  }
  return key; // fallback to key
};

const changeLocale = (locale) => {
  i18n.changeLanguage(locale);
  return Promise.resolve();
};

const getLocale = () => i18n.language;

const raI18nProvider = { translate, changeLocale, getLocale };
export default raI18nProvider;