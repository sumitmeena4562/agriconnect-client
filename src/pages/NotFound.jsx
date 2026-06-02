import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';

const NotFound = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleGoBack = () => {
    if (!user) {
      navigate('/', { replace: true });
    } else if (user.role === 'FARMER') {
      navigate('/farmer-dashboard', { replace: true });
    } else {
      navigate('/vendor-dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm text-center relative z-10 space-y-5 animate-fade-in-up">
        {/* Animated Icon Container */}
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center mx-auto transition-transform hover:scale-105 duration-300">
          <span className="material-symbols-outlined text-[32px] text-primary-600 animate-bounce">agriculture</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-[32px] font-black text-slate-800 leading-none tracking-tight">404</h1>
          <h2 className="text-[14px] font-bold text-slate-700 uppercase tracking-wider">Page Not Found</h2>
          <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            It looks like you've wandered off the path. The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <button
          onClick={handleGoBack}
          className="btn-primary w-full shadow-md font-bold uppercase tracking-wider text-[11px] !h-[38px] active:scale-[0.98] transition-all cursor-pointer"
        >
          Go back to dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
