import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import TestJWT from './TestJWT.jsx';
import SignupForm from './features/portal/SignupForm.jsx';
import { initI18n } from './i18n/index.js';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

initI18n();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/test-jwt" element={<TestJWT />} />
        <Route path="/admin/*" element={<App />} />
        <Route path="/" element={<SignupForm />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);