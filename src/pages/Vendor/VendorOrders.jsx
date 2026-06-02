import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { getToken } from '../../utils/auth';
import ConfirmModal from '../../components/common/ConfirmModal';
import OrderCard from '../../components/shared/OrderCard';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, isLoading: false });

  const tabs = ['All', 'Pending', 'Accepted', 'Rejected', 'Completed', 'Cancelled'];

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      let url = '/api/orders';
      if (activeTab !== 'All') {
        url += `?status=${activeTab}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.data);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const cropName = order.crop?.name?.toLowerCase() || '';
    const cropVariety = order.crop?.variety?.toLowerCase() || '';
    const contactName = order.farmer?.name?.toLowerCase() || '';
    const orderId = order._id?.slice(-6).toLowerCase() || '';
    
    return (
      cropName.includes(query) ||
      cropVariety.includes(query) ||
      contactName.includes(query) ||
      orderId.includes(query) ||
      orderId.includes(query.replace('#', ''))
    );
  });

  const handleCancelClick = (orderId) => {
    setConfirmModal({
      isOpen: true,
      orderId,
      isLoading: false
    });
  };

  const handleConfirmCancel = async () => {
    const { orderId } = confirmModal;
    if (!orderId) return;

    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    const toastId = toast.loading('Cancelling order request...');
    try {
      const token = getToken();
      const res = await axios.patch(`/api/orders/${orderId}/status`, { status: 'Cancelled' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Order request cancelled successfully!', { id: toastId });
      setConfirmModal({ isOpen: false, orderId: null, isLoading: false });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order request', { id: toastId });
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">My Orders</h1>
        <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">Track your sent order requests and procurement deals.</p>
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
            placeholder="Search by Order ID (#xxxxxx), farmer name, or crop..."
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
            <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)]">shopping_cart</span>
          </div>
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1">No orders placed</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] max-w-xs mx-auto">
            You don't have any sent order requests under "{activeTab}" status.
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
                role="vendor"
                onCancelOrder={handleCancelClick}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Confirm Cancel Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => !confirmModal.isLoading && setConfirmModal({ isOpen: false, orderId: null, isLoading: false })}
        onConfirm={handleConfirmCancel}
        title="Cancel Order Request?"
        description="Are you sure you want to cancel this order request? This action cannot be undone."
        confirmText="Yes, Cancel"
        icon="delete_forever"
        isDanger={true}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
};

export default VendorOrders;
