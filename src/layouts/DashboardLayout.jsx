import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

const DashboardLayout = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/farmer-dashboard', icon: 'home' },
    { name: 'My Crops', path: '/farmer-dashboard/crops', icon: 'yard' },
    { name: 'Orders', path: '/farmer-dashboard/orders', icon: 'shopping_cart' },
    { name: 'Profile', path: '/farmer-dashboard/profile', icon: 'person' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-body)] flex">
      {/* 1. Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-[220px] bg-white border-r border-slate-200 fixed h-full z-20 shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <Logo size="sm" />
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/farmer-dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 font-bold text-[12px] ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? 'icon-pop' : ''}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[12px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 md:ml-[220px] pb-[70px] md:pb-0 min-h-screen relative flex flex-col">
        {/* Top Header (Mobile & Desktop) */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="md:hidden">
            <Logo size="sm" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-[16px] font-black text-slate-800 leading-none pt-1">Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="relative w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-green-300 border border-white shadow-sm flex items-center justify-center cursor-pointer">
              <span className="text-white font-bold text-[11px]">FA</span>
            </div>
          </div>
        </header>

        {/* Page Content injected via Outlet */}
        <div className="p-3 sm:p-5 w-full max-w-7xl mx-auto flex-1">
          <Outlet />
        </div>
      </main>

      {/* 3. Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-1.5 pb-safe z-20 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/farmer-dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                isActive ? 'text-primary-600 transform -translate-y-0.5' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isActive ? 'bg-primary-50' : 'bg-transparent'}`}>
                  <span className={`material-symbols-outlined text-[20px] transition-transform ${isActive ? 'icon-pop' : ''}`}>
                    {item.icon}
                  </span>
                </div>
                <span className={`text-[8px] font-bold mt-0.5 leading-none ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default DashboardLayout;
