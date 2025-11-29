import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import heroImg from '../../../assets/login.png'; // Reuse same image for now
import PageIcon from '../portal/PageIcon';
import '../portal/StudentLogin.css'; // Reuse styles
import PortalLanguageSelect from '../portal/PortalLanguageSelect.jsx';
import { setInstructorAccessToken, setInstructorRefreshToken } from '../../api/httpClient';

const InstructorLogin = () => {
  const { t } = useTranslation(['portal', 'common']);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const loginValid = () => email.trim() && password.trim();

  const storeTokens = (data) => {
    if (data.access) setInstructorAccessToken(data.access);
    if (data.refresh) setInstructorRefreshToken(data.refresh);
    if (data.instructor) {
      try { localStorage.setItem('instructor_profile', JSON.stringify(data.instructor)); } catch (_) {}
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginValid()) return;
    setSubmitting(true);
    setMessage(null);
    setDebugInfo(null);
    try {
      const body = { email: email.trim().toLowerCase(), password: password.trim() };

      const resp = await fetch('/api/auth/instructor/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      let data = {};
      try { data = await resp.json(); } catch (_) {}
      if (resp.ok) {
        storeTokens(data);
        setMessage(t('loginSuccess', 'Logged in successfully.'));
        setDebugInfo(data);
        setTimeout(() => navigate('/instructor/dashboard'), 800);
      } else {
        const backendError = data.detail || data.message || data.error;
        setMessage(t('loginFailed', 'Login failed') + (backendError ? `: ${backendError}` : ''));
        setDebugInfo({ status: resp.status, body: data });
      }
    } catch (err) {
      setMessage(t('networkError', 'Network error. Please try again.'));
      setDebugInfo({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const IconWrapper = ({ children }) => (
    <div className="input-icon">{children}</div>
  );

  const EyeButton = ({ onClick, shown }) => (
    <button
      type="button"
      onClick={onClick}
      className="password-toggle"
      aria-label={shown ? t('hidePassword', 'Hide password') : t('showPassword', 'Show password')}
    >
      <span>{shown ? '🙈' : '👁'}</span>
    </button>
  );

  const messageVariant = (msg) => {
    const s = String(msg || '').toLowerCase();
    if (!s) return 'info';
    if (s.includes('success')) return 'success';
    return 'error';
  };

  return (
    <div className="student-login-page">
      <div className="tw-fixed tw-top-2 tw-right-2 tw-z-50"><PortalLanguageSelect /></div>
      <div className="hero-section">
        <img src={heroImg} alt="Instructor Portal" className="hero-image" />
        <div className="hero-motto" aria-hidden>
          {t('instructorMotto', "Empowering the next generation of drivers.")}
        </div>
      </div>
      <div className="form-section">
        <div className="form-container">
          <div className="form-wrapper">
            <div>
              <div className="form-header">
                <h1 className="form-title"><PageIcon name="login" style={{ marginRight:8 }} />{t('instructorLogin', 'Instructor Portal')}</h1>
                <p className="form-subtitle">{t('loginIntroInstructor', 'Please log in with your instructor credentials.')}</p>
              </div>
              <form onSubmit={handleLoginSubmit} className="ui-form">
                <div className="input-group">
                  <IconWrapper>📧</IconWrapper>
                  <input
                    type="email"
                    className="input"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <IconWrapper>🔒</IconWrapper>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <EyeButton shown={showPassword} onClick={() => setShowPassword(s => !s)} />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !loginValid()}
                  className="button"
                >
                  {submitting ? t('loggingIn') : t('login')}
                  <span>→</span>
                </button>
              </form>
            </div>
            {message && (() => {
              const v = messageVariant(message);
              return (
                <div className={`message ${v}`} role="alert" aria-live="polite">
                  <div className="message-text">{message}</div>
                </div>
              );
            })()}
          </div>
        </div>
        <div className="footer">
          <a href="/legal">{t('legalCenter', 'Legal Center')}</a>
          <a href="/terms">{t('termsOfUse', 'Terms of Use')}</a>
          <a href="/privacy">{t('privacyPolicy', 'Privacy Policy')}</a>
        </div>
      </div>
    </div>
  );
};

export default InstructorLogin;
