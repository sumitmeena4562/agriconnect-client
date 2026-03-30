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
          flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group relative
          ${isActive 
            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
        `}
      >
        <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary-500'}`}>
          {item.icon}
        </span>
        {!isCollapsed && (
          <span className="text-[14px] font-black uppercase tracking-tight whitespace-nowrap">
            {item.label}
          </span>
        )}
        {isActive && !isCollapsed && (
          <motion.div 
            layoutId="activeGlow"
            className="absolute -left-1 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full"
          />
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 88 }}
        className="hidden lg:flex flex-col bg-white border-r border-slate-100 shadow-sm z-50 transition-all duration-300 relative"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Logo size="md" />
              </motion.div>
            ) : (
              <motion.div key="mini" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-auto">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white font-black text-xl">A</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
          {farmerNavItems.map((item) => (
            <SidebarItem key={item.path} item={item} isCollapsed={!isSidebarOpen} />
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className={`
            bg-slate-50 rounded-[24px] p-4 border border-slate-100 transition-all
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 scale-90 pointer-events-none'}
          `}>
             <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary-600 text-sm">auto_awesome</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Z+ Intelligence</span>
             </div>
             <p className="text-[11px] font-bold text-slate-600 leading-relaxed mb-3">Market rates are up by 4% in your area.</p>
             <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-800 uppercase tracking-tight hover:bg-slate-100 transition-all">View Analytics</button>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:text-slate-900 transition-all group"
          >
            <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: isSidebarOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
              last_page
            </span>
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Collapse Menu</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 z-40">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="hidden sm:block">
                 <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase">
                    {farmerNavItems.find(i => i.path === location.pathname)?.label || 'Overview'}
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                 </h2>
              </div>
           </div>

           <div className="flex items-center gap-3 lg:gap-6">
              <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500/10 transition-all group">
                 <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">search</span>
                 <input type="text" placeholder="Search Mandis, Crops..." className="bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 w-48 lg:w-64 placeholder:text-slate-300" />
              </div>

              <div className="flex items-center gap-2">
                 <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-all relative">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                 </button>
                 
                 <div className="h-10 w-[1px] bg-slate-100 hidden sm:block mx-2"></div>

                 <div className="flex items-center gap-3 pl-2">
                    <div className="hidden sm:flex flex-col items-end">
                       <span className="text-[13px] font-black text-slate-900 uppercase leading-none">{user?.name}</span>
                       <Badge variant="primary" size="xs" className="mt-1">Verified {role}</Badge>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500/20 transition-all">
                       {user?.avatar ? (
                         <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                         <span className="material-symbols-outlined text-slate-400">account_circle</span>
                       )}
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                    >
                       <span className="material-symbols-outlined">logout</span>
                    </button>
                 </div>
              </div>
           </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-6 lg:px-10 py-8 custom-scrollbar">
          {children}
        </main>
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
              className="absolute top-0 left-0 h-full w-[80%] max-w-sm bg-white shadow-2xl p-6 flex flex-col"
            >
               <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-50">
                  <Logo size="md" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <span className="material-symbols-outlined">close</span>
                  </button>
               </div>

               <nav className="flex-1 space-y-2">
                  {farmerNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) => `
                        flex items-center gap-4 px-5 py-4 rounded-2xl text-[15px] font-black uppercase transition-all
                        ${isActive ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}
                      `}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
               </nav>

               <div className="pt-6 border-t border-slate-50">
                  <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 w-full text-left text-rose-500 font-bold uppercase transition-all hover:bg-rose-50 rounded-2xl">
                    <span className="material-symbols-outlined">logout</span>
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
