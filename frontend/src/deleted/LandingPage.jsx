import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['common']);

  const handleConnect = () => {
    navigate('/signup');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>
      <h1>{t('welcome')}</h1>
      <button onClick={handleConnect} style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: 'pointer' }}>
        {t('connect')}
      </button>
    </div>
  );
};

export default LandingPage;
