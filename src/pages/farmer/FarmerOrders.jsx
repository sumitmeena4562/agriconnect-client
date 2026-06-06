import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';
import OrderCard from '../../components/shared/OrderCard';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, status: null, isLoading: false });
  const [otpModal, setOtpModal] = useState({ isOpen: false, orderId: null, otpValue: '', isLoading: false });

  const otpInputRef = useRef(null);

  useEffect(() => {
    if (otpModal.isOpen) {
      const timer = setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [otpModal.isOpen]);

  const tabs = ['All', 'Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'];

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = '/orders';
      if (activeTab !== 'All') {
        url += `?status=${activeTab}`;
      }
      const res = await api.get(url);
      setOrders(res.data.data);
    } catch (error) {
      console.error('Error fetching farmer orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchOrders();
    };
    window.addEventListener('agriconnect:refresh-data', handleRefresh);
    return () => window.removeEventListener('agriconnect:refresh-data', handleRefresh);
  }, [fetchOrders]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const cropName = order.crop?.name?.toLowerCase() || '';
    const cropVariety = order.crop?.variety?.toLowerCase() || '';
    const contactName = order.vendor?.name?.toLowerCase() || '';
    const orderId = order._id?.slice(-6).toLowerCase() || '';
    
    return (
      cropName.includes(query) ||
      cropVariety.includes(query) ||
      contactName.includes(query) ||
      orderId.includes(query) ||
      orderId.includes(query.replace('#', ''))
    );
  });

  const handleUpdateStatusClick = (orderId, newStatus) => {
    if (newStatus === 'Completed') {
      setOtpModal({
        isOpen: true,
        orderId,
        otpValue: '',
        isLoading: false
      });
    } else {
      setConfirmModal({
        isOpen: true,
        orderId,
        status: newStatus,
        isLoading: false
      });
    }
  };

  const handleVerifyOtpAndComplete = async (e) => {
    if (e) e.preventDefault();
    const { orderId, otpValue } = otpModal;
    if (!otpValue || otpValue.trim().length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }

    setOtpModal(prev => ({ ...prev, isLoading: true }));
    const toastId = toast.loading('Verifying delivery OTP & completing order...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { 
        status: 'Completed', 
        otp: otpValue.trim() 
      });
      toast.success(res.data.message || 'Order completed & dispatched successfully!', { id: toastId });
      setOtpModal({ isOpen: false, orderId: null, otpValue: '', isLoading: false });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete order. Check OTP again.', { id: toastId });
      setOtpModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleConfirmStatusUpdate = async () => {
    const { orderId, status } = confirmModal;
    if (!orderId || !status) return;

    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    const toastId = toast.loading('Updating order status...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(res.data.message || `Order successfully ${status.toLowerCase()}!`, { id: toastId });
      setConfirmModal({ isOpen: false, orderId: null, status: null, isLoading: false });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status', { id: toastId });
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleVerifyPayment = async (orderId, action) => {
    const toastId = toast.loading(action === 'confirm' ? 'Confirming payment...' : 'Rejecting payment...');
    try {
      const res = await api.patch(`/orders/${orderId}/payment/verify`, { action });
      toast.success(res.data.message || (action === 'confirm' ? 'Payment verified!' : 'Payment rejected.'), { id: toastId });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update payment', { id: toastId });
    }
  };

  const getConfirmModalDetails = () => {
    const { status } = confirmModal;
    if (status === 'Accepted') {
      return {
        title: 'Accept Order Request?',
        description: 'Accepting this order will decrement your crop stock. Are you sure you want to proceed?',
        confirmText: 'Yes, Accept',
        icon: 'check_circle',
        isDanger: false
      };
    }
    if (status === 'Rejected') {
      return {
        title: 'Reject Order Request?',
        description: 'Are you sure you want to reject this request? The vendor will be notified.',
        confirmText: 'Yes, Reject',
        icon: 'cancel',
        isDanger: true
      };
    }
    if (status === 'Completed') {
      return {
        title: 'Mark Order Completed?',
        description: 'This will mark the order as dispatched and successfully completed. Make sure you have delivered the produce.',
        confirmText: 'Yes, Complete',
        icon: 'task_alt',
        isDanger: false
      };
    }
    return {
      title: 'Confirm Action',
      description: 'Are you sure you want to perform this action?',
      confirmText: 'Confirm',
      icon: 'warning',
      isDanger: false
    };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">Incoming Orders</h1>
        <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">Review and manage buying requests received from vendors.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] overflow-x-auto hide-scrollbar gap-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-3 text-[11px] font-bold border-b-2 whitespace-nowrap transition-all outline-none ${
              activeTab === tab
                ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      {!isLoading && orders.length > 0 && (
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by Order ID (#xxxxxx), vendor name, or crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 h-9 text-[12px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="global-card text-center py-10 px-4">
          <div className="w-12 h-12 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)]">assignment_late</span>
          </div>
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1">No orders found</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] max-w-xs mx-auto">
            You don't have any order requests under "{activeTab}" status.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="global-card text-center py-10 px-4">
          <div className="w-12 h-12 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)]">search_off</span>
          </div>
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1">No matching orders</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] max-w-xs mx-auto">
            No orders match "{searchQuery}" under "{activeTab}" status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 w-full min-w-0">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                role="farmer"
                onUpdateStatus={handleUpdateStatusClick}
                onVerifyPayment={handleVerifyPayment}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm Status Change Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => !confirmModal.isLoading && setConfirmModal({ isOpen: false, orderId: null, status: null, isLoading: false })}
        onConfirm={handleConfirmStatusUpdate}
        isLoading={confirmModal.isLoading}
        {...getConfirmModalDetails()}
      />

      {/* OTP Entry Verification Modal */}
      <AnimatePresence>
        {otpModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !otpModal.isLoading && setOtpModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-5 z-10"
            >
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-4 mx-auto text-primary-600">
                <span className="material-symbols-outlined text-[24px]">vpn_key</span>
              </div>
              
              <h3 className="text-[16px] font-black text-slate-800 text-center mb-1">Enter Delivery OTP</h3>
              <p className="text-[11.5px] text-slate-500 text-center mb-4.5 leading-relaxed">
                Confirm pickup by asking the vendor for the 4-digit code shown on their screen.
              </p>
              
              <form onSubmit={handleVerifyOtpAndComplete} className="space-y-4">
                <div className="flex justify-center">
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={otpModal.otpValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setOtpModal(prev => ({ ...prev, otpValue: val }));
                    }}
                    placeholder="• • • •"
                    className="w-40 text-center tracking-[12px] font-black text-[22px] h-12 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-primary-500 transition-colors focus:ring-1 focus:ring-primary-500 select-all"
                    required
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpModal({ isOpen: false, orderId: null, otpValue: '', isLoading: false })}
                    disabled={otpModal.isLoading}
                    className="flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={otpModal.isLoading || otpModal.otpValue.length !== 4}
                    className="flex-1 py-2.5 rounded-lg text-[13px] font-bold text-white bg-success-600 hover:bg-success-700 shadow-sm shadow-success-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {otpModal.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[15px] font-bold">check_circle</span>
                        <span>Complete Deal</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmerOrders;
