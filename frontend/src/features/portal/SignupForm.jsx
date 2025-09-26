// Moved from src/SignupForm.jsx unchanged for now except updated relative imports.
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import './StudentLogin.css';
import heroImg from '../../../assets/login.png';
import PageIcon from './PageIcon';

const Field = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', fontSize: '.9rem', gap: '.25rem' }}>
    <span>{label}</span>
    {children}
  </label>
);

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const yyyyMmDdLocal = (d) => { const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };

const MIN_AGE_YEARS = 15;

const COUNTRY_CODES = [
  { code: '+373', label: 'MD +373' },
  { code: '+40', label: 'RO +40' },
  { code: '+49', label: 'DE +49' },
  { code: '+33', label: 'FR +33' },
  { code: '+39', label: 'IT +39' },
  { code: '+41', label: 'CH +41' },
  { code: '+44', label: 'UK +44' },
  { code: '+34', label: 'ES +34' },
  { code: '+351', label: 'PT +351' },
  { code: '+1', label: 'US +1' },
  { code: '+7', label: 'RU +7' },
  { code: '+380', label: 'UA +380' },
  { code: '+48', label: 'PL +48' },
  { code: '+386', label: 'SI +386' },
  { code: '+372', label: 'EE +372' },
];

const NAME_ALLOWED = /^[A-Za-zÀ-ÖØ-öø-ÿ\- ]*$/;

