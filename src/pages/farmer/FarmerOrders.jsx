import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmModal from '../../components/common/ConfirmModal';
import OrderCard from '../../components/shared/OrderCard';
import OrderInvoiceModal from '../../components/shared/OrderInvoiceModal';
import { OrderGridCardSkeleton } from '../../components/dashboard/OrderCardSkeleton';

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, status: null, isLoading: false });
  const [otpModal, setOtpModal] = useState({ isOpen: false, orderId: null, otpValue: '', isLoading: false });
  const [invoiceModal, setInvoiceModal] = useState({ isOpen: false, order: null });

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
      setOrders(res.data.data || []);
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
    if (newStatus === 'REFRESH') {
      fetchOrders();
      return;
    }
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

  // Detailed PDF File Generation & Download
  const handleDownloadPDF = () => {
    if (orders.length === 0) {
      toast.error('No order records available to export');
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Brand Top Header Bar
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 20, 'F');

      doc.setFillColor(16, 185, 129); // emerald-500 line
      doc.rect(0, 19, 297, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('AgriConnect™ - Farmer Incoming Orders Audit Report', 14, 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 215, 13);

      // Summary Metric Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 24, 269, 16, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      
      const totalDealsVal = orders.reduce((s, o) => s + (o.payment?.amount || ((o.requestedQuantity || 0) * (o.offeredPrice || 0))), 0);

      doc.text(`Total Orders: ${orders.length}`, 20, 34);
      doc.text(`Pending Approval: ${pendingCount}`, 75, 34);
      doc.text(`Active Dispatches: ${acceptedCount}`, 135, 34);
      doc.text(`Total Value: Rs. ${totalDealsVal.toLocaleString('en-IN')}`, 195, 34);

      // Detailed Multi-Column Table
      const tableColumn = [
        'Order ID & Date',
        'Crop & Category',
        'Buyer (Vendor)',
        'Quantity & Rate',
        'Total Amount',
        'Payment Info',
        'Logistics & Driver',
        'Status'
      ];

      const tableRows = orders.map(o => {
        const orderId = `#${o._id?.slice(-6).toUpperCase()}`;
        const orderDate = new Date(o.createdAt).toLocaleDateString('en-IN');
        
        const cropName = o.crop?.name || 'Produce Item';
        const varietyStr = o.crop?.variety ? `(${o.crop.variety})` : '';
        const cropCategory = o.crop?.category || 'General';
        const cropGrade = o.crop?.qualityGrade ? `Grade: ${o.crop.qualityGrade}` : '';
        
        const vendorName = o.vendor?.name || 'Vendor';
        const vendorPhone = o.vendor?.phone ? `Mob: ${o.vendor.phone}` : '';
        
        const qtyStr = `${o.requestedQuantity || 0} ${o.crop?.unit || 'Kg'}`;
        const rateStr = `Rs. ${o.offeredPrice || 0}/${o.crop?.unit || 'Kg'}`;
        const amount = `Rs. ${(o.payment?.amount || ((o.requestedQuantity || 0) * (o.offeredPrice || 0))).toLocaleString('en-IN')}`;

        const payStatus = o.payment?.status || (o.status === 'Accepted' ? 'Pending' : 'N/A');
        const payMethod = o.payment?.method ? `Method: ${o.payment.method}` : (o.crop?.paymentTerms ? `Terms: ${o.crop.paymentTerms}` : '');
        const payRef = o.payment?.upiRef ? `Ref: ${o.payment.upiRef}` : '';

        const logisticsOpt = o.crop?.logisticsOption || 'Self Pickup';
        const driverName = o.driver?.name ? `Driver: ${o.driver.name}` : (logisticsOpt === 'Transport Available' ? 'Driver: Pending' : 'Self Transport');
        const delStatus = o.deliveryStatus ? `Status: ${o.deliveryStatus}` : '';

        return [
          `${orderId}\n${orderDate}`,
          `${cropName} ${varietyStr}\nCat: ${cropCategory} ${cropGrade}`,
          `${vendorName}\n${vendorPhone}`,
          `${qtyStr}\nRate: ${rateStr}`,
          `${amount}`,
          `Status: ${payStatus}\n${payMethod}\n${payRef}`.trim(),
          `${logisticsOpt}\n${driverName}\n${delStatus}`.trim(),
          o.status
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 44,
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 23, 42], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold', 
          fontSize: 8.5, 
          halign: 'left',
          cellPadding: 3
        },
        bodyStyles: { 
          fontSize: 8, 
          textColor: [51, 65, 85],
          cellPadding: 2.5,
          valign: 'middle'
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 26 },
          1: { cellWidth: 42 },
          2: { cellWidth: 32 },
          3: { cellWidth: 30 },
          4: { fontStyle: 'bold', cellWidth: 26 },
          5: { cellWidth: 38 },
          6: { cellWidth: 40 },
          7: { fontStyle: 'bold', cellWidth: 25 }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 7) {
            const val = data.cell.raw;
            if (val === 'Accepted') {
              data.cell.styles.textColor = [4, 120, 87];
            } else if (val === 'Pending') {
              data.cell.styles.textColor = [180, 83, 9];
            } else if (val === 'Completed') {
              data.cell.styles.textColor = [3, 105, 161];
            } else if (val === 'Rejected' || val === 'Cancelled') {
              data.cell.styles.textColor = [185, 28, 28];
            }
          }
        }
      });

      // Footer page numbering
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`AgriConnect Marketplace • Official Farmer Inventory & Order Audit Statement • Page ${i} of ${pageCount}`, 14, 203);
      }

      // Save PDF file directly
      doc.save(`AgriConnect_Detailed_Orders_Audit_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Detailed PDF Audit Report downloaded!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF report');
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

  // Metrics calculation
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const acceptedCount = orders.filter(o => o.status === 'Accepted').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const totalRevenue = orders
    .filter(o => o.status === 'Completed' || o.status === 'Accepted')
    .reduce((sum, o) => sum + (o.payment?.amount || ((o.requestedQuantity || 0) * (o.offeredPrice || 0))), 0);

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto px-1 sm:px-2 pb-10">
      
      {/* ── 1. Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div>
          <h1 className="text-[19px] sm:text-[22px] font-black text-slate-900 tracking-tight leading-none">
            Incoming Vendor Orders 📦
          </h1>
          <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium mt-1">
            Review buying proposals, accept deals & dispatch crop shipments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            title="Download Official PDF Orders Report"
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {/* ── 2. Order Metrics Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Total Deals</p>
            <p className="text-[15px] font-black text-slate-900 leading-none mt-0.5">{orders.length}</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">pending_actions</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
            <p className="text-[15px] font-black text-amber-700 leading-none mt-0.5">{pendingCount} Orders</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Active Dispatches</p>
            <p className="text-[15px] font-black text-emerald-700 leading-none mt-0.5">{acceptedCount} Orders</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-info-50 text-info-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">payments</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Accepted Value</p>
            <p className="text-[15px] font-black text-slate-900 leading-none mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* ── 3. Micro-Compact Filter Toolbar ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 px-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-xs">
        
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
          {tabs.map((tab) => {
            const count = tab === 'All' 
              ? orders.length 
              : orders.filter(o => o.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white shadow-xs font-black'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{tab}</span>
                <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Box */}
        <div className="flex items-center gap-2 flex-1 md:max-w-[320px] justify-end">
          <div className="flex items-center gap-2 px-2.5 h-8 bg-slate-50 border border-slate-200 rounded-md flex-1 min-w-[140px] focus-within:border-primary-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-primary-100 transition-all">
            <span className="material-symbols-outlined text-[15px] leading-none text-slate-400 shrink-0 select-none flex items-center justify-center">search</span>
            <input
              type="text"
              placeholder="Search ID, vendor, crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-[11px] font-semibold text-slate-800 placeholder:text-slate-400 p-0 leading-none focus:ring-0 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 4. Content Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
          <OrderGridCardSkeleton />
          <OrderGridCardSkeleton />
          <OrderGridCardSkeleton />
          <OrderGridCardSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <div className="global-card text-center py-12 px-4 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-[24px]">assignment_late</span>
          </div>
          <h3 className="text-[13px] font-black text-slate-800">No order requests found</h3>
          <p className="text-[10.5px] text-slate-500 max-w-xs font-medium">
            You don't have any order requests under "{activeTab}" status.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="global-card text-center py-12 px-4 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span className="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <h3 className="text-[13px] font-black text-slate-800">No matching orders</h3>
          <p className="text-[10.5px] text-slate-500 max-w-xs font-medium">
            No orders match "{searchQuery}" under "{activeTab}" status.
          </p>
          <button 
            onClick={() => setSearchQuery('')}
            className="mt-1 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10.5px] rounded-lg transition-colors cursor-pointer"
          >
            Clear Search
          </button>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-5 z-10 border border-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-3 mx-auto text-primary-600">
                <span className="material-symbols-outlined text-[24px]">vpn_key</span>
              </div>
              
              <h3 className="text-[15px] font-black text-slate-800 text-center mb-1">Enter Delivery OTP</h3>
              <p className="text-[11px] text-slate-500 text-center mb-4 leading-relaxed font-medium">
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
                
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpModal({ isOpen: false, orderId: null, otpValue: '', isLoading: false })}
                    disabled={otpModal.isLoading}
                    className="flex-1 py-2.5 rounded-xl text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={otpModal.isLoading || otpModal.otpValue.length !== 4}
                    className="flex-1 py-2.5 rounded-xl text-[11px] font-black text-white bg-success-600 hover:bg-success-700 shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* Printable Invoice Modal */}
      <OrderInvoiceModal
        isOpen={invoiceModal.isOpen}
        onClose={() => setInvoiceModal({ isOpen: false, order: null })}
        order={invoiceModal.order}
      />
    </div>
  );
};

export default FarmerOrders;
