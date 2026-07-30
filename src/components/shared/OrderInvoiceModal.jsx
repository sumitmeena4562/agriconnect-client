import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * OrderInvoiceModal — Printable PDF tax receipt modal for completed produce orders
 */
const OrderInvoiceModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `INV-${(order._id || '987654').slice(-6).toUpperCase()}`;
  const dateStr = order.updatedAt
    ? new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN');

  const unitPrice = order.crop?.pricePerUnit || 0;
  const quantity = order.requestedQuantity || 0;
  const subtotal = order.totalAmount || (unitPrice * quantity);
  const platformFee = Math.round(subtotal * 0.02); // 2% platform fee
  const grandTotal = subtotal;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto print:shadow-none print:border-none print:m-0 print:max-w-none print:w-full"
        >
          {/* Header Action Toolbar (Hidden when printing) */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-400">receipt_long</span>
              <span className="text-[12px] font-black tracking-wide uppercase">Official Order Invoice</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">print</span>
                Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          {/* Invoice Body (Print Target) */}
          <div className="p-5 sm:p-6 space-y-5 text-slate-800 bg-white">
            {/* Branding Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h1 className="text-[20px] font-black text-emerald-700 leading-none tracking-tight">AgriConnect 🌾</h1>
                <p className="text-[10px] text-slate-500 font-semibold mt-1">Direct Farm-to-Vendor Produce Receipt</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-200">
                  PAID & DELIVERED
                </span>
                <p className="text-[11px] font-black text-slate-900 mt-1.5">{invoiceNo}</p>
                <p className="text-[9.5px] text-slate-500 font-medium">Date: {dateStr}</p>
              </div>
            </div>

            {/* Seller & Buyer Details */}
            <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div>
                <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider mb-1">Farmer / Seller</p>
                <p className="font-black text-slate-900">{order.farmer?.name || 'AgriConnect Farmer'}</p>
                <p className="text-[10px] text-slate-600 font-medium">{order.farmer?.phone || 'Verified Farmer'}</p>
                <p className="text-[10px] text-slate-500">{order.farmer?.location || 'Madhya Pradesh, India'}</p>
              </div>
              <div>
                <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider mb-1">Vendor / Buyer</p>
                <p className="font-black text-slate-900">{order.vendor?.name || 'Vendor Buyer'}</p>
                <p className="text-[10px] text-slate-600 font-medium">{order.vendor?.phone || 'Verified Vendor'}</p>
                <p className="text-[10px] text-slate-500">{order.vendor?.businessName || 'Agri Merchant'}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] font-black">
                    <th className="pb-2">Crop Description</th>
                    <th className="pb-2 text-center">Qty</th>
                    <th className="pb-2 text-right">Unit Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-black text-slate-900">
                      {order.crop?.name || 'Fresh Produce'}
                      <span className="block text-[9.5px] font-semibold text-slate-500">{order.crop?.variety || 'Standard Grade'}</span>
                    </td>
                    <td className="py-2.5 text-center font-bold text-slate-700">
                      {quantity} {order.crop?.unit || 'kg'}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-slate-600">
                      ₹{unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 text-right font-black text-slate-900">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Total */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Platform Handling Fee (Included)</span>
                <span>₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-[14px] font-black text-slate-900">
                <span>Grand Total Settled</span>
                <span className="text-emerald-700">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Security Stamp / Delivery Verification */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                <div>
                  <p className="font-black text-emerald-900 leading-none">OTP Delivery Verified</p>
                  <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">Secure OTP Handover Completed</p>
                </div>
              </div>
              <span className="font-mono font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                OTP: {order.deliveryOTP || 'VERIFIED'}
              </span>
            </div>

            {/* Footer Notice */}
            <p className="text-[8.5px] text-slate-400 font-medium text-center border-t border-slate-100 pt-3">
              This is a computer-generated tax invoice for direct agricultural trade on AgriConnect platform.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderInvoiceModal;
