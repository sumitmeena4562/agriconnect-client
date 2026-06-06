import { useEffect, useRef } from 'react';
import { getToken } from '../utils/auth';

/**
 * Custom hook to establish and manage a real-time Server-Sent Events (SSE) connection.
 * Connects via JWT query param, listens to server broadcasts, and dispatches custom DOM events.
 */
const useSSE = () => {
  const eventSourceRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    // Establish connection to backend SSE stream via Vite proxy
    const streamUrl = `/api/v1/sse/stream?token=${encodeURIComponent(token)}`;
    
    console.log('[SSE] Initializing EventSource connection...');
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    // 1. Connection acknowledgement
    es.addEventListener('CONNECTED', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Connection verified by server:', data.message);
      } catch (e) {
        console.log('[SSE] Connection event received.');
      }
    });

    // 2. Real-time notification received
    es.addEventListener('NOTIFICATION_RECEIVED', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Notification received:', data);
        // Dispatch to layouts to play chime, trigger toast, and update unread count
        window.dispatchEvent(new CustomEvent('agriconnect:notification', { detail: data }));
      } catch (e) {
        console.error('[SSE] Error parsing notification payload:', e);
      }
    });

    // 3. Real-time order status or payment state change
    es.addEventListener('ORDER_UPDATED', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Order update received:', data);
        
        // Dispatch event with specific order payload for instant list injection
        window.dispatchEvent(new CustomEvent('agriconnect:order-updated', { detail: data }));
        
        // Dispatch general refresh-data event as a fallback/trigger
        window.dispatchEvent(new CustomEvent('agriconnect:refresh-data', { detail: data }));
      } catch (e) {
        console.error('[SSE] Error parsing order update payload:', e);
      }
    });

    es.onerror = (err) => {
      console.error('[SSE] Connection error or connection dropped by server. Auto-reconnecting...', err);
    };

    return () => {
      if (eventSourceRef.current) {
        console.log('[SSE] Closing EventSource stream...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);
};

export default useSSE;
