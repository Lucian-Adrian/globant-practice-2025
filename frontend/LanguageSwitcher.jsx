import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleState, useSetLocale } from 'react-admin';

/**
 * Language switcher component that uses React-Admin's locale state
 * @param {object} props - Component props
 * @param {object} props.style - Custom styles for the container
 * @param {object} props.selectStyle - Custom styles for the select element
 * @param {object} props...pos - Position props passed to container
 */
const RALocaleSwitcher = ({ style, selectStyle, ...pos }) => {
  const [locale, setLocale] = useLocaleState();

  const handleChange = (e) => {
    const lang = e.target.value;
    setLocale(lang); // Triggers RA to call i18nProvider.changeLocale
  };

  return (
    <div style={{ position: 'relative', ...pos, ...style }}>
      <select
        aria-label="Select language"
        value={locale}
        onChange={handleChange}
        style={selectStyle}
      >
        <option value="en">English</option>
        <option value="ro">Română</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
};

/**
 * Language switcher component that uses i18next directly
 * @param {object} props - Component props
 * @param {object} props.style - Custom styles for the container
 * @param {object} props.selectStyle - Custom styles for the select element
 * @param {object} props...pos - Position props passed to container
 */
const I18nLocaleSwitcher = ({ style, selectStyle, ...pos }) => {
  const { i18n } = useTranslation();

  const handleChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
  };

  return (
    <div style={{ position: 'relative', ...pos, ...style }}>
      <select
        aria-label="Select language"
        value={i18n.language}
        onChange={handleChange}
        style={selectStyle}
      >
        <option value="en">English</option>
        <option value="ro">Română</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
};

/**
 * Simple language switcher for selecting active UI language.
 *
 * Usage: place <LanguageSwitcher position="absolute" top={20} right={20} />
 *
 * @param {object} props - Component props
 * @param {boolean} props.useRA - Whether to use React-Admin locale state (default: false)
 * @param {object} props...other - Other props passed to the underlying component
 */
const LanguageSwitcher = ({ useRA = false, ...props }) => (
  useRA ? <RALocaleSwitcher {...props} /> : <I18nLocaleSwitcher {...props} />
);

export default LanguageSwitcher;
