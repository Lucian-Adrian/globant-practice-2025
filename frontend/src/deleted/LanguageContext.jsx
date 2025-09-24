// Legacy LanguageContext (superseded by i18next). Retained for LandingPage.
import React, { createContext, useContext, useState } from 'react';
import translations from './translations';

const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);
export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const toggleLanguage = (newLang) => setLang(newLang);
  return <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>{children}</LanguageContext.Provider>;
};
