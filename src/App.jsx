import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/common/ScrollToTop';
import ThemePreview from './pages/ThemePreview';
import LandingPage from './pages/LandingPage';
import FarmerRegistration from './pages/Registration/FarmerRegistration';
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
        <Route path="/farmer-registration" element={<FarmerRegistration />} />
        <Route path="/dashboard" element={<div className="p-8"><h1>Dashboard Coming Soon...</h1></div>} />
      </Routes>
    </>
  );
}

export default App;
