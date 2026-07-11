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
  const [planningBatch, setPlanningBatch] = useState(null);
  const [localRouteStops, setLocalRouteStops] = useState([]);
  const [removedOrderIds, setRemovedOrderIds] = useState(new Set());
  const [savingPlan, setSavingPlan] = useState(false);

  const handleOpenPlanner = (batch) => {
    setPlanningBatch(batch);
    setLocalRouteStops(batch.optimizedRoute || []);
    setRemovedOrderIds(new Set());
  };

  const handleClosePlanner = () => {
    setPlanningBatch(null);
    setLocalRouteStops([]);
    setRemovedOrderIds(new Set());
  };

  const handleSaveLoadPlan = async () => {
    if (!planningBatch) return;
    setSavingPlan(true);
    const toastId = toast.loading('Saving load plan and updating routing...');
    try {
      const res = await api.put(`/batches/${planningBatch._id}/load-plan`, {
        optimizedRoute: localRouteStops,
        orderIdsToRemove: Array.from(removedOrderIds)
      });
      if (res.data.success) {
        toast.success('Load plan saved successfully! 🚛', { id: toastId });
        fetchData();
        handleClosePlanner();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save load plan', { id: toastId });
    } finally {
      setSavingPlan(false);
    }
  };

  const handleMoveStop = (idx, direction) => {
    const pickups = localRouteStops.filter(s => s.stopType === 'pickup');
    const deliveries = localRouteStops.filter(s => s.stopType === 'delivery');
    
    if (direction === 'up' && idx > 0) {
      const temp = deliveries[idx];
      deliveries[idx] = deliveries[idx - 1];
      deliveries[idx - 1] = temp;
    } else if (direction === 'down' && idx < deliveries.length - 1) {
      const temp = deliveries[idx];
      deliveries[idx] = deliveries[idx + 1];
      deliveries[idx + 1] = temp;
    }

    // Re-assign sequences and loading sequences
    let seq = pickups.length + 1;
    deliveries.forEach((stop, index) => {
      stop.sequence = seq++;
      stop.loadingSequence = deliveries.length - index;
    });

    setLocalRouteStops([...pickups, ...deliveries]);
  };

  const handleRemoveOrderFromBatch = (orderId) => {
    setRemovedOrderIds(prev => {
      const updated = new Set(prev);
      updated.add(String(orderId));
      return updated;
    });

    // Remove stops corresponding to this orderId
    const filteredStops = localRouteStops.filter(s => String(s.orderId) !== String(orderId));
    
    // Re-sequence remaining stops
    const pickups = filteredStops.filter(s => s.stopType === 'pickup');
    const deliveries = filteredStops.filter(s => s.stopType === 'delivery');

    let seq = 1;
    pickups.forEach((stop, index) => {
      stop.sequence = seq++;
    });

    deliveries.forEach((stop, index) => {
      stop.sequence = seq++;
      stop.loadingSequence = deliveries.length - index;
    });

    setLocalRouteStops([...pickups, ...deliveries]);
  };

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
                          <div className="flex items-center gap-2 self-end">
                            <button
                              onClick={() => handleOpenPlanner(batch)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-250 rounded-xl text-[10.5px] font-black cursor-pointer active:scale-95 transition-all flex items-center gap-1.5 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
                              <span>Plan Load 🚛</span>
                            </button>
                            {canDispatch && (
                              <button
                                onClick={() => handleDispatchBatch(batch._id)}
                                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10.5px] rounded-xl cursor-pointer border-0 active:scale-95 transition-all flex items-center gap-1 shadow-sm"
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

      {/* ── Visual Load Planning Modal (TMS Visualizer) ── */}
      <AnimatePresence>
        {planningBatch && (() => {
          const activeOrders = planningBatch.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
          const totalWeight = activeOrders.reduce((sum, o) => sum + (o.requestedQuantity || 0), 0);
          const maxCapacity = planningBatch.driver?.payloadCapacity || 10000;
          const weightPercent = Math.min(100, Math.round((totalWeight / maxCapacity) * 100));
          const totalPallets = Math.ceil(totalWeight / 250);
          
          const deliveryStops = localRouteStops.filter(
            s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
          );
          
          const lifoAlerts = deliveryStops.filter(stop => {
            return deliveryStops.some(other => {
              return other.loadingSequence > stop.loadingSequence && stop.sequence < other.sequence;
            });
          }).length;
          
          const alertsCount = lifoAlerts + (totalWeight > maxCapacity ? 1 : 0);

          // Trailer grid (6 slots: index 0 to 5)
          const gridSlots = Array(6).fill(null);
          deliveryStops.forEach(stop => {
            const lSeq = stop.loadingSequence;
            if (lSeq >= 1 && lSeq <= 6) {
              gridSlots[lSeq - 1] = stop;
            }
          });

          // Top Row: slots 4, 5, 6 (represented by index 3, 4, 5)
          // Bottom Row: slots 1, 2, 3 (represented by index 0, 1, 2)
          const topRow = [gridSlots[3], gridSlots[4], gridSlots[5]];
          const bottomRow = [gridSlots[0], gridSlots[1], gridSlots[2]];

          const renderCargoSlot = (stop, slotNum) => {
            if (!stop) {
              return (
                <div key={slotNum} className="border border-dashed border-slate-300 rounded-xl flex items-center justify-center p-3 text-slate-400 bg-slate-100/50 min-h-[65px] select-none">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Empty Slot</span>
                </div>
              );
            }

            const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
            const isViolated = deliveryStops.some(other => {
              return other.loadingSequence > stop.loadingSequence && stop.sequence < other.sequence;
            });

            return (
              <div 
                key={stop.orderId} 
                className={`border rounded-xl p-2.5 flex flex-col justify-between shadow-xs transition-all min-h-[65px] bg-white text-left ${
                  isViolated 
                    ? 'border-purple-500 ring-1 ring-purple-400/20' 
                    : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-bold">
                  <span>S{stop.sequence - localRouteStops.filter(s => s.stopType === 'pickup').length}</span>
                  <span>{order?.requestedQuantity} {order?.crop?.unit}</span>
                </div>
                
                <h5 className="text-[11px] font-black text-slate-800 truncate leading-none my-1">
                  {order?.crop?.name || 'Crop'}
                </h5>
                
                <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-bold border-t border-slate-100 pt-1">
                  <span>L-{stop.loadingSequence}</span>
                  {isViolated ? (
                    <span className="text-purple-600 font-black animate-pulse text-[8px] uppercase">LIFO Alert</span>
                  ) : (
                    <span className="text-emerald-600 font-bold text-[8px] uppercase">OK</span>
                  )}
                </div>
              </div>
            );
          };

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClosePlanner}>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-150 z-10 overflow-hidden flex flex-col h-[85vh] max-h-[720px]"
              >
                {/* Modal Title bar */}
                <div className="px-6 py-4 border-b border-slate-150 bg-white flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-[15px] font-black text-slate-800 tracking-tight leading-none">
                      🚚 Batch #{planningBatch._id.slice(-6).toUpperCase()} Load Planning Console
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      Carrier: {planningBatch.driver?.name || 'Self-Delivery'} • Vehicle Number: {planningBatch.driver?.vehicleNumber || 'N/A'}
                    </p>
                  </div>
                  <button 
                    onClick={handleClosePlanner}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-450 border-0 cursor-pointer transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                  {/* Left Visualizer Panel */}
                  <div className="flex-1 flex flex-col p-6 space-y-5 bg-white overflow-y-auto">
                    
                    {/* Stats Row */}
                    <div className="flex items-center gap-10 text-[12px] font-bold text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                      <div className="flex items-center gap-2">
                        <span>Weight</span>
                        <span className="text-[17px] font-black text-slate-800">{totalWeight.toLocaleString()}kg</span>
                        <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded ${weightPercent > 100 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          +{weightPercent}%
                        </span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="flex items-center gap-2">
                        <span>Pallets</span>
                        <span className="text-[17px] font-black text-slate-800">{totalPallets}</span>
                        <span className="text-[9.5px] font-extrabold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          +{activeOrders.length}
                        </span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div className="flex items-center gap-2">
                        <span>Alerts</span>
                        <span className="text-[17px] font-black text-slate-800">{alertsCount}</span>
                        {alertsCount > 0 ? (
                          <span className="text-[9.5px] font-extrabold bg-purple-100 text-purple-700 px-2 py-0.5 rounded">-{alertsCount}</span>
                        ) : (
                          <span className="text-[9.5px] font-extrabold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">OK</span>
                        )}
                      </div>
                    </div>

                    {/* Truck Layout Graphic Section */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-wider">Trailer Visual Layout</h3>
                          <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Click "Plan Load" and shift sequence to rearrange stops</p>
                        </div>
                        <span className="text-[9px] bg-slate-100 border border-slate-200 font-mono font-bold px-2 py-0.5 rounded text-slate-500 uppercase tracking-wide">
                          Capacity: {maxCapacity} {activeOrders[0]?.crop?.unit || 'kg'}
                        </span>
                      </div>

                      {/* Visual Semi-Truck and trailer grid */}
                      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-3xl min-h-[300px] w-full select-none">
                        <div className="flex items-end w-full max-w-4xl gap-0 justify-center">
                          {/* Clean realistic truck cab profile */}
                          <div className="shrink-0 -mr-1 z-10 flex flex-col items-center">
                            <svg viewBox="0 0 160 110" className="w-44 h-26 fill-white stroke-slate-350 stroke-[2] drop-shadow-xs">
                              {/* Exhaust stack */}
                              <line x1="25" y1="10" x2="25" y2="50" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                              {/* Cab shape */}
                              <path d="M10 80 L10 42 C10 38, 14 36, 18 36 L68 36 C78 36, 88 26, 94 16 L118 16 C124 16, 128 20, 131 25 L145 48 L148 48 C149 48, 150 49, 150 50 L150 80 Z" />
                              {/* Window outline */}
                              <path d="M80 42 L94 22 L116 22 C118 22, 120 23, 121 25 L130 42 Z" fill="#1e293b" />
                              {/* Front bumper */}
                              <rect x="144" y="65" width="8" height="15" rx="2" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1" />
                              {/* Wheels */}
                              <circle cx="45" cy="78" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2.5"/>
                              <circle cx="45" cy="78" r="4" fill="#f8fafc"/>
                              <circle cx="115" cy="78" r="12" fill="#1e293b" stroke="#64748b" strokeWidth="2.5"/>
                              <circle cx="115" cy="78" r="4" fill="#f8fafc"/>
                            </svg>
                            <span className="text-[8.5px] font-black text-slate-400 mt-1 uppercase tracking-wide">CABIN (FRONT)</span>
                          </div>

                          {/* Trailer Container */}
                          <div className="flex-1 bg-[#f1f3f5] border border-slate-300 rounded-r-2xl p-4 min-h-[190px] relative flex flex-col justify-between shadow-inner">
                            {/* Top Row: Slots 4, 5, 6 */}
                            <div className="grid grid-cols-3 gap-3 flex-1 mb-3">
                              {topRow.map((stop, idx) => renderCargoSlot(stop, idx + 4))}
                            </div>
                            {/* Bottom Row: Slots 1, 2, 3 */}
                            <div className="grid grid-cols-3 gap-3 flex-1">
                              {bottomRow.map((stop, idx) => renderCargoSlot(stop, idx + 1))}
                            </div>

                            {/* Wheels of Trailer */}
                            <div className="absolute -bottom-4 left-10 right-10 flex justify-between px-10 pointer-events-none">
                              <div className="flex gap-1">
                                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400"/></div>
                                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400"/></div>
                              </div>
                              <div className="flex gap-1">
                                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400"/></div>
                                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center shadow-md"><div className="w-2 h-2 rounded-full bg-slate-400"/></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Plan List Sidebar */}
                  <div className="w-80 border-l border-slate-150 flex flex-col bg-white h-full overflow-hidden shrink-0">
                    <div className="p-4 border-b border-slate-150 shrink-0 bg-white">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[12.5px] font-black text-slate-800 uppercase tracking-wider">Load Sequence</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Interactive</span>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => {
                            if (window.confirm('Reset this load plan to default optimized route?')) {
                              setLocalRouteStops(planningBatch.optimizedRoute || []);
                              setRemovedOrderIds(new Set());
                            }
                          }}
                          className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Clear Plan
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                      {deliveryStops.map((stop, idx, arr) => {
                        const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
                        return (
                          <div key={stop.orderId} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span className="font-extrabold text-[11px] text-slate-800 truncate">
                                  {order?.crop?.name || 'Crop'}
                                </span>
                              </div>
                              <p className="text-[9px] text-slate-400 font-semibold pl-7 truncate leading-none mt-1">
                                {order?.vendor?.name}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {/* Up Arrow */}
                              <button
                                disabled={idx === 0}
                                onClick={() => handleMoveStop(idx, 'up')}
                                className="w-6 h-6 rounded-md hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-500 border-0 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">expand_less</span>
                              </button>
                              {/* Down Arrow */}
                              <button
                                disabled={idx === arr.length - 1}
                                onClick={() => handleMoveStop(idx, 'down')}
                                className="w-6 h-6 rounded-md hover:bg-slate-100 disabled:opacity-30 flex items-center justify-center text-slate-500 border-0 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">expand_more</span>
                              </button>
                              {/* Unassign Order Button */}
                              <button
                                onClick={() => {
                                  if (window.confirm('Unassign this order?')) {
                                    handleRemoveOrderFromBatch(stop.orderId);
                                  }
                                }}
                                className="w-6 h-6 rounded-md hover:bg-rose-50 text-rose-600 border-0 cursor-pointer flex items-center justify-center"
                                title="Remove Order"
                              >
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 border-t border-slate-150 shrink-0 bg-white">
                      <button
                        onClick={handleSaveLoadPlan}
                        disabled={savingPlan}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[12.5px] rounded-xl cursor-pointer border-0 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                      >
                        {savingPlan ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : 'Save Load Plan'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default BatchManagement;
