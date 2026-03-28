import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const FarmerRegistration = React.lazy(() => import('./pages/FarmerRegistration'));
const CustomerRegistration = React.lazy(() => import('./pages/CustomerRegistration'));
const VendorRegistration = React.lazy(() => import('./pages/VendorRegistration'));
const ThemePreview = React.lazy(() => import('./pages/ThemePreview'));

const App = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="material-symbols-outlined animate-spin text-primary-500 text-3xl">autorenew</span></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Top-level routes to match existing Navbar/Footer links */}
        <Route path="/farmer-registration" element={<FarmerRegistration />} />
        <Route path="/customer-registration" element={<CustomerRegistration />} />
        <Route path="/vendor-registration" element={<VendorRegistration />} />
        <Route path="/theme" element={<ThemePreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
