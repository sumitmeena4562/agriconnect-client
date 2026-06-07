import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const LiveTrackingMap = ({ orderId, onClose }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const mapRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const intervalRef = useRef(null);

  // 1. Dynamic Leaflet CDN Loader
  useEffect(() => {
    // Check if script is already present
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Clean up link/script if necessary, or let them remain cache-primed
    };
  }, []);

  // 2. Fetch live tracking info (loops every 3 seconds)
  const fetchTracking = async () => {
    try {
      const res = await api.get(`/orders/${orderId}/tracking`);
      if (res.data.success) {
        setTrackingData(res.data);
      }
    } catch (e) {
      console.error('Error fetching live tracking coords:', e);
    }
  };

  useEffect(() => {
    fetchTracking(); // initial fetch
    
    intervalRef.current = setInterval(() => {
      fetchTracking();
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  // 3. Initialize Map & Markers
  useEffect(() => {
    if (!mapLoaded || !trackingData || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;
    
    // Create map instance
    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true
    }).setView(trackingData.currentCoords, 11);

    mapInstanceRef.current = map;

    // Load OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // Dynamic Leaflet icons using custom colored HTML markers to fit HSL theme
    const createHtmlIcon = (iconText, colorClass, textLabel) => {
      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center shadow-lg border-2 border-white scale-100 hover:scale-105 transition-all">
              <span class="material-symbols-outlined text-[18px]!">${iconText}</span>
            </div>
            <span class="bg-slate-800/90 text-white font-bold text-[8.5px] px-1 py-0.2 rounded mt-0.5 whitespace-nowrap shadow border border-slate-700/50">${textLabel}</span>
          </div>
        `,
        iconSize: [32, 45],
        iconAnchor: [16, 40]
      });
    };

    // Farmer Warehouse Icon
    const farmerIcon = createHtmlIcon('agriculture', 'bg-emerald-600', 'Farmer');
    L.marker(trackingData.startCoords, { icon: farmerIcon }).addTo(map)
      .bindPopup("<b>Farmer Warehouse</b><br/>Crops Dispatch Point");

    // Vendor Destination Icon
    const vendorIcon = createHtmlIcon('storefront', 'bg-blue-600', 'My Shop');
    L.marker(trackingData.endCoords, { icon: vendorIcon }).addTo(map)
      .bindPopup("<b>My Shop (Vendor)</b><br/>Delivery Destination");

    // Draw route path line
    L.polyline(trackingData.route, {
      color: '#6366f1',
      weight: 4,
      opacity: 0.8,
      dashArray: '5, 8'
    }).addTo(map);

    // Active Driver Marker
    const vehicleIcon = trackingData.driver?.vehicleType === 'Bike' ? 'two_wheeler' : 'local_shipping';
    const driverIcon = createHtmlIcon(vehicleIcon, 'bg-amber-500 animate-pulse', trackingData.driver?.name || 'Driver');
    
    const driverMarker = L.marker(trackingData.currentCoords, { icon: driverIcon }).addTo(map);
    driverMarkerRef.current = driverMarker;

    // Fit map to show all points
    const bounds = L.latLngBounds([trackingData.startCoords, trackingData.endCoords]);
    map.fitBounds(bounds, { padding: [40, 40] });

  }, [mapLoaded, trackingData]);

  // 4. Update driver marker position dynamically when coordinates update
  useEffect(() => {
    if (mapInstanceRef.current && driverMarkerRef.current && trackingData) {
      const newPos = trackingData.currentCoords;
      driverMarkerRef.current.setLatLng(newPos);
      
      // Keep truck in view (slight pan)
      if (trackingData.deliveryStatus === 'In Transit') {
        mapInstanceRef.current.panTo(newPos);
      }
    }
  }, [trackingData]);

  const formatEta = (seconds) => {
    if (!seconds) return 'Arrived';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Container */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-[13.5px] font-black text-slate-800 flex items-center gap-1.5 leading-none">
              <span className="material-symbols-outlined text-[18px] text-primary-600">navigation</span>
              Live Delivery Tracking
            </h2>
            <p className="text-[9.5px] text-slate-400 font-bold mt-0.5">Order Delivery Status Statement</p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-450 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Map Box */}
        <div className="flex-1 bg-slate-100 min-h-[250px] relative">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-bold text-slate-500">Loading Map components...</span>
            </div>
          )}
          <div ref={mapRef} className="w-full h-full min-h-[280px] z-0" id="map-container" />
        </div>

        {/* Driver Details Footer */}
        {trackingData && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 space-y-3">
            {/* Status & ETA */}
            <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-inner">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Status</p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                  trackingData.deliveryStatus === 'Arrived' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-primary-50 text-primary-700 border border-primary-100 animate-pulse'
                }`}>
                  {trackingData.deliveryStatus === 'In Transit' ? '🚚 In Transit' : '🏁 Arrived'}
                </span>
              </div>

              <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Estimated Arrival</p>
                <p className="text-[14px] font-black text-slate-800">{formatEta(trackingData.etaSeconds)}</p>
              </div>
            </div>

            {/* Driver Profile */}
            {trackingData.driver ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-extrabold text-slate-800">{trackingData.driver.name}</p>
                    <p className="text-[9.5px] font-semibold text-slate-400 uppercase font-mono">{trackingData.driver.vehicleNumber} ({trackingData.driver.vehicleType})</p>
                  </div>
                </div>

                <a 
                  href={`tel:${trackingData.driver.phone}`}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer"
                  title="Call Driver"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                </a>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic text-center">Logistics dispatcher info not available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTrackingMap;
