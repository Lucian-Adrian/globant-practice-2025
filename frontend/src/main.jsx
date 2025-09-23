import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import SignupForm from './features/portal/SignupForm.jsx';
import LandingPublic from './features/portal/LandingPublic.tsx';
import LandingStudent from './features/portal/LandingStudent.tsx';
import Lessons from './features/portal/Lessons.tsx';
import Progress from './features/portal/Progress.tsx';
import Practice from './features/portal/Practice.tsx';
import Payments from './features/portal/Payments.tsx';
import DashboardStudent from './features/portal/DashboardStudent.tsx';
import { initI18n } from './i18n/index.js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

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
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/payments" element={<Payments />} />
    <Route path="/landing" element={<LandingStudent />} />
  <Route path="/dashboard" element={<DashboardStudent />} />
        <Route path="/" element={<LandingPublic />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);