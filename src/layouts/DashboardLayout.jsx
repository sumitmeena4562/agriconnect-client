import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import Badge from '../components/ui/Badge';

const DashboardLayout = ({ children, role = 'farmer' }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-section')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const farmerNavItems = [
    { label: 'Dashboard', icon: 'grid_view', path: '/farmer/dashboard' },
    { label: 'My Crops', icon: 'psychology_alt', path: '/farmer/crops' },
    { label: 'Market Prices', icon: 'trending_up', path: '/farmer/market' },
    { label: 'Weather', icon: 'cloud', path: '/farmer/weather' },
    { label: 'Community', icon: 'groups', path: '/farmer/community' },
    { label: 'Payments', icon: 'account_balance_wallet', path: '/farmer/payments' },
  ];

  const profileMenuItems = [
    { label: 'My Profile', icon: 'person', path: '/farmer/profile' },
    { label: 'Account Settings', icon: 'settings', path: '/farmer/settings' },
    { label: 'Privacy & Security', icon: 'shield', path: '/farmer/security' },
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
        <header className="h-14 lg:h-16 bg-white/70 backdrop-blur-md border-b border-slate-50/80 flex items-center justify-between px-4 lg:px-8 shrink-0 z-40">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 lg:hidden active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">sort</span>
              </button>
              <div className="flex items-center gap-2 pr-4 lg:border-r lg:border-slate-100/50">
                 <h2 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.1em] whitespace-nowrap">
                   {farmerNavItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                 </h2>
                 <div className="flex items-center gap-1 ml-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                    <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Live</span>
                 </div>
              </div>

              {/* Quick Weather Widget - Pro Navbar */}
              <div className="hidden xl:flex items-center gap-3 pl-4">
                 <div className="flex flex-col items-start">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Jaipur, Rajasthan</span>
                    <span className="text-[11px] font-black text-slate-700 mt-0.5">32°C / Sunny</span>
                 </div>
                 <span className="material-symbols-outlined text-amber-500 text-[20px]">light_mode</span>
              </div>
           </div>

           <div className="flex-1 max-w-xs hidden md:block px-6">
              <div className="relative group">
                 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[16px] group-focus-within:text-primary-500 transition-colors">search</span>
                 <input 
                   type="text" 
                   placeholder="Search mandi, crops..." 
                   className="w-full bg-slate-50/50 border border-slate-100/50 rounded-xl py-1.5 pl-9 pr-4 text-[11px] font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all" 
                 />
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-4">
              {/* Language Switcher - New Pro Feature */}
              <div className="hidden sm:flex items-center bg-slate-50 border border-slate-100/50 rounded-lg p-1 mr-2">
                 <button className="px-2 py-1 text-[9px] font-black text-slate-400 hover:text-slate-600">EN</button>
                 <button className="px-2 py-1 text-[9px] font-black bg-white shadow-sm border border-slate-100 rounded-md text-primary-600">हि</button>
              </div>

              <button className="w-9 h-9 rounded-xl text-slate-300 hover:text-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center relative">
                 <span className="material-symbols-outlined text-[20px]">notifications</span>
                 <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="h-6 w-[1px] bg-slate-100 hidden sm:block mx-1"></div>

              <div className="relative profile-section">
                 <div 
                   onClick={() => setIsProfileOpen(!isProfileOpen)}
                   className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-all"
                 >
                    <div className="hidden lg:flex flex-col items-end">
                       <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-0.5">{user?.name}</span>
                       <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Verified Pro</span>
                    </div>
                    
                    <div className="w-8 h-8 rounded-lg bg-primary-500 shadow-md shadow-primary-500/10 flex items-center justify-center text-white font-black text-xs transition-transform group-hover:scale-105">
                       {user?.name?.slice(0,1)}
                    </div>
                    <span className={`material-symbols-outlined text-[18px] text-slate-300 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>expand_more</span>
                 </div>

                 {/* Premium Profile Dropdown */}
                 <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 mt-2 w-52 bg-white/80 backdrop-blur-xl border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-2xl p-2 z-[110]"
                      >
                         <div className="px-3 py-3 border-b border-slate-50 mb-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Signed in as</p>
                            <p className="text-[12px] font-bold text-slate-800 truncate">{user?.name}</p>
                         </div>

                         {profileMenuItems.map((item) => (
                           <NavLink
                             key={item.path}
                             to={item.path}
                             onClick={() => setIsProfileOpen(false)}
                             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-all group"
                           >
                              <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary-500">{item.icon}</span>
                              <span className="text-[12px] font-bold">{item.label}</span>
                           </NavLink>
                         ))}

                         <button 
                           onClick={handleLogout}
                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all mt-1 border-t border-slate-50 pt-3"
                         >
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                            <span className="text-[12px] font-black uppercase">Sign Out</span>
                         </button>
                      </motion.div>
                    )}
                 </AnimatePresence>
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
