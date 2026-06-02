import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getToken } from '../../utils/auth';

const VendorOrders = () => {
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
      console.error('Error fetching vendor orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order request?')) return;

    const toastId = toast.loading('Cancelling order request...');
    try {
      const token = getToken();
      const res = await axios.patch(`/api/orders/${orderId}/status`, { status: 'Cancelled' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(res.data.message || 'Order request cancelled successfully!', { id: toastId });
      // Refresh list
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order request', { id: toastId });
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning-50 text-warning-600 border border-warning-200';
      case 'Accepted':
        return 'bg-primary-50 text-primary-600 border border-primary-200';
      case 'Completed':
        return 'bg-success-50 text-success-600 border border-success-200';
      case 'Rejected':
        return 'bg-danger-50 text-danger-600 border border-danger-200';
      case 'Cancelled':
        return 'bg-slate-50 text-slate-400 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
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
      <div className="flex border-b border-[var(--color-border)] overflow-x-auto hide-scrollbar gap-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-3 text-[11px] font-bold border-b-2 whitespace-nowrap transition-all outline-none ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
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
            <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)]">shopping_cart</span>
          </div>
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1">No orders placed</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] max-w-xs mx-auto">
            You don't have any sent order requests under "{activeTab}" status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="global-card flex flex-col justify-between"
              >
                {/* Crop & Status Header */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2.5">
                    <div>
                      <h3 className="text-[13.5px] font-black text-[var(--color-text-primary)] leading-tight">{order.crop?.name || 'Deleted Crop'}</h3>
                      <p className="text-[10px] text-[var(--color-text-secondary)] font-medium uppercase mt-0.5">{order.crop?.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <hr className="border-[var(--color-border)] my-2" />

                  {/* Seller Details */}
                  <div className="space-y-1.5 text-[11.5px]">
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)] font-medium">Seller (Farmer):</span>
                      <span className="font-bold text-[var(--color-text-primary)]">{order.farmer?.name}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)] font-medium">Phone:</span>
                      <a href={`tel:${order.farmer?.phone}`} className="font-bold text-primary-600 hover:underline flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">call</span>
                        {order.farmer?.phone}
                      </a>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)] font-medium">Farm Location:</span>
                      <span className="font-bold text-[var(--color-text-primary)] truncate max-w-[200px]" title={order.farmer?.location}>{order.farmer?.location || 'Not Specified'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)] font-medium">Quantity Requested:</span>
                      <span className="font-bold text-[var(--color-text-primary)]">{order.requestedQuantity} {order.crop?.unit}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-secondary)] font-medium">Offered Price:</span>
                      <span className="font-bold text-[var(--color-text-primary)]">₹{order.offeredPrice} / {order.crop?.unit}</span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-[var(--color-border)]">
                      <span className="text-[var(--color-text-secondary)] font-bold">Total Deal Amount:</span>
                      <span className="font-black text-[13.5px] text-[var(--color-text-primary)]">₹{order.requestedQuantity * order.offeredPrice}</span>
                    </div>

                    {order.message && (
                      <div className="mt-2.5 p-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg text-[10.5px] text-slate-600 italic">
                        <p className="font-semibold not-italic text-slate-400 text-[9px] uppercase tracking-wider mb-0.5">Your Message:</p>
                        "{order.message}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                {order.status === 'Pending' && (
                  <div className="flex gap-2 mt-4 pt-3.5 border-t border-[var(--color-border)]">
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="w-full py-1.5 rounded-lg border border-danger-200 text-danger-600 bg-white hover:bg-danger-50 text-[11px] font-bold transition-all active:scale-[0.98]"
                    >
                      Cancel Request
                    </button>
                  </div>
                )}

                {/* Date Display */}
                <div className="mt-2 text-[9px] font-bold text-slate-400 self-end">
                  Requested on: {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
