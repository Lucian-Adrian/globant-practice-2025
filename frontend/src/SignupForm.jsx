import React, { useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

//  Keep Field outside to avoid remount
const Field = ({ label, children }) => (
  <label style={{ display: 'flex', flexDirection: 'column', fontSize: '.9rem', gap: '.25rem' }}>
    <span>{label}</span>
    {children}
  </label>
);

// Helper: allow only one leading "+" and digits
const sanitizePhone = (raw) => {
  let v = raw.replace(/[^\d+]/g, '');
  if (v.includes('+')) v = '+' + v.replace(/\+/g, ''); // collapse extras
  return v;
};

// Helpers for safe local-date comparisons
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const yyyyMmDdLocal = (d) => {
  // Local YYYY-MM-DD (no UTC shift)
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MIN_AGE_YEARS = 15;

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

  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

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
    if (!isEmail(form.email)) return false;
    if (!isValidPhoneNumber(form.phone)) return false;
    // Age validation (client-side quick check)
    if (!form.dob) return false;
    const dobDate = startOfDay(new Date(form.dob));
    if (dobDate > today) return false;     // future
    if (dobDate > cutoff) return false;    // too young
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
      } else if (!isValidPhoneNumber(v)) {
        setFieldError('phone', 'invalidPhone');
      } else {
        setFieldError('phone', null);
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));

    if (name === 'email') {
      if (!value.trim()) setFieldError('email', 'required');
      else if (!isEmail(value)) setFieldError('email', 'invalidEmail');
      else setFieldError('email', null);
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
      else if (!isValidPhoneNumber(v)) setFieldError('phone', 'invalidPhone');
      else setFieldError('phone', null);
      return;
    }

    if (name === 'dob') {
      if (!value) {
        setFieldError('dob', 'required');
        return;
      }
      const dobDate = startOfDay(new Date(value));
      if (dobDate > today) {
        setFieldError('dob', 'invalidDob');
      } else if (dobDate > cutoff) {
        setFieldError('dob', 'tooYoung', { years: MIN_AGE_YEARS });
      } else {
        setFieldError('dob', null);
      }
      return;
    }

    if (!value) setFieldError(name, 'required');
  };

  const validateAll = () => {
    const dobDate = form.dob ? startOfDay(new Date(form.dob)) : null;

    const newErrors = {
      firstName: form.firstName.trim() ? null : { key: 'required' },
      lastName: form.lastName.trim() ? null : { key: 'required' },
      email: !form.email.trim()
        ? { key: 'required' }
        : isEmail(form.email) ? null : { key: 'invalidEmail' },
      phone:
        (!form.phone || form.phone === '+' || form.phone === '+373')
          ? { key: 'required' }
          : isValidPhoneNumber(form.phone) ? null : { key: 'invalidPhone' },
      dob:
        !form.dob
          ? { key: 'required' }
          : dobDate > today
            ? { key: 'invalidDob' }
            : dobDate > cutoff
              ? { key: 'tooYoung', params: { years: MIN_AGE_YEARS } }
              : null,
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
    let normalizedPhone = form.phone;
    const phoneObj = parsePhoneNumberFromString(form.phone);
    if (phoneObj?.isValid()) normalizedPhone = phoneObj.number;

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

  // For the date picker UX: block future dates and enforce 15+ years.
  // Using 'max' = cutoff (today - 15y) automatically prevents future DOBs too.
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
