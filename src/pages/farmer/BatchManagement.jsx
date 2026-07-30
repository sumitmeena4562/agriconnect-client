import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmModal from '../../components/common/ConfirmModal';

const BatchManagement = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [unbatchedOrders, setUnbatchedOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriverMap, setSelectedDriverMap] = useState({}); // batchId -> driverId
  const [dispatchConfirm, setDispatchConfirm] = useState({ open: false, batchId: null, isLoading: false });
  const [radiusKm, setRadiusKm] = useState(10);

  // Fetch batches, unbatched orders and drivers
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [batchesRes, ordersRes, driversRes] = await Promise.all([
        api.get('/batches'),
        api.get('/orders'),
        api.get('/drivers')
      ]);

      if (batchesRes.data.success) setBatches(batchesRes.data.data);
      
      // Filter unbatched pending/accepted orders
      if (ordersRes.data.success) {
        const pendingOrders = ordersRes.data.data.filter(
          o => o.status === 'Accepted' && o.deliveryStatus === 'Pending' && !o.deliveryBatchId
        );
        setUnbatchedOrders(pendingOrders);
      }

      // Filter fleet drivers
      if (driversRes.data.success) {
        setDrivers(driversRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching batch data:', error);
      toast.error('Failed to load delivery batches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Run Auto-Grouping Algorithm
  const handleAutoGroup = async () => {
    const toastId = toast.loading(`Running proximity matching within ${radiusKm} km radius...`);
    try {
      const res = await api.post('/batches/auto-group', { radiusKm });
      if (res.data.success) {
        toast.success(res.data.message || 'Batches created successfully!', { id: toastId });
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to auto-group orders', { id: toastId });
    }
  };

  // Assign Driver to a Batch
  const handleAssignDriver = async (batchId) => {
    const driverId = selectedDriverMap[batchId];
    if (!driverId) {
      toast.error('Please select a driver first');
      return;
    }

    const toastId = toast.loading('Assigning driver and updating fleet status...');
    try {
      const res = await api.post(`/batches/${batchId}/assign-driver`, { driverId });
      if (res.data.success) {
        toast.success('Driver assigned successfully!', { id: toastId });
        // Clear stale dropdown selection for this batch
        setSelectedDriverMap(prev => {
          const updated = { ...prev };
          delete updated[batchId];
          return updated;
        });
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign driver', { id: toastId });
    }
  };

  // Dispatch Batch (Out for Delivery) — called only after confirm modal
  const handleDispatchBatch = async () => {
    const batchId = dispatchConfirm.batchId;
    if (!batchId) return;
    setDispatchConfirm(prev => ({ ...prev, isLoading: true }));
    const toastId = toast.loading('Dispatching batch. Notification sent to customers...');
    try {
      const res = await api.patch(`/batches/${batchId}/status`, { status: 'Out For Delivery' });
      if (res.data.success) {
        toast.success('Batch is now Out For Delivery! 🚚', { id: toastId });
        setDispatchConfirm({ open: false, batchId: null, isLoading: false });
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to dispatch batch', { id: toastId });
      setDispatchConfirm(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Safely extract driver ID — handles both populated object & raw ObjectId string
  const getDriverId = (driver) => (driver && typeof driver === 'object' ? driver._id : driver);

  const handleCopyLink = (driver) => {
    const driverId = getDriverId(driver);
    if (!driverId) {
      toast.error('Driver ID not found');
      return;
    }
    const link = `${window.location.origin}/driver-batch?driverId=${driverId}`;
    navigator.clipboard.writeText(link);
    toast.success('Driver tracking link copied to clipboard! 📋');
  };

  // Download Comprehensive Delivery Batch Route Manifest PDF
  const handleDownloadBatchPDF = (batch) => {
    if (!batch) return;
    try {
      // Landscape A4 PDF for maximum width & clear detail presentation
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Header branding bar (Dark Slate + Emerald Line)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 22, 'F');
      doc.setFillColor(16, 185, 129); // emerald-500 line
      doc.rect(0, 21, 297, 1.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AgriConnect™ - Official Multi-Order Delivery Batch & Fleet Manifest', 14, 14);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | System Audit Copy`, 210, 14);

      // Calculate Total Batch Quantity & Total Valuation
      const totalBatchQty = (batch.orders || []).reduce((acc, o) => acc + (Number(o.requestedQuantity) || 0), 0);
      const totalBatchValue = (batch.orders || []).reduce((acc, o) => acc + (Number(o.totalPrice) || (Number(o.requestedQuantity) * Number(o.pricePerUnit)) || 0), 0);

      // Logistics & Batch Summary Info Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(12, 27, 273, 28, 3, 3, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');

      // Col 1: Batch Info
      doc.text(`Batch Reference: #${batch._id.slice(-6).toUpperCase()}`, 16, 35);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Dispatch Status: ${batch.batchStatus}`, 16, 42);
      doc.text(`Created Date: ${new Date(batch.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 16, 49);

      // Col 2: Route & Weight Metrics
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Total Distance: ${batch.totalDistance || 0} km`, 82, 35);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Total Shipment Cargo: ${batch.orders?.length || 0} Orders`, 82, 42);
      doc.text(`Total Weight Volume: ${totalBatchQty} Kg`, 82, 49);

      // Col 3: Valuation Info
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Total Valuation: Rs. ${totalBatchValue.toLocaleString('en-IN')}`, 148, 35);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Origin Warehouse: Indore Farm Warehouse`, 148, 42);
      doc.text(`Hub Region: Indore District, M.P.`, 148, 49);

      // Col 4: Fleet Carrier
      const driverName = batch.driver?.name || 'Unassigned Fleet Carrier';
      const vehicleInfo = batch.driver ? `${batch.driver.vehicleType} (${batch.driver.vehicleNumber || 'Reg Pending'})` : 'N/A';
      const driverPhone = batch.driver?.phone || batch.driver?.mobile || 'N/A';

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Assigned Carrier: ${driverName}`, 212, 35);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Vehicle: ${vehicleInfo}`, 212, 42);
      doc.text(`Carrier Contact: ${driverPhone}`, 212, 49);

      // ── Detailed Route & Order Cargo Table ──
      const tableColumn = [
        'Seq #',
        'Order ID',
        'Crop Produce Item',
        'Category & Grade',
        'Recipient Vendor / Buyer',
        'Delivery Location Address',
        'Quantity',
        'Unit Rate & Total',
        'Delivery Status'
      ];

      // Stop 1: Pickup Warehouse
      const tableRows = [
        [
          'Stop #1',
          'PICKUP-WH',
          'BULK PRODUCE CARGO (PICKUP)',
          'All Categories',
          'Indore Farm Warehouse',
          'Main AgriHub Central Warehouse, Indore',
          `${totalBatchQty} Kg`,
          `Valuation:\nRs. ${totalBatchValue.toLocaleString('en-IN')}`,
          'Picked Up ✓'
        ]
      ];

      // Add each delivery order stop with 100% full details
      (batch.orders || []).forEach((o, index) => {
        const orderId = o._id ? `#${o._id.slice(-6).toUpperCase()}` : `#ORD-${index + 1}`;
        const cropName = o.crop?.name || o.cropName || 'Produce Cargo';
        const variety = o.crop?.variety ? ` (${o.crop.variety})` : '';
        const category = o.crop?.category || 'Vegetables';
        const grade = o.crop?.grade || 'Grade A';
        const vendorName = o.vendor?.name || o.buyerName || `Vendor ${index + 1}`;
        const vendorPhone = o.vendor?.phone || o.vendorPhone || '9876543210';
        const address = o.deliveryAddress?.addressLine || o.vendorAddress || o.shippingAddress || `A.B. Road, Stop ${index + 1}, Indore`;
        const qty = `${o.requestedQuantity || o.quantity || 0} ${o.crop?.unit || 'Kg'}`;
        const rate = o.pricePerUnit || (o.totalPrice && o.requestedQuantity ? (o.totalPrice / o.requestedQuantity).toFixed(0) : 40);
        const price = o.totalPrice ? `Rs. ${Number(o.totalPrice).toLocaleString('en-IN')}` : `Rs. ${(Number(o.requestedQuantity || 0) * Number(rate)).toLocaleString('en-IN')}`;
        const status = o.deliveryStatus || batch.batchStatus || 'Out For Delivery';

        tableRows.push([
          `Stop #${index + 2}`,
          orderId,
          `${cropName}${variety}`,
          `${category}\n(${grade})`,
          `${vendorName}\nMob: ${vendorPhone}`,
          address,
          qty,
          `@ Rs. ${rate}/${o.crop?.unit || 'Kg'}\n${price}`,
          status
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 58,
        margin: { left: 12, right: 12 },
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85], cellPadding: 2.5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 16 },
          1: { fontStyle: 'bold', cellWidth: 20 },
          2: { fontStyle: 'bold', cellWidth: 40 },
          3: { cellWidth: 26 },
          4: { cellWidth: 45 },
          5: { cellWidth: 50 },
          6: { fontStyle: 'bold', cellWidth: 18 },
          7: { fontStyle: 'bold', cellWidth: 30 },
          8: { fontStyle: 'bold', cellWidth: 28 }
        }
      });

      // Signature & Stamp Verification Box
      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 160;
      if (finalY < 185) {
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.3);

        // Sign Box 1: Dispatch Officer
        doc.line(20, finalY + 12, 80, finalY + 12);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Dispatch Officer / Farmer Sign', 25, finalY + 16);

        // Sign Box 2: Driver Acknowledgement
        doc.line(115, finalY + 12, 185, finalY + 12);
        doc.text('Fleet Driver Pickup Sign', 125, finalY + 16);

        // Sign Box 3: Verification Stamp
        doc.line(215, finalY + 12, 275, finalY + 12);
        doc.text('Security / Gate Clearance Stamp', 220, finalY + 16);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`AgriConnect Logistics Fleet • Batch Manifest #${batch._id.slice(-6).toUpperCase()} • Page ${i} of ${pageCount}`, 14, 202);
      }

      doc.save(`AgriConnect_Batch_Manifest_${batch._id.slice(-6).toUpperCase()}.pdf`);
      toast.success('Comprehensive Batch Manifest PDF Downloaded! 📄');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate Batch Manifest PDF');
    }
  };

  // Metrics calculation
  const activeDispatchesCount = batches.filter(b => b.batchStatus === 'Out For Delivery').length;
  const assignedCarriersCount = batches.filter(b => b.driver).length;

  return (
    <>
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-[20px] font-black text-slate-900 tracking-tight leading-none mb-1.5 flex items-center gap-2">
            <span className="material-symbols-outlined p-1.5 bg-primary-50 text-primary-600 rounded-lg text-[18px]">local_shipping</span> 
            Multi-Order Delivery & Batches
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Group accepted orders to optimize routes, assign fleet carriers, and track batch shipments.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start sm:self-center">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-2 rounded-xl shadow-2xs">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary-600">radar</span> Radius:
            </span>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-20 accent-primary-600 cursor-pointer"
            />
            <span className="text-[11px] font-black text-primary-750 tabular-nums min-w-[38px] text-right">{radiusKm} km</span>
          </div>

          <button
            onClick={handleAutoGroup}
            disabled={unbatchedOrders.length === 0}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-black text-[12px] rounded-xl shadow-sm hover:shadow-md cursor-pointer border-0 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">alt_route</span>
            <span>Auto-Group Orders ({unbatchedOrders.length} pending)</span>
          </button>
        </div>
      </div>

      {/* ── Batch Metrics Overview Bar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">hub</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Total Batches</p>
            <p className="text-[15px] font-black text-slate-900 leading-none mt-0.5">{batches.length}</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Active Dispatches</p>
            <p className="text-[15px] font-black text-emerald-700 leading-none mt-0.5">{activeDispatchesCount} Batches</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">badge</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Carriers Assigned</p>
            <p className="text-[15px] font-black text-indigo-700 leading-none mt-0.5">{assignedCarriersCount} Drivers</p>
          </div>
        </div>

        <div className="global-card !p-3 flex items-center gap-3">
          <div className="w-8.5 h-8.5 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">pending</span>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">Unbatched Orders</p>
            <p className="text-[15px] font-black text-amber-700 leading-none mt-0.5">{unbatchedOrders.length} Orders</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-primary-100 border-t-primary-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left col: Batches list */}
          <div className="xl:col-span-8 space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Active Batches ({batches.length})
            </h3>
            {batches.length === 0 ? (
              <div className="global-card p-8 text-center">
                <span className="material-symbols-outlined text-[36px] text-slate-300">hub</span>
                <p className="text-[12.5px] font-bold text-slate-600 mt-2">No active batches created</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  Click the "Auto-Group Orders" button above to run the routing optimization algorithm on pending orders.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map((batch) => {
                  const driverAssigned = !!batch.driver;
                  const canDispatch = batch.batchStatus === 'Driver Assigned';
                  const isCompleted = batch.batchStatus === 'Completed';

                  return (
                    <div
                      key={batch._id}
                      className={`global-card p-4.5 ${
                        isCompleted ? 'opacity-85 border-slate-200/80 bg-slate-50/40 shadow-none hover:shadow-none hover:translate-y-0' : ''
                      }`}
                    >
                      {/* ── 1. Batch Header Row ── */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-black bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200">
                            BATCH #{batch._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                            batch.batchStatus === 'Completed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : batch.batchStatus === 'Out For Delivery'
                              ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                              : batch.batchStatus === 'Driver Assigned'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {batch.batchStatus}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400">
                            • {batch.orders.length} Deliveries ({batch.totalDistance} km)
                          </span>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            onClick={() => handleDownloadBatchPDF(batch)}
                            title="Download Batch Route Manifest PDF"
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px] text-emerald-600">picture_as_pdf</span>
                            <span>Manifest PDF</span>
                          </button>

                          <button
                            onClick={() => navigate(`/farmer-dashboard/batches/${batch._id}/load-plan`)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span className="material-symbols-outlined text-[13px] text-slate-500">view_in_ar</span>
                            <span>3D Load Plan</span>
                          </button>

                          {canDispatch && (
                            <button
                              onClick={() => setDispatchConfirm({ open: true, batchId: batch._id, isLoading: false })}
                              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-xs active:scale-95"
                            >
                              <span className="material-symbols-outlined text-[13px]">local_shipping</span>
                              <span>Dispatch</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* ── 2. Assigned Carrier Bar ── */}
                      <div className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl mb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[18px]">badge</span>
                          </div>
                          <div>
                            {driverAssigned ? (
                              <>
                                <p className="text-[11.5px] font-black text-slate-900 leading-tight">
                                  {batch.driver?.name} <span className="text-slate-400 font-bold text-[10px]">({batch.driver?.vehicleNumber})</span>
                                </p>
                                <p className="text-[9.5px] text-slate-500 font-semibold">
                                  Assigned Carrier • {batch.driver?.vehicleType}
                                </p>
                              </>
                            ) : (
                              <p className="text-[11px] font-extrabold text-amber-700">
                                Carrier Unassigned — Select driver to dispatch
                              </p>
                            )}
                          </div>
                        </div>

                        {driverAssigned ? (
                          <button
                            onClick={() => handleCopyLink(batch.driver)}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0 self-start sm:self-center"
                          >
                            <span className="material-symbols-outlined text-[12px] text-slate-500">content_copy</span>
                            <span>Share Tracking Link</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 self-start sm:self-center">
                            <select
                              onChange={(e) => setSelectedDriverMap(prev => ({ ...prev, [batch._id]: e.target.value }))}
                              value={selectedDriverMap[batch._id] || ''}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="">Select Carrier...</option>
                              {drivers
                                .filter(d => d.status === 'Available' || d.status === 'Idle')
                                .map(d => (
                                  <option key={d._id} value={d._id}>
                                    {d.name} ({d.vehicleType === 'Bike' ? '🛵 Bike (Max 5)' : '🚛 Truck (Max 20)'})
                                  </option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleAssignDriver(batch._id)}
                              className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] rounded-lg cursor-pointer active:scale-95 transition-all"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>

                      {/* ── 3. Step-by-Step Delivery Route & Cargo Timeline ── */}
                      <div className="space-y-2">
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary-600">alt_route</span>
                          Step-by-Step Delivery Route ({batch.orders.length} Stops)
                        </span>

                        <div className="relative space-y-2.5 py-1">
                          {/* Explicit Sub-Pixel Centered Vertical Route Line */}
                          <div className="absolute left-[11px] top-3.5 bottom-3.5 w-[2px] bg-slate-200 z-0" />
                          
                          {/* Warehouse Pickup Stop */}
                          <div className="relative flex items-start gap-2.5 pl-7">
                            <div className="absolute left-[11px] -translate-x-1/2 top-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white z-10 shadow-2xs">
                              ✓
                            </div>
                            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 px-3 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <div>
                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-100/80 px-1.5 py-0.2 rounded mr-1.5">
                                  Stop #1 • Pickup Warehouse
                                </span>
                                <span className="text-[11.5px] font-black text-slate-800">Indore Farm Warehouse</span>
                              </div>
                              <span className="text-[10px] font-extrabold text-emerald-800">
                                Picked up {batch.orders.length} Produce Orders
                              </span>
                            </div>
                          </div>

                          {/* Delivery Stops for Each Order */}
                          {batch.orders.map((orderItem, idx) => (
                            <div key={orderItem._id || idx} className="relative flex items-start gap-2.5 pl-7">
                              <div className="absolute left-[11px] -translate-x-1/2 top-2 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px] font-black ring-4 ring-white z-10 shadow-2xs">
                                {idx + 2}
                              </div>
                              <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 px-3 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9.5px] font-extrabold text-slate-400 uppercase">
                                      Stop #{idx + 2} • Delivery
                                    </span>
                                    <h5 className="text-[12px] font-black text-slate-900 truncate">
                                      {orderItem.crop?.name || 'Produce Item'}
                                    </h5>
                                  </div>
                                  <p className="text-[10.5px] font-semibold text-slate-500 mt-0.5">
                                    Deliver to: <strong className="text-slate-800 font-bold">{orderItem.vendor?.name || 'Vendor Store'}</strong>
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-black text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                                    {orderItem.requestedQuantity} {orderItem.crop?.unit || 'Kg'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right col: Unbatched orders sidebar list */}
          <div className="xl:col-span-4 space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Unbatched Orders ({unbatchedOrders.length})
            </h3>
            {unbatchedOrders.length === 0 ? (
              <div className="global-card p-6 text-center opacity-90">
                <span className="material-symbols-outlined text-[28px] text-primary-500 bg-primary-50 p-2 rounded-full">done_all</span>
                <p className="text-[11.5px] font-extrabold text-slate-700 mt-2">All orders batched!</p>
                <p className="text-[9.5px] text-slate-400 mt-1 leading-snug">
                  When new accepted orders arrive, run Auto-Group to optimize and batch shipment route sequences.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {unbatchedOrders.map((order) => (
                  <div key={order._id} className="global-card p-3.5 hover:shadow-sm flex flex-col justify-between gap-1">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-black text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">
                        {order.requestedQuantity} {order.crop?.unit}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[12px] text-slate-800 mt-0.5">
                      {order.crop?.name}
                    </h4>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 pt-1.5 border-t border-slate-100 mt-1.5">
                      <span className="truncate max-w-[100px] text-slate-500">📍 {order.farmer?.name}</span>
                      <span className="text-slate-350">➔</span>
                      <span className="truncate max-w-[100px] text-right text-slate-500">🏪 {order.vendor?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {/* Dispatch Confirmation Modal */}
    <ConfirmModal
      isOpen={dispatchConfirm.open}
      onClose={() => !dispatchConfirm.isLoading && setDispatchConfirm({ open: false, batchId: null, isLoading: false })}
      onConfirm={handleDispatchBatch}
      title="Dispatch this batch?"
      description="This will mark the batch as 'Out For Delivery' and send notifications to all customers. This action cannot be undone."
      confirmText="Yes, Dispatch 🚚"
      cancelText="Cancel"
      icon="local_shipping"
      isDanger={false}
      isLoading={dispatchConfirm.isLoading}
    />
    </>
  );
};

export default BatchManagement;
