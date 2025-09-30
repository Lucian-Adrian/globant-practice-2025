import React from 'react';
import i18n from '../../i18n/index.js';

// Portal-specific language selector (independent from React-Admin locale state)
// Uses its own localStorage key to avoid interfering with admin panel language.
const PORTAL_LANG_KEY = 'portal_lang';
const SUPPORTED = [
  { code: 'en', label: 'EN' },
  { code: 'ro', label: 'RO' },
  { code: 'ru', label: 'RU' },
];

export function getInitialPortalLang() {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(PORTAL_LANG_KEY);
  if (stored && SUPPORTED.some(l => l.code === stored)) return stored;
  return i18n.language || 'en';
}

export const PortalLanguageSelect = ({ className = '' }) => {
  const [lang, setLang] = React.useState(getInitialPortalLang());

  const handleChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    try { window.localStorage.setItem(PORTAL_LANG_KEY, newLang); } catch(_) {}
    i18n.changeLanguage(newLang);
  };

  React.useEffect(() => {
    const listener = (lng) => {
      setLang(lng);
      try { if (typeof document !== 'undefined') { document.documentElement.lang = lng; } } catch(_) {}
    };
    // Set immediately on mount
    try { if (typeof document !== 'undefined') { document.documentElement.lang = lang; } } catch(_) {}
    i18n.on('languageChanged', listener);
    return () => { i18n.off('languageChanged', listener); };
  }, []);

  return (
    <div className={`tw-relative ${className}`}>      
      <select
        aria-label="Select language"
        value={lang}
        onChange={handleChange}
        className="tw-bg-white tw-border tw-border-gray-300 tw-text-gray-800 tw-text-xs tw-rounded-full tw-py-1 tw-pl-3 tw-pr-6 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary/40 hover:tw-border-gray-400 tw-shadow-sm"
      >
        {SUPPORTED.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  );
};

export default PortalLanguageSelect;
