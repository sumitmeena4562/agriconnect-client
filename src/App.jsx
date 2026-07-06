import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/common/ScrollToTop';
import ThemePreview from './pages/ThemePreview';
import LandingPage from './pages/LandingPage';
import FarmerRegistration from './pages/Registration/FarmerRegistration';
import VendorRegistration from './pages/Registration/VendorRegistration';
import Marketplace from './pages/Vendor/Marketplace';
import VendorCropDetails from './pages/Vendor/VendorCropDetails';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import DashboardLayout from './layouts/DashboardLayout';
import VendorDashboardLayout from './layouts/VendorDashboardLayout';
import FarmerDashboard from './pages/Farmer/Dashboard';
import MyCrops from './pages/Farmer/MyCrops';
import AddCrop from './pages/Farmer/AddCrop';
import CropDetails from './pages/Farmer/CropDetails';
import Profile from './pages/Farmer/Profile';
import FarmerOrders from './pages/farmer/FarmerOrders';
import DriverRegistry from './pages/farmer/DriverRegistry';
import FreightTracking from './pages/farmer/FreightTracking';
import VendorOrders from './pages/Vendor/VendorOrders';
import VendorTracking from './pages/Vendor/VendorTracking';
import SharedCropLinkHandler from './pages/SharedCropLinkHandler';
import NotFound from './pages/NotFound';
import DriverTrackingPage from './pages/DriverTrackingPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import NotificationsPage from './pages/NotificationsPage';
import BankPage from './pages/BankPage';
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
        <Route path="/vendor-registration" element={<VendorRegistration />} />
        
        {/* WhatsApp Shared Link Handler */}
        <Route path="/crops/:id" element={<SharedCropLinkHandler />} />
        
        {/* Driver Live Tracking — Public (no login needed, link shared via WhatsApp) */}
        <Route path="/driver-track" element={<DriverTrackingPage />} />
        
        {/* Protected Dashboard Routes (Farmer) */}
        <Route element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="/farmer-dashboard" element={<DashboardLayout />}>
            <Route index element={<FarmerDashboard />} />
            <Route path="crops" element={<MyCrops />} />
            <Route path="crops/new" element={<AddCrop />} />
            <Route path="crops/edit/:id" element={<AddCrop isEditMode={true} />} />
            <Route path="crops/:id" element={<CropDetails />} />
            <Route path="orders" element={<FarmerOrders />} />
            <Route path="fleet" element={<DriverRegistry />} />
            <Route path="tracking" element={<FreightTracking />} />
            <Route path="bank" element={<BankPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Protected Dashboard Routes (Vendor) */}
        <Route element={<ProtectedRoute allowedRoles={['VENDOR', 'CUSTOMER', 'ADMIN']} />}>
          <Route path="/vendor-dashboard" element={<VendorDashboardLayout />}>
            <Route index element={<Marketplace />} />
            <Route path="crops/:id" element={<VendorCropDetails />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="tracking" element={<VendorTracking />} />
            <Route path="bank" element={<BankPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<div className="p-4"><h1 className="text-xl font-bold">Vendor Profile (Coming Soon)</h1></div>} />
          </Route>
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
