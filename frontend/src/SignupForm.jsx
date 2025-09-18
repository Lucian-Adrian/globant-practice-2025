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
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+373',
    localPhone: '',
    dob: '',
    status: ''
  });

  // Store error KEYS (and optional params), not final strings → re-translate on language switch
  const [errors, setErrors] = useState({
    firstName: null,
    lastName: null,
    email: null,
  countryCode: null,
  localPhone: null,
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
  const { firstName, lastName, email, localPhone, dob, status } = form;
  const phoneLooksFilled = localPhone.trim().length > 3; // minimal digits
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
  const fullPhone = form.countryCode + form.localPhone.replace(/^0+/, '');
  if (!isValidPhoneNumber(fullPhone)) return false;
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

    if (name === 'firstName' || name === 'lastName') {
      if (!NAME_ALLOWED.test(value)) return; // block disallowed char
      setForm(p => ({ ...p, [name]: value }));
      if (!value.trim()) setFieldError(name, 'required'); else setFieldError(name, null);
      return;
    }

    if (name === 'countryCode') {
      setForm(p => ({ ...p, countryCode: value }));
      // revalidate phone combined
      const full = value + form.localPhone.replace(/^0+/, '');
      if (!form.localPhone.trim()) setFieldError('localPhone', 'required');
      else if (!isValidPhoneNumber(full)) setFieldError('localPhone', 'invalidPhone');
      else setFieldError('localPhone', null);
      return;
    }

    if (name === 'localPhone') {
      const digits = value.replace(/[^0-9]/g, '');
      setForm(p => ({ ...p, localPhone: digits }));
      if (!digits) setFieldError('localPhone', 'required');
      else {
        const full = form.countryCode + digits.replace(/^0+/, '');
        if (!isValidPhoneNumber(full)) setFieldError('localPhone', 'invalidPhone');
        else setFieldError('localPhone', null);
      }
      return;
    }

    setForm((p) => ({ ...p, [name]: value }));

    if (name === 'email') {
      if (!value.trim()) setFieldError('email', 'required');
      else if (!isEmail(value)) setFieldError('email', 'invalidEmail');
      else setFieldError('email', null);
    }

  if (['dob', 'status'].includes(name)) {
      if (!value) setFieldError(name, 'required');
      else setFieldError(name, null);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

  if (name === 'localPhone' || name === 'countryCode') return; // handled in change

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

    const fullPhone = form.countryCode + form.localPhone.replace(/^0+/, '');
    const newErrors = {
      firstName: form.firstName.trim() ? null : { key: 'required' },
      lastName: form.lastName.trim() ? null : { key: 'required' },
      email: !form.email.trim()
        ? { key: 'required' }
        : isEmail(form.email) ? null : { key: 'invalidEmail' },
      localPhone: !form.localPhone.trim()
        ? { key: 'required' }
        : isValidPhoneNumber(fullPhone) ? null : { key: 'invalidPhone' },
      countryCode: null, // always selected
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
  const fullPhone = form.countryCode + form.localPhone.replace(/^0+/, '');
  let normalizedPhone = fullPhone;
  const phoneObj = parsePhoneNumberFromString(fullPhone);
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
            countryCode: '+373',
            localPhone: '',
          dob: '',
          status: ''
        });
        setErrors({
          firstName: null,
          lastName: null,
          email: null,
          countryCode: null,
          localPhone: null,
          dob: null,
          status: null
        });
      } else {
        // Map structured errors if present
        if (data.errors) {
          const fieldErrors = { ...errors };
          // Reset first so cleared fields don't remain marked
          Object.keys(fieldErrors).forEach(k => fieldErrors[k] = null);
          Object.entries(data.errors).forEach(([k, v]) => {
            if (!Array.isArray(v) || !v.length) return;
            const first = String(v[0]).toLowerCase();
            if (k === 'first_name') fieldErrors.firstName = { key: 'required' };
            if (k === 'last_name') fieldErrors.lastName = { key: 'required' };
            if (k === 'email') fieldErrors.email = first.includes('invalid') ? { key: 'invalidEmail' } : { key: 'invalidEmail' };
            if (k === 'phone_number') fieldErrors.localPhone = { key: 'invalidPhone' };
            if (k === 'date_of_birth') fieldErrors.dob = first.includes('future') ? { key: 'invalidDob' } : first.includes('least') ? { key: 'tooYoung', params: { years: MIN_AGE_YEARS } } : { key: 'invalidDob' };
            if (k === 'status') fieldErrors.status = { key: 'required' };
          });
          setErrors(fieldErrors);
        }
        const backendError = data.message || data.detail || data.error;
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
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <select
            name="countryCode"
            value={form.countryCode}
            onChange={handleChange}
            style={{ width: '35%' }}
            aria-invalid={!!errors.countryCode}
          >
            {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
          <input
            name="localPhone"
            type="tel"
            inputMode="tel"
            value={form.localPhone}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            aria-invalid={!!errors.localPhone}
            placeholder="60123456"
          />
        </div>
        {errors.localPhone && <span style={{ color: 'red' }}>{renderError(errors.localPhone)}</span>}
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
