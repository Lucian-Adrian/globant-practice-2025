import React, { useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';
import {
  MIN_STUDENT_AGE_YEARS as MIN_AGE_YEARS,
    MAX_YEARS_AGO,
  sanitizePhone,
  startOfDay,
  yyyyMmDdLocal,
    yearsAgo,
  validatePhone,
  validateEmail,
  validateStudentDob,
  normalizePhoneE164,
} from './validation/validators';

//  Keep Field outside to avoid remount
const Field = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', fontSize: '.9rem', gap: '.25rem' }}>
    <span>{label}</span>
    {children}
  </label>
);

// MIN_AGE_YEARS now comes from shared validators

const SignupForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+373', // default prefix
    dob: '',
    status: ''
  });

  // Store error KEYS (and optional params), not final strings → re-translate on language switch
  const [errors, setErrors] = useState({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    dob: null,
    status: null
  });

  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const { t, lang, toggleLanguage } = useLanguage();

  // Email validation centralized in validators

  // Precompute today + cutoff (today - 15 years), both at local midnight
  const today = useMemo(() => startOfDay(new Date()), []);
  const cutoff = useMemo(() => {
    const c = new Date(today);
    c.setFullYear(c.getFullYear() - MIN_AGE_YEARS);
    return c;
  }, [today]);

  // Disable submit early if obviously incomplete/invalid
  const formIsComplete = useMemo(() => {
    const { firstName, lastName, email, phone, dob, status } = form;
    const phoneLooksFilled = phone && phone !== '+' && phone !== '+373';
    return Boolean(
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      phoneLooksFilled &&
      dob &&
      status
    );
  }, [form]);

  const formIsValid = useMemo(() => {
    if (!formIsComplete) return false;
    if (!validateEmail(form.email).ok) return false;
    if (!validatePhone(form.phone).ok) return false;
    const dobRes = validateStudentDob(form.dob, { today, minAgeYears: MIN_AGE_YEARS });
    if (!dobRes.ok) return false;
    return true;
  }, [formIsComplete, form, today, cutoff]);

  const setFieldError = (name, key = null, params = undefined) =>
    setErrors((prev) => ({ ...prev, [name]: key ? { key, params } : null }));

  // Translate an error key (with optional params) into a string using current language
  const renderError = (err) => {
    if (!err || !err.key) return '';
    const years = err.params?.years ?? MIN_AGE_YEARS;
    const dict = {
      required: t.required || 'This field is required',
      invalidEmail: t.invalidEmail || 'Invalid email address',
      invalidPhone: t.invalidPhone || 'Invalid phone number',
      invalidDob: t.invalidDob || 'You cannot select a future date',
      // Prefer template if present, else fall back to non-template or English
      tooYoung: t.tooYoungTpl
        ? t.tooYoungTpl.replace('{years}', String(years))
        : (t.tooYoung || `You must be at least ${years} years old`),
      tooOld: t.tooOldTpl
        ? t.tooOldTpl.replace('{years}', String(years))
        : (t.tooOld || `Date cannot be more than ${years} years ago`),
    };
    return dict[err.key] || '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const v = sanitizePhone(value);
      setForm((p) => ({ ...p, phone: v }));

      if (!v.trim() || v === '+' || v === '+373') {
        setFieldError('phone', 'required');
      } else if (!validatePhone(v).ok) {
        setFieldError('phone', 'invalidPhone');
      } else {
        setFieldError('phone', null);
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));

    if (name === 'email') {
      const res = validateEmail(value);
      setFieldError('email', res.ok ? null : res.error.key, res.error?.params);
    }

    if (['firstName', 'lastName', 'dob', 'status'].includes(name)) {
      if (!value) setFieldError(name, 'required');
      else setFieldError(name, null);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      setForm((p) => {
        if (!p.phone || p.phone === '+') return { ...p, phone: '+373' };
        return p;
      });
      const v = value || '+373';
      if (!v || v === '+' || v === '+373') setFieldError('phone', 'required');
      else if (!validatePhone(v).ok) setFieldError('phone', 'invalidPhone');
      else setFieldError('phone', null);
      return;
    }

    if (name === 'dob') {
      const res = validateStudentDob(value, { today, minAgeYears: MIN_AGE_YEARS });
      setFieldError('dob', res.ok ? null : res.error.key, res.error?.params);
      return;
    }

    if (!value) setFieldError(name, 'required');
  };

  const validateAll = () => {
    const dobDate = form.dob ? startOfDay(new Date(form.dob)) : null;

    const emailRes = validateEmail(form.email);
    const phoneRes = validatePhone(form.phone);
    const dobRes = validateStudentDob(form.dob, { today, minAgeYears: MIN_AGE_YEARS });

    const newErrors = {
      firstName: form.firstName.trim() ? null : { key: 'required' },
      lastName: form.lastName.trim() ? null : { key: 'required' },
      email: emailRes.ok ? null : emailRes.error,
      phone: phoneRes.ok ? null : phoneRes.error,
      dob: dobRes.ok ? null : dobRes.error,
      status: form.status ? null : { key: 'required' },
    };

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => !msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null);
    setDebugInfo(null);

    const allGood = validateAll();
    if (!allGood) return;

    // Normalize to E.164
  const normalizedPhone = normalizePhoneE164(form.phone);

    try {
      setSubmitting(true);
      const response = await fetch('/api/students/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          email: form.email.trim(),
          phone_number: normalizedPhone,
          date_of_birth: form.dob,
          status: (form.status || '').toUpperCase() || 'ACTIVE',
        }),
      });

      let data = {};
      try { data = await response.json(); } catch (_) {}

      if (response.ok) {
        setApiMessage(data.message || (t.signupSuccess || 'Signed up successfully.'));
        setDebugInfo(data);
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '+373',
          dob: '',
          status: ''
        });
        setErrors({
          firstName: null,
          lastName: null,
          email: null,
          phone: null,
          dob: null,
          status: null
        });
      } else {
        const backendError = data.error || data.detail || JSON.stringify(data);
        setApiMessage((t.signupFailed || 'Sign up failed') + (backendError ? `: ${backendError}` : ''));
        setDebugInfo({ status: response.status, body: data });
      }
    } catch (err) {
      setApiMessage(t.networkError || 'Network error. Please try again.');
      setDebugInfo({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  // For the date picker UX: enforce [today-125y .. today-15y]
  const minDobForPicker = yyyyMmDdLocal(yearsAgo(MAX_YEARS_AGO, today));
  const maxDobForPicker = yyyyMmDdLocal(cutoff);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        maxWidth: 460, margin: '2rem auto', display: 'flex', flexDirection: 'column',
        gap: '0.9rem', padding: '2rem', border: '1px solid #ccc', borderRadius: 8, background: '#fff'
      }}
    >
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <select value={lang} onChange={e => toggleLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>

      <h2>{t.signupTitle}</h2>

      <Field label={t.firstName}>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!errors.firstName}
        />
        {errors.firstName && <span style={{ color: 'red' }}>{renderError(errors.firstName)}</span>}
      </Field>

      <Field label={t.lastName}>
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!errors.lastName}
        />
        {errors.lastName && <span style={{ color: 'red' }}>{renderError(errors.lastName)}</span>}
      </Field>

      <Field label={t.email}>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!errors.email}
        />
        {errors.email && <span style={{ color: 'red' }}>{renderError(errors.email)}</span>}
      </Field>

      <Field label={t.phone}>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!errors.phone}
        />
        {errors.phone && <span style={{ color: 'red' }}>{renderError(errors.phone)}</span>}
      </Field>

      <Field label={t.dob}>
        <input
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!errors.dob}
          min={minDobForPicker}
          max={maxDobForPicker} // ✅ must be born on/before this date (>=15 years old)
        />
        {errors.dob && <span style={{ color: 'red' }}>{renderError(errors.dob)}</span>}
      </Field>

      <Field label={t.status}>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          aria-invalid={!!errors.status}
        >
          <option value="">{t.selectStatus}</option>
          <option value="active">{t.active}</option>
          <option value="inactive">{t.inactive}</option>
        </select>
        {errors.status && <span style={{ color: 'red' }}>{renderError(errors.status)}</span>}
      </Field>

      <button
        type="submit"
        disabled={submitting || !formIsValid}
        style={{ padding: '0.65rem 1rem', fontSize: '1rem', cursor: formIsValid && !submitting ? 'pointer' : 'not-allowed' }}
      >
        {submitting ? t.submitting : t.signUp}
      </button>

      {apiMessage && (
        <div style={{ marginTop: '.5rem', color: apiMessage.startsWith(t.signupSuccess) ? 'green' : 'red' }}>
          {apiMessage}
        </div>
      )}

      {debugInfo && (
        <pre style={{ background: '#f7f7f7', padding: '.5rem', fontSize: '.7rem', overflowX: 'auto' }}>
          {t.debugLabel}: {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </form>
  );
};

export default SignupForm;
