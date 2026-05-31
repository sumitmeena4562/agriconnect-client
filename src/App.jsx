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
        
        {/* Protected Dashboard Routes (Farmer) */}
        <Route path="/farmer-dashboard" element={<DashboardLayout />}>
          <Route index element={<FarmerDashboard />} />
          <Route path="crops" element={<MyCrops />} />
          <Route path="crops/new" element={<AddCrop />} />
          <Route path="crops/edit/:id" element={<AddCrop isEditMode={true} />} />
          <Route path="crops/:id" element={<CropDetails />} />
          <Route path="orders" element={<div className="p-4"><h1 className="text-xl font-bold">Orders (Coming Soon)</h1></div>} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Protected Dashboard Routes (Vendor) */}
        <Route path="/vendor-dashboard" element={<VendorDashboardLayout />}>
          <Route index element={<Marketplace />} />
          <Route path="crops/:id" element={<VendorCropDetails />} />
          <Route path="orders" element={<div className="p-4"><h1 className="text-xl font-bold">My Orders (Coming Soon)</h1></div>} />
          <Route path="profile" element={<div className="p-4"><h1 className="text-xl font-bold">Vendor Profile (Coming Soon)</h1></div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
