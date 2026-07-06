import { useEffect, useRef, useCallback, useState } from 'react';
import { ref, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * useDriverTracking — Driver ke phone pe GPS coordinates
 * Firebase Realtime DB mein push karta hai.
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
  const locationRef   = orderId ? ref(database, `locations/${orderId}`) : null;

  // ── Screen wake lock — driver ki screen off na ho ────────────────────────
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

  // ── Stop tracking — GPS band karo ────────────────────────────────────────
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    releaseWakeLock();
    setGpsStatus('idle');

    // Firebase mein offline mark karo
    if (locationRef) {
      set(locationRef, {
        active: false,
        stoppedAt: Date.now(),
      });
    }
  }, [locationRef]);

  // ── Main tracking effect ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isActive || !orderId || !locationRef) {
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

    // Firebase mein auto-offline set karo — agar browser band ho jaaye
    onDisconnect(locationRef).set({
      active: false,
      stoppedAt: Date.now(),
    });

    // GPS watch shuru karo
    watchIdRef.current = navigator.geolocation.watchPosition(
      // ── SUCCESS — GPS mila ─────────────────────────────────────────────
      (position) => {
        const { latitude, longitude, accuracy: acc, speed: spd } = position.coords;

        const kmhSpeed = spd != null ? parseFloat((spd * 3.6).toFixed(1)) : null;

        console.log(`[useDriverTracking] GPS coordinate fetched. Lat: ${latitude}, Lng: ${longitude}. Writing to: locations/${orderId}`);

        // Firebase update
        set(locationRef, {
          lat: latitude,
          lng: longitude,
          speed: kmhSpeed,
          accuracy: Math.round(acc),
          timestamp: Date.now(),
          active: true,
        })
        .then(() => {
          console.log(`[useDriverTracking] Successfully wrote coordinates for ${orderId} to Firebase`);
        })
        .catch((err) => {
          console.error(`[useDriverTracking] Firebase write error for ${orderId}:`, err);
        });

        setGpsStatus('active');
        setAccuracy(Math.round(acc));
        setSpeed(kmhSpeed);
        setUpdateCount((c) => c + 1);
      },

      // ── ERROR — GPS nahi mila ───────────────────────────────────────────
      (err) => {
        console.error('[Driver] Geolocation API Error:', err.message);
        setGpsStatus('error');
      },

      // ── Options ────────────────────────────────────────────────────────
      {
        enableHighAccuracy: true,   // Real GPS chip use karo
        timeout: 15000,             // 15 second mein response chahiye
        maximumAge: 5000,           // 5 second purana data accept hai
      }
    );

    return () => stopTracking();
  }, [isActive, orderId]);

  return { stopTracking, gpsStatus, accuracy, updateCount, speed };
};

export default useDriverTracking;
