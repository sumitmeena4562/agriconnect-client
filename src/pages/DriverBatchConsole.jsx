import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import useDriverTracking from '../hooks/useDriverTracking';

const DriverBatchConsole = () => {
  const [searchParams] = useSearchParams();
  const driverId = searchParams.get('driverId') || '';

  const [batch, setBatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [otpValues, setOtpValues] = useState({}); // orderId -> otpString
  const [isVerifyingOtp, setIsVerifyingOtp] = useState({});

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Extract order IDs for GPS tracking
  const orderIds = useMemo(() => {
    return batch && batch.orders ? batch.orders.map(o => String(o._id)) : [];
  }, [batch]);

  const isTripActive = batch && (batch.batchStatus === 'Out For Delivery' || batch.batchStatus === 'Partially Delivered');
  const { gpsStatus } = useDriverTracking(orderIds, isTripActive);

  // Fetch active batch for the driver
  const fetchActiveBatch = useCallback(async () => {
    if (!driverId) return;
    try {
      const res = await api.get('/batches/driver/active');
      if (res.data.success) {
        setBatch(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching driver batch:', error);
      toast.error('Failed to load batch delivery details');
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchActiveBatch();
  }, [fetchActiveBatch]);

  // Load Leaflet CDN dynamically
  useEffect(() => {
    if (window.L) { setMapLoaded(true); return; }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Update batch status (e.g. Out For Delivery)
  const handleUpdateBatchStatus = async (status) => {
    const toastId = toast.loading(`Updating trip status to ${status}...`);
    try {
      const res = await api.patch(`/batches/${batch._id}/status`, { status });
      if (res.data.success) {
        toast.success(`Trip status updated! 🚀`, { id: toastId });
        fetchActiveBatch();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update trip status', { id: toastId });
    }
  };

  // Deliver individual order via OTP
  const handleVerifyOrderOtp = async (orderId) => {
    const otp = otpValues[orderId];
    if (!otp || otp.trim().length !== 4) {
      toast.error('Please enter a 4-digit OTP');
      return;
    }

    setIsVerifyingOtp(prev => ({ ...prev, [orderId]: true }));
    const toastId = toast.loading('Verifying handover OTP...');
    try {
      const res = await api.patch(`/batches/${batch._id}/orders/${orderId}/deliver`, { otp: otp.trim() });
      if (res.data.success) {
        toast.success('Order completed and handed over successfully!', { id: toastId });
        setOtpValues(prev => ({ ...prev, [orderId]: '' }));
        fetchActiveBatch();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid OTP. Check and try again.', { id: toastId });
    } finally {
      setIsVerifyingOtp(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !batch || !batch.optimizedRoute) return;
    const L = window.L;

    // Init map
    if (!mapInstanceRef.current) {
      const m = L.map(mapRef.current, { zoomControl: true }).setView([28.6, 77.2], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(m);
      mapInstanceRef.current = m;
    }
    const map = mapInstanceRef.current;

    // Clear existing markers and route polyline
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    // Custom marker helper
    const mkIcon = (icon, color, label) =>
      L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="display:flex;flex-direction:column;align-items:center;position:relative">
          <div style="width:28px;height:28px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.25);border:2px solid #fff">
            <span class="material-symbols-outlined" style="font-size:15px">${icon}</span>
          </div>
          <span style="background:rgba(15,23,42,.85);color:#fff;font-size:8px;font-weight:700;padding:1px 4px;border-radius:4px;margin-top:2px;white-space:nowrap">${label}</span>
        </div>`,
        iconSize: [32, 44],
        iconAnchor: [16, 40]
      });

    // Plot stops sequentially
    const routePoints = [];
    const bounds = [];

    batch.optimizedRoute.forEach((stop) => {
      const pos = [stop.coordinates.lat, stop.coordinates.lng];
      routePoints.push(pos);
      bounds.push(pos);

      const color = stop.stopType === 'pickup' ? '#10b981' : '#3b82f6';
      const icon = stop.stopType === 'pickup' ? 'agriculture' : 'storefront';
      const label = `Stop ${stop.sequence}: ${stop.stopType === 'pickup' ? 'Pickup' : 'Deliver'}`;

      const marker = L.marker(pos, { icon: mkIcon(icon, color, label) })
        .addTo(map)
        .bindPopup(`<b>Stop ${stop.sequence}</b><br/>${stop.address}`);
      markersRef.current.push(marker);
    });

    // Draw route connecting stops
    if (routePoints.length > 1) {
      polylineRef.current = L.polyline(routePoints, {
        color: '#6366f1',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
    }
  }, [mapLoaded, batch]);

  if (!driverId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center max-w-sm shadow-md">
          <span className="material-symbols-outlined text-[36px] text-rose-500">warning</span>
          <p className="text-[13px] font-black text-slate-800 mt-2">Driver ID is missing</p>
          <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">
            Please make sure you access this page using the link shared by the logistics coordinator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center p-4 bg-gradient-to-br from-slate-50 to-indigo-50/10">
      
      {/* Header */}
      <div className="w-full max-w-lg text-center mb-4 shrink-0">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 mb-1">
          <span className="material-symbols-outlined text-[20px] font-bold">route</span>
        </div>
        <h1 className="text-[17px] font-black text-slate-800">AgriConnect Delivery</h1>
        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none mt-0.5">
          Multi-Order Dispatch Console
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 flex-1">
          <div className="w-8 h-8 rounded-full border-3 border-indigo-100 border-t-indigo-600 animate-spin" />
        </div>
      ) : !batch ? (
        <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-6 text-center shadow-xs">
          <span className="material-symbols-outlined text-[36px] text-slate-300">agriculture</span>
          <p className="text-[12.5px] font-bold text-slate-500 mt-2">No active shipments assigned</p>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            You do not have any active delivery batches currently. Stand by for dispatcher assignments.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-4 pb-10">
          
          {/* Card 1: Batch Overview */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex justify-between items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 uppercase">
                  BATCH #{batch._id.slice(-6).toUpperCase()}
                </span>
                {isTripActive && (
                  <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border flex items-center gap-1 ${
                    gpsStatus === 'active'
                      ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 animate-pulse'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${gpsStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {gpsStatus === 'active' ? 'Live GPS Active' : 'Connecting GPS...'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[14px] font-black text-slate-800">
                  {batch.orders.length} orders
                </span>
                <span className="text-slate-350 text-[10px] font-bold">·</span>
                <span className="text-[11.5px] font-extrabold text-slate-500">
                  {batch.totalDistance} km
                </span>
              </div>
            </div>
            {batch.batchStatus === 'Driver Assigned' ? (
              <button
                onClick={() => handleUpdateBatchStatus('Out For Delivery')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] rounded-xl cursor-pointer border-0 active:scale-95 shadow-md flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[15px]">play_circle</span>
                <span>Start Trip</span>
              </button>
            ) : (
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                batch.batchStatus === 'Completed'
                  ? 'bg-emerald-50 border-emerald-250 text-emerald-700'
                  : 'bg-amber-50 border-amber-250 text-amber-700 animate-pulse'
              }`}>
                {batch.batchStatus}
              </span>
            )}
          </div>

          {/* Card 2: Interactive Route Map */}
          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs flex flex-col h-[280px]">
            <div className="px-4 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                Optimized Delivery Route
              </span>
            </div>
            <div className="flex-1 relative bg-slate-100">
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[11px] font-bold text-slate-500">Loading Map...</span>
                </div>
              )}
              <div ref={mapRef} id="driver-batch-map" className="w-full h-full z-0" />
            </div>
          </div>

          {/* Card 3: Sequential Timeline and Actions */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
            <h3 className="text-[11.5px] font-black uppercase tracking-wider text-slate-400">
              Delivery Stops Timeline
            </h3>
            
            <div className="relative border-l-2 border-indigo-100 pl-4 ml-2.5 space-y-5">
              {(() => {
                const groupedStops = [];
                let seq = 1;
                batch.optimizedRoute.forEach(stop => {
                  const last = groupedStops[groupedStops.length - 1];
                  if (last && last.stopType === 'pickup' && stop.stopType === 'pickup' && last.address === stop.address) {
                    last.items.push({
                      orderId: stop.orderId,
                      cropName: batch.orders.find(o => o._id === stop.orderId)?.crop?.name,
                      quantity: batch.orders.find(o => o._id === stop.orderId)?.requestedQuantity,
                      unit: batch.orders.find(o => o._id === stop.orderId)?.crop?.unit,
                    });
                  } else {
                    groupedStops.push({
                      ...stop,
                      sequence: seq++,
                      items: [{
                        orderId: stop.orderId,
                        cropName: batch.orders.find(o => o._id === stop.orderId)?.crop?.name,
                        quantity: batch.orders.find(o => o._id === stop.orderId)?.requestedQuantity,
                        unit: batch.orders.find(o => o._id === stop.orderId)?.crop?.unit,
                      }]
                    });
                  }
                });

                return groupedStops.map((stop, stopIdx) => {
                  const isCompleted = stop.items.every(item => {
                    const o = batch.orders.find(ord => ord._id === item.orderId);
                    return o?.deliveryStatus === 'Completed';
                  });

                  return (
                    <div key={stopIdx} className="relative">
                      {/* Timeline Node Icon dot */}
                      <div className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : stop.stopType === 'pickup'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      }`}>
                        <span className="material-symbols-outlined text-[8px] font-bold">
                          {isCompleted ? 'check' : stop.stopType === 'pickup' ? 'agriculture' : 'storefront'}
                        </span>
                      </div>

                      {/* Timeline Node Content */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            Stop {stop.sequence} · {stop.stopType}
                          </span>
                          {isCompleted && (
                            <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 rounded">
                              Done
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1.5 mt-0.5">
                          {stop.items.map((item, itemIdx) => {
                            const itemOrder = batch.orders.find(o => o._id === item.orderId);
                            const itemDone = itemOrder?.deliveryStatus === 'Completed';
                            return (
                              <div key={itemIdx} className="flex flex-col">
                                <h4 className={`font-extrabold text-[12.5px] ${itemDone ? 'text-slate-450 line-through' : 'text-slate-800'} leading-snug`}>
                                  {item.cropName || 'Crop'} ({item.quantity} {item.unit})
                                </h4>
                                {stop.stopType === 'delivery' && !itemDone && batch.batchStatus !== 'Driver Assigned' && (
                                  <div className="mt-1.5 p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl max-w-xs">
                                    <span className="text-[8.5px] font-black text-indigo-900 flex items-center gap-1 uppercase tracking-wider mb-1.5">
                                      <span className="material-symbols-outlined text-[11px] text-indigo-600">lock_open</span>
                                      Verify Handover OTP
                                    </span>
                                    <div className="flex gap-1.5">
                                      <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="OTP"
                                        value={otpValues[item.orderId] || ''}
                                        onChange={(e) => setOtpValues(prev => ({ ...prev, [item.orderId]: e.target.value.replace(/\D/g, '') }))}
                                        className="w-full px-2 py-0.5 bg-white border border-slate-300 rounded-lg text-[10.5px] font-bold tracking-widest text-center focus:outline-none focus:border-indigo-500"
                                        disabled={isVerifyingOtp[item.orderId]}
                                      />
                                      <button
                                        onClick={() => handleVerifyOrderOtp(item.orderId)}
                                        disabled={isVerifyingOtp[item.orderId] || (otpValues[item.orderId] || '').length !== 4}
                                        className="px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-black text-[9.5px] rounded-lg cursor-pointer border-0 active:scale-95 transition-all"
                                      >
                                        Verify
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <p className="text-[9.5px] text-slate-500 font-bold mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[11px] text-slate-400">pin_drop</span>
                          <span>{stop.address}</span>
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverBatchConsole;

