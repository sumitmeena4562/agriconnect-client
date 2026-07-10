import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useDriverTracking from '../hooks/useDriverTracking';
import api from '../utils/api';

// ── GPS Status Config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  idle: {
    label: 'Tracking Not Started',
    dot: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]',
    badge: 'bg-slate-50 text-slate-500 border-slate-200/50',
    themeColor: '#64748b'
  },
  requesting: {
    label: 'Requesting GPS...',
    dot: 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    badge: 'bg-amber-50 text-amber-700 border-amber-250/60',
    themeColor: '#d97706'
  },
  active: {
    label: 'Live Tracking Active',
    dot: 'bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-250',
    themeColor: '#059669'
  },
  error: {
    label: 'GPS Error',
    dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    badge: 'bg-rose-50 text-rose-700 border-rose-250/60',
    themeColor: '#e11d48'
  },
};

const DriverTrackingPage = () => {
  const [searchParams]        = useSearchParams();
  const [isTracking, setIsTracking] = useState(false);
  const [isSos, setIsSos]            = useState(false);
  // Milk run / route consolidation state
  const [suggestions, setSuggestions]           = useState([]);
  const [acceptedIds, setAcceptedIds]           = useState(new Set());
  const [dismissedIds, setDismissedIds]         = useState(new Set());
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false);
  // Store route points received from hook (for sending to backend)
  const [activeRoutePoints, setActiveRoutePoints] = useState(null);

  // URL parameters
  const orderId    = searchParams.get('orderId')   || '';
  const driverName = searchParams.get('name')      || 'Driver';
  const cropName   = searchParams.get('crop')      || 'Crop';
  const vendorName = searchParams.get('vendor')    || 'Vendor';

  // Pass primary orderId + accepted addon orderIds so GPS updates both
  const trackingOrderIds = useMemo(() => [orderId, ...Array.from(acceptedIds)], [orderId, acceptedIds]);

  // GPS hook
  const { gpsStatus, accuracy, updateCount, speed, stopTracking, routePoints } =
    useDriverTracking(trackingOrderIds, isTracking);

  const config = STATUS_CONFIG[gpsStatus] || STATUS_CONFIG.idle;

  // Firebase REST URL dynamically constructed from env
  const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || '';

  // Dynamic document title update
  useEffect(() => {
    if (gpsStatus === 'active') {
      document.title = '📍 Live Tracking — AgriConnect';
    } else {
      document.title = 'Driver Tracking — AgriConnect';
    }
    return () => { document.title = 'AgriConnect'; };
  }, [gpsStatus]);

  const triggerSos = async (state) => {
    try {
      const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl : dbUrl + '/';
      const trackingOrderIds = [orderId, ...Array.from(acceptedIds)];
      await Promise.all(trackingOrderIds.map(id =>
        fetch(`${cleanDbUrl}locations/${id}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sos: state })
        })
      ));
      setIsSos(state);
    } catch (err) {
      console.error('[Driver] SOS failed:', err.message);
    }
  };

  // On page load, fetch consolidation status to populate already accepted consolidations
  useEffect(() => {
    if (!orderId) return;
    const fetchConsolidationStatus = async () => {
      try {
        const res = await api.get(`/orders/${orderId}/consolidation`);
        if (res.data.success && res.data.consolidatedWith) {
          const activeAddons = res.data.consolidatedWith
            .filter(o => o.status !== 'Completed' && o.status !== 'Cancelled')
            .map(o => String(o._id));
          if (activeAddons.length > 0) {
            setAcceptedIds(new Set(activeAddons));
          }
        }
      } catch (err) {
        console.warn('[Milk Run] Failed to fetch consolidation status:', err.message);
      }
    };
    fetchConsolidationStatus();
  }, [orderId]);

  const handleToggle = () => {
    if (isTracking) {
      triggerSos(false);
      stopTracking();
      setIsTracking(false);
      setSuggestions([]);
      setAcceptedIds(new Set());
      setDismissedIds(new Set());
    } else {
      setIsTracking(true);
    }
  };

  // Fetch route consolidation suggestions from backend
  const fetchSuggestions = useCallback(async (routePts) => {
    if (!orderId || !routePts || routePts.length < 2) return;
    setFetchingSuggestions(true);
    try {
      const res = await api.get('/orders/route-suggestions', {
        params: {
          orderId,
          routePoints: JSON.stringify(routePts)
        }
      });
      if (res.data.success) {
        setSuggestions(res.data.data || []);
      }
    } catch (err) {
      console.warn('[Milk Run] Suggestions fetch failed:', err.message);
    } finally {
      setFetchingSuggestions(false);
    }
  }, [orderId]);

  // When GPS becomes active, fetch suggestions once
  useEffect(() => {
    if (gpsStatus === 'active' && suggestions.length === 0 && !fetchingSuggestions) {
      // Use a simple straight-line route as fallback for suggestion matching
      // Real route points would come from the tracking hook if available
      const pts = activeRoutePoints || routePoints || null;
      fetchSuggestions(pts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpsStatus]);

  const handleAcceptSuggestion = async (suggestion) => {
    try {
      await api.post(`/orders/${suggestion._id}/consolidate`, { primaryOrderId: orderId });
      setAcceptedIds(prev => new Set([...prev, suggestion._id]));
    } catch (err) {
      console.error('[Milk Run] Accept failed:', err.message);
      alert('Could not accept order. Please try again.');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 py-6 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100/50"
    >
      {/* ── Top Header ── */}
      <div className="w-full text-center mb-4 shrink-0">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 mb-1.5">
          <span className="material-symbols-outlined text-[20px] font-bold">agriculture</span>
        </div>
        <h1 className="text-[17px] font-black tracking-tight text-slate-800">
          AgriConnect
        </h1>
        <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest leading-none mt-0.5">
          Live Dispatch Console
        </p>
      </div>

      {/* ── Balanced Compact Card ── */}
      <div className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_15px_45px_rgba(16,185,129,0.04)] space-y-4.5">
        
        {/* Section 1: Shipment Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Shipment Details</span>
            {orderId && (
              <span className="font-mono text-[8.5px] font-bold bg-slate-100 border border-slate-200/60 px-1.5 py-0.2 rounded text-slate-505">
                #{orderId.slice(-6).toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-2 bg-emerald-50/15 border border-emerald-100/30 p-3 rounded-2xl">
            <div className="text-center min-w-0">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mx-auto mb-1.5 text-emerald-600 shadow-3xs border border-emerald-50/50">
                <span className="material-symbols-outlined text-[13.5px] font-bold">person</span>
              </div>
              <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider leading-none truncate">Driver</p>
              <p className="text-[12px] font-black text-slate-80 truncate mt-0.5">{driverName}</p>
            </div>
            <div className="text-center border-x border-slate-200/40 min-w-0">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mx-auto mb-1.5 text-emerald-600 shadow-3xs border border-emerald-50/50">
                <span className="material-symbols-outlined text-[13.5px] font-bold">package_2</span>
              </div>
              <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider leading-none truncate">Cargo</p>
              <p className="text-[12px] font-black text-slate-8 truncate mt-0.5">{cropName}</p>
            </div>
            <div className="text-center min-w-0">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mx-auto mb-1.5 text-emerald-600 shadow-3xs border border-emerald-50/50">
                <span className="material-symbols-outlined text-[13.5px] font-bold">storefront</span>
              </div>
              <p className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider leading-none truncate">Deliver To</p>
              <p className="text-[12px] font-black text-slate-8 truncate mt-0.5">{vendorName}</p>
            </div>
          </div>
        </div>

        {/* Section 2: GPS Status & Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tracking Status</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/40">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
              <span className="text-[9.5px] font-bold text-slate-650">{config.label}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <AnimatePresence>
            {gpsStatus === 'active' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="grid grid-cols-3 gap-2.5"
              >
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center shadow-3xs">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600 block">gps_fixed</span>
                  <p className="text-[14px] font-black text-slate-800 leading-none mt-1">{accuracy != null ? `${accuracy}m` : '—'}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Accuracy</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center shadow-3xs">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600 block">speed</span>
                  <p className="text-[14px] font-black text-slate-800 leading-none mt-1">{speed != null ? speed : '0'}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">km/h</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 text-center shadow-3xs">
                  <span className="material-symbols-outlined text-[15px] text-emerald-600 block">upload</span>
                  <p className="text-[14px] font-black text-slate-800 leading-none mt-1">{updateCount}</p>
                  <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Updates</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {gpsStatus === 'error' && (
            <div className="rounded-2xl p-2.5 bg-rose-50 border border-rose-100">
              <p className="text-[10px] font-bold text-rose-600 text-center leading-normal">
                📵 GPS permission blocked. Enable location services in phone/browser settings and refresh.
              </p>
            </div>
          )}

          {/* Main Action Toggle Button */}
          <button
            onClick={handleToggle}
            disabled={!orderId}
            className={`w-full py-3 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border-0 shadow-md cursor-pointer ${
              isTracking
                ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-[0_4px_15px_rgba(244,63,94,0.2)]'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">{isTracking ? 'stop_circle' : 'play_circle'}</span>
            {isTracking ? (gpsStatus === 'requesting' ? 'Finding GPS...' : 'Stop Tracking') : 'Start Tracking 🚚'}
          </button>

          {/* Emergency SOS Trigger */}
          {isTracking && (
            <button
              type="button"
              onClick={() => {
                if (isSos) {
                  triggerSos(false);
                } else {
                  if (window.confirm('Emergency SOS alert trigger karna chahte hain? Sabhi ko notification mil jayega.')) {
                    triggerSos(true);
                  }
                }
              }}
              className={`w-full py-2.5 rounded-2xl font-black text-[11px] flex items-center justify-center gap-1.5 border-0 shadow-xs transition-all duration-300 active:scale-[0.98] cursor-pointer mt-2.5 ${
                isSos
                  ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_12px_rgba(225,29,72,0.4)]'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/40'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {isSos ? '🚨 SOS ACTIVE (Tap to Cancel)' : '⚠️ TRIGGER SOS ALERT'}
            </button>
          )}

          {/* ── Milk Run: Route Suggestions ─────────────────────────── */}
          <AnimatePresence>
            {isTracking && (suggestions.length > 0 || fetchingSuggestions) && (
              <motion.div
                key="milk-run-section"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="border-t border-slate-100 pt-3 mt-1 space-y-2"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-amber-500">route</span>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500">Nearby Orders Along Route</span>
                  {fetchingSuggestions && (
                    <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin ml-auto" />
                  )}
                </div>

                {suggestions
                  .filter(s => !dismissedIds.has(String(s._id)))
                  .map((s) => {
                    const isAccepted = acceptedIds.has(String(s._id));
                    return (
                      <motion.div
                        key={s._id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className={`rounded-2xl border p-3 ${
                          isAccepted
                            ? 'bg-emerald-50 border-emerald-200/60'
                            : 'bg-amber-50/60 border-amber-200/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="material-symbols-outlined text-[11px] text-amber-600">package_2</span>
                              <span className="text-[11px] font-black text-slate-800 truncate">
                                {s.crop?.name || 'Crop'} · {s.requestedQuantity} {s.crop?.unit || 'kg'}
                              </span>
                            </div>
                            <p className="text-[9px] font-semibold text-slate-500 truncate">
                              📍 {s.farmer?.name} → {s.vendor?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[8.5px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                +{s.detourKm} km detour
                              </span>
                              <span className="text-[8.5px] font-bold text-slate-400">
                                Cap left: {s.remainingCapacityAfter} kg
                              </span>
                            </div>
                          </div>

                          {isAccepted ? (
                            <div className="flex flex-col items-center gap-0.5 shrink-0">
                              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                              <span className="text-[8px] font-black text-emerald-700">Added!</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleAcceptSuggestion(s)}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black rounded-xl transition-colors active:scale-95 cursor-pointer"
                              >
                                Accept ✓
                              </button>
                              <button
                                type="button"
                                onClick={() => setDismissedIds(prev => new Set([...prev, String(s._id)]))}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-500 text-[9px] font-bold rounded-xl transition-colors active:scale-95 cursor-pointer"
                              >
                                Skip
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                }
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulation Controls (Inline/Clean Layout) */}
          {isTracking && (
            <div className="flex items-center justify-center gap-2 py-1 border-t border-slate-100 mt-2.5">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">science</span>
                <span>Simulate:</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (orderId) {
                    const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl : dbUrl + '/';
                    fetch(`${cleanDbUrl}locations/${orderId}.json`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        lat: 28.6139,
                        lng: 77.2090,
                        speed: 45,
                        accuracy: 5,
                        timestamp: Date.now(),
                        active: true
                      })
                    }).catch(err => console.error(err));
                  }
                }}
                className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100/50 cursor-pointer transition-colors"
              >
                📍 Delhi
              </button>
              <button
                type="button"
                onClick={() => {
                  if (orderId) {
                    const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl : dbUrl + '/';
                    fetch(`${cleanDbUrl}locations/${orderId}.json`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        lat: 28.5355,
                        lng: 77.3910,
                        speed: 60,
                        accuracy: 4,
                        timestamp: Date.now(),
                        active: true
                      })
                    }).catch(err => console.error(err));
                  }
                }}
                className="py-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100/50 cursor-pointer transition-colors"
              >
                📍 Noida
              </button>
            </div>
          )}

          {!orderId && (
            <p className="text-center text-[9.5px] font-bold text-rose-500">
              ⚠️ Invalid link — Ask the farmer for a new link
            </p>
          )}
        </div>

        {/* Collapsible Info/Instructions */}
        <details className="group bg-slate-50/60 border border-slate-200/50 rounded-2xl p-3 cursor-pointer transition-all hover:bg-slate-50">
          <summary className="list-none flex items-center justify-between text-[10.5px] font-bold text-slate-500 select-none">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-slate-400">info</span>
              Important Instructions
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
          <ul className="mt-2 space-y-1.5 pl-1 border-t border-slate-200/40 pt-2.5">
            {[
              'Keep this page open during delivery',
              'Keep the screen on (disable screen lock)',
              'Keep GPS / Location turned ON',
              'Keep mobile internet active',
            ].map((tip, i) => (
              <li key={i} className="flex items-center gap-2 text-[9.5px] font-semibold text-slate-500">
                <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0 shadow-3xs" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      {/* Footer */}
      <div className="text-center mt-5 shrink-0">
        <p className="text-[9px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[10px] text-emerald-600 font-bold">lock</span>
          Secure Tracking Console
        </p>
      </div>
    </div>
  );
};

export default DriverTrackingPage;
