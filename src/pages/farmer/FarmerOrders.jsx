import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { getToken } from '../../utils/auth';
import OrderCard from '../../components/shared/OrderCard';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

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
      console.error('Error fetching farmer orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    const actionText = newStatus === 'Accepted' ? 'accept' : newStatus === 'Rejected' ? 'reject' : 'complete';
    const confirmMessage = `Are you sure you want to ${actionText} this order request?`;
    if (!window.confirm(confirmMessage)) return;

    const toastId = toast.loading('Updating order status...');
    try {
      const token = getToken();
      const res = await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || `Order successfully ${newStatus.toLowerCase()}!`, { id: toastId });
      // Refresh list
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update order status', { id: toastId });
    }
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 w-full min-w-0">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                role="farmer"
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
