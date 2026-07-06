import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useDriverTracking from '../hooks/useDriverTracking';

// ── GPS Status config ─────────────────────────────────────────────────────
const STATUS_CONFIG = {
  idle: {
    label: 'Tracking Shuru Nahi Hua',
    dot: 'bg-[var(--color-text-muted)]',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
  },
  requesting: {
    label: 'GPS Permission Maang Raha Hai...',
    dot: 'bg-[var(--color-warning-500)] animate-pulse',
    badge: 'bg-[var(--color-warning-50)] text-[var(--color-warning-700)] border-[var(--color-warning-200)]',
  },
  active: {
    label: 'LIVE Tracking Chal Rahi Hai',
    dot: 'bg-[var(--color-success-500)] animate-ping',
    badge: 'bg-[var(--color-success-50)] text-[var(--color-success-600)] border-[var(--color-success-100)]',
  },
  error: {
    label: 'GPS Nahi Mila — Permission Check Karo',
    dot: 'bg-[var(--color-danger-500)]',
    badge: 'bg-[var(--color-danger-50)] text-[var(--color-danger-600)] border-[var(--color-danger-100)]',
  },
};

const DriverTrackingPage = () => {
  const [searchParams]        = useSearchParams();
  const [isTracking, setIsTracking] = useState(false);

  // URL se order info lo
  const orderId    = searchParams.get('orderId')   || '';
  const driverName = searchParams.get('name')      || 'Driver';
  const cropName   = searchParams.get('crop')      || 'Crop';
  const vendorName = searchParams.get('vendor')    || 'Vendor';

  // GPS hook
  const { gpsStatus, accuracy, updateCount, speed, stopTracking } =
    useDriverTracking(orderId, isTracking);

  const config = STATUS_CONFIG[gpsStatus] || STATUS_CONFIG.idle;

  // Jab tracking active ho — status bar green karo
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

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--color-bg-body)' }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm mb-6 text-center">
        <span className="text-3xl">🌾</span>
        <h1
          className="text-[18px] font-black tracking-tight mt-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          AgriConnect
        </h1>
        <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
          Driver Live Tracking
        </p>
      </div>

      {/* ── Order Info Card ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="global-card w-full max-w-sm mb-4 !p-4"
      >
        <p className="text-caption mb-2">Delivery Details</p>

        <div className="space-y-2">
          {/* Driver */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-primary-600)' }}>person</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Driver</p>
              <p className="text-[13px] font-black" style={{ color: 'var(--color-text-primary)' }}>{driverName}</p>
            </div>
          </div>

          {/* Cargo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-primary-600)' }}>package_2</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Cargo</p>
              <p className="text-[13px] font-black" style={{ color: 'var(--color-text-primary)' }}>{cropName}</p>
            </div>
          </div>

          {/* Deliver To */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--color-primary-600)' }}>storefront</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Deliver To</p>
              <p className="text-[13px] font-black" style={{ color: 'var(--color-text-primary)' }}>{vendorName}</p>
            </div>
          </div>

          {/* Order ID */}
          {orderId && (
            <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--color-text-muted)' }}>tag</span>
              <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--color-text-muted)' }}>
                ORDER #{orderId.slice(-6).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── GPS Status Card ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="global-card w-full max-w-sm mb-4 !p-4"
      >
        {/* Status badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config.dot}`} />
          <span
            className={`badge border text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}
          >
            {config.label}
          </span>
        </div>

        {/* Stats Grid — only show when active */}
        <AnimatePresence>
          {gpsStatus === 'active' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-3 gap-3 mb-4"
            >
              {/* Accuracy */}
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'var(--color-bg-subtle)' }}
              >
                <span className="material-symbols-outlined text-[18px] block mb-1" style={{ color: 'var(--color-primary-600)' }}>
                  gps_fixed
                </span>
                <p className="text-[14px] font-black" style={{ color: 'var(--color-text-primary)' }}>
                  {accuracy != null ? `${accuracy}m` : '—'}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Accuracy
                </p>
              </div>

              {/* Speed */}
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'var(--color-bg-subtle)' }}
              >
                <span className="material-symbols-outlined text-[18px] block mb-1" style={{ color: 'var(--color-primary-600)' }}>
                  speed
                </span>
                <p className="text-[14px] font-black" style={{ color: 'var(--color-text-primary)' }}>
                  {speed != null ? `${speed}` : '0'}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  km/h
                </p>
              </div>

              {/* Updates Sent */}
              <div
                className="rounded-xl p-3 text-center"
                style={{ background: 'var(--color-bg-subtle)' }}
              >
                <span className="material-symbols-outlined text-[18px] block mb-1" style={{ color: 'var(--color-primary-600)' }}>
                  upload
                </span>
                <p className="text-[14px] font-black" style={{ color: 'var(--color-text-primary)' }}>
                  {updateCount}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Updates
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        {gpsStatus === 'error' && (
          <div
            className="rounded-xl p-3 mb-4"
            style={{ background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-100)' }}
          >
            <p className="text-[11.5px] font-semibold" style={{ color: 'var(--color-danger-600)' }}>
              📵 Phone ki Settings mein Location permission allow karo, phir browser refresh karo.
            </p>
          </div>
        )}

        {/* ── Main Toggle Button ──────────────────────────────────────── */}
        <button
          onClick={handleToggle}
          disabled={!orderId}
          className={`w-full py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.97] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
            isTracking
              ? 'bg-[var(--color-danger-500)] hover:bg-[var(--color-danger-600)] text-white shadow-red-500/20'
              : 'bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] text-white shadow-green-600/20'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {isTracking ? 'stop_circle' : 'play_circle'}
          </span>
          {isTracking
            ? (gpsStatus === 'requesting' ? 'GPS Dhoond Raha Hai...' : 'Tracking Band Karo')
            : 'Tracking Shuru Karo 🚚'}
        </button>

        {/* ── 🧪 TEST/DEMO CONTROL PANEL (Only for testing) ────────────────── */}
        {isTracking && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-2">🧪 Test Controls (Bina phone hilaye test karein):</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  // Simulate location 1 (Delhi area)
                  if (orderId) {
                    import('firebase/database').then(({ ref, set }) => {
                      import('../config/firebase').then(({ database }) => {
                        set(ref(database, `locations/${orderId}`), {
                          lat: 28.6139,
                          lng: 77.2090,
                          speed: 45,
                          accuracy: 5,
                          timestamp: Date.now(),
                          active: true
                        });
                      });
                    });
                  }
                }}
                className="py-1.5 px-2 bg-white border border-blue-300 text-blue-700 text-[10.5px] font-bold rounded-lg hover:bg-blue-50"
              >
                📍 Delhi me dikhao
              </button>
              <button
                type="button"
                onClick={() => {
                  // Simulate location 2 (Noida area)
                  if (orderId) {
                    import('firebase/database').then(({ ref, set }) => {
                      import('../config/firebase').then(({ database }) => {
                        set(ref(database, `locations/${orderId}`), {
                          lat: 28.5355,
                          lng: 77.3910,
                          speed: 60,
                          accuracy: 4,
                          timestamp: Date.now(),
                          active: true
                        });
                      });
                    });
                  }
                }}
                className="py-1.5 px-2 bg-white border border-blue-300 text-blue-700 text-[10.5px] font-bold rounded-lg hover:bg-blue-50"
              >
                📍 Noida me dikhao
              </button>
            </div>
            <p className="text-[9px] text-blue-600 mt-2 text-center font-medium">In buttons ko click karke doosre tab me Map par location badalte hue dekhein!</p>
          </div>
        )}

        {!orderId && (
          <p className="text-center text-[10px] mt-2 font-medium" style={{ color: 'var(--color-danger-500)' }}>
            ⚠️ Invalid link — Farmer se dobara link maango
          </p>
        )}
      </motion.div>

      {/* ── Tips Card ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm global-card !p-3.5"
      >
        <p className="text-caption mb-2">📌 Zaruri Baatein</p>
        <ul className="space-y-1.5">
          {[
            'Ye page khula rakho — band mat karo delivery tak',
            'Phone ki screen off mat karo (auto lock band rakho)',
            'GPS / Location ON rakho phone settings mein',
            'Internet (4G/WiFi) connected rakho',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span
                className="material-symbols-outlined text-[12px] mt-0.5 shrink-0"
                style={{ color: 'var(--color-primary-500)' }}
              >
                check_circle
              </span>
              <span className="text-[10.5px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Footer */}
      <p className="text-[10px] mt-6 font-medium" style={{ color: 'var(--color-text-muted)' }}>
        🌾 AgriConnect Driver Tracking
      </p>
    </div>
  );
};

export default DriverTrackingPage;
