import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage.jsx';
import SignupForm from './SignupForm.jsx';
import App from './App.jsx';

const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/admin/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);

export default Root;
