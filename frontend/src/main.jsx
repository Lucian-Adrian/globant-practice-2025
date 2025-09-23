import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import SignupForm from './features/portal/SignupForm.jsx';
import StudentLogin from './features/portal/StudentLogin.jsx';
import StudentDashboard from './features/portal/StudentDashboard.jsx';
import TestJWT from './TestJWT.jsx';
import { initI18n } from './i18n/index.js';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Component to protect admin routes from student tokens
const ProtectedAdminRoute = ({ children }) => {
  const studentToken = localStorage.getItem('student_access_token');
  
  // If student token exists, redirect to dashboard
  if (studentToken) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise, allow access to admin (it will handle its own auth)
  return children;
};

initI18n();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Redirect direct hits on /students/board to admin route */}
        {/* <Route path="/students/board" element={<Navigate to="/admin/students/board" replace />} /> */}
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<StudentLogin />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/TestJWT" element={<TestJWT />} />
        <Route path="/admin/*" element={<ProtectedAdminRoute><App /></ProtectedAdminRoute>} />
        <Route path="/" element={<SignupForm />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);