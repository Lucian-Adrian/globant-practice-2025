// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import Root from './Root.jsx';
// import './i18n.js';

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <Root />
//   </React.StrictMode>
// );

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './i18n.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/admin/*" element={<ProtectedAdminRoute><App /></ProtectedAdminRoute>} />
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
