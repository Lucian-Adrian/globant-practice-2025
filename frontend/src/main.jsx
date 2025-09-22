import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import SignupForm from './features/portal/SignupForm.jsx';
import { initI18n } from './i18n/index.js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

initI18n();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect direct hits on /students/board to admin route */}
        <Route path="/students/board" element={<Navigate to="/admin/students/board" replace />} />
        <Route path="/signup" element={<SignupForm />} />
  { /* TestJWT legacy component removed; can be reintroduced from legacy folder if needed */ }
        <Route path="/admin/*" element={<App />} />
        <Route path="/" element={<SignupForm />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);