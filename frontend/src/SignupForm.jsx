import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

const SignupForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    status: ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const { t, lang, toggleLanguage } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'phone') {
      if (value.trim() === '') {
        setPhoneError('');
      } else if (!isValidPhoneNumber(value, 'RO')) {
        setPhoneError(t.invalidPhone);
      } else {
        setPhoneError('');
      }
    }
    if (name === 'email') {
      // Simple email validation
      if (value.trim() === '') {
        setEmailError('');
      } else if (!/^\S+@\S+\.\S+$/.test(value)) {
        setEmailError(t.invalidEmail);
      } else {
        setEmailError('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Normalize phone number
    let normalizedPhone = form.phone;
    const phoneObj = parsePhoneNumberFromString(form.phone, 'RO');
    if (phoneObj && phoneObj.isValid()) {
      normalizedPhone = phoneObj.number; // E.164 format
    }
    if (phoneError) {
      alert(phoneError);
      return;
    }
    if (emailError) {
      alert(emailError);
      return;
    }
    try {
      const response = await fetch('/api/students/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: normalizedPhone,
          dob: form.dob,
          status: form.status,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Signup successful!');
      } else {
        alert(data.error || 'Signup failed.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <select value={lang} onChange={e => toggleLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="ro">Română</option>
          <option value="ru">Русский</option>
        </select>
      </div>
      <h2>{t.signupTitle}</h2>
      <input name="firstName" placeholder={t.firstName} value={form.firstName} onChange={handleChange} required />
      <input name="lastName" placeholder={t.lastName} value={form.lastName} onChange={handleChange} required />
  <input name="email" type="email" placeholder={t.email} value={form.email} onChange={handleChange} required />
  {emailError && <span style={{ color: 'red', fontSize: '0.9rem' }}>{emailError}</span>}
  <input name="phone" type="tel" placeholder={t.phone} value={form.phone} onChange={handleChange} required />
  {phoneError && <span style={{ color: 'red', fontSize: '0.9rem' }}>{phoneError}</span>}
      <input name="dob" type="date" placeholder={t.dob} value={form.dob} onChange={handleChange} required />
      <select name="status" value={form.status} onChange={handleChange} required>
        <option value="">{t.selectStatus}</option>
        <option value="active">{t.active}</option>
        <option value="inactive">{t.inactive}</option>
      </select>
      <button type="submit" style={{ padding: '0.5rem 1rem', fontSize: '1rem', cursor: 'pointer' }}>{t.signUp}</button>
    </form>
  );
};

export default SignupForm;
