import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useDriverTracking from '../hooks/useDriverTracking';

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
    badge: 'bg-amber-50 text-amber-700 border-amber-200/50',
    themeColor: '#d97706'
  },
  active: {
    label: 'Live Tracking Active',
    dot: 'bg-emerald-500 animate-ping shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-250',
    themeColor: '#059669'
  },
  error: {
    label: 'GPS Error',
    dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    badge: 'bg-rose-50 text-rose-700 border-rose-200/50',
    themeColor: '#e11d48'
  },
};

const DriverTrackingPage = () => {
  const [searchParams]        = useSearchParams();
  const [isTracking, setIsTracking] = useState(false);

  // URL parameters
  const orderId    = searchParams.get('orderId')   || '';
  const driverName = searchParams.get('name')      || 'Driver';
  const cropName   = searchParams.get('crop')      || 'Crop';
  const vendorName = searchParams.get('vendor')    || 'Vendor';

  // GPS hook
  const { gpsStatus, accuracy, updateCount, speed, stopTracking } =
    useDriverTracking(orderId, isTracking);

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

  const handleToggle = () => {
    if (isTracking) {
      stopTracking();
      setIsTracking(false);
    } else {
      setIsTracking(true);
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col items-center justify-between p-3 overflow-hidden bg-gradient-to-br from-emerald-50/60 via-teal-50/10 to-emerald-100/30"
    >
      {/* ── Top Header ── */}
      <div className="w-full text-center py-1 shrink-0">
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/10 mb-0.5">
          <span className="material-symbols-outlined text-[18px] font-bold">agriculture</span>
        </div>
        <h1 className="text-[14.5px] font-black tracking-tight text-slate-800">
          AgriConnect
        </h1>
        <p className="text-[8.5px] font-bold text-emerald-700/80 uppercase tracking-widest leading-none mt-0.5">
          Live Driver Console
        </p>
      </div>

      {/* ── Main Premium Card (Scrollbar Hidden & Ultra Compact Spacing) ── */}
      <div className="flex-1 w-full max-w-sm bg-white/95 backdrop-blur-md border border-white/80 rounded-3xl p-3.5 shadow-[0_15px_40px_rgba(16,185,129,0.05)] flex flex-col justify-between overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-0 space-y-3">
        
        {/* Section 1: Shipment details */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider">Shipment Details</span>
            {orderId && (
              <span className="font-mono text-[8.5px] font-bold bg-slate-100 border border-slate-200/50 px-1.5 py-0.2 rounded text-slate-500">
                #{orderId.slice(-6).toUpperCase()}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-1.5 bg-emerald-50/20 border border-emerald-100/40 p-2 rounded-xl">
            <div className="text-center min-w-0">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mx-auto mb-0.5 text-emerald-600 shadow-3xs border border-emerald-50/50">
                <span className="material-symbols-outlined text-[11px] font-bold">person</span>
              </div>
              <p className="text-[7px] font-bold text-slate-400 uppercase leading-none truncate">Driver</p>
              <p className="text-[11px] font-extrabold text-slate-800 truncate mt-0.5 leading-none">{driverName}</p>
            </div>
            <div className="text-center border-x border-slate-200/40 min-w-0">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mx-auto mb-0.5 text-emerald-600 shadow-3xs border border-emerald-50/50">
                <span className="material-symbols-outlined text-[11px] font-bold">package_2</span>
              </div>
              <p className="text-[7px] font-bold text-slate-400 uppercase leading-none truncate">Cargo</p>
              <p className="text-[11px] font-extrabold text-slate-800 truncate mt-0.5 leading-none">{cropName}</p>
            </div>
            <div className="text-center min-w-0">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mx-auto mb-0.5 text-emerald-600 shadow-3xs border border-emerald-50/50">
                <span className="material-symbols-outlined text-[11px] font-bold">storefront</span>
              </div>
              <p className="text-[7px] font-bold text-slate-400 uppercase leading-none truncate">Deliver To</p>
              <p className="text-[11px] font-extrabold text-slate-800 truncate mt-0.5 leading-none">{vendorName}</p>
            </div>
          </div>
        </div>

        {/* Section 2: GPS control status */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider">Tracking Status</span>
            <div className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-slate-50 border border-slate-250/30">
              <span className={`w-1 h-1 rounded-full shrink-0 ${config.dot}`} />
              <span className="text-[9px] font-bold text-slate-650">{config.label}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <AnimatePresence>
            {gpsStatus === 'active' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-3 gap-2"
              >
                <div className="bg-slate-50/60 border border-slate-100/60 rounded-xl p-1.5 text-center shadow-3xs">
                  <span className="material-symbols-outlined text-[12px] text-emerald-650 block">gps_fixed</span>
                  <p className="text-[12px] font-black text-slate-800 leading-none mt-0.5">{accuracy != null ? `${accuracy}m` : '—'}</p>
                  <p className="text-[7px] font-bold uppercase tracking-wider text-slate-450 mt-0.5">Accuracy</p>
                </div>
                <div className="bg-slate-50/60 border border-slate-100/60 rounded-xl p-1.5 text-center shadow-3xs">
                  <span className="material-symbols-outlined text-[12px] text-emerald-650 block">speed</span>
                  <p className="text-[12px] font-black text-slate-800 leading-none mt-0.5">{speed != null ? speed : '0'}</p>
                  <p className="text-[7px] font-bold uppercase tracking-wider text-slate-450 mt-0.5">km/h</p>
                </div>
                <div className="bg-slate-50/60 border border-slate-100/60 rounded-xl p-1.5 text-center shadow-3xs">
                  <span className="material-symbols-outlined text-[12px] text-emerald-650 block">upload</span>
                  <p className="text-[12px] font-black text-slate-800 leading-none mt-0.5">{updateCount}</p>
                  <p className="text-[7px] font-bold uppercase tracking-wider text-slate-450 mt-0.5">Updates</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {gpsStatus === 'error' && (
            <div className="rounded-xl p-2 bg-rose-50 border border-rose-100">
              <p className="text-[9.5px] font-bold text-rose-600 text-center leading-tight">
                📵 Location blocked. Enable GPS inside browser settings and reload.
              </p>
            </div>
          )}

          {/* Main Action Toggle Button */}
          <button
            onClick={handleToggle}
            disabled={!orderId}
            className={`w-full py-2.5 rounded-2xl font-black text-[12.5px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border-0 shadow-xs cursor-pointer ${
              isTracking
                ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{isTracking ? 'stop_circle' : 'play_circle'}</span>
            {isTracking ? (gpsStatus === 'requesting' ? 'Finding GPS...' : 'Stop Tracking') : 'Start Tracking 🚚'}
          </button>

          {/* Simulation Controls */}
          {isTracking && (
            <div className="p-2 bg-blue-50/30 border border-blue-150/40 rounded-2xl space-y-1.5">
              <div className="text-[8px] font-extrabold text-blue-700/80 uppercase tracking-widest text-center flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[9px]">science</span>
                <span>Simulation Controls</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (orderId) {
                      const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl : dbUrl + '/';
                      fetch(`${cleanDbUrl}locations/${orderId}.json`, {
                        method: 'PUT',
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
                  className="py-1 px-1.5 bg-white border border-blue-200/50 text-blue-700 text-[9px] font-extrabold rounded-lg hover:bg-blue-50 transition-colors shadow-3xs cursor-pointer"
                >
                  📍 Delhi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (orderId) {
                      const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl : dbUrl + '/';
                      fetch(`${cleanDbUrl}locations/${orderId}.json`, {
                        method: 'PUT',
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
                  className="py-1 px-1.5 bg-white border border-blue-200/50 text-blue-700 text-[9px] font-extrabold rounded-lg hover:bg-blue-50 transition-colors shadow-3xs cursor-pointer"
                >
                  📍 Noida
                </button>
              </div>
            </div>
          )}

          {!orderId && (
            <p className="text-center text-[9px] font-bold text-rose-500">
              ⚠️ Invalid link — Ask the farmer for a new link
            </p>
          )}
        </div>

        {/* Collapsible Info/Instructions */}
        <details className="group bg-slate-50/50 border border-slate-200/40 rounded-2xl p-2 cursor-pointer transition-all hover:bg-slate-50">
          <summary className="list-none flex items-center justify-between text-[9px] font-bold text-slate-500 select-none">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[12px] text-slate-400">info</span>
              Important Instructions
            </span>
            <span className="material-symbols-outlined text-[12px] text-slate-400 group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
          <ul className="mt-1.5 space-y-1 pl-1 border-t border-slate-200/40 pt-1.5">
            {[
              'Keep this page open during delivery',
              'Keep the screen on (disable screen lock)',
              'Keep GPS / Location turned ON',
              'Keep mobile internet active',
            ].map((tip, i) => (
              <li key={i} className="flex items-center gap-2 text-[8px] font-semibold text-slate-500">
                <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0 shadow-3xs" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      {/* Footer */}
      <div className="text-center py-1.5 shrink-0">
        <p className="text-[8px] font-bold text-slate-400 flex items-center justify-center gap-1">
          <span className="material-symbols-outlined text-[9px] text-emerald-600 font-bold">lock</span>
          Secure Tracking Console
        </p>
      </div>
    </div>
  );
};

export default DriverTrackingPage;
