import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

/**
 * useDriverTracking — Driver ke phone pe GPS coordinates
 * REST API se Firebase Realtime DB mein push karta hai.
 * Bypasses SDK API Key mismatch errors.
 *
 * @param {string} orderId  - Order ka MongoDB _id
 * @param {boolean} isActive - Tracking on/off switch
 * @returns {{ stopTracking, gpsStatus, accuracy, updateCount, speed }}
 */
const useDriverTracking = (orderId, isActive) => {
  const [gpsStatus, setGpsStatus]       = useState('idle');   // idle | requesting | active | error
  const [accuracy, setAccuracy]         = useState(null);     // meters
  const [updateCount, setUpdateCount]   = useState(0);
  const [speed, setSpeed]               = useState(null);     // km/h

  const watchIdRef    = useRef(null);
  const wakeLockRef   = useRef(null);

  const dbUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL || '';
  const cleanDbUrl = dbUrl.endsWith('/') ? dbUrl : dbUrl + '/';
  const fetchUrls = useMemo(() => {
    const ids = Array.isArray(orderId) ? orderId : (orderId ? [orderId] : []);
    return ids.map(id => `${cleanDbUrl}locations/${id}.json`);
  }, [orderId, cleanDbUrl]);

  // Screen wake lock — driver ki screen off na ho
  const acquireWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('[Driver] Wake lock acquired — screen will stay on');
      }
    } catch (err) {
      console.warn('[Driver] Wake lock not available:', err.message);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // Helper: Write active: false to DB
  const markOffline = useCallback(async () => {
    if (fetchUrls.length === 0) return;
    try {
      await Promise.all(fetchUrls.map(url =>
        fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            active: false,
            sos: false, // auto-clear SOS alert when tracking stops
            stoppedAt: Date.now()
          })
        })
      ));
      console.log('[Driver] Marked offline in database');
    } catch (err) {
      console.warn('[Driver] Failed to mark offline:', err.message);
    }
  }, [fetchUrls]);

  // Stop tracking — GPS band karo
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    releaseWakeLock();
    setGpsStatus('idle');
    markOffline();
  }, [markOffline]);

  // Main tracking effect
  useEffect(() => {
    if (!isActive || fetchUrls.length === 0) {
      if (!isActive && watchIdRef.current !== null) stopTracking();
      return;
    }

    if (!navigator.geolocation) {
      setGpsStatus('error');
      console.error('[Driver] GPS not supported on this device/browser');
      return;
    }

    setGpsStatus('requesting');
    acquireWakeLock();

    // Browser close par auto-offline mark karne ke liye keepalive beacon setup karein
    const handleUnload = () => {
      fetchUrls.forEach(url => {
        fetch(url, {
          method: 'PATCH',
          keepalive: true, // Crucial for unload handlers
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            active: false,
            sos: false, // clear SOS
            stoppedAt: Date.now()
          })
        });
      });
    };
    window.addEventListener('beforeunload', handleUnload);

    // GPS watch shuru karo
    watchIdRef.current = navigator.geolocation.watchPosition(
      // SUCCESS — GPS mila
      async (position) => {
        const { latitude, longitude, accuracy: acc, speed: spd } = position.coords;
        const kmhSpeed = spd != null ? parseFloat((spd * 3.6).toFixed(1)) : null;

        console.log(`[useDriverTracking] GPS fetched. Lat: ${latitude}, Lng: ${longitude}`);

        try {
          await Promise.all(fetchUrls.map(url =>
            fetch(url, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lat: latitude,
                lng: longitude,
                speed: kmhSpeed,
                accuracy: Math.round(acc),
                timestamp: Date.now(),
                active: true,
              })
            })
          ));
          console.log(`[useDriverTracking] Successfully wrote coordinates via REST`);
        } catch (err) {
          console.error(`[useDriverTracking] REST write error:`, err.message);
        }

        setGpsStatus('active');
        setAccuracy(Math.round(acc));
        setSpeed(kmhSpeed);
        setUpdateCount((c) => c + 1);
      },

      // ERROR — GPS nahi mila
      (err) => {
        console.error('[Driver] Geolocation API Error:', err.message);
        setGpsStatus('error');
      },

      // Options
      {
        enableHighAccuracy: true,   // Real GPS chip use karo
        timeout: 15000,             // 15 second mein response chahiye
        maximumAge: 5000,           // 5 second purana data accept hai
      }
    );

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      stopTracking();
    };
  }, [isActive, orderId, fetchUrls, stopTracking]);

  return { stopTracking, gpsStatus, accuracy, updateCount, speed };
};

export default useDriverTracking;
