import { Routes, Route, Navigate } from 'react-router-dom';
import ThemePreview from './pages/ThemePreview';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/theme" replace />} />
      <Route path="/theme" element={<ThemePreview />} />
      <Route path="/dashboard" element={<div className="p-8"><h1>Dashboard Coming Soon...</h1></div>} />
    </Routes>
  );
}

export default App;
