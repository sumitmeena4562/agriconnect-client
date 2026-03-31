import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

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
    <div className="min-h-screen bg-[#F4F7FE] flex flex-col lg:flex-row font-sans antialiased overflow-hidden">
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
        {/* Pro Navbar Header */}
        <header className="h-14 lg:h-16 bg-white border-b border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between px-4 lg:px-8 shrink-0 z-50">
            <div className="flex items-center gap-4 lg:gap-6">
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 lg:hidden border border-slate-200/50 active:scale-95 transition-all"
               >
                 <span className="material-symbols-outlined text-[20px]">sort</span>
               </button>
               
               <div className="flex-col items-start pr-4 lg:border-r lg:border-slate-200/60 hidden sm:flex">
                  <div className="flex items-center gap-2">
                     <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.08em] whitespace-nowrap">
                       {farmerNavItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                     </h2>
                     <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] font-black text-emerald-700 uppercase tracking-tighter">Live</span>
                     </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.05em] mt-0.5 hidden md:block">Real-time Agriculture Monitor</span>
               </div>

               {/* Quick Weather Widget */}
               <div className="hidden xl:flex items-center gap-3 pl-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
                     <span className="material-symbols-outlined text-[20px]">light_mode</span>
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="text-[11px] font-black text-slate-700 leading-none">32°C / Sunny</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Jaipur</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 max-w-sm hidden md:block px-6">
               <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[18px] group-focus-within:text-primary-500 transition-colors">search</span>
                  <input 
                    type="text" 
                    placeholder="Search Mandi, Crops, or Experts..." 
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl py-2 pl-10 pr-4 text-[12px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/30 transition-all shadow-inner-sm" 
                  />
               </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
               {/* Language Switcher */}
               <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200/60 rounded-xl p-1 mr-2 shadow-sm">
                  <button className="px-3 py-1 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors">EN</button>
                  <button className="px-3 py-1 text-[10px] font-black bg-white shadow-sm border border-slate-200/60 rounded-lg text-primary-600">हि</button>
               </div>

               <button className="w-10 h-10 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center relative border border-transparent hover:border-primary-100 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
               </button>

               <div className="h-8 w-[1px] bg-slate-200 hidden sm:block mx-1"></div>

               <div className="relative profile-section">
                  <div 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 rounded-xl transition-all border border-transparent hover:border-slate-200"
                  >
                     <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{user?.name}</span>
                        <div className="flex items-center gap-1">
                           <span className="w-1 h-1 rounded-full bg-primary-500"></span>
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Verified Pro</span>
                        </div>
                     </div>
                     
                     <div className="w-9 h-9 rounded-xl bg-primary-500 shadow-lg shadow-primary-500/20 flex items-center justify-center text-white font-black text-[14px] transition-transform group-hover:scale-105 border-2 border-white">
                        {user?.name?.slice(0,1)}
                     </div>
                     <span className={`material-symbols-outlined text-[20px] text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>

                  {/* Premium Profile Dropdown */}
                  <AnimatePresence>
                     {isProfileOpen && (
                       <motion.div
                         initial={{ opacity: 0, y: 12, scale: 0.95 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 12, scale: 0.95 }}
                         transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                         className="absolute right-0 mt-3 w-64 bg-white border border-slate-200/60 shadow-[0_30px_70px_rgba(0,0,0,0.15)] rounded-3xl p-2.5 z-[999]"
                       >
                          <div className="px-4 py-4 border-b border-slate-100/50 mb-1.5">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Signed in as</p>
                             <p className="text-[15px] font-black text-slate-900 truncate mt-1.5 font-heading tracking-tight">{user?.name}</p>
                          </div>

                          <div className="space-y-1">
                             {profileMenuItems.map((item) => (
                               <NavLink
                                 key={item.path}
                                 to={item.path}
                                 onClick={() => setIsProfileOpen(false)}
                                 className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-all group"
                               >
                                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-primary-100/50 transition-colors">
                                     <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-primary-600 transition-colors">{item.icon}</span>
                                  </div>
                                  <span className="text-[13px] font-bold">{item.label}</span>
                               </NavLink>
                             ))}
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-100">
                             <button 
                               onClick={handleLogout}
                               className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group"
                             >
                                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                   <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">logout</span>
                                </div>
                                <span className="text-[12px] font-black uppercase tracking-wider">Sign Out</span>
                             </button>
                          </div>
                       </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-4 lg:py-6 no-scrollbar pb-24 lg:pb-8">
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

        {/* Mobile Bottom Navigation Bar (Floating & Premium) */}
        <nav className="lg:hidden fixed bottom-5 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[24px] flex items-center justify-around px-4 z-[90] pointer-events-auto">
           {mobileNavItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              // Add a central button space after the second item
              return (
                <React.Fragment key={item.path}>
                  <NavLink to={item.path} className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${isActive ? 'text-primary-600 scale-110' : 'text-slate-400'}`}>
                     <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center transition-all ${isActive ? 'bg-primary-50 shadow-sm shadow-primary-200/50' : 'bg-transparent'}`}>
                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                     </div>
                     {isActive && (
                       <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-600" />
                     )}
                  </NavLink>
                  
                  {index === 1 && (
                    <div className="flex items-center justify-center -mt-8">
                       <button className="w-12 h-12 rounded-[18px] bg-primary-500 shadow-lg shadow-primary-500/30 flex items-center justify-center text-white active:scale-90 transition-all border-4 border-[#F4F7FE]">
                          <span className="material-symbols-outlined text-[24px]">add</span>
                       </button>
                    </div>
                  )}
                </React.Fragment>
              )
           })}
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
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
