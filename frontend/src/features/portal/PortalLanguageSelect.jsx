import React from 'react';
import { useTranslation } from 'react-i18next';

// Portal-specific language selector
// Uses direct i18n control for student portal
const SUPPORTED = [
  { code: 'en', label: 'EN' },
  { code: 'ro', label: 'RO' },
  { code: 'ru', label: 'RU' },
];

export const PortalLanguageSelect = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const handleChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang).catch((error) => {
      console.error('Language change failed:', error);
    });
  };

  React.useEffect(() => {
    try { if (typeof document !== 'undefined') { document.documentElement.lang = i18n.language; } } catch(_) {}
  }, [i18n.language]);

  return (
    <div className={`tw-relative ${className}`}>      
      <select
        aria-label="Select language"
        value={i18n.language}
        onChange={handleChange}
        className="tw-bg-white tw-border tw-border-gray-300 tw-text-gray-800 tw-text-xs tw-rounded-full tw-py-1 tw-pl-3 tw-pr-6 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary/40 hover:tw-border-gray-400 tw-shadow-sm"
      >
        {SUPPORTED.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </div>
  );
};

export default PortalLanguageSelect;
