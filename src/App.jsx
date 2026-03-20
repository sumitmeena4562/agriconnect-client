import { Routes, Route } from 'react-router-dom';
import ThemePreview from './pages/ThemePreview';
import LandingPage from './pages/LandingPage';
import './App.css';
import FarmerRegistration from './pages/FarmerRegistration';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/theme" element={<ThemePreview />} />
      <Route path="/farmer-registration" element={<FarmerRegistration/>} />
      <Route path="/dashboard" element={<div className="p-8"><h1>Dashboard Coming Soon...</h1></div>} />
    </Routes>
  );
}

export default App;
