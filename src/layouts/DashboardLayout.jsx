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
          flex items-center transition-all duration-500 group relative overflow-hidden
          ${isCollapsed ? 'justify-center w-12 h-12 mx-auto rounded-xl mb-2.5' : 'gap-3.5 px-4 py-3 rounded-2xl mb-1.5'}
          ${isActive 
            ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' 
            : 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-900'}
        `}
      >
        {/* Active Indicator Pin (Desktop Expanded) */}
        {isActive && !isCollapsed && (
          <motion.div 
            layoutId="activeIndicator"
            className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full z-10"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}

        <span className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'text-[22px]' : 'text-[24px]'} ${isActive ? 'text-white' : 'group-hover:text-primary-500'}`}>
          {item.icon}
        </span>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-[13px] font-bold uppercase tracking-tight whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-slate-600'}`}
          >
            {item.label}
          </motion.span>
        )}
      </NavLink>
    );
  };

  const mobileNavItems = farmerNavItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F9FBFC] flex flex-col lg:flex-row font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar (Left) */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="hidden lg:flex flex-col bg-white border-r border-slate-100/80 shadow-sm z-50 relative h-screen"
      >
        <div className="p-6 flex items-center justify-between h-20">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div key="full" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                <Logo size="md" />
              </motion.div>
            ) : (
              <motion.div key="mini" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mx-auto">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/20">A</div>
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
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50/80 backdrop-blur-sm rounded-[24px] p-4 border border-slate-100"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Premium Care</span>
              </div>
              <p className="text-[11px] font-bold text-slate-700 leading-snug mb-3">Your crop health is optimal today.</p>
              <button className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-800 uppercase hover:bg-slate-50 active:scale-95 transition-all">Advice Hub</button>
            </motion.div>
          )}

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`flex items-center gap-3 rounded-2xl text-slate-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all group mt-4 ${isSidebarOpen ? 'w-full px-4 py-3' : 'w-12 h-12 mx-auto justify-center'}`}
          >
            <span className="material-symbols-outlined transition-all duration-500 group-hover:scale-110" style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              keyboard_double_arrow_right
            </span>
            {isSidebarOpen && <span className="text-[11px] font-bold uppercase tracking-widest">Collapse View</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header - Mobile Compact */}
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 lg:px-10 shrink-0 z-40">
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 lg:hidden active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">sort</span>
              </button>
              <div className="lg:hidden scale-90">
                 <Logo size="sm" />
              </div>
              <div className="hidden lg:block relative">
                 <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                    {farmerNavItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                 </h2>
                 <p className="absolute -bottom-4 left-0 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Updates Available</p>
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-6">
              <div className="hidden sm:flex items-center bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/10 transition-all">
                 <span className="material-symbols-outlined text-slate-300 text-[18px] mr-2">search</span>
                 <input type="text" placeholder="Search system..." className="bg-transparent border-none focus:outline-none text-[13px] font-medium text-slate-700 w-44 lg:w-56 placeholder:text-slate-300" />
              </div>

              <div className="flex items-center gap-2">
                 <button className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary-500 transition-all relative group flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                 </button>
                 
                 <div className="h-6 w-[1px] bg-slate-100 hidden sm:block mx-2"></div>

                 <div className="flex items-center gap-2.5 relative group cursor-pointer pl-1">
                    <div className="hidden sm:flex flex-col items-end">
                       <span className="text-[12px] font-bold text-slate-900 uppercase leading-none">{user?.name}</span>
                       <span className="text-[9px] font-bold text-primary-500 uppercase tracking-widest mt-1">Farmer Pro</span>
                    </div>
                    <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-primary-500 shadow-lg shadow-primary-500/20 overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                       {user?.avatar ? (
                         <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         user?.name?.slice(0,1)
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-10 py-6 lg:py-8 no-scrollbar pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3 }}
             >
                {children}
             </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-4 z-[90] pb-2">
           {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary-600' : 'text-slate-300'}`}
                >
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'hover:bg-slate-50'}`}>
                      <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                   </div>
                </NavLink>
              )
           })}
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col rounded-r-[32px]"
            >
               <div className="p-8 flex items-center justify-between border-b border-slate-50">
                  <Logo size="md" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined">close</span>
                  </button>
               </div>

               <nav className="flex-1 px-6 pt-8 space-y-2 overflow-y-auto no-scrollbar">
                  {farmerNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-4 px-6 py-4 rounded-[20px] text-[15px] font-bold uppercase transition-all
                        ${isActive ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30' : 'text-slate-500 hover:bg-slate-50'}
                      `}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
               </nav>

               <div className="p-8 border-t border-slate-50 mt-auto">
                  <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 w-full text-rose-500 font-bold uppercase hover:bg-rose-50 rounded-2xl transition-all">
                    <span className="material-symbols-outlined">power_settings_new</span>
                    Sign Out
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
