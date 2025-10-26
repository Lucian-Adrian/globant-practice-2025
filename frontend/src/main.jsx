import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import SignupForm from './features/portal/SignupForm.jsx';
import LandingPublic from './features/portal/LandingPublic.tsx';
import LandingStudent from './features/portal/LandingStudent.tsx';
import Lessons from './features/portal/Lessons.tsx';
import BookLesson from './features/portal/BookLesson.tsx';
import Progress from './features/portal/Progress.tsx';
import Practice from './features/portal/Practice.tsx';
import Payments from './features/portal/Payments.tsx';
import DashboardStudent from './features/portal/DashboardStudent.tsx';
import StudentLogin from './features/portal/StudentLogin.jsx';
import StudentDashboard from './features/portal/StudentDashboard.jsx';
import TestJWT from './TestJWT.jsx';
import { initI18n } from './i18n/index.js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';


initI18n();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
  <Route path="/admin/*" element={<App />} />
  <Route path="/lessons" element={<Lessons />} />
  <Route path="/book-lesson" element={<BookLesson />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/TestJWT" element={<TestJWT />} />
        <Route path="/landing" element={<LandingStudent />} />
        <Route path="/dashboard" element={<DashboardStudent />} />
        <Route path="/" element={<LandingPublic />} />        
        <Route path="/dash" element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);