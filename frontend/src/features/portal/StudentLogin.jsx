import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import heroImg from '../../../assets/login.png';
import PageIcon from './PageIcon';
import './StudentLogin.css';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import PortalLanguageSelect from './PortalLanguageSelect.jsx';

/**
 * StudentLogin
 * A full translation of the provided static studentlogin.html file into React.
 * Features:
 *  - Two-column layout (hero image + form) responsive for mobile (stacked)
 *  - Toggle between Login and Signup forms without route change
 *  - Phone/password login (keeps legacy email capability via fallback field name mapping)
 *  - Signup form with validation (full name, phone, category, birthday optional, password + confirm)
 *  - Password visibility toggles
 *  - i18n wrappers with graceful fallbacks if keys not defined
 *  - Reuses existing login API endpoint; signup endpoint is speculative and marked TODO
 *
 * Assumptions (documented for later refinement):
 *  - Login API can accept either { email, password } OR { phone, password }. We attempt phone field first; if value contains '@' treat as email.
 *  - Signup API endpoint guessed as /api/auth/student/signup/ (adjust when backend contract confirmed).
 */
const StudentLogin = () => {
  // Include 'portal' namespace first so auth/landing keys stored in portal locale JSON resolve correctly
  const { t, i18n } = useTranslation(['portal','common','validation']);
  const navigate = useNavigate();

  // Log translations when language changes
  React.useEffect(() => {
    const loginTitle = t('portal.login.title', { defaultValue: 'Student Login' });
    const signupTitle = t('portal.signup.title', { defaultValue: 'Student Signup' });
    const loginSubtitle = t('portal.login.subtitle', { defaultValue: 'Welcome back' });
    console.log('🔐 Login page translations updated:', {
      language: i18n.language,
      loginTitle,
      signupTitle,
      loginSubtitle
    });
  }, [i18n.language, t]);

  // Mode toggle
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Login state
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginShowPassword, setLoginShowPassword] = useState(false);

  // Signup state
  const [signup, setSignup] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+373',
    localPhone: '',
    dob: '',
    category: '',
    password: '',
    confirmPassword: ''
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupShowPassword2, setSignupShowPassword2] = useState(false);
  const [signupAgreed, setSignupAgreed] = useState(false);
  const [signupAgreedError, setSignupAgreedError] = useState(null);

  // Shared
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  /* ---------------------------- Helpers & Validation ---------------------------- */
  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);
  const phoneIsValid = (v) => /^\+?[0-9\s\-]{6,20}$/.test(v.trim());

  const loginValid = () =>
    loginPhoneOrEmail.trim() && loginPassword.trim() && (isEmail(loginPhoneOrEmail) || phoneIsValid(loginPhoneOrEmail));

  // Advanced signup validation rules (age >=15, valid email, phone by libphonenumber)
  const MIN_AGE_YEARS = 15;
  const NAME_ALLOWED = /^[A-Za-zÀ-ÖØ-öø-ÿ\- ]*$/;
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const cutoff = useMemo(() => { const c = new Date(today); c.setFullYear(c.getFullYear() - MIN_AGE_YEARS); return c; }, [today]);

  const fullPhone = useMemo(() => signup.countryCode + signup.localPhone.replace(/^0+/, ''), [signup.countryCode, signup.localPhone]);
  const signupFormComplete = useMemo(() => {
    const s = signup;
    return Boolean(s.firstName.trim() && s.lastName.trim() && s.email.trim() && s.localPhone.trim() && s.dob && s.password && s.confirmPassword && s.category);
  }, [signup]);
  const signupValid = () => {
    if (!signupFormComplete) return false;
    if (!isEmail(signup.email)) return false;
    if (!isValidPhoneNumber(fullPhone)) return false;
    if (!signup.dob) return false;
    const dobDate = new Date(signup.dob); dobDate.setHours(0,0,0,0);
    if (dobDate > today) return false;
    if (dobDate > cutoff) return false;
    if (signup.password.length < 6) return false;
    if (signup.password !== signup.confirmPassword) return false;
    return true;
  };

  const setSignupError = (field, key=null) => setSignupErrors(prev => ({ ...prev, [field]: key ? { key } : null }));
  const renderSignupError = (err) => {
    if (!err || !err.key) return '';
    const map = {
      required: t('validation.requiredField', 'Required'),
      invalidEmail: t('validation.invalidEmail', 'Invalid email'),
      invalidPhone: t('validation.invalidPhone', 'Invalid phone'),
      passwordTooShort: t('validation.passwordTooShort', 'Min 6 chars'),
      passwordsDontMatch: t('validation.passwordsDontMatch', "Passwords don't match"),
      invalidDob: t('validation.invalidDob', 'Invalid date'),
      tooYoung: t('validation.tooYoung', { years: MIN_AGE_YEARS, defaultValue: `You must be at least ${MIN_AGE_YEARS}` }),
      nameChars: t('validation.nameChars', 'Invalid characters')
    };
    return map[err.key] || '';
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignup(s => ({ ...s, [name]: value }));
    if (name === 'firstName' || name === 'lastName') {
      if (!value.trim()) return setSignupError(name, 'required');
      if (!NAME_ALLOWED.test(value)) return setSignupError(name, 'nameChars');
      return setSignupError(name, null);
    }
    if (name === 'email') {
      if (!value.trim()) return setSignupError(name, 'required');
      if (!isEmail(value)) return setSignupError(name, 'invalidEmail');
      return setSignupError(name, null);
    }
    if (name === 'localPhone' || name === 'countryCode') {
      const lp = name === 'localPhone' ? value.replace(/[^0-9]/g,'') : signup.localPhone;
      const cc = name === 'countryCode' ? value : signup.countryCode;
      const composed = cc + lp.replace(/^0+/, '');
      if (!lp.trim()) return setSignupError('localPhone', 'required');
      if (!isValidPhoneNumber(composed)) return setSignupError('localPhone', 'invalidPhone');
      if (name === 'localPhone') setSignup(s => ({ ...s, localPhone: lp }));
      return setSignupError('localPhone', null);
    }
    if (name === 'dob') {
      if (!value) return setSignupError('dob', 'required');
      const d = new Date(value); d.setHours(0,0,0,0);
      if (d > today) return setSignupError('dob', 'invalidDob');
      if (d > cutoff) return setSignupError('dob', 'tooYoung');
      return setSignupError('dob', null);
    }
    if (name === 'password') {
      if (!value) return setSignupError('password', 'required');
      if (value.length < 6) setSignupError('password', 'passwordTooShort'); else setSignupError('password', null);
      if (signup.confirmPassword && signup.confirmPassword !== value) setSignupError('confirmPassword', 'passwordsDontMatch'); else if (signup.confirmPassword) setSignupError('confirmPassword', null);
      return;
    }
    if (name === 'confirmPassword') {
      if (!value) return setSignupError('confirmPassword', 'required');
      if (value !== signup.password) return setSignupError('confirmPassword', 'passwordsDontMatch');
      return setSignupError('confirmPassword', null);
    }
    if (name === 'category') {
      if (!value) return setSignupError('category', 'required');
      return setSignupError('category', null);
    }
  };

  const validateSignupAll = () => {
    const fresh = {};
    const s = signup;
    if (!s.firstName.trim()) fresh.firstName = { key:'required' };
    if (!s.lastName.trim()) fresh.lastName = { key:'required' };
    if (!s.email.trim()) fresh.email = { key:'required' }; else if (!isEmail(s.email)) fresh.email = { key:'invalidEmail' };
    if (!s.localPhone.trim()) fresh.localPhone = { key:'required' }; else if (!isValidPhoneNumber(fullPhone)) fresh.localPhone = { key:'invalidPhone' };
    if (!s.category) fresh.category = { key:'required' };
    if (!s.dob) fresh.dob = { key:'required' }; else { const d = new Date(s.dob); d.setHours(0,0,0,0); if (d > today) fresh.dob = { key:'invalidDob' }; else if (d > cutoff) fresh.dob = { key:'tooYoung' }; }
    if (!s.password) fresh.password = { key:'required' }; else if (s.password.length < 6) fresh.password = { key:'passwordTooShort' };
    if (!s.confirmPassword) fresh.confirmPassword = { key:'required' }; else if (s.confirmPassword !== s.password) fresh.confirmPassword = { key:'passwordsDontMatch' };
    setSignupErrors(fresh);
    return Object.keys(fresh).length === 0;
  };

  const validateSignupAgreement = () => {
    if (!signupAgreed) { setSignupAgreedError({ key:'required' }); return false; }
    setSignupAgreedError(null); return true;
  };

  const storeTokens = (data) => {
    if (data.access) localStorage.setItem('student_access_token', data.access);
    if (data.refresh) localStorage.setItem('student_refresh_token', data.refresh);
    if (data.student) {
      try { localStorage.setItem('student_profile', JSON.stringify(data.student)); } catch (_) {}
    }
  };

  /* ---------------------------------- Handlers ---------------------------------- */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginValid()) return;
    setSubmitting(true);
    setMessage(null);
    setDebugInfo(null);
    try {
      const body = { password: loginPassword };
      if (isEmail(loginPhoneOrEmail)) body.email = loginPhoneOrEmail.trim().toLowerCase();
      else body.phone = loginPhoneOrEmail.trim();

      const resp = await fetch('/api/auth/student/login/', {
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
        setTimeout(() => navigate('/dashboard'), 800);
      } else {
        const backendError = data.detail || data.message || data.error;
        const low = String(backendError || '').toLowerCase();
        if (low.includes('pending') || low.includes('await') || low.includes('approval') || resp.status === 202) {
          // Sweet user-facing message
          setMessage(t('loginPendingSweet', "We couldn't log you in right now — your account is pending approval. Please wait, or contact us at 069 155 877."));
        } else {
          setMessage(t('loginFailed', 'Login failed') + (backendError ? `: ${backendError}` : ''));
        }
        setDebugInfo({ status: resp.status, body: data });
      }
    } catch (err) {
      setMessage(t('networkError', 'Network error. Please try again.'));
      setDebugInfo({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
  if (!validateSignupAll()) return;
  if (!signupValid()) return; // double guard
  if (!validateSignupAgreement()) return;
    setSubmitting(true);
    setMessage(null);
    setDebugInfo(null);
    try {
      const phoneObj = parsePhoneNumberFromString(fullPhone);
      const normalizedPhone = phoneObj?.isValid() ? phoneObj.number : fullPhone;
      const payload = {
        first_name: signup.firstName.trim(),
        last_name: signup.lastName.trim(),
        email: signup.email.trim(),
        phone_number: normalizedPhone,
        date_of_birth: signup.dob,
        category: signup.category,
        password: signup.password
      };
      // Primary endpoint guess (adjust once known)
      const resp = await fetch('/api/students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let data = {}; try { data = await resp.json(); } catch (_) {}
      if (resp.ok) {
        setMessage(t('signupSuccess', 'Account created successfully.'));
        // Optional auto-login if backend returns tokens
        if (data.access || data.refresh) storeTokens(data);
        setDebugInfo(data);
        setTimeout(() => { if (data.access) navigate('/dashboard'); else setMode('login'); }, 900);
      } else {
        // Map backend field errors
        if (data.errors && typeof data.errors === 'object') {
          const mapped = { ...signupErrors };
            Object.entries(data.errors).forEach(([k,v]) => {
              const first = Array.isArray(v) ? String(v[0]).toLowerCase() : String(v).toLowerCase();
              if (k === 'first_name') mapped.firstName = { key:'required' };
              if (k === 'last_name') mapped.lastName = { key:'required' };
              if (k === 'email') mapped.email = { key: first.includes('invalid') ? 'invalidEmail' : 'invalidEmail' };
              if (k === 'phone_number') mapped.localPhone = { key:'invalidPhone' };
              if (k === 'date_of_birth') mapped.dob = { key: first.includes('future') ? 'invalidDob' : first.includes('least') ? 'tooYoung' : 'invalidDob' };
            });
          setSignupErrors(mapped);
        }
        const backendError = data.detail || data.message || data.error;
        setMessage(t('signupFailed', 'Signup failed') + (backendError ? `: ${backendError}` : ''));
        setDebugInfo({ status: resp.status, body: data });
      }
    } catch (err) {
      setMessage(t('networkError', 'Network error. Please try again.'));
      setDebugInfo({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  /* --------------------------------- UI Helpers --------------------------------- */
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

  /* ------------------------------------ View ------------------------------------ */
  // Determine message variant: success / info / error
  const messageVariant = (msg, debug) => {
    const s = String(msg || '').toLowerCase();
    if (!s) return 'info';
    if (s.includes('success')) return 'success';
    if (s.includes('pending') || s.includes('await') || s.includes('approval') || s.includes('awaiting')) return 'info';
    if (debug && debug.status === 202) return 'info';
    return 'error';
  };

  return (
    <div className="student-login-page">
      <div className="tw-fixed tw-top-2 tw-right-2 tw-z-50"><PortalLanguageSelect /></div>
      <div className="hero-section">
        <img src={heroImg} alt={t('loginHeroAlt', 'Professional driving instructor with car')} className="hero-image" />
        {mode === 'login' && (
          <div className="hero-motto" aria-hidden>
            {t('guestMotto', "Learn confidently. Drive safely. We're with you every mile.")}
          </div>
        )}
      </div>
      <div className="form-section">
        <div className="form-container">
          <div className="form-wrapper">
            {mode === 'login' && (
              <div>
                <div className="form-header">
                  <h1 className="form-title"><PageIcon name="login" style={{ marginRight:8 }} />{t('welcome', 'Welcome back')}</h1>
                  <p className="form-subtitle">{t('loginIntroPhone')}</p>
                </div>
                <form onSubmit={handleLoginSubmit} className="ui-form">
                  <div className="input-group">
                    <IconWrapper>📱</IconWrapper>
                    <input
                      type="text"
                      className="input"
                      placeholder={t('phoneOrEmail')}
                      value={loginPhoneOrEmail}
                      onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <IconWrapper>🔒</IconWrapper>
                    <input
                      type={loginShowPassword ? 'text' : 'password'}
                      className="input"
                      placeholder={t('passwordPlaceholder')}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                    <EyeButton shown={loginShowPassword} onClick={() => setLoginShowPassword(s => !s)} />
                  </div>
                  <div className="forgot-password">
                    <a href="#">{t('forgotPassword')}</a>
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
                <div className="form-footer">
                  {t('noAccount')}{' '}
                  <button type="button" onClick={() => navigate('/signup')}>{t('createAccount')}</button>
                </div>
              </div>
            )}
            {mode === 'signup' && (
              <div>
                <div className="form-header">
                  <h1 className="form-title"><PageIcon name="signup" style={{ marginRight:8 }} />{t('createAccount')}</h1>
                  <p className="form-subtitle">{t('signupIntro')}</p>
                </div>
                <form onSubmit={handleSignupSubmit} className="ui-form">
                  {/* Name row */}
                  <div className="input-group" style={{ display:'flex', gap:'.75rem' }}>
                    <div style={{ position:'relative', flex:1 }}>
                      <IconWrapper>👤</IconWrapper>
                      <input
                        type="text"
                        name="firstName"
                        className="input"
                        placeholder={t('firstName', { defaultValue: 'First Name' })}
                        value={signup.firstName}
                        onChange={handleSignupChange}
                        required
                      />
                      {signupErrors.firstName && <div className="error-text">{renderSignupError(signupErrors.firstName)}</div>}
                    </div>
                    <div style={{ position:'relative', flex:1 }}>
                      <IconWrapper>👤</IconWrapper>
                      <input
                        type="text"
                        name="lastName"
                        className="input"
                        placeholder={t('lastName', { defaultValue: 'Last Name' })}
                        value={signup.lastName}
                        onChange={handleSignupChange}
                        required
                      />
                      {signupErrors.lastName && <div className="error-text">{renderSignupError(signupErrors.lastName)}</div>}
                    </div>
                  </div>
                  {/* Email */}
                  <div className="input-group">
                    <IconWrapper>📧</IconWrapper>
                    <input
                      type="email"
                      name="email"
                      className="input"
                      placeholder={t('email', { defaultValue: 'Email' })}
                      value={signup.email}
                      onChange={handleSignupChange}
                      required
                    />
                    {signupErrors.email && <div className="error-text">{renderSignupError(signupErrors.email)}</div>}
                  </div>
                  {/* Phone split */}
                  <div className="input-group" style={{ display:'flex', gap:'.5rem' }}>
                    <div style={{ position:'relative', width:'35%' }}>
                      <select
                        name="countryCode"
                        className="select"
                        value={signup.countryCode}
                        onChange={handleSignupChange}
                      >
                        {['+373','+40','+49','+33','+39','+41','+44','+34','+351','+1','+7','+380','+48','+386','+372'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ position:'relative', flex:1 }}>
                      <IconWrapper>📱</IconWrapper>
                      <input
                        type="tel"
                        name="localPhone"
                        className="input"
                        placeholder={t('phoneNumber', { defaultValue: 'Phone Number' })}
                        value={signup.localPhone}
                        onChange={handleSignupChange}
                        required
                      />
                      {signupErrors.localPhone && <div className="error-text">{renderSignupError(signupErrors.localPhone)}</div>}
                    </div>
                  </div>
                  {/* DOB */}
                  <div className="input-group">
                    <IconWrapper>📅</IconWrapper>
                    <input
                      type="date"
                      name="dob"
                      className="input"
                      value={signup.dob}
                      onChange={handleSignupChange}
                      required
                      max={useMemo(() => { const c = new Date(cutoff); return c.toISOString().slice(0,10); }, [cutoff])}
                    />
                    {signupErrors.dob && <div className="error-text">{renderSignupError(signupErrors.dob)}</div>}
                  </div>
                  {/* Category */}
                  <div className="input-group">
                    <IconWrapper>📋</IconWrapper>
                    <select
                      name="category"
                      className="select"
                      value={signup.category}
                      onChange={handleSignupChange}
                      required
                    >
                      <option value="">{t('selectDesiredCategory', 'Select desired category')}</option>
                      {['AM','A1','A2','A','B1','B','BE','C1','C1E','C','CE','D1','D1E','D','DE'].map(code => (
                        <option key={code} value={code}>{code}</option>
                      ))}
                    </select>
                    {signupErrors.category && <div className="error-text">{renderSignupError(signupErrors.category)}</div>}
                  </div>
                  {/* Password */}
                  <div className="input-group">
                    <IconWrapper>🔒</IconWrapper>
                    <input
                      type={signupShowPassword ? 'text' : 'password'}
                      name="password"
                      className="input"
                      placeholder={t('passwordPlaceholder')}
                      value={signup.password}
                      onChange={handleSignupChange}
                      required
                    />
                    <EyeButton shown={signupShowPassword} onClick={() => setSignupShowPassword(s => !s)} />
                    {signupErrors.password && <div className="error-text">{renderSignupError(signupErrors.password)}</div>}
                  </div>
                  {/* Confirm Password */}
                  <div className="input-group">
                    <IconWrapper>🔒</IconWrapper>
                    <input
                      type={signupShowPassword2 ? 'text' : 'password'}
                      name="confirmPassword"
                      className="input"
                      placeholder={t('confirmPassword')}
                      value={signup.confirmPassword}
                      onChange={handleSignupChange}
                      required
                    />
                    <EyeButton shown={signupShowPassword2} onClick={() => setSignupShowPassword2(s => !s)} />
                    {signupErrors.confirmPassword && <div className="error-text">{renderSignupError(signupErrors.confirmPassword)}</div>}
                  </div>
                  <div style={{ marginTop:'.75rem' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:'.5rem', justifyContent:'center' }}>
                      <input type="checkbox" checked={signupAgreed} onChange={(e) => { setSignupAgreed(e.target.checked); if(e.target.checked) setSignupAgreedError(null); }} />
                      <span style={{ fontSize:'.9rem' }}>{t('agreeTo')} <a href="/terms">{t('terms')}</a> {t('and')} <a href="/privacy">{t('privacy')}</a></span>
                    </label>
                    {signupAgreedError && <div className="error-text" style={{ textAlign:'center', marginTop:'.5rem' }}>{t('validation:required', 'Please accept Terms and Privacy')}</div>}
                  </div>

                  <button type="submit" disabled={submitting || !signupValid() || !signupAgreed} className="button">
                    {submitting ? t('creatingAccount', { defaultValue: 'Creating account...' }) : t('createAccount')}
                    <span>→</span>
                  </button>
                </form>
                <div className="form-footer">
                  {t('haveAccount')}{' '}
                  <button type="button" onClick={() => setMode('login')}>{t('login', { defaultValue: 'Log in' })}</button>
                </div>
              </div>
            )}
            {message && (() => {
              const v = messageVariant(message, debugInfo);
              return (
                <div className={`message ${v}`} role="alert" aria-live="polite">
                  <div className="message-icon" aria-hidden>
                    {v === 'success' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : v === 'info' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8h.01" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 12h2v4h-2z" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17h.01" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  <div className="message-text">{message}</div>
                </div>
              );
            })()}
            {debugInfo && (
              <pre className="message" style={{ background:'#f3f4f6', padding:'0.5rem', fontSize:'10px', overflowX:'auto' }}>{t('debugLabel', 'Debug')}: {JSON.stringify(debugInfo, null, 2)}</pre>
            )}
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

export default StudentLogin;
