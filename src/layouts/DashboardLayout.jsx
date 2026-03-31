import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import Badge from '../components/ui/Badge';

const DashboardLayout = ({ children, role = 'farmer' }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const farmerNavItems = [
    { label: 'Dashboard', icon: 'grid_view', path: '/farmer/dashboard' },
    { label: 'My Crops', icon: 'psychology_alt', path: '/farmer/crops' },
    { label: 'Market Prices', icon: 'trending_up', path: '/farmer/market' },
    { label: 'Weather', icon: 'cloud', path: '/farmer/weather' },
    { label: 'Community', icon: 'groups', path: '/farmer/community' },
    { label: 'Payments', icon: 'account_balance_wallet', path: '/farmer/payments' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarItem = ({ item, isCollapsed }) => {
    const isActive = location.pathname === item.path;
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => `
          flex items-center transition-all duration-200 group relative
          ${isCollapsed ? 'justify-center w-11 h-11 mx-auto rounded-xl mb-3' : 'gap-3.5 px-4 py-3 rounded-2xl mb-1.5'}
          ${isActive 
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/15' 
            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
        `}
      >
        <span className={`material-symbols-outlined ${isCollapsed ? 'text-[22px]' : 'text-[24px]'} ${isActive ? 'text-white' : 'group-hover:text-primary-500'}`}>
          {item.icon}
        </span>
        {!isCollapsed && (
          <span className={`text-[13px] font-bold uppercase tracking-tight whitespace-nowrap ${isActive ? 'text-white' : 'text-slate-600'}`}>
            {item.label}
          </span>
        )}
      </NavLink>
    );
  };

  const mobileNavItems = farmerNavItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FBFDFF] flex flex-col lg:flex-row font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar (Left) - Balanced & Clean */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 250 : 80 }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
        className="hidden lg:flex flex-col bg-white border-r border-slate-100 z-50 relative h-screen"
      >
        <div className="p-5 flex items-center justify-between h-20">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pl-2">
                <Logo size="md" />
              </motion.div>
            ) : (
              <motion.div key="mini" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-black text-lg">A</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 mt-6 overflow-y-auto no-scrollbar">
          {farmerNavItems.map((item) => (
            <SidebarItem key={item.path} item={item} isCollapsed={!isSidebarOpen} />
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-3 rounded-2xl text-slate-300 hover:text-slate-600 transition-all group ${isSidebarOpen ? 'w-full px-5 py-3 ml-1' : 'w-11 h-11 mx-auto justify-center'}`}
          >
            <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              keyboard_double_arrow_right
            </span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Simplified Header */}
        <header className="h-16 lg:h-20 bg-white/90 backdrop-blur-md border-b border-slate-50 flex items-center justify-between px-4 lg:px-10 shrink-0 z-40">
           <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 lg:hidden active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">sort</span>
                </button>
              )}
              <h2 className="text-[14px] font-bold text-slate-700 uppercase tracking-tight flex items-center gap-2">
                {farmerNavItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
              </h2>
           </div>

           <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 focus-within:bg-white transition-all">
                 <span className="material-symbols-outlined text-slate-300 text-[16px] mr-2">search</span>
                 <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-[12px] font-medium text-slate-600 w-32 lg:w-40" />
              </div>

              <div className="flex items-center gap-2 relative cursor-pointer pl-2 border-l border-slate-50 ml-2">
                 <div className="hidden md:flex flex-col items-end">
                    <span className="text-[11px] font-bold text-slate-900 leading-none">{user?.name}</span>
                 </div>
                 <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-primary-500/20">
                    {user?.name?.slice(0,1)}
                 </div>
                 <button onClick={handleLogout} className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                 </button>
              </div>
           </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 no-scrollbar pb-24 lg:pb-8 bg-slate-50/30">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, scale: 0.99 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.99 }}
               transition={{ duration: 0.15 }}
             >
                {children}
             </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar (Super Clean) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-50 flex items-center justify-around px-6 z-[90] pb-2">
           {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink key={item.path} to={item.path} className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary-500' : 'text-slate-300'}`}>
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary-50' : 'bg-transparent'}`}>
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                   </div>
                </NavLink>
              )
           })}
        </nav>
      </div>

      {/* Super Simple Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.2, ease: 'easeOut' }} className="absolute top-0 left-0 h-full w-[240px] bg-white shadow-2xl flex flex-col border-r border-slate-100">
               <div className="p-5 flex items-center justify-between border-b border-slate-50">
                  <Logo size="sm" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 rounded-lg text-slate-300">
                    <span className="material-symbols-outlined">close</span>
                  </button>
               </div>
               <nav className="flex-1 px-3 pt-6 space-y-1">
                  {farmerNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-bold uppercase
                        ${isActive ? 'bg-primary-500 text-white' : 'text-slate-500 hover:bg-slate-50'}
                      `}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
               </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