const SignupForm = () => {
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', countryCode:'+373', localPhone:'', dob:'', password:'', confirmPassword:'' });
  const [errors, setErrors] = useState({ firstName:null,lastName:null,email:null,countryCode:null,localPhone:null,dob:null,password:null,confirmPassword:null });
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const { t, i18n } = useTranslation('common');

  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);
  const today = useMemo(() => startOfDay(new Date()), []);
  const cutoff = useMemo(() => { const c = new Date(today); c.setFullYear(c.getFullYear()-MIN_AGE_YEARS); return c; }, [today]);

  const formIsComplete = useMemo(() => {
    const { firstName,lastName,email,localPhone,dob,password,confirmPassword } = form;
    const phoneLooksFilled = localPhone.trim().length > 3;
    return Boolean(firstName.trim() && lastName.trim() && email.trim() && phoneLooksFilled && dob && password && confirmPassword);
  }, [form]);

  const formIsValid = useMemo(() => {
    if(!formIsComplete) return false;
    if(!isEmail(form.email)) return false;
    const fullPhone = form.countryCode + form.localPhone.replace(/^0+/, '');
    if(!isValidPhoneNumber(fullPhone)) return false;
    if(!form.dob) return false;
    const dobDate = startOfDay(new Date(form.dob));
    if(dobDate > today) return false;
    if(dobDate > cutoff) return false;
    if(form.password.length < 6) return false;
    if(form.password !== form.confirmPassword) return false;
    return true;
  }, [formIsComplete, form, today, cutoff]);

  const setFieldError = (name, key=null, params=undefined) => setErrors(prev => ({ ...prev, [name]: key ? { key, params } : null }));
  const renderError = (err) => {
    if(!err || !err.key) return '';
    const years = err.params?.years ?? MIN_AGE_YEARS;
    const keyMap = {
      required: t('validation:required', t('common:required', 'This field is required')),
      invalidEmail: t('validation:invalidEmail', 'Invalid email address'),
      invalidPhone: t('validation:invalidPhone', 'Invalid phone number'),
      invalidDob: t('validation:invalidDob', 'You cannot select a future date'),
      tooYoung: t('validation:tooYoung', { years, defaultValue: `You must be at least ${years} years old` }),
      passwordTooShort: t('validation:passwordTooShort', 'Password must be at least 6 characters'),
      passwordsDontMatch: t('validation:passwordsDontMatch', 'Passwords do not match'),
    };
    return keyMap[err.key] || '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if(name === 'firstName' || name === 'lastName') { if(!NAME_ALLOWED.test(value)) return; setForm(p=>({...p,[name]:value})); if(!value.trim()) setFieldError(name,'required'); else setFieldError(name,null); return; }
    if(name === 'countryCode') { setForm(p=>({...p,countryCode:value})); const full = value + form.localPhone.replace(/^0+/, ''); if(!form.localPhone.trim()) setFieldError('localPhone','required'); else if(!isValidPhoneNumber(full)) setFieldError('localPhone','invalidPhone'); else setFieldError('localPhone',null); return; }
    if(name === 'localPhone') { const digits = value.replace(/[^0-9]/g,''); setForm(p=>({...p,localPhone:digits})); if(!digits) setFieldError('localPhone','required'); else { const full = form.countryCode + digits.replace(/^0+/, ''); if(!isValidPhoneNumber(full)) setFieldError('localPhone','invalidPhone'); else setFieldError('localPhone',null);} return; }
    setForm(p=>({...p,[name]:value}));
    if(name === 'email') { if(!value.trim()) setFieldError('email','required'); else if(!isEmail(value)) setFieldError('email','invalidEmail'); else setFieldError('email',null); }
    if(name==='dob') { if(!value) setFieldError(name,'required'); else setFieldError(name,null); }
    if(name === 'password') { if(!value) setFieldError('password','required'); else if(value.length < 6) setFieldError('password','passwordTooShort'); else { setFieldError('password',null); if(form.confirmPassword && value !== form.confirmPassword) setFieldError('confirmPassword','passwordsDontMatch'); else if(form.confirmPassword) setFieldError('confirmPassword',null); } }
    if(name === 'confirmPassword') { if(!value) setFieldError('confirmPassword','required'); else if(value !== form.password) setFieldError('confirmPassword','passwordsDontMatch'); else setFieldError('confirmPassword',null); }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if(name === 'localPhone' || name === 'countryCode') return;
    if(name === 'dob') { if(!value){ setFieldError('dob','required'); return;} const dobDate = startOfDay(new Date(value)); if(dobDate > today) setFieldError('dob','invalidDob'); else if(dobDate > cutoff) setFieldError('dob','tooYoung',{years:MIN_AGE_YEARS}); else setFieldError('dob',null); return; }
    if(name === 'password') { if(!value) setFieldError('password','required'); else if(value.length < 6) setFieldError('password','passwordTooShort'); return; }
    if(name === 'confirmPassword') { if(!value) setFieldError('confirmPassword','required'); else if(value !== form.password) setFieldError('confirmPassword','passwordsDontMatch'); return; }
    if(!value) setFieldError(name,'required');
  };

  const validateAll = () => {
    const dobDate = form.dob ? startOfDay(new Date(form.dob)) : null;
    const fullPhone = form.countryCode + form.localPhone.replace(/^0+/, '');
    const newErrors = {
      firstName: form.firstName.trim()?null:{key:'required'},
      lastName: form.lastName.trim()?null:{key:'required'},
      email: !form.email.trim()?{key:'required'}: isEmail(form.email)?null:{key:'invalidEmail'},
      localPhone: !form.localPhone.trim()?{key:'required'}: isValidPhoneNumber(fullPhone)?null:{key:'invalidPhone'},
      countryCode: null,
      dob: !form.dob?{key:'required'}: dobDate > today?{key:'invalidDob'}: dobDate > cutoff?{key:'tooYoung',params:{years:MIN_AGE_YEARS}}:null,
      password: !form.password?{key:'required'}: form.password.length < 6?{key:'passwordTooShort'}:null,
      confirmPassword: !form.confirmPassword?{key:'required'}: form.confirmPassword !== form.password?{key:'passwordsDontMatch'}:null,
    };
    setErrors(newErrors); return Object.values(newErrors).every(v=>!v);
  };

  // Check agreement to terms/privacy
  const validateAgreement = () => {
    if (!agreed) { setAgreedError({ key: 'required' }); return false; }
    setAgreedError(null); return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setApiMessage(null); setDebugInfo(null);
    if(!validateAll()) return;
    if(!validateAgreement()) return;
    const fullPhone = form.countryCode + form.localPhone.replace(/^0+/, '');
    let normalizedPhone = fullPhone; const phoneObj = parsePhoneNumberFromString(fullPhone); if(phoneObj?.isValid()) normalizedPhone = phoneObj.number;
    try { setSubmitting(true); const response = await fetch('/api/students/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ first_name:form.firstName.trim(), last_name:form.lastName.trim(), email:form.email.trim(), phone_number:normalizedPhone, date_of_birth:form.dob, password:form.password })}); let data={}; try{ data= await response.json(); }catch(_){}
    if(response.ok){ setApiMessage(t('common:signupSuccess', 'Signed up successfully.')); setDebugInfo(data); setForm({ firstName:'',lastName:'',email:'',countryCode:'+373',localPhone:'',dob:'',password:'',confirmPassword:'' }); setErrors({ firstName:null,lastName:null,email:null,countryCode:null,localPhone:null,dob:null,password:null,confirmPassword:null }); } else { if(data.errors){ const fieldErrors={...errors}; Object.keys(fieldErrors).forEach(k=>fieldErrors[k]=null); Object.entries(data.errors).forEach(([k,v])=>{ if(!Array.isArray(v)||!v.length) return; const first=String(v[0]).toLowerCase(); if(k==='first_name') fieldErrors.firstName={key:'required'}; if(k==='last_name') fieldErrors.lastName={key:'required'}; if(k==='email') fieldErrors.email= first.includes('invalid')?{key:'invalidEmail'}:{key:'invalidEmail'}; if(k==='phone_number') fieldErrors.localPhone={key:'invalidPhone'}; if(k==='date_of_birth') fieldErrors.dob= first.includes('future')?{key:'invalidDob'}: first.includes('least')?{key:'tooYoung',params:{years:MIN_AGE_YEARS}}:{key:'invalidDob'}; }); setErrors(fieldErrors);} const backendError = data.message || data.detail || data.error; const low = String(backendError || '').toLowerCase(); if (low.includes('pending') || low.includes('await') || low.includes('approval') || response.status === 202) { setApiMessage(t('signupPendingSweet', "We couldn't create your account right now — your registration is pending approval. Please wait, or contact us at 069 155 877.")); } else { setApiMessage(t('common:signupFailed', 'Sign up failed') + (backendError?`: ${backendError}`:'')); } setDebugInfo({ status:response.status, body:data }); }
    } catch(err){ setApiMessage(t('common:networkError', 'Network error. Please try again.')); setDebugInfo({ error:String(err) }); } finally { setSubmitting(false); }
  };

  const maxDobForPicker = yyyyMmDdLocal(cutoff);

  // Helper to choose message variant based on text and response
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
      <div className="hero-section">
        <img src={heroImg} alt={t('signupHeroAlt', 'Professional driving instructor with car')} className="hero-image" />
      </div>
      <div className="form-section">
        <div className="form-container">
          <div className="form-wrapper" style={{ maxWidth:460, margin:'0 auto' }}>
        <div className="form-header">
          <h1 className="form-title"><PageIcon name="signup" style={{ marginRight:8 }} />{t('common:signupTitle', 'Create your account')}</h1>
          <p className="form-subtitle">{t('common:signupIntro', 'Create an account to start')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="ui-form">
          <div className="input-group" style={{ display:'flex', gap:'.75rem' }}>
            <div style={{ position:'relative', flex:1 }}>
              <div className="input-icon">👤</div>
              <input name="firstName" className="input" placeholder={t('common:firstName')} value={form.firstName} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.firstName} />
              {errors.firstName && <div className="error-text">{renderError(errors.firstName)}</div>}
            </div>
            <div style={{ position:'relative', flex:1 }}>
              <div className="input-icon">👤</div>
              <input name="lastName" className="input" placeholder={t('common:lastName')} value={form.lastName} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.lastName} />
              {errors.lastName && <div className="error-text">{renderError(errors.lastName)}</div>}
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon">📧</div>
            <input name="email" type="email" className="input" placeholder={t('common:email')} value={form.email} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.email} />
            {errors.email && <div className="error-text">{renderError(errors.email)}</div>}
          </div>

          <div className="input-group" style={{ display:'flex', gap:'.5rem' }}>
            <div style={{ position:'relative', width:'35%' }}>
              <select name="countryCode" className="select" value={form.countryCode} onChange={handleChange} aria-invalid={!!errors.countryCode}>
                {COUNTRY_CODES.map(c=> <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div style={{ position:'relative', flex:1 }}>
              <div className="input-icon">📱</div>
              <input name="localPhone" type="tel" inputMode="tel" className="input" placeholder="60123456" value={form.localPhone} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.localPhone} />
              {errors.localPhone && <div className="error-text">{renderError(errors.localPhone)}</div>}
            </div>
          </div>

          <div className="input-group">
            <div className="input-icon">📅</div>
            <input name="dob" type="date" className="input" value={form.dob} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.dob} max={maxDobForPicker} />
            {errors.dob && <div className="error-text">{renderError(errors.dob)}</div>}
          </div>

          <div className="input-group">
            <div className="input-icon">🔒</div>
            <div style={{ position:'relative' }}>
              <input name="password" type={showPassword ? 'text' : 'password'} className="input" placeholder={t('passwordPlaceholder', 'Password')} value={form.password} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.password} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">{showPassword ? '🙈' : '👁'}</button>
            </div>
            {errors.password && <div className="error-text">{renderError(errors.password)}</div>}
          </div>

          <div className="input-group">
            <div className="input-icon">🔒</div>
            <div style={{ position:'relative' }}>
              <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className="input" placeholder={t('confirmPassword', 'Confirm Password')} value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.confirmPassword} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle">{showConfirmPassword ? '🙈' : '👁'}</button>
            </div>
            {errors.confirmPassword && <div className="error-text">{renderError(errors.confirmPassword)}</div>}
          </div>

          <div style={{ marginTop:'.75rem' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'.5rem', justifyContent:'center' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); if(e.target.checked) setAgreedError(null); }} />
              <span style={{ fontSize:'.9rem' }}>{t('common:agreeTo', 'I agree to the')} <Link to="/terms">{t('common:terms', 'Terms of Use')}</Link> {t('common:and', 'and')} <Link to="/privacy">{t('common:privacy', 'Privacy Policy')}</Link></span>
            </label>
            {agreedError && <div className="error-text" style={{ textAlign:'center', marginTop:'.5rem' }}>{t('validation:required', 'Please accept Terms and Privacy')}</div>}
          </div>

          <button type="submit" disabled={submitting || !formIsValid || !agreed} className="button">{submitting ? t('common:submitting') : t('common:signUp')}</button>

          {apiMessage && (() => {
            const v = messageVariant(apiMessage, debugInfo);
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
                <div className="message-text">{apiMessage}</div>
              </div>
            );
          })()}
          {debugInfo && <pre className="message" style={{ background:'#f7f7f7', padding:'.5rem', fontSize:'.7rem', overflowX:'auto' }}>{t('common:debugLabel')}: {JSON.stringify(debugInfo, null, 2)}</pre>}

          <div className="form-footer" style={{ marginTop:'1rem', textAlign:'center' }}>{t('common:haveAccount', 'Already have an account?')} <Link to="/login">{t('common:login', 'Log in')}</Link></div>

          <div className="footer" style={{ marginTop:'1rem', textAlign:'center' }}>
            <a href="/legal">{t('legalCenter', 'Legal Center')}</a>
            <a href="/terms" style={{ marginLeft:'1rem' }}>{t('termsOfUse', 'Terms of Use')}</a>
            <a href="/privacy" style={{ marginLeft:'1rem' }}>{t('privacyPolicy', 'Privacy Policy')}</a>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>
  );
};

export default SignupForm;
