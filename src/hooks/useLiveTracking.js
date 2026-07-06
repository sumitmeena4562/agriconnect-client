import { useEffect, useState } from 'react';

/**
 * useLiveTracking — Farmer / Vendor ke dashboard pe
 * REST API se real-time driver location fetch karta hai.
 * Bypasses SDK API Key mismatch errors.
 */
const STALE_THRESHOLD_MS = 30_000; // 30 seconds
const POLL_INTERVAL_MS = 4_000;    // Poll every 4 seconds

const useLiveTracking = (orderId) => {
  const [location, setLocation]           = useState(null);
  const [isDriverOnline, setIsDriverOnline] = useState(false);
  const [isStale, setIsStale]             = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
    if (!dbUrl) {
      console.error('[useLiveTracking] VITE_FIREBASE_DATABASE_URL is missing in environment!');
      return;
    }

    const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl : dbUrl + '/';
    const fetchUrl = `${cleanDbUrl}locations/${orderId}.json`;

    const fetchLocation = async () => {
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data || !data.active || !data.lat || !data.lng) {
          setIsDriverOnline(false);
          setLocation(data?.lat ? data : null);
          return;
        }

        const ageMs = Date.now() - (data.timestamp || 0);
        const stale = ageMs > STALE_THRESHOLD_MS;

        setLocation(data);
        setIsDriverOnline(true);
        setIsStale(stale);
      } catch (err) {
        console.error('[useLiveTracking] REST fetch error:', err.message);
      }
    };

    // Initial fetch
    fetchLocation();

    // Set polling interval
    const interval = setInterval(fetchLocation, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [orderId]);

  return { location, isDriverOnline, isStale };
};

export default useLiveTracking;
