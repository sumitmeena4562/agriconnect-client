import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import ConfirmModal from '../../components/common/ConfirmModal';
import OrderCard from '../../components/shared/OrderCard';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, isLoading: false });
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, order: null, method: 'UPI', upiRef: '', note: '', isLoading: false });
  const [bankAccount, setBankAccount] = useState(null);

  const fetchBankAccount = async () => {
    try {
      const res = await api.get('/bank/account');
      setBankAccount(res.data.data);
    } catch (error) {
      console.error('Error fetching bank account:', error);
    }
  };

  useEffect(() => {
    fetchBankAccount();
  }, []);

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

  const handleSubmitPaymentClick = (order) => {
    fetchBankAccount();
    setPaymentModal({ isOpen: true, order, method: 'UPI', upiRef: '', note: '', isLoading: false });
  };

  const handleConfirmPayment = async () => {
    const { order, method, upiRef, note } = paymentModal;
    setPaymentModal(prev => ({ ...prev, isLoading: true }));
    const toastId = toast.loading('Submitting payment...');
    try {
      await api.patch(`/orders/${order._id}/payment`, { method, upiRef, note });
      toast.success('Payment submitted! Waiting for farmer confirmation.', { id: toastId });
      setPaymentModal({ isOpen: false, order: null, method: 'UPI', upiRef: '', note: '', isLoading: false });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit payment', { id: toastId });
      setPaymentModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleConfirmCancel = async () => {
    const { orderId } = confirmModal;
    if (!orderId) return;

    setConfirmModal(prev => ({ ...prev, isLoading: true }));
    const toastId = toast.loading('Cancelling order request...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'Cancelled' });
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
                onSubmitPayment={handleSubmitPaymentClick}
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

      {/* Payment Submission Modal */}
      {paymentModal.isOpen && paymentModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !paymentModal.isLoading && setPaymentModal(prev => ({ ...prev, isOpen: false }))}
          />
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 z-10 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-[15px] font-extrabold text-slate-800">💳 Submit Payment</h2>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Order #{paymentModal.order._id?.slice(-6).toUpperCase()}</p>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Amount & Balance Details */}
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
                    <span className="text-[22px] font-black text-amber-700">
                      ₹{((paymentModal.order.requestedQuantity || 0) * (paymentModal.order.offeredPrice || 0)).toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-amber-600 font-medium mt-0.5">
                      {paymentModal.order.requestedQuantity} {paymentModal.order.crop?.unit} × ₹{paymentModal.order.offeredPrice}
                    </p>
                  </div>
                </div>

                {bankAccount && (() => {
                  const orderAmt = (paymentModal.order.requestedQuantity || 0) * (paymentModal.order.offeredPrice || 0);
                  const isInsufficient = bankAccount.balance < orderAmt;
                  return (
                    <div className={`px-3 py-2 rounded-xl border text-[10.5px] font-bold flex items-center justify-between ${
                      isInsufficient 
                        ? 'bg-rose-50 border-rose-200 text-rose-700' 
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">account_balance</span>
                        <span>Bank Balance:</span>
                      </span>
                      <span>₹{bankAccount.balance.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</p>
                <div className="grid grid-cols-2 gap-2">
                  {['UPI', 'Cash', 'Bank Transfer', 'Cheque'].map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentModal(prev => ({ ...prev, method: m }))}
                      className={`h-9 rounded-lg border text-[12px] font-bold transition-all ${
                        paymentModal.method === m
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                      }`}
                    >{m}</button>
                  ))}
                </div>
              </div>

              {/* UPI / Bank Ref */}
              {(paymentModal.method === 'UPI' || paymentModal.method === 'Bank Transfer') && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {paymentModal.method === 'UPI' ? 'UPI Transaction ID' : 'Bank Reference No.'}
                  </p>
                  <input
                    type="text"
                    placeholder={paymentModal.method === 'UPI' ? 'e.g. UPI12345678' : 'e.g. NEFT123456'}
                    value={paymentModal.upiRef}
                    onChange={e => setPaymentModal(prev => ({ ...prev, upiRef: e.target.value }))}
                    className="w-full h-9 px-3 text-[12px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              )}

              {/* Note */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Note (Optional)</p>
                <textarea
                  rows={2}
                  placeholder="Any additional info for farmer..."
                  value={paymentModal.note}
                  onChange={e => setPaymentModal(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3 py-2 text-[12px] rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => !paymentModal.isLoading && setPaymentModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 text-[12.5px] font-bold hover:bg-slate-50 transition-colors"
              >Cancel</button>
              <button
                onClick={handleConfirmPayment}
                disabled={paymentModal.isLoading || (bankAccount && bankAccount.balance < ((paymentModal.order.requestedQuantity || 0) * (paymentModal.order.offeredPrice || 0)))}
                className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12.5px] font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {paymentModal.isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : '💳'}
                {paymentModal.isLoading 
                  ? 'Submitting...' 
                  : (bankAccount && bankAccount.balance < ((paymentModal.order.requestedQuantity || 0) * (paymentModal.order.offeredPrice || 0)) 
                      ? 'Insufficient Funds' 
                      : 'Submit Payment')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
