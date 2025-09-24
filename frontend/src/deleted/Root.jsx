// Legacy Root router (archived). Kept for potential future portal separation.
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import SignupForm from '../features/portal/SignupForm.jsx';
import App from '../app/App.jsx';
import { LanguageProvider } from './LanguageContext.jsx';

const Root = () => (
  <LanguageProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/admin/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </LanguageProvider>
);
export default Root;
