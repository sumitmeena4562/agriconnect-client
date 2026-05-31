import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Logo from '../components/common/Logo';
import ConfirmModal from '../components/common/ConfirmModal';

const VendorDashboardLayout = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userInitials, setUserInitials] = useState('VA');
  const [userName, setUserName] = useState('');

  // Activate Vendor Theme globally for the entire dashboard
  useEffect(() => {
    document.body.classList.add('theme-vendor');
    return () => {
      document.body.classList.remove('theme-vendor');
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('agriconnect_token') || sessionStorage.getItem('agriconnect_token') || localStorage.getItem('token');
    
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || localStorage.getItem('agriconnect_user') || '{}');
    if (user.name) {
      setUserName(user.name);
      const parts = user.name.split(' ');
      if (parts.length > 1) {
        setUserInitials(`${parts[0][0]}${parts[1][0]}`.toUpperCase());
      } else {
        setUserInitials(user.name.substring(0, 2).toUpperCase());
      }
    }
    
    if (user.role !== 'VENDOR' && user.role !== 'ADMIN') {
        toast.error('Unauthorized access. Please login as Vendor.');
        navigate('/', { replace: true });
    }
  }, [navigate]);

  const navItems = [
    { name: 'Marketplace', path: '/vendor-dashboard', icon: 'storefront' },
    { name: 'My Orders', path: '/vendor-dashboard/orders', icon: 'shopping_bag' },
    { name: 'Profile', path: '/vendor-dashboard/profile', icon: 'business_center' },
  ];

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('agriconnect_token');
      localStorage.removeItem('agriconnect_user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    }, 800);
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--color-bg-body)] flex">
        {/* 1. Desktop Sidebar */}
        <aside className={`hidden md:flex flex-col bg-white border-r border-slate-200 fixed h-full z-20 shadow-sm transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-[80px]' : 'w-[220px]'}`}>
          <div className="h-14 px-4 border-b border-slate-200 flex items-center overflow-hidden">
            <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'w-7' : 'w-[200px]'}`}>
              <Logo size="sm" color="#3B82F6" />
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
            <p className={`text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 transition-all duration-300 overflow-hidden whitespace-nowrap ${isSidebarCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-10 opacity-100 mb-2'}`}>
              Vendor Portal
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/vendor-dashboard'}
                title={isSidebarCollapsed ? item.name : ""}
                className={({ isActive }) =>
                  `flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2.5 rounded-lg transition-all duration-200 font-bold text-[12px] ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined text-[20px] transition-transform ${isActive ? 'icon-pop' : ''}`}>
                      {item.icon}
                    </span>
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-slate-200 flex flex-col gap-2 overflow-hidden">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex items-center justify-center w-full py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              title="Toggle Sidebar"
            >
              <span className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}>
                keyboard_double_arrow_left
              </span>
            </button>
            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              title={isSidebarCollapsed ? "Logout" : ""}
              className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-center gap-2'} w-full py-2.5 rounded-lg text-[12px] font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors`}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'max-w-0 opacity-0' : 'max-w-[150px] opacity-100'}`}>
                Logout
              </span>
            </button>
          </div>
        </aside>

        {/* 2. Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[220px]'} pb-[70px] md:pb-0 min-h-screen relative flex flex-col`}>
        {/* Top Header */}
        <header className="h-14 sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="md:hidden">
            <Logo size="sm" color="#3B82F6" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-[16px] font-black text-slate-800 leading-none pt-1">Procurement Portal</h2>
          </div>
          
          <div className="flex items-center gap-3 relative">
            <button className="relative w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-blue-300 border border-white shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <span className="text-white font-bold text-[11px] leading-none relative top-[1px]">{userInitials}</span>
              </div>

              {isProfileOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
              )}

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Signed in as Vendor</p>
                      <p className="text-[13px] font-bold text-slate-800 truncate">{userName || 'Vendor User'}</p>
                    </div>
                    
                    <button 
                      onClick={() => { setIsProfileOpen(false); navigate('/vendor-dashboard/profile'); }}
                      className="w-full text-left px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">business_center</span>
                      Business Profile
                    </button>
                    
                    <div className="h-[1px] bg-slate-100 my-1"></div>
                    
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsLogoutModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content injected via Outlet */}
        <div className="p-3 sm:p-5 w-full max-w-7xl mx-auto flex-1">
          <Outlet />
        </div>
      </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-1.5 pb-safe z-20 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/vendor-dashboard'}
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

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Log out of Vendor Portal?"
        description="You will need to login again to access the marketplace and your orders."
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        icon="logout"
        isDanger={true}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default VendorDashboardLayout;
