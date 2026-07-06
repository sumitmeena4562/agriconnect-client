import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../config/firebase';

/**
 * useLiveTracking — Farmer / Vendor ke dashboard pe
 * Firebase se real-time driver location sunata hai.
 *
 * @param {string} orderId - Order ka MongoDB _id
 * @returns {{ location, isDriverOnline, isStale }}
 *
 * location = { lat, lng, speed, accuracy, timestamp, active }
 * isDriverOnline = true agar last update 30 sec se zyada purana nahi
 * isStale = true agar 30 sec+ koi update nahi aaya (weak signal etc.)
 */
const STALE_THRESHOLD_MS = 30_000; // 30 seconds

const useLiveTracking = (orderId) => {
  const [location, setLocation]           = useState(null);
  const [isDriverOnline, setIsDriverOnline] = useState(false);
  const [isStale, setIsStale]             = useState(false);

  useEffect(() => {
    if (!orderId) {
      console.log('[useLiveTracking] No orderId provided, skipping subscription');
      return;
    }

    const locationRef = ref(database, `locations/${orderId}`);
    console.log(`[useLiveTracking] Subscribing to path: locations/${orderId}`);

    // Firebase onValue — real-time listener (no polling)
    const unsubscribe = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      console.log(`[useLiveTracking] Data received for ${orderId}:`, data);

      if (!data || !data.active || !data.lat || !data.lng) {
        console.log('[useLiveTracking] Driver offline or invalid coordinates received');
        setIsDriverOnline(false);
        setLocation(data?.lat ? data : null); // Last known location rakhte hain
        return;
      }

      const ageMs = Date.now() - (data.timestamp || 0);
      const stale = ageMs > STALE_THRESHOLD_MS;

      setLocation(data);
      setIsDriverOnline(true);
      setIsStale(stale);
    }, (error) => {
      console.error(`[useLiveTracking] Firebase read error for ${orderId}:`, error);
    });

    // Cleanup — component unmount pe listener band karo
    return () => {
      console.log(`[useLiveTracking] Unsubscribing from: locations/${orderId}`);
      off(locationRef, 'value', unsubscribe);
    };
  }, [orderId]);

  return { location, isDriverOnline, isStale };
};

export default useLiveTracking;
