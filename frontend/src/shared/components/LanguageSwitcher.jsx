import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleState } from 'react-admin';

// Two modes: RA locale (if inside <Admin>) or direct i18next outside portal Signup page.
const RALocaleSwitcher = ({ style, selectStyle, ...pos }) => {
  const [locale, setLocale] = useLocaleState();
  const handleChange = (e) => setLocale(e.target.value);
  return (
    <div style={{ position: 'relative', ...pos, ...style }}>
      <select aria-label="Select language" value={locale} onChange={handleChange} style={selectStyle}>
        <option value="en">English</option>
        <option value="ro">Română</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
};

const I18nLocaleSwitcher = ({ style, selectStyle, ...pos }) => {
  const { i18n } = useTranslation();
  const handleChange = (e) => i18n.changeLanguage(e.target.value);
  return (
    <div style={{ position: 'relative', ...pos, ...style }}>
      <select aria-label="Select language" value={i18n.language} onChange={handleChange} style={selectStyle}>
        <option value="en">English</option>
        <option value="ro">Română</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
};

const LanguageSwitcher = ({ useRA = false, ...props }) => (useRA ? <RALocaleSwitcher {...props} /> : <I18nLocaleSwitcher {...props} />);
export default LanguageSwitcher;
