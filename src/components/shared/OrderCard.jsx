import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import LiveTrackingMap from './LiveTrackingMap';
import api from '../../utils/api';

const OrderCard = ({ order, role = 'farmer', onUpdateStatus, onCancelOrder, onSubmitPayment, onVerifyPayment }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrackingMapOpen, setIsTrackingMapOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState('');

  const fetchAvailableDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setAvailableDrivers(res.data.data.filter(d => d.status === 'Available'));
    } catch (e) {
      console.error("Failed to load drivers:", e);
    }
  };

  const handleOpenAssignModal = () => {
    fetchAvailableDrivers();
    setIsAssignModalOpen(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      toast.error('Please select a driver');
      return;
    }
    setIsAssigning(true);
    const toastId = toast.loading('Dispatching delivery...');
    try {
      await api.patch(`/orders/${order._id}/dispatch`, { driverId: selectedDriverId });
      toast.success('Order dispatched successfully!', { id: toastId });
      setIsAssignModalOpen(false);
      setSelectedDriverId('');
      if (onUpdateStatus) onUpdateStatus(order._id, 'REFRESH');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Dispatch failed', { id: toastId });
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-[var(--color-warning-50)] text-[var(--color-warning-600)] border border-[var(--color-warning-200)]';
      case 'Accepted':
        return 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)] border border-[var(--color-primary-200)]';
      case 'Completed':
        return 'bg-[var(--color-success-50)] text-[var(--color-success-600)] border border-[var(--color-success-200)]';
      case 'Rejected':
        return 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)] border border-[var(--color-danger-200)]';
      case 'Cancelled':
        return 'bg-[var(--color-bg-body)] text-[var(--color-text-secondary)] border border-[var(--color-border)]';
      default:
        return 'bg-[var(--color-bg-body)] text-[var(--color-text-secondary)] border border-[var(--color-border)]';
    }
  };

  const isFarmer = role === 'farmer';
  const contactPerson = isFarmer ? order.vendor : order.farmer;

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderStatusTimeline = (status) => {
    const steps = ['Pending', 'Accepted', 'Completed'];
    const currentStepIndex = steps.indexOf(status);
    const isCancelled = status === 'Cancelled';
    const isRejected = status === 'Rejected';

    if (isCancelled || isRejected) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-[11px] sm:text-[12px] font-bold flex items-center gap-2 w-full justify-center">
          <span className="material-symbols-outlined text-[16px]">cancel</span>
          <span>Order has been {status.toLowerCase()}.</span>
        </div>
      );
    }

    return (
      <div className="relative flex items-center justify-between w-full px-6 py-2 bg-slate-50 rounded-xl border border-slate-100">
        {/* Background Connector Line */}
        <div className="absolute left-[36px] right-[36px] top-[20px] h-[2px] bg-slate-200 z-0">
          <div 
            className="h-full bg-primary-600 transition-all duration-500" 
            style={{ width: `${currentStepIndex * 50}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const isDone = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                isCurrent 
                  ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                  : isDone
                    ? 'bg-primary-50 border-primary-600 text-primary-600'
                    : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {isDone && !isCurrent ? (
                  <span className="material-symbols-outlined text-[11px] font-bold">check</span>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-[9.5px] font-bold mt-1 ${isCurrent ? 'text-primary-600' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={() => setIsModalOpen(true)}
        className="bg-[var(--color-surface)] rounded-[var(--card-border-radius)] border border-[var(--color-border)] p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between w-full min-w-0 cursor-pointer group"
      >
        {/* Crop & Status Header with Thumbnail */}
        <div>
          <div className="flex gap-2.5 mb-2 min-w-0 items-start">
            {/* Thumbnail Image */}
            {order.crop?.images && order.crop.images.length > 0 ? (
              <img 
                src={order.crop.images[0]} 
                alt={order.crop.name} 
                className="w-10 h-10 object-cover rounded-lg border border-[var(--color-border)] shrink-0" 
              />
            ) : (
              <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center border border-[var(--color-border)] shrink-0">
                <span className="material-symbols-outlined text-slate-300 text-[18px]">image</span>
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <div className="flex justify-between items-start gap-1.5 min-w-0">
                <h3 className="text-[13.5px] font-bold text-[var(--color-text-primary)] leading-tight truncate flex items-center gap-1.5">
                  <span className="truncate">{order.crop?.name || 'Deleted Crop'}</span>
                  {order.crop?.variety && (
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                      ({order.crop.variety})
                    </span>
                  )}
                </h3>
                <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="text-[9.5px] text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mt-0.5 flex items-center gap-1.5 min-w-0">
                <span className="truncate">{order.crop?.category}</span>
                <span className="text-slate-400 bg-slate-100 px-1 py-0.2 rounded border border-slate-200/50 text-[8.5px] select-all font-bold shrink-0">
                  #{order._id?.slice(-6).toUpperCase()}
                </span>
                <span className="text-slate-400 normal-case font-medium ml-auto text-[8.5px] shrink-0">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-[var(--color-border)] my-1.5" />

          {/* Details List */}
          <div className="space-y-1.5 text-[12px] sm:text-[12.5px] min-w-0">
            {/* Name & Call Button merged row */}
            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-[var(--color-text-secondary)] font-medium shrink-0">
                {isFarmer ? 'Buyer (Vendor):' : 'Seller (Farmer):'}
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[120px] sm:max-w-[150px]">
                  {contactPerson?.name}
                </span>
                {contactPerson?.phone && (
                  <a 
                    href={`tel:${contactPerson.phone}`} 
                    onClick={(e) => e.stopPropagation()} 
                    className="bg-success-50 hover:bg-success-100 border border-success-100 rounded-full w-6.5 h-6.5 text-success-600 flex items-center justify-center no-underline transition-all shrink-0 active:scale-90"
                    title="Call contact"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[11.5px] h-[11.5px] text-success-600 select-none">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-[var(--color-text-secondary)] font-medium shrink-0">Quantity:</span>
              <span className="font-semibold text-[var(--color-text-primary)] text-right truncate min-w-0">
                {order.requestedQuantity} {order.crop?.unit}
              </span>
            </div>

            {order.crop?.paymentTerms && (
              <div className="flex justify-between items-center gap-2 min-w-0">
                <span className="text-[var(--color-text-secondary)] font-medium shrink-0">Payment Terms:</span>
                <span className="font-semibold text-slate-700 text-right truncate min-w-0 text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50">
                  {order.crop.paymentTerms}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center gap-2 pt-1.5 border-t border-[var(--color-border)] mt-1.5 min-w-0">
              <span className="text-[var(--color-text-secondary)] font-bold shrink-0">Total Amount:</span>
              <span className="font-bold text-[13.5px] text-[var(--color-text-primary)] text-right truncate min-w-0">
                ₹{order.requestedQuantity * order.offeredPrice}
              </span>
            </div>
            {order.status === 'Accepted' && (() => {
              const ps = order.payment?.status || 'Unpaid';
              const badgeClass = ps === 'Verified'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : ps === 'Submitted'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-orange-50 border-orange-200 text-orange-700';
              const badgeIcon = ps === 'Verified' ? '✅' : ps === 'Submitted' ? '⏳' : '💳';
              const badgeLabel = ps === 'Verified' ? 'Payment Verified' : ps === 'Submitted' ? 'Awaiting Verification' : 'Payment Pending';
              return (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10.5px] font-bold mt-1.5 ${badgeClass}`}>
                  <span>{badgeIcon}</span>
                  <span>{badgeLabel}</span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Actions Footer */}
        {isFarmer ? (
          <>
            {order.status === 'Pending' && onUpdateStatus && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex gap-2 mt-2.5"
              >
                <button
                  onClick={() => onUpdateStatus(order._id, 'Rejected')}
                  className="flex-1 h-8 rounded-lg border border-danger-200 text-danger-600 bg-white hover:bg-danger-50 text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => onUpdateStatus(order._id, 'Accepted')}
                  className="flex-1 h-8 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Accept Order
                </button>
              </div>
            )}

            {order.status === 'Accepted' && order.payment?.status === 'Verified' && onUpdateStatus && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="mt-2.5 space-y-2"
              >
                {order.crop?.logisticsOption === 'Transport Available' ? (
                  order.deliveryStatus === 'Pending' ? (
                    <button
                      onClick={handleOpenAssignModal}
                      className="w-full h-8 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[15px]">local_shipping</span>
                      Assign Driver & Dispatch
                    </button>
                  ) : (
                    <>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-[10.5px] text-emerald-800 font-semibold text-center flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[13px] animate-bounce">local_shipping</span>
                        <span>
                          {order.driver 
                            ? `In Transit: ${order.driver.name} is delivering the crops.` 
                            : 'Self-Transit: You are delivering the crops directly.'}
                        </span>
                      </div>

                      {/* Driver Link Share controls */}
                      <div className="p-2 bg-slate-50 border border-slate-250 rounded-lg text-[10.5px] font-bold mt-1.5 shadow-sm space-y-1.5">
                        <div className="text-slate-500 text-left">Share Tracking Link:</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = `${window.location.origin}/driver-track?orderId=${order._id}&name=${encodeURIComponent(order.driver?.name || 'Farmer')}&crop=${encodeURIComponent(order.crop?.name || 'Crop')}&vendor=${encodeURIComponent(order.vendor?.name || 'Vendor')}`;
                              navigator.clipboard.writeText(link);
                              toast.success('Driver tracking link copied!');
                            }}
                            className="bg-white border border-slate-200 py-1 px-2 rounded text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px]">content_copy</span>
                            <span>Copy Link</span>
                          </button>
                          <a
                            href={(() => {
                              let phone = order.driver ? order.driver.phone : '';
                              if (phone) {
                                // Clean up spaces or dashes
                                const clean = phone.replace(/\D/g, '');
                                // Prepend 91 for Indian numbers if it's 10 digits
                                phone = clean.length === 10 ? `91${clean}` : clean;
                              }
                              const text = `Please click this link to start live GPS tracking for order #${order._id.slice(-6).toUpperCase()}: ${window.location.origin}/driver-track?orderId=${order._id}&name=${encodeURIComponent(order.driver?.name || 'Farmer')}&crop=${encodeURIComponent(order.crop?.name || 'Crop')}&vendor=${encodeURIComponent(order.vendor?.name || 'Vendor')}`;
                              return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                            })()}
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-50 border border-emerald-200 py-1 px-2 rounded text-emerald-700 hover:bg-emerald-100 flex items-center justify-center gap-1 no-underline transition-all"
                          >
                            <span className="material-symbols-outlined text-[13px]">share</span>
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => navigate(`/farmer-dashboard/tracking?orderId=${order._id}`)}
                          className="flex-1 h-8 rounded-lg border border-primary-200 text-primary-600 bg-white hover:bg-primary-50 text-[11px] font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">navigation</span>
                          Track Route
                        </button>
                        <button
                          onClick={() => onUpdateStatus(order._id, 'Completed')}
                          className="flex-1 h-8 rounded-lg bg-success-600 hover:bg-success-700 text-white text-[11px] font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                        >
                          Complete Delivery
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-[10.5px] text-blue-800 font-semibold text-center flex items-center justify-center gap-1.5 shadow-sm">
                      <span className="material-symbols-outlined text-[14px] text-blue-600 animate-pulse">storefront</span>
                      <span>Awaiting Pickup: Vendor will collect the crops directly.</span>
                    </div>
                    <button
                      onClick={() => onUpdateStatus(order._id, 'Completed')}
                      className="w-full h-8 rounded-lg bg-success-600 hover:bg-success-700 text-white text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                    >
                      Verify OTP & Complete Pickup
                    </button>
                  </>
                )}
              </div>
            )}

            {isFarmer && order.status === 'Accepted' && order.payment?.status === 'Submitted' && onVerifyPayment && (
              <div onClick={(e) => e.stopPropagation()} className="mt-2.5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mb-2">
                  <p className="text-[10px] font-bold text-blue-700 mb-0.5">💳 Payment Submitted by Vendor</p>
                  <p className="text-[11px] text-blue-900 font-bold">₹{(order.payment.amount || 0).toLocaleString('en-IN')} via {order.payment.method}</p>
                  {order.payment.upiRef && <p className="text-[10px] text-blue-600 mt-0.5">Ref: {order.payment.upiRef}</p>}
                  {order.payment.note && <p className="text-[10px] text-slate-500 mt-0.5">{order.payment.note}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onVerifyPayment(order._id, 'reject')}
                    className="flex-1 h-8 rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 text-[11px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                  >❌ Reject</button>
                  <button
                    onClick={() => onVerifyPayment(order._id, 'confirm')}
                    className="flex-1 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                  >✅ Confirm Paid</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {order.status === 'Pending' && onCancelOrder && (
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="flex gap-2 mt-2.5"
              >
                <button
                  onClick={() => onCancelOrder(order._id)}
                  className="w-full h-8 rounded-lg border border-danger-200 text-danger-600 bg-white hover:bg-danger-50 text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancel Request
                </button>
              </div>
            )}

            {!isFarmer && order.status === 'Accepted' && order.deliveryStatus === 'In Transit' && (
              <div onClick={(e) => e.stopPropagation()} className="mt-2.5">
                <button
                  onClick={() => navigate(`/vendor-dashboard/tracking?orderId=${order._id}`)}
                  className="w-full h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">navigation</span>
                  Track Delivery 🚚
                </button>
              </div>
            )}

            {!isFarmer && order.status === 'Accepted' && order.payment?.status !== 'Verified' && onSubmitPayment && (
              <div onClick={(e) => e.stopPropagation()} className="mt-2.5">
                {order.payment?.status === 'Submitted' ? (
                  <div className="w-full h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5">
                    <span>⏳</span><span>Awaiting farmer verification...</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onSubmitPayment(order)}
                    className="w-full h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>💳</span>
                    <span>
                      {order.crop?.paymentTerms === '50% Advance'
                        ? `Submit 50% Advance (₹${(0.5 * order.requestedQuantity * order.offeredPrice).toLocaleString('en-IN')})`
                        : `Submit 100% Advance (₹${(order.requestedQuantity * order.offeredPrice).toLocaleString('en-IN')})`}
                    </span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Details Pop-up Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] z-10 relative"
            >
              {/* Modal Header */}
              <div className="px-4 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                <div>
                  <h2 className="text-[14.5px] font-extrabold text-slate-800">Order Details</h2>
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                    <span>Ref ID: #{order._id?.slice(-6).toUpperCase()}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(order._id);
                        toast.success('Full Order ID copied!');
                      }}
                      className="text-primary-600 hover:underline flex items-center gap-0.5 text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[10px]">content_copy</span>
                      <span>Copy Full ID</span>
                    </button>
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-3.5 overflow-y-auto min-h-0 text-[12px] sm:text-[13px]">
                {/* Timeline */}
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Order Status Timeline</p>
                  {renderStatusTimeline(order.status)}
                </div>

                <hr className="border-slate-100" />

                {/* Crop Information */}
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Crop Details</p>
                  <div className="flex gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {order.crop?.images && order.crop.images.length > 0 ? (
                      <img 
                        src={order.crop.images[0]} 
                        alt={order.crop.name} 
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">image</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-slate-800 text-[13.5px]">
                        {order.crop?.name || 'Deleted Crop'} 
                        {order.crop?.variety && <span className="text-[10.5px] text-slate-400 font-bold ml-1">({order.crop.variety})</span>}
                      </h4>
                      <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{order.crop?.category}</p>
                      {order.crop?.location && (
                        <p className="text-[9.5px] text-slate-500 mt-1 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px] text-red-500">location_on</span>
                          <span className="truncate">{order.crop.location}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Contact Profiles with Call Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Buyer Box */}
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-between min-h-[90px]">
                    <div>
                      <p className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center justify-between">
                        <span>Buyer (Vendor)</span>
                        {!isFarmer && <span className="text-[8px] text-slate-400 font-bold lowercase bg-slate-200/50 px-1 py-0.2 rounded shrink-0">(you)</span>}
                      </p>
                      <h5 className="font-extrabold text-slate-800 mt-1 text-[12.5px] truncate">{order.vendor?.name}</h5>
                    </div>
                    {isFarmer && order.vendor?.phone ? (
                      <a 
                        href={`tel:${order.vendor.phone}`} 
                        onClick={(e) => e.stopPropagation()} 
                        className="mt-2 w-full py-1.5 px-2 rounded-lg bg-success-600 hover:bg-success-500 active:scale-[0.97] transition-all text-white font-black text-[11px] flex items-center justify-center gap-1 no-underline shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[13px] font-bold">call</span>
                        <span>Call Buyer</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium mt-2 block select-all">{order.vendor?.phone}</span>
                    )}
                  </div>

                  {/* Seller Box */}
                  <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 flex flex-col justify-between min-h-[90px]">
                    <div>
                      <p className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-wider flex items-center justify-between">
                        <span>Seller (Farmer)</span>
                        {isFarmer && <span className="text-[8px] text-slate-400 font-bold lowercase bg-slate-200/50 px-1 py-0.2 rounded shrink-0">(you)</span>}
                      </p>
                      <h5 className="font-extrabold text-slate-800 mt-1 text-[12.5px] truncate">{order.farmer?.name}</h5>
                    </div>
                    {!isFarmer && order.farmer?.phone ? (
                      <a 
                        href={`tel:${order.farmer.phone}`} 
                        onClick={(e) => e.stopPropagation()} 
                        className="mt-2 w-full py-1.5 px-2 rounded-lg bg-success-600 hover:bg-success-500 active:scale-[0.97] transition-all text-white font-black text-[11px] flex items-center justify-center gap-1 no-underline shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[13px] font-bold">call</span>
                        <span>Call Seller</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium mt-2 block select-all">{order.farmer?.phone}</span>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Pricing & Math Invoice */}
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Deal Invoice Summary</p>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Requested Qty:</span>
                      <span className="font-bold text-slate-800">{order.requestedQuantity} {order.crop?.unit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Offered Price:</span>
                      <span className="font-bold text-slate-800">₹{order.offeredPrice} / {order.crop?.unit}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 mt-1">
                      <span className="font-extrabold text-slate-800">Total Net Amount:</span>
                      <span className="font-extrabold text-[14.5px] text-primary-600">₹{order.requestedQuantity * order.offeredPrice}</span>
                    </div>
                  </div>
                </div>

                {order.message && (
                  <>
                    <hr className="border-slate-100" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Additional Notes</p>
                      <div className="p-2 bg-slate-50/50 border border-slate-150 rounded-lg text-[11px] text-slate-600 italic leading-normal">
                        "{order.message}"
                      </div>
                    </div>
                  </>
                )}

                {/* Logistics & Delivery details */}
                {(order.pickupDate || order.vehicleNumber || order.deliveryOTP) && (
                  <>
                    <hr className="border-slate-100" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Logistics & Delivery Details</p>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-2">
                        {order.pickupDate && (
                          <div className="flex justify-between items-center text-[11.5px] sm:text-[12px]">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <span className="material-symbols-outlined text-[14px] text-orange-500">calendar_month</span>
                              Pickup Date:
                            </span>
                            <span className="font-bold text-slate-800 text-right truncate">
                              {new Date(order.pickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                        {order.vehicleNumber && (
                          <div className="flex justify-between items-center text-[11.5px] sm:text-[12px]">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <span className="material-symbols-outlined text-[14px] text-info-600">local_shipping</span>
                              Vehicle Number:
                            </span>
                            <span className="font-bold text-slate-800 uppercase bg-slate-200/60 px-1.5 py-0.5 rounded text-[10.5px]">
                              {order.vehicleNumber}
                            </span>
                          </div>
                        )}
                        {order.driver && (
                          <div className="flex justify-between items-center text-[11.5px] sm:text-[12px] pt-1">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <span className="material-symbols-outlined text-[14px] text-emerald-600">person</span>
                              Driver Assigned:
                            </span>
                            <span className="font-bold text-slate-700 text-right truncate max-w-[150px]">
                              {order.driver.name} ({order.driver.vehicleNumber})
                            </span>
                          </div>
                        )}
                        {order.deliveryStatus === 'In Transit' && !order.driver && (
                          <div className="flex justify-between items-center text-[11.5px] sm:text-[12px] pt-1">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <span className="material-symbols-outlined text-[14px] text-emerald-600">motorcycle</span>
                              Delivery Mode:
                            </span>
                            <span className="font-bold text-slate-700 text-right">
                              Farmer Self-Delivery
                            </span>
                          </div>
                        )}
                        {order.crop?.logisticsOption === 'Self-Pickup' && (
                          <div className="flex justify-between items-center text-[11.5px] sm:text-[12px] pt-1">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <span className="material-symbols-outlined text-[14px] text-emerald-600">storefront</span>
                              Fulfillment:
                            </span>
                            <span className="font-bold text-slate-700 text-right">
                              Vendor Self-Pickup
                            </span>
                          </div>
                        )}
                        
                        {/* OTP display */}
                        {order.deliveryOTP && ['Accepted', 'Completed'].includes(order.status) && (
                          <div className="pt-2 border-t border-slate-200 mt-2 flex flex-col items-center justify-center gap-1.5 text-center">
                            {isFarmer ? (
                              order.status === 'Accepted' ? (
                                order.payment?.status === 'Verified' ? (
                                  <div className="bg-primary-50 text-primary-700 px-3 py-2 rounded-lg border border-primary-200 text-[11px] font-bold w-full">
                                    <span>
                                      {order.crop?.logisticsOption === 'Self-Pickup' 
                                        ? 'Verify OTP from Buyer during pickup to complete order.' 
                                        : 'Verify OTP from Buyer upon delivery to complete order.'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg border border-orange-200 text-[11px] font-bold w-full">
                                    <span>Awaiting payment verification before order completion.</span>
                                  </div>
                                )
                              ) : (
                                <div className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[11px] font-medium w-full">
                                  <span>Delivery OTP verified successfully.</span>
                                </div>
                              )
                            ) : (
                              order.status === 'Accepted' ? (
                                order.payment?.status === 'Verified' ? (
                                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 w-full">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 text-yellow-700">
                                      <span className="material-symbols-outlined text-[13px]">key</span>
                                      Delivery Verification OTP
                                    </span>
                                    <span className="text-[18px] font-black tracking-widest text-slate-800 bg-white px-4 py-1.5 rounded-lg border border-yellow-300 shadow-inner">
                                      {order.deliveryOTP}
                                    </span>
                                    <span className="text-[9.5px] font-bold text-yellow-850 mt-0.5">
                                      {order.crop?.logisticsOption === 'Self-Pickup'
                                        ? 'Self-Pickup: Show this OTP to the farmer when you collect the crops.'
                                        : order.driver 
                                        ? `Delivery: Share this OTP with driver ${order.driver.name} upon arrival.`
                                        : 'Self-Delivery: Share this OTP with the farmer upon delivery.'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="bg-orange-50 border border-orange-200 text-orange-850 p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 w-full">
                                    <span className="text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 text-orange-700">
                                      <span className="material-symbols-outlined text-[13px]">lock</span>
                                      OTP Locked
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-650 mt-0.5">
                                      {order.payment?.status === 'Submitted'
                                        ? 'Awaiting farmer to confirm your submitted payment.'
                                        : 'Please submit payment first to unlock the delivery OTP.'}
                                    </span>
                                  </div>
                                )
                              ) : (
                                <div className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[11px] font-medium w-full">
                                  <span>Delivery OTP ({order.deliveryOTP}) verified successfully.</span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-4 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] text-slate-450 font-bold">
                  <span>Ordered: {formatDateTime(order.createdAt)}</span>
                </div>
                
                {isFarmer ? (
                  <>
                    {order.status === 'Pending' && onUpdateStatus && (
                      <div className="flex gap-2 mt-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(order._id, 'Rejected');
                            setIsModalOpen(false);
                          }}
                          className="flex-1 h-9 rounded-lg border border-danger-200 text-danger-600 bg-white hover:bg-danger-50 text-[12px] font-bold cursor-pointer"
                        >
                          Reject Request
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(order._id, 'Accepted');
                            setIsModalOpen(false);
                          }}
                          className="flex-1 h-9 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-bold cursor-pointer"
                        >
                          Accept Order
                        </button>
                      </div>
                    )}

                    {order.status === 'Accepted' && order.payment?.status === 'Verified' && onUpdateStatus && (
                      <div className="mt-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(order._id, 'Completed');
                            setIsModalOpen(false);
                          }}
                          className="w-full h-9 rounded-lg bg-success-600 hover:bg-success-700 text-white text-[12px] font-bold cursor-pointer"
                        >
                          Mark Completed & Dispatched
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {order.status === 'Pending' && onCancelOrder && (
                      <div className="mt-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelOrder(order._id);
                            setIsModalOpen(false);
                          }}
                          className="w-full h-9 rounded-lg border border-danger-200 text-danger-600 bg-white hover:bg-danger-50 text-[12px] font-bold cursor-pointer"
                        >
                          Cancel Request
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Tracking Map Modal */}
      {isTrackingMapOpen && (
        <LiveTrackingMap 
          orderId={order._id} 
          onClose={() => setIsTrackingMapOpen(false)} 
        />
      )}

      {/* Farmer Assign Driver Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { e.stopPropagation(); setIsAssignModalOpen(false); }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 z-10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-[14.5px] font-extrabold text-slate-800">🚚 Dispatch Order</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Assign fulfillment for order #{order._id?.slice(-6).toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setIsAssignModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-450 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[350px] space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Delivery Method</label>
              
              {/* Option 1: Self-Delivery (Always Available) */}
              <div 
                onClick={() => setSelectedDriverId('self')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between hover:border-primary-500 hover:bg-slate-50/50 ${
                  selectedDriverId === 'self'
                    ? 'border-primary-600 bg-primary-50/20 ring-1 ring-primary-500/10'
                    : 'border-slate-100 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">directions_run</span>
                  </div>
                  <div>
                    <h4 className="text-[12.5px] font-bold text-slate-800">Self-Delivery</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">I will deliver the crops myself</p>
                  </div>
                </div>
                {selectedDriverId === 'self' && (
                  <span className="material-symbols-outlined text-primary-600 font-black text-[18px]">check_circle</span>
                )}
              </div>

              {/* Option 2: List of available drivers */}
              {availableDrivers.map(drv => {
                const getIcon = (type) => {
                  if (type === 'Bike') return 'two_wheeler';
                  if (type === 'Tractor') return 'agriculture';
                  return 'local_shipping';
                };
                
                return (
                  <div 
                    key={drv._id}
                    onClick={() => setSelectedDriverId(drv._id)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between hover:border-primary-500 hover:bg-slate-50/50 ${
                      selectedDriverId === drv._id
                        ? 'border-primary-600 bg-primary-50/20 ring-1 ring-primary-500/10'
                        : 'border-slate-100 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">{getIcon(drv.vehicleType)}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[12.5px] font-bold text-slate-800 truncate">{drv.name}</h4>
                        <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                          {drv.vehicleNumber} • {drv.vehicleType}
                        </p>
                      </div>
                    </div>
                    {selectedDriverId === drv._id && (
                      <span className="material-symbols-outlined text-primary-600 font-black text-[18px]">check_circle</span>
                    )}
                  </div>
                );
              })}

              {availableDrivers.length === 0 && (
                <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-150 p-2.5">
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    No registered fleet drivers available right now. You can still use the <b>Self-Delivery</b> option above.
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 flex gap-2 pt-2 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-600 text-[12px] font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >Cancel</button>
              <button
                onClick={handleAssignDriver}
                disabled={isAssigning || !selectedDriverId}
                className="flex-1 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isAssigning ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCard;
