import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
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
                      {/* Top Header line */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9.5px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                            BATCH #{batch._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            batch.batchStatus === 'Completed'
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                              : batch.batchStatus === 'Out For Delivery'
                              ? 'bg-amber-50 border-amber-250 text-amber-700 animate-pulse'
                              : batch.batchStatus === 'Driver Assigned'
                              ? 'bg-indigo-50 border-indigo-250 text-indigo-700'
                              : 'bg-slate-100 border-slate-200 text-slate-500'
                          }`}>
                            {batch.batchStatus}
                          </span>
                        </div>
                        <div className="text-right flex items-baseline gap-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Distance:</span>
                          <span className="text-[12px] font-black text-slate-800">{batch.totalDistance} km</span>
                        </div>
                      </div>

                      {/* Orders summary */}
                      <div className="space-y-1.5 mb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Cargo & Destinations ({batch.orders.length})</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {batch.orders.map((o) => (
                            <div key={o._id} className="p-2 bg-slate-50 hover:bg-slate-100/50 border border-slate-200/40 rounded-xl flex items-center justify-between gap-2 transition-colors">
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-[11px] text-slate-800 truncate leading-none mb-1">
                                  {o.crop?.name || 'Deleted Crop'}
                                </h5>
                                <p className="text-[8.5px] text-slate-400 font-bold truncate leading-none">
                                  Deliver to: <strong className="text-slate-600">{o.vendor?.name || 'Store'}</strong>
                                </p>
                              </div>
                              <span className="text-[9.5px] font-extrabold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                                {o.requestedQuantity} {o.crop?.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sequence stops timeline */}
                      <div className="bg-slate-50/50 border border-slate-100 p-2.5 rounded-xl mb-3.5 space-y-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px] text-primary-600 font-bold">route</span>
                          Optimized Delivery Route Map
                        </span>
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 pt-0.5">
                          {(() => {
                            const route = batch.optimizedRoute || [];
                            if (route.length === 0) {
                              return (
                                <span className="text-[10px] text-slate-400 italic font-medium">
                                  Route data unavailable
                                </span>
                              );
                            }
                            const groupedStops = [];
                            route.forEach(stop => {
                              const last = groupedStops[groupedStops.length - 1];
                              if (last && last.stopType === stop.stopType && last.address === stop.address) {
                                  last.count++;
                              } else {
                                  groupedStops.push({ ...stop, count: 1 });
                              }
                            });
                            return groupedStops.map((stop, index) => (
                              <React.Fragment key={index}>
                                {index > 0 && <span className="material-symbols-outlined text-[10px] text-slate-300">chevron_right</span>}
                                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border transition-all ${
                                  stop.stopType === 'pickup'
                                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                                    : 'bg-info-50 border-info-200 text-info-750'
                                }`}>
                                  <span className="material-symbols-outlined text-[10px]">
                                    {stop.stopType === 'pickup' ? 'local_mall' : 'storefront'}
                                  </span>
                                  <span>
                                    {stop.address.split("'s")[0]} 
                                    {stop.count > 1 && <span className="ml-1 font-extrabold text-[8px] bg-white/60 px-1 rounded">x{stop.count}</span>}
                                  </span>
                                </div>
                              </React.Fragment>
                            ));
                          })()}
                        </div>
                      </div>

                      {!isCompleted && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-slate-400">person_pin</span>
                            {driverAssigned ? (
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="text-[11px] font-black text-slate-800 leading-none">
                                    {batch.driver?.name} ({batch.driver?.vehicleNumber})
                                  </p>
                                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                                    Assigned Carrier · {batch.driver?.vehicleType}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleCopyLink(batch.driver)}
                                  className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-lg text-[9px] font-black cursor-pointer active:scale-95 transition-all flex items-center gap-0.5"
                                  title="Copy Driver Tracking Link"
                                >
                                  <span className="material-symbols-outlined text-[11px]">content_copy</span>
                                  <span>Copy Link</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <select
                                  onChange={(e) => setSelectedDriverMap(prev => ({ ...prev, [batch._id]: e.target.value }))}
                                  value={selectedDriverMap[batch._id] || ''}
                                  className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
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
                                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] rounded-lg border-0 cursor-pointer active:scale-95 transition-all"
                                >
                                  Assign
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              onClick={() => navigate(`/farmer-dashboard/batches/${batch._id}/load-plan`)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 rounded-xl text-[10px] font-black cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
                              <span>Plan Load 🚛</span>
                            </button>
                            {canDispatch && (
                              <button
                                onClick={() => setDispatchConfirm({ open: true, batchId: batch._id, isLoading: false })}
                                className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] rounded-xl cursor-pointer border-0 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
                              >
                                <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                <span>Dispatch Batch ➔</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
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
