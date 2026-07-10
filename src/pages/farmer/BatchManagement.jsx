import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [unbatchedOrders, setUnbatchedOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriverMap, setSelectedDriverMap] = useState({}); // batchId -> driverId

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
    const toastId = toast.loading('Running proximity matching & route optimization...');
    try {
      const res = await api.post('/batches/auto-group');
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
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to assign driver', { id: toastId });
    }
  };

  // Dispatch Batch (Out for Delivery)
  const handleDispatchBatch = async (batchId) => {
    const toastId = toast.loading('Dispatching batch. Notification sent to customers...');
    try {
      const res = await api.patch(`/batches/${batchId}/status`, { status: 'Out For Delivery' });
      if (res.data.success) {
        toast.success('Batch is now Out For Delivery! 🚚', { id: toastId });
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to dispatch batch', { id: toastId });
    }
  };

  const handleCopyLink = (driverId) => {
    const link = `${window.location.origin}/driver-batch?driverId=${driverId}`;
    navigator.clipboard.writeText(link);
    toast.success('Driver tracking link copied to clipboard! 📋');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-slate-800 tracking-tight leading-none mb-1 flex items-center gap-2">
            <span>📦</span> Multi-Order Delivery & Batches
          </h1>
          <p className="text-[12px] text-slate-500 font-medium">
            Group nearby orders to optimize routes, assign fleet drivers, and track batch statuses.
          </p>
        </div>
        <button
          onClick={handleAutoGroup}
          disabled={unbatchedOrders.length === 0}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-black text-[12px] rounded-xl shadow-md cursor-pointer border-0 active:scale-95 transition-all flex items-center gap-2 shrink-0 self-start sm:self-center"
        >
          <span className="material-symbols-outlined text-[16px]">alt_route</span>
          <span>Auto-Group Orders ({unbatchedOrders.length} pending)</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-emerald-100 border-t-emerald-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left col: Batches list */}
          <div className="xl:col-span-8 space-y-4">
            <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-400">
              Active Batches ({batches.length})
            </h3>
            {batches.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-xs">
                <span className="material-symbols-outlined text-[36px] text-slate-300">hub</span>
                <p className="text-[12.5px] font-bold text-slate-500 mt-2">No active batches created</p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
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
                      className={`bg-white border rounded-2xl p-4 shadow-sm relative transition-all ${
                        isCompleted ? 'border-slate-200/80 bg-slate-50/50' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {/* Top Header line */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                            BATCH #{batch._id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            batch.batchStatus === 'Completed'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : batch.batchStatus === 'Out For Delivery'
                              ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                              : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                            {batch.batchStatus}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-slate-400 block uppercase">Distance</span>
                          <span className="text-[12.5px] font-extrabold text-slate-700">{batch.totalDistance} km</span>
                        </div>
                      </div>

                      {/* Orders summary */}
                      <div className="space-y-2.5 mb-4">
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400">Cargo & Destinations ({batch.orders.length})</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {batch.orders.map((o) => (
                            <div key={o._id} className="p-2.5 bg-slate-50/70 border border-slate-200/40 rounded-xl flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <h5 className="font-bold text-[11.5px] text-slate-800 truncate leading-none mb-1">
                                  {o.crop?.name || 'Deleted Crop'}
                                </h5>
                                <p className="text-[9px] text-slate-500 font-semibold truncate leading-none">
                                  Deliver to: {o.vendor?.name || 'Store'}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                                {o.requestedQuantity} {o.crop?.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sequence stops timeline */}
                      <div className="bg-slate-50 p-3 rounded-xl mb-4 space-y-2">
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-emerald-600 font-bold">route</span>
                          Optimized Delivery Sequence
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {(() => {
                            const groupedStops = [];
                            batch.optimizedRoute.forEach(stop => {
                              const last = groupedStops[groupedStops.length - 1];
                              if (last && last.stopType === stop.stopType && last.address === stop.address) {
                                last.count++;
                              } else {
                                groupedStops.push({ ...stop, count: 1 });
                              }
                            });
                            return groupedStops.map((stop, index) => (
                              <React.Fragment key={index}>
                                {index > 0 && <span className="text-slate-350 text-[10px]">➔</span>}
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-black border ${
                                  stop.stopType === 'pickup'
                                    ? 'bg-emerald-50 border-emerald-250/60 text-emerald-700'
                                    : 'bg-blue-50 border-blue-250/60 text-blue-755'
                                }`}>
                                  <span className="material-symbols-outlined text-[10.5px]">
                                    {stop.stopType === 'pickup' ? 'agriculture' : 'storefront'}
                                  </span>
                                  <span>
                                    {stop.address.split('\'s')[0]} 
                                    {stop.count > 1 && ` (x${stop.count})`}
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
                                    Assigned Fleet Carrier · {batch.driver?.vehicleType}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleCopyLink(batch.driver._id || batch.driver)}
                                  className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[9px] font-black cursor-pointer active:scale-95 transition-all flex items-center gap-0.5"
                                  title="Copy Driver Tracking Link"
                                >
                                  <span className="material-symbols-outlined text-[11.5px]">content_copy</span>
                                  <span>Copy Link</span>
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <select
                                  onChange={(e) => setSelectedDriverMap(prev => ({ ...prev, [batch._id]: e.target.value }))}
                                  value={selectedDriverMap[batch._id] || ''}
                                  className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-[10.5px] font-bold focus:outline-none focus:border-emerald-500"
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
                                  className="px-3 py-1 bg-slate-800 text-white font-black text-[10px] rounded-lg border-0 cursor-pointer active:scale-95 transition-all"
                                >
                                  Assign
                                </button>
                              </div>
                            )}
                          </div>

                          {canDispatch && (
                            <button
                              onClick={() => handleDispatchBatch(batch._id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10.5px] rounded-lg cursor-pointer border-0 active:scale-95 transition-all flex items-center gap-1 self-end shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                              <span>Dispatch Batch ➔</span>
                            </button>
                          )}
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
            <h3 className="text-[13px] font-black uppercase tracking-wider text-slate-400">
              Unbatched Orders ({unbatchedOrders.length})
            </h3>
            {unbatchedOrders.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-center">
                <span className="material-symbols-outlined text-[28px] text-slate-400">done_all</span>
                <p className="text-[11.5px] font-bold text-slate-500 mt-1">All orders batched!</p>
                <p className="text-[9.5px] text-slate-400 mt-0.5 leading-snug">
                  Naye accepted orders aane par auto-batch run karke assign kar sakte hain.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {unbatchedOrders.map((order) => (
                  <div key={order._id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs flex flex-col justify-between gap-1">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[8.5px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-700">
                        {order.requestedQuantity} {order.crop?.unit}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[12.5px] text-slate-800 mt-0.5">
                      {order.crop?.name}
                    </h4>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 pt-1.5 border-t border-slate-100 mt-1">
                      <span className="truncate max-w-[100px]">📍 {order.farmer?.name}</span>
                      <span className="text-slate-300">➔</span>
                      <span className="truncate max-w-[100px] text-right">🏪 {order.vendor?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
