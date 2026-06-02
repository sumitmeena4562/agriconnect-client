import React from 'react';
import { motion } from 'framer-motion';

const OrderCard = ({ order, role = 'farmer', onUpdateStatus, onCancelOrder }) => {
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--color-surface)] rounded-[var(--card-border-radius)] border border-[var(--color-border)] p-3.5 sm:p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between w-full min-w-0"
    >
      {/* Crop & Status Header */}
      <div>
        <div className="flex justify-between items-start gap-2 mb-1.5 min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-[13.5px] font-bold text-[var(--color-text-primary)] leading-tight truncate">{order.crop?.name || 'Deleted Crop'}</h3>
            <p className="text-[9.5px] text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mt-0.5 truncate">{order.crop?.category}</p>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${getStatusBadgeClass(order.status)}`}>
            {order.status}
          </span>
        </div>

        <hr className="border-[var(--color-border)] my-1.5" />

        {/* Details List */}
        <div className="space-y-1.5 text-[12px] sm:text-[12.5px] min-w-0">
          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-[var(--color-text-secondary)] font-medium shrink-0">
              {isFarmer ? 'Buyer (Vendor):' : 'Seller (Farmer):'}
            </span>
            <span className="font-semibold text-[var(--color-text-primary)] text-right truncate min-w-0">
              {contactPerson?.name}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-[var(--color-text-secondary)] font-medium shrink-0">Phone:</span>
            <a href={`tel:${contactPerson?.phone}`} className="group font-semibold text-primary-600 flex items-center gap-1 text-right min-w-0 no-underline leading-none">
              <span className="material-symbols-outlined icon-lg shrink-0 no-underline select-none">call</span>
              <span className="truncate group-hover:underline leading-none">{contactPerson?.phone}</span>
            </a>
          </div>

          {!isFarmer && (
            <div className="flex justify-between items-center gap-2 min-w-0">
              <span className="text-[var(--color-text-secondary)] font-medium shrink-0">Farm Location:</span>
              <span className="font-semibold text-[var(--color-text-primary)] text-right truncate min-w-0" title={contactPerson?.location}>
                {contactPerson?.location || 'Not Specified'}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-[var(--color-text-secondary)] font-medium shrink-0">Quantity Requested:</span>
            <span className="font-semibold text-[var(--color-text-primary)] text-right truncate min-w-0">
              {order.requestedQuantity} {order.crop?.unit}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2 min-w-0">
            <span className="text-[var(--color-text-secondary)] font-medium shrink-0">Offered Price:</span>
            <span className="font-semibold text-[var(--color-text-primary)] text-right truncate min-w-0">
              ₹{order.offeredPrice} / {order.crop?.unit}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2 pt-1.5 border-t border-[var(--color-border)] mt-1.5 min-w-0">
            <span className="text-[var(--color-text-secondary)] font-bold shrink-0">Total Deal Amount:</span>
            <span className="font-bold text-[13.5px] text-[var(--color-text-primary)] text-right truncate min-w-0">
              ₹{order.requestedQuantity * order.offeredPrice}
            </span>
          </div>

          {order.message && (
            <div className="mt-2 p-1.5 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-md text-[10.5px] text-[var(--color-text-secondary)] italic leading-relaxed min-w-0">
              <p className="font-bold not-italic text-[var(--color-text-secondary)] text-[8.5px] uppercase tracking-wider mb-0.5 opacity-80">
                {isFarmer ? 'Vendor Note:' : 'Your Message:'}
              </p>
              <p className="break-words">"{order.message}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions Footer */}
      {isFarmer ? (
        <>
          {order.status === 'Pending' && onUpdateStatus && (
            <div className="flex gap-2 mt-2.5 pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => onUpdateStatus(order._id, 'Rejected')}
                className="flex-1 h-8 py-0.5 px-2.5 rounded-lg border border-danger-200 text-danger-600 bg-white hover:bg-danger-50 text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                Reject Request
              </button>
              <button
                onClick={() => onUpdateStatus(order._id, 'Accepted')}
                className="flex-1 h-8 py-0.5 px-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                Accept Order
              </button>
            </div>
          )}

          {order.status === 'Accepted' && onUpdateStatus && (
            <div className="mt-2.5 pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => onUpdateStatus(order._id, 'Completed')}
                className="w-full h-8 py-0.5 px-2.5 rounded-lg bg-success-600 hover:bg-success-700 text-white text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                Mark Completed & Dispatched
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {order.status === 'Pending' && onCancelOrder && (
            <div className="flex gap-2 mt-2.5 pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => onCancelOrder(order._id)}
                className="w-full h-8 py-0.5 px-2.5 rounded-lg border border-danger-200 text-danger-600 bg-white hover:bg-danger-50 text-[11.5px] font-bold transition-all active:scale-[0.98] cursor-pointer"
              >
                Cancel Request
              </button>
            </div>
          )}
        </>
      )}

      {/* Date Display */}
      <div className="mt-1.5 text-[9px] font-medium text-slate-400 self-end shrink-0">
        Requested on: {new Date(order.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
};

export default OrderCard;
