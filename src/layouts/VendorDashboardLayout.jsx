import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Logo from '../components/common/Logo';
import ConfirmModal from '../components/common/ConfirmModal';

import { getToken, getUser } from '../utils/auth';
import { formatTimeAgo } from '../utils/time';

const VendorDashboardLayout = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userInitials, setUserInitials] = useState('VA');
  const [userName, setUserName] = useState('');

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const isInitialLoad = useRef(true);
  const notificationsRef = useRef([]);

  const notificationsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Request browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Premium two-tone chime using Web Audio API
  const playNotificationChime = () => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(784, now + 0.12);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.3);
    } catch (e) {
      // Silently fail if Audio API not available
    }
  };

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await api.get('/notifications');
      const newNotifications = res.data.data;

      // Trigger active toast messages, chime sound, and push for new unread notifications
      if (!isInitialLoad.current && newNotifications.length > 0) {
        let hasNewUnread = false;
        newNotifications.forEach(n => {
          const exists = notificationsRef.current.some(prev => prev._id === n._id);
          if (!exists && !n.read) {
            hasNewUnread = true;
            toast(n.text, {
              icon: n.type === 'ORDER_RECEIVED'     ? '📦' :
                    n.type === 'ORDER_ACCEPTED'     ? '✅' :
                    n.type === 'ORDER_REJECTED'     ? '❌' :
                    n.type === 'ORDER_COMPLETED'    ? '🎉' :
                    n.type === 'ORDER_CANCELLED'    ? '⚠️' :
                    n.type === 'PAYMENT_SUBMITTED'  ? '💳' :
                    n.type === 'PAYMENT_VERIFIED'   ? '✅' :
                    n.type === 'PAYMENT_REJECTED'   ? '🔴' : '🔔',
              duration: 5000,
              style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
              }
            });

            // Browser push notification (shows when tab is not focused)
            if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
              try {
                new Notification('AgriConnect 📦', {
                  body: n.text,
                  icon: '/favicon.svg',
                  tag: n._id,
                  silent: true
                });
              } catch (e) { /* ignore */ }
            }
          }
        });

        // Play chime once for batch of new notifications
        if (hasNewUnread) {
          playNotificationChime();
        }
      }

      setNotifications(newNotifications);
      isInitialLoad.current = false;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);



  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-read', {});
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const handleMarkSingleRead = async (notificationId) => {
    const found = notifications.find(n => n._id === notificationId);
    if (found && found.read) return;

    try {
      await api.patch(`/notifications/${notificationId}/read`, {});
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const handleNotificationNav = async (n) => {
    await handleMarkSingleRead(n._id);
    setIsNotificationsOpen(false);
    navigate('/vendor-dashboard/orders');
  };

  // Activate Vendor Theme globally for the entire dashboard
  useEffect(() => {
    document.body.classList.add('theme-vendor');
    return () => {
      document.body.classList.remove('theme-vendor');
    };
  }, []);

  useEffect(() => {
    const token = getToken();
    
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    const user = getUser() || {};
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
        <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:ml-[80px]' : 'md:ml-[220px]'} pb-[70px] md:pb-0 min-h-screen relative flex flex-col`}>
        {/* Top Header */}
        <header className="h-14 sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="md:hidden">
            <Logo size="sm" color="#3B82F6" />
          </div>
          <div className="hidden md:block">
            <h2 className="text-[16px] font-black text-slate-800 leading-none pt-1">Procurement Portal</h2>
          </div>
          
          <div className="flex items-center gap-3 relative">
            <div className="relative" ref={notificationsDropdownRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">notifications</span>
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2.5 z-50 overflow-hidden"
                  >
                    <div className="px-3.5 pb-2 border-b border-slate-100 flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Notifications</span>
                      <button 
                        onClick={handleMarkAllRead} 
                        className="text-[9.5px] font-bold text-primary-600 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-[11px] font-medium select-none">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n._id} 
                            onClick={() => handleNotificationNav(n)}
                            className={`px-3.5 py-2 text-[10.5px] leading-snug cursor-pointer transition-colors hover:bg-slate-50 flex items-start gap-2 ${!n.read ? 'bg-primary-50/40 font-bold' : ''}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-transparent'}`} />
                            <div>
                              <p className="text-slate-700">{n.text}</p>
                              <span className="text-[8.5px] text-slate-400 font-medium block mt-0.5">{formatTimeAgo(n.createdAt)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="border-t border-slate-100 p-2 text-center bg-slate-50/50">
                      <button 
                        onClick={() => { setIsNotificationsOpen(false); navigate('/vendor-dashboard/notifications'); }}
                        className="text-[10px] font-bold text-[var(--color-primary-600)] hover:underline flex items-center justify-center gap-0.5 mx-auto cursor-pointer"
                      >
                        <span>View all notifications</span>
                        <span className="material-symbols-outlined text-[12px]">arrow_right_alt</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 border border-white shadow-sm flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
              >
                <span className="text-white font-bold text-[11px] leading-none relative top-[1px]">{userInitials}</span>
              </div>

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
