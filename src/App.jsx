import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/common/ScrollToTop';
import ThemePreview from './pages/ThemePreview';
import LandingPage from './pages/LandingPage';
import FarmerRegistration from './pages/Registration/FarmerRegistration';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import FarmerDashboard from './pages/Farmer/Dashboard';
import './App.css';

function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontWeight: '600',
            fontSize: '14px',
            borderRadius: 'var(--form-border-radius)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/theme" element={<ThemePreview />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/farmer-registration" element={<FarmerRegistration />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/farmer-dashboard" element={<DashboardLayout />}>
          <Route index element={<FarmerDashboard />} />
          <Route path="crops" element={<div className="p-4"><h1 className="text-xl font-bold">My Crops (Coming Soon)</h1></div>} />
          <Route path="orders" element={<div className="p-4"><h1 className="text-xl font-bold">Orders (Coming Soon)</h1></div>} />
          <Route path="profile" element={<div className="p-4"><h1 className="text-xl font-bold">Profile (Coming Soon)</h1></div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
