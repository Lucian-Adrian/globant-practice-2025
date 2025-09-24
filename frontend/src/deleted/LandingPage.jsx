// Moved to legacy: previously at src/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../LanguageContext.jsx';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, lang, toggleLanguage } = useLanguage();
  const handleConnect = () => navigate('/signup');
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ position:'absolute', top:20, right:20 }}>
        <select value={lang} onChange={e => toggleLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>
      <h1>{t.welcome}</h1>
      <button onClick={handleConnect} style={{ padding:'1rem 2rem', fontSize:'1.2rem', cursor:'pointer' }}>{t.connect}</button>
    </div>
  );
};
export default LandingPage;
