import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import TestJWT from './TestJWT.jsx';
import SignupForm from './SignupForm.jsx';
import { LanguageProvider } from './LanguageContext.jsx';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public signup form (localized) */}
        <Route
          path="/signup"
          element={
            <LanguageProvider>
              <SignupForm />
            </LanguageProvider>
          }
        />
        <Route path="/test-jwt" element={<TestJWT />} />
        {/* Admin mounted under /admin - RA handles /admin/login etc. */}
        <Route path="/admin/*" element={<App />} />
        {/* Student portal at root */}
        <Route
          path="/"
          element={
            <LanguageProvider>
              <SignupForm />
            </LanguageProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);