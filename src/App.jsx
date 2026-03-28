import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FarmerRegistration from './pages/FarmerRegistration';
import CustomerRegistration from './pages/CustomerRegistration';
import VendorRegistration from './pages/VendorRegistration';
import ThemePreview from './pages/ThemePreview';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* Top-level routes to match existing Navbar/Footer links */}
      <Route path="/farmer-registration" element={<FarmerRegistration />} />
      <Route path="/customer-registration" element={<CustomerRegistration />} />
      <Route path="/vendor-registration" element={<VendorRegistration />} />
      <Route path="/theme" element={<ThemePreview />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
