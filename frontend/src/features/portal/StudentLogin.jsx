import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{label}</label>
    {children}
  </div>
);

const StudentLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: null, password: null });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();

  const isEmail = (v) => /^\S+@\S+\.\S+$/.test(v);

  const renderError = (err) => {
    if (!err || !err.key) return '';
    const keyMap = {
      required: t('validation:required', 'This field is required'),
      invalidEmail: t('validation:invalidEmail', 'Invalid email address'),
    };
    return keyMap[err.key] || '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (name === 'email') {
      if (!value.trim()) setErrors(p => ({ ...p, email: { key: 'required' } }));
      else if (!isEmail(value)) setErrors(p => ({ ...p, email: { key: 'invalidEmail' } }));
      else setErrors(p => ({ ...p, email: null }));
    }
    if (name === 'password') {
      if (!value) setErrors(p => ({ ...p, password: { key: 'required' } }));
      else setErrors(p => ({ ...p, password: null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      if (!value.trim()) setErrors(p => ({ ...p, email: { key: 'required' } }));
      else if (!isEmail(value)) setErrors(p => ({ ...p, email: { key: 'invalidEmail' } }));
    }
    if (name === 'password') {
      if (!value) setErrors(p => ({ ...p, password: { key: 'required' } }));
    }
  };

  const formIsValid = form.email.trim() && isEmail(form.email) && form.password && !errors.email && !errors.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formIsValid) return;

    try {
      setSubmitting(true);
      const response = await fetch('/api/auth/student/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        })
      });

      let data = {};
      try { data = await response.json(); } catch (_) {}

      if (response.ok) {
        // Store tokens in localStorage
        if (data.access) localStorage.setItem('student_access_token', data.access);
        if (data.refresh) localStorage.setItem('student_refresh_token', data.refresh);

        setApiMessage(t('common:loginSuccess', 'Logged in successfully.'));
        setDebugInfo(data);

        // Redirect to student dashboard or home
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        const backendError = data.detail || data.message || data.error;
        setApiMessage(t('common:loginFailed', 'Login failed') + (backendError ? `: ${backendError}` : ''));
        setDebugInfo({ status: response.status, body: data });
      }
    } catch (err) {
      setApiMessage(t('common:networkError', 'Network error. Please try again.'));
      setDebugInfo({ error: String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate style={{
      maxWidth: 460,
      margin: '2rem auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.9rem',
      padding: '2rem',
      border: '1px solid #ccc',
      borderRadius: 8,
      background: '#fff'
    }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <select value={i18n.language} onChange={e => i18n.changeLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>
      <h2>{t('common:studentLoginTitle', 'Student Login')}</h2>
      <Field label={t('common:email')}>
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
      <Field label={t('common:password')}>
        <div style={{ position: 'relative' }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2em'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        {errors.password && <span style={{ color: 'red' }}>{renderError(errors.password)}</span>}
      </Field>
      <button
        type="submit"
        disabled={submitting || !formIsValid}
        style={{
          padding: '0.65rem 1rem',
          fontSize: '1rem',
          cursor: formIsValid && !submitting ? 'pointer' : 'not-allowed'
        }}
      >
        {submitting ? t('common:loggingIn', 'Logging in...') : t('common:login', 'Login')}
      </button>
      {apiMessage && (
        <div style={{
          marginTop: '.5rem',
          color: apiMessage.includes('successfully') ? 'green' : 'red'
        }}>
          {apiMessage}
        </div>
      )}
      {debugInfo && (
        <pre style={{
          background: '#f7f7f7',
          padding: '.5rem',
          fontSize: '.7rem',
          overflowX: 'auto'
        }}>
          {t('common:debugLabel', 'Debug')}: {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>
          {t('common:noAccount', "Don't have an account? Sign up")}
        </a>
      </div>
    </form>
  );
};

export default StudentLogin;
