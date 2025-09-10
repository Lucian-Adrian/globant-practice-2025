import React, { useMemo, useState } from 'react';
import { useLanguage } from './LanguageContext';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

// ✅ Keep Field outside to avoid remount
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

const SignupForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+373', // ✅ default Moldovan prefix
    dob: '',
    status: ''
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    status: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const { t, lang, toggleLanguage } = useLanguage();

  // Reusable email validator
  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  // Compute overall validity (useful to disable the button proactively)
  const formIsComplete = useMemo(() => {
    const { firstName, lastName, email, phone, dob, status } = form;
    // Phone must be more than just '+' or '+373'
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
    // Run quick client-side checks (email/phone formats)
    if (!formIsComplete) return false;
    if (!isEmail(form.email)) return false;
    if (!isValidPhoneNumber(form.phone)) return false;
    return true;
  }, [formIsComplete, form]);

  const setFieldError = (name, message) =>
    setErrors((prev) => ({ ...prev, [name]: message }));

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const v = sanitizePhone(value);
      setForm((p) => ({ ...p, phone: v }));

      // Live phone validation
      if (!v.trim() || v === '+' || v === '+373') {
        setFieldError('phone', t.required || 'This field is required');
      } else if (!isValidPhoneNumber(v)) {
        setFieldError('phone', t.invalidPhone || 'Invalid phone number');
      } else {
        setFieldError('phone', '');
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));

    // Live email validation
    if (name === 'email') {
      if (!value.trim()) setFieldError('email', t.required || 'This field is required');
      else if (!isEmail(value)) setFieldError('email', t.invalidEmail || 'Invalid email');
      else setFieldError('email', '');
    }

    // Generic required validation for other fields
    if (['firstName', 'lastName', 'dob', 'status'].includes(name)) {
      if (!value) setFieldError(name, t.required || 'This field is required');
      else setFieldError(name, '');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // If cleared or just '+', put back default prefix
      setForm((p) => {
        if (!p.phone || p.phone === '+') return { ...p, phone: '+373' };
        return p;
      });
      const v = value || '+373';
      if (!v || v === '+' || v === '+373') setFieldError('phone', t.required || 'This field is required');
      else if (!isValidPhoneNumber(v)) setFieldError('phone', t.invalidPhone || 'Invalid phone number');
      else setFieldError('phone', '');
      return;
    }

    // Mark empties on blur
    if (!value) setFieldError(name, t.required || 'This field is required');
  };

  const validateAll = () => {
    const newErrors = {
      firstName: form.firstName.trim() ? '' : (t.required || 'This field is required'),
      lastName: form.lastName.trim() ? '' : (t.required || 'This field is required'),
      email: !form.email.trim()
        ? (t.required || 'This field is required')
        : isEmail(form.email) ? '' : (t.invalidEmail || 'Invalid email'),
      phone:
        (!form.phone || form.phone === '+' || form.phone === '+373')
          ? (t.required || 'This field is required')
          : isValidPhoneNumber(form.phone) ? '' : (t.invalidPhone || 'Invalid phone number'),
      dob: form.dob ? '' : (t.required || 'This field is required'),
      status: form.status ? '' : (t.required || 'This field is required'),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => !msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiMessage(null);
    setDebugInfo(null);

    // Hard gate: everything required + valid
    const allGood = validateAll();
    if (!allGood) return;

    // Normalize to E.164 if valid (already checked)
    let normalizedPhone = form.phone;
    const phoneObj = parsePhoneNumberFromString(form.phone);
    if (phoneObj?.isValid()) normalizedPhone = phoneObj.number; // e.g. +373xxxxxxxx

    try {
      setSubmitting(true);
      // Backend does not yet expose /students/register/; DRF ViewSet accepts POST at /students/
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
        setApiMessage(data.message || t.signupSuccess || 'Signed up successfully.');
        setDebugInfo(data);
        setForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '+373', // ✅ reset to default prefix
          dob: '',
          status: ''
        });
        setErrors({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dob: '',
          status: ''
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
        {errors.firstName && <span style={{ color: 'red' }}>{errors.firstName}</span>}
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
        {errors.lastName && <span style={{ color: 'red' }}>{errors.lastName}</span>}
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
        {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
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
        {errors.phone && <span style={{ color: 'red' }}>{errors.phone}</span>}
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
          max={new Date().toISOString().split('T')[0]}
        />
        {errors.dob && <span style={{ color: 'red' }}>{errors.dob}</span>}
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
        {errors.status && <span style={{ color: 'red' }}>{errors.status}</span>}
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
