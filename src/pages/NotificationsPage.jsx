import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getToken, getUser } from '../utils/auth';
import { formatTimeAgo } from '../utils/time';

const NotificationsPage = () => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [otpVisible, setOtpVisible] = useState(null);
  const [isClearingRead, setIsClearingRead] = useState(false);

  const user = getUser() || {};
  const isFarmer = user.role === 'FARMER';

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);


  const handleMarkAllRead = async () => {
    if (notifications.filter(n => !n.read).length === 0) return;
    
    const toastId = toast.loading('Marking all as read...');
    try {
      const token = getToken();
      await axios.patch('/api/notifications/mark-read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read', { id: toastId });
    } catch (error) {
      console.error('Error marking all read:', error);
      toast.error('Failed to mark read', { id: toastId });
    }
  };

  const handleClearRead = async () => {
    const readCount = notifications.filter(n => n.read).length;
    if (readCount === 0) return;
    
    setIsClearingRead(true);
    const toastId = toast.loading('Clearing read notifications...');
    try {
      const token = getToken();
      await axios.delete('/api/notifications/read', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => !n.read));
      toast.success(`${readCount} read notification${readCount > 1 ? 's' : ''} cleared`, { id: toastId });
    } catch (error) {
      console.error('Error clearing read:', error);
      toast.error('Failed to clear notifications', { id: toastId });
    } finally {
      setIsClearingRead(false);
    }
  };

  const handleNotificationClick = async (n) => {
    // If unread, mark it as read on server first
    if (!n.read) {
      try {
        const token = getToken();
        await axios.patch(`/api/notifications/${n._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
      } catch (error) {
        console.error('Error marking read:', error);
      }
    }

    // Redirect to appropriate page
    const dashboardPrefix = isFarmer ? '/farmer-dashboard' : '/vendor-dashboard';
    
    if (n.type && ['ORDER_RECEIVED', 'ORDER_ACCEPTED', 'ORDER_REJECTED', 'ORDER_COMPLETED', 'ORDER_CANCELLED'].includes(n.type)) {
      const shortId = n.order?._id ? n.order._id.slice(-6).toUpperCase() : '';
      navigate(`${dashboardPrefix}/orders`, { state: { searchQuery: shortId } });
    } else if (n.order) {
      navigate(`${dashboardPrefix}/orders`);
    } else {
      navigate(dashboardPrefix);
    }
  };

  // Quick Action: Accept Order (Farmer only)
  const handleAcceptOrder = async (e, orderId, notificationId) => {
    e.stopPropagation();
    setActionLoadingId(notificationId);
    try {
      const token = getToken();
      await axios.patch(`/api/orders/${orderId}/status`, { status: 'Accepted' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order accepted successfully! OTP generated.');
      await fetchNotifications();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
      await fetchNotifications();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Reject Order (Farmer only)
  const handleRejectOrder = async (e, orderId, notificationId) => {
    e.stopPropagation();
    setActionLoadingId(notificationId);
    try {
      const token = getToken();
      await axios.patch(`/api/orders/${orderId}/status`, { status: 'Rejected' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order rejected.');
      await fetchNotifications();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error(error.response?.data?.message || 'Failed to reject order');
      await fetchNotifications();
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Action: Toggle OTP visibility (Vendor only)
  const handleToggleOtp = (e, notificationId) => {
    e.stopPropagation();
    setOtpVisible(prev => prev === notificationId ? null : notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_RECEIVED':
        return { emoji: '🌾', bg: 'bg-[var(--color-primary-50)] border-[var(--color-primary-100)] text-[var(--color-primary-600)]' };
      case 'ORDER_ACCEPTED':
        return { emoji: '✅', bg: 'bg-[var(--color-success-50)] border-[var(--color-success-100)] text-[var(--color-success-600)]' };
      case 'ORDER_REJECTED':
        return { emoji: '❌', bg: 'bg-[var(--color-danger-50)] border-[var(--color-danger-100)] text-[var(--color-danger-600)]' };
      case 'ORDER_COMPLETED':
        return { emoji: '🎉', bg: 'bg-[var(--color-success-50)] border-[var(--color-success-100)] text-[var(--color-success-600)]' };
      case 'ORDER_CANCELLED':
        return { emoji: '⚠️', bg: 'bg-[var(--color-warning-50)] border-[var(--color-warning-100)] text-[var(--color-warning-600)]' };
      default:
        return { emoji: '🔔', bg: 'bg-slate-50 border-slate-100 text-slate-500' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return { text: 'Pending', cls: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'Accepted':
        return { text: 'Accepted', cls: 'bg-[var(--color-success-50)] text-[var(--color-success-600)] border-[var(--color-success-100)]' };
      case 'Rejected':
        return { text: 'Rejected', cls: 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)] border-[var(--color-danger-100)]' };
      case 'Completed':
        return { text: 'Completed', cls: 'bg-[var(--color-success-50)] text-[var(--color-success-600)] border-[var(--color-success-100)]' };
      case 'Cancelled':
        return { text: 'Cancelled', cls: 'bg-slate-50 text-slate-500 border-slate-200' };
      default:
        return { text: status || '—', cls: 'bg-slate-50 text-slate-500 border-slate-200' };
    }
  };

  // Filtered List
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Unread') return !n.read;
    if (activeTab === 'Read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;
  const backDestination = isFarmer ? '/farmer-dashboard' : '/vendor-dashboard';

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(backDestination)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <span className="material-symbols-outlined text-[18px]! text-slate-600">arrow_back</span>
          </button>
          <div>
            <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">
              Notifications Center
            </h1>
            <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">
              Manage your procurement alerts, requests, and transaction lifecycle updates.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-center">
          {readCount > 0 && (
            <button
              onClick={handleClearRead}
              disabled={isClearingRead}
              className="h-8 px-3 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              <span className="hidden sm:inline">Clear Read</span>
            </button>
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="h-8 px-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[15px]">done_all</span>
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[var(--color-border)] gap-2 overflow-x-auto hide-scrollbar flex-nowrap w-full">
        {['All', 'Unread', 'Read'].map((tab) => {
          const count = tab === 'All' ? notifications.length : tab === 'Unread' ? unreadCount : readCount;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-3 text-[11px] font-bold border-b-2 whitespace-nowrap transition-all outline-none flex items-center gap-1.5 cursor-pointer shrink-0 ${
                isActive
                  ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-extrabold ${isActive ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-600)]' : 'bg-slate-100 text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Panel Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="global-card text-center py-12 px-4 max-w-md mx-auto">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-350">
            <span className="material-symbols-outlined text-[28px]">notifications_off</span>
          </div>
          <h3 className="text-[14.5px] font-extrabold text-[var(--color-text-primary)] mb-1">
            No notifications found
          </h3>
          <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] max-w-xs mx-auto">
            {activeTab === 'All' 
              ? 'You have no alerts at this time. When order states change, updates will show up here.' 
              : `You have no notifications filtered under "${activeTab}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-w-3xl">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((n) => {
              const iconData = getNotificationIcon(n.type);
              const order = n.order;
              const hasOrderData = order && order.crop;
              const orderStatus = order?.status;
              const statusBadge = orderStatus ? getStatusBadge(orderStatus) : null;

              // Determine if quick actions should show
              const showAcceptReject = isFarmer && n.type === 'ORDER_RECEIVED' && orderStatus === 'Pending';
              const showViewOtp = !isFarmer && n.type === 'ORDER_ACCEPTED' && orderStatus === 'Accepted' && order?.deliveryOTP;

              // Readable title from type
              const getTitle = (type) => {
                switch (type) {
                  case 'ORDER_RECEIVED': return 'New Order Request';
                  case 'ORDER_ACCEPTED': return 'Order Accepted';
                  case 'ORDER_REJECTED': return 'Order Rejected';
                  case 'ORDER_COMPLETED': return 'Order Completed';
                  case 'ORDER_CANCELLED': return 'Order Cancelled';
                  default: return 'Notification';
                }
              };

              return (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNotificationClick(n)}
                  className={`rounded-2xl border cursor-pointer group transition-all duration-300 hover:shadow-md overflow-hidden ${
                    !n.read 
                      ? 'bg-[var(--color-primary-50)]/30 border-[var(--color-primary-200)]' 
                      : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex gap-3 p-3 sm:p-4">
                    {/* Left: Icon + unread indicator */}
                    <div className="flex flex-col items-center gap-1.5 pt-0.5 shrink-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-[20px] select-none ${iconData.bg}`}>
                        {iconData.emoji}
                      </div>
                      {!n.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-500)]" />
                      )}
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 min-w-0">
                      {/* Row 1: Title + Time */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className={`text-[13px] sm:text-[14px] leading-tight ${!n.read ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                          {getTitle(n.type)}
                        </h3>
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold whitespace-nowrap shrink-0">
                          {formatTimeAgo(n.createdAt)}
                        </span>
                      </div>

                      {/* Row 2: Message */}
                      <p className={`text-[11px] sm:text-[12px] leading-relaxed line-clamp-2 mb-2 ${!n.read ? 'text-slate-700' : 'text-slate-500'}`}>
                        {n.text}
                      </p>

                      {/* Row 3: Order details inline */}
                      {hasOrderData && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-slate-500 font-medium mb-2">
                          <span className="text-slate-800 font-bold">{order.crop.name}</span>
                          {order.requestedQuantity && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{order.requestedQuantity} {order.crop.unit || 'kg'}</span>
                            </>
                          )}
                          {order.offeredPrice && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-amber-600 font-bold">₹{Number(order.offeredPrice).toLocaleString('en-IN')}</span>
                            </>
                          )}
                          {statusBadge && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-px rounded ${statusBadge.cls}`}>
                                {statusBadge.text}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Row 4: Quick Actions */}
                      {showAcceptReject && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={(e) => handleAcceptOrder(e, order._id, n._id)}
                            disabled={actionLoadingId === n._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[var(--color-success-50)] text-[var(--color-success-600)] border border-[var(--color-success-100)] hover:bg-[var(--color-success-100)] transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoadingId === n._id ? (
                              <div className="w-3 h-3 rounded-full border-2 border-[var(--color-success-200)] border-t-[var(--color-success-600)] animate-spin" />
                            ) : (
                              <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            )}
                            Accept
                          </button>
                          <button
                            onClick={(e) => handleRejectOrder(e, order._id, n._id)}
                            disabled={actionLoadingId === n._id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[var(--color-danger-50)] text-[var(--color-danger-600)] border border-[var(--color-danger-100)] hover:bg-[var(--color-danger-100)] transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoadingId === n._id ? (
                              <div className="w-3 h-3 rounded-full border-2 border-[var(--color-danger-200)] border-t-[var(--color-danger-600)] animate-spin" />
                            ) : (
                              <span className="material-symbols-outlined text-[13px]">cancel</span>
                            )}
                            Reject
                          </button>
                        </div>
                      )}

                      {showViewOtp && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          <button
                            onClick={(e) => handleToggleOtp(e, n._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold bg-[var(--color-info-50)] text-[var(--color-info-600)] border border-[var(--color-info-100)] hover:bg-[var(--color-info-100)] transition-all active:scale-95 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {otpVisible === n._id ? 'visibility_off' : 'key'}
                            </span>
                            {otpVisible === n._id ? 'Hide OTP' : 'View OTP'}
                          </button>
                          
                          <AnimatePresence>
                            {otpVisible === n._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.15 }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--color-info-50)] border-2 border-dashed border-[var(--color-info-300)]"
                              >
                                <span className="text-[15px] sm:text-[17px] font-black tracking-[0.25em] text-[var(--color-info-700)] font-mono">
                                  {order.deliveryOTP}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(order.deliveryOTP);
                                    toast.success('OTP copied!');
                                  }}
                                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-[var(--color-info-100)] text-[var(--color-info-500)] transition-colors cursor-pointer"
                                  title="Copy OTP"
                                >
                                  <span className="material-symbols-outlined text-[13px]">content_copy</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Chevron */}
                    <div className="shrink-0 self-center select-none">
                      <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary-600 transition-colors">chevron_right</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
