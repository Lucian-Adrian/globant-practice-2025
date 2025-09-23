// Moved from src/SignupForm.jsx unchanged for now except updated relative imports.
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

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

  const handleSubmit = async (e) => {
    e.preventDefault(); setApiMessage(null); setDebugInfo(null);
    if(!validateAll()) return;
    const fullPhone = form.countryCode + form.localPhone.replace(/^0+/, '');
    let normalizedPhone = fullPhone; const phoneObj = parsePhoneNumberFromString(fullPhone); if(phoneObj?.isValid()) normalizedPhone = phoneObj.number;
    try { setSubmitting(true); const response = await fetch('/api/students/', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ first_name:form.firstName.trim(), last_name:form.lastName.trim(), email:form.email.trim(), phone_number:normalizedPhone, date_of_birth:form.dob, password:form.password })}); let data={}; try{ data= await response.json(); }catch(_){}
      if(response.ok){ setApiMessage(t('common:signupSuccess', 'Signed up successfully.')); setDebugInfo(data); setForm({ firstName:'',lastName:'',email:'',countryCode:'+373',localPhone:'',dob:'',password:'',confirmPassword:'' }); setErrors({ firstName:null,lastName:null,email:null,countryCode:null,localPhone:null,dob:null,password:null,confirmPassword:null }); } else { if(data.errors){ const fieldErrors={...errors}; Object.keys(fieldErrors).forEach(k=>fieldErrors[k]=null); Object.entries(data.errors).forEach(([k,v])=>{ if(!Array.isArray(v)||!v.length) return; const first=String(v[0]).toLowerCase(); if(k==='first_name') fieldErrors.firstName={key:'required'}; if(k==='last_name') fieldErrors.lastName={key:'required'}; if(k==='email') fieldErrors.email= first.includes('invalid')?{key:'invalidEmail'}:{key:'invalidEmail'}; if(k==='phone_number') fieldErrors.localPhone={key:'invalidPhone'}; if(k==='date_of_birth') fieldErrors.dob= first.includes('future')?{key:'invalidDob'}: first.includes('least')?{key:'tooYoung',params:{years:MIN_AGE_YEARS}}:{key:'invalidDob'}; }); setErrors(fieldErrors);} const backendError = data.message || data.detail || data.error; setApiMessage(t('common:signupFailed', 'Sign up failed') + (backendError?`: ${backendError}`:'')); setDebugInfo({ status:response.status, body:data }); }
    } catch(err){ setApiMessage(t('common:networkError', 'Network error. Please try again.')); setDebugInfo({ error:String(err) }); } finally { setSubmitting(false); }
  };

  const maxDobForPicker = yyyyMmDdLocal(cutoff);

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth:460, margin:'2rem auto', display:'flex', flexDirection:'column', gap:'0.9rem', padding:'2rem', border:'1px solid #ccc', borderRadius:8, background:'#fff' }}>
      <div style={{ position:'absolute', top:20, right:20 }}>
  <select value={i18n.language} onChange={e=> i18n.changeLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>
  <h2>{t('common:signupTitle')}</h2>
  <Field label={t('common:firstName')}><input name="firstName" value={form.firstName} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.firstName} />{errors.firstName && <span style={{color:'red'}}>{renderError(errors.firstName)}</span>}</Field>
  <Field label={t('common:lastName')}><input name="lastName" value={form.lastName} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.lastName} />{errors.lastName && <span style={{color:'red'}}>{renderError(errors.lastName)}</span>}</Field>
  <Field label={t('common:email')}><input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.email} />{errors.email && <span style={{color:'red'}}>{renderError(errors.email)}</span>}</Field>
  <Field label={t('common:phone')}><div style={{display:'flex', gap:'.5rem'}}><select name="countryCode" value={form.countryCode} onChange={handleChange} style={{width:'35%'}} aria-invalid={!!errors.countryCode}>{COUNTRY_CODES.map(c=> <option key={c.code} value={c.code}>{c.label}</option>)}</select><input name="localPhone" type="tel" inputMode="tel" value={form.localPhone} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.localPhone} placeholder="60123456" /></div>{errors.localPhone && <span style={{color:'red'}}>{renderError(errors.localPhone)}</span>}</Field>
  <Field label={t('common:password')}><div style={{position:'relative'}}><input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.password} /><button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1.2em'}}>{showPassword ? '🙈' : '👁️'}</button></div>{errors.password && <span style={{color:'red'}}>{renderError(errors.password)}</span>}</Field>
  <Field label={t('common:confirmPassword')}><div style={{position:'relative'}}><input name="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.confirmPassword} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1.2em'}}>{showConfirmPassword ? '🙈' : '👁️'}</button></div>{errors.confirmPassword && <span style={{color:'red'}}>{renderError(errors.confirmPassword)}</span>}</Field>
  <Field label={t('common:dob')}><input name="dob" type="date" value={form.dob} onChange={handleChange} onBlur={handleBlur} required aria-invalid={!!errors.dob} max={maxDobForPicker} />{errors.dob && <span style={{color:'red'}}>{renderError(errors.dob)}</span>}</Field>
  {/* Status field removed as requested */}
  <button type="submit" disabled={submitting || !formIsValid} style={{ padding:'0.65rem 1rem', fontSize:'1rem', cursor: formIsValid && !submitting ? 'pointer':'not-allowed' }}>{submitting ? t('common:submitting') : t('common:signUp')}</button>
  {apiMessage && (<div style={{ marginTop:'.5rem', color: apiMessage.startsWith(t('common:signupSuccess')) ? 'green':'red' }}>{apiMessage}</div>)}
  {debugInfo && (<pre style={{ background:'#f7f7f7', padding:'.5rem', fontSize:'.7rem', overflowX:'auto' }}>{t('common:debugLabel')}: {JSON.stringify(debugInfo, null, 2)}</pre>)}
    </form>
  );
};

export default SignupForm;
