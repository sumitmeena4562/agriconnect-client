import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useLiveTracking from '../../hooks/useLiveTracking';

const FreightTracking = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');

  // Firebase real-time GPS — sirf selected order ke liye
  const { location: driverLocation, isDriverOnline, isStale } =
    useLiveTracking(selectedOrder?._id);

  const mapRef           = useRef(null);
  const mapInstanceRef   = useRef(null);
  const tileLayerRef     = useRef(null);
  const overlayLayerRef  = useRef(null);
  const currentStyleRef  = useRef(null);
  const driverMarkerRef  = useRef(null);
  const startMarkerRef   = useRef(null);
  const endMarkerRef     = useRef(null);
  const polylineRef      = useRef(null);
  const boundsSetRef     = useRef(false); // ✅ fitBounds bug fix

  // ── 1. Fetch Orders ───────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders');
      const data = res.data.data;
      setOrders(data);

      const activeTransit = data.filter(
        (o) =>
          o.status === 'Accepted' &&
          (o.deliveryStatus === 'In Transit' || o.deliveryStatus === 'Arrived')
      );

      const orderIdParam  = searchParams.get('orderId');
      const driverIdParam = searchParams.get('driverId');

      if (orderIdParam) {
        const match = activeTransit.find((o) => o._id === orderIdParam);
        if (match) { setSelectedOrder(match); return; }
      }
      if (driverIdParam) {
        const match = activeTransit.find((o) => o.driver?._id === driverIdParam);
        if (match) { setSelectedOrder(match); return; }
      }
      if (activeTransit.length > 0) setSelectedOrder(activeTransit[0]);
    } catch {
      toast.error('Failed to load active shipments');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── 2. Load Leaflet CDN dynamically ──────────────────────────────────────
  useEffect(() => {
    if (window.L) { setMapLoaded(true); return; }

    const cssLink = document.createElement('link');
    cssLink.rel  = 'stylesheet';
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLink);

    const script    = document.createElement('script');
    script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async    = true;
    script.onload   = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  // ── 3. Reset markers + bounds flag when order changes ────────────────────
  useEffect(() => {
    boundsSetRef.current = false;
    if (mapInstanceRef.current) {
      [startMarkerRef, endMarkerRef, driverMarkerRef, polylineRef].forEach((r) => {
        if (r.current) { mapInstanceRef.current.removeLayer(r.current); r.current = null; }
      });
    }
  }, [selectedOrder]);

  // ── 4. OSRM route fetch (one-time per order) ─────────────────────────────
  const routeCacheRef = useRef({});
  const fetchRoute = useCallback(async (startLat, startLng, endLat, endLng, key) => {
    if (routeCacheRef.current[key]) return routeCacheRef.current[key];
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OSRM error');
      const data = await res.json();
      if (data.code === 'Ok' && data.routes?.length) {
        const pts = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        routeCacheRef.current[key] = pts;
        return pts;
      }
    } catch { /* fallback below */ }
    // Sine-wave fallback
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      pts.push([
        startLat + (endLat - startLat) * t + 0.02 * Math.sin(t * Math.PI),
        startLng + (endLng - startLng) * t,
      ]);
    }
    routeCacheRef.current[key] = pts;
    return pts;
  }, []);

  // ── 5. Draw / Update Map ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !selectedOrder) return;

    const L = window.L;

    // Init map once
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([28.6, 77.2], 10);
    }
    const map = mapInstanceRef.current;

    // Tile layer (satellite / streets)
    if (!tileLayerRef.current || currentStyleRef.current !== mapStyle) {
      if (tileLayerRef.current)   { map.removeLayer(tileLayerRef.current);   tileLayerRef.current  = null; }
      if (overlayLayerRef.current){ map.removeLayer(overlayLayerRef.current); overlayLayerRef.current = null; }

      if (mapStyle === 'satellite') {
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, attribution: 'Tiles © Esri' }
        ).addTo(map);
        overlayLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
          { maxZoom: 19, opacity: 0.85 }
        ).addTo(map);
      } else {
        tileLayerRef.current = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 19, attribution: '© OpenStreetMap contributors' }
        ).addTo(map);
      }
      currentStyleRef.current = mapStyle;
    }

    // Helper: custom HTML marker
    const mkIcon = (icon, colorVar, label) =>
      L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="display:flex;flex-direction:column;align-items:center">
          <div style="width:32px;height:32px;border-radius:50%;background:${colorVar};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid #fff">
            <span class="material-symbols-outlined" style="font-size:17px">${icon}</span>
          </div>
          <span style="background:rgba(15,23,42,.85);color:#fff;font-size:8.5px;font-weight:700;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap">${label}</span>
        </div>`,
        iconSize: [32, 48],
        iconAnchor: [16, 44],
      });

    const id     = selectedOrder._id;
    const seed1  = id.charCodeAt(id.length - 1) || 0;
    const seed2  = id.charCodeAt(id.length - 2) || 0;
    const seed3  = id.charCodeAt(id.length - 3) || 0;
    const seed4  = id.charCodeAt(id.length - 4) || 0;

    // Use real coordinates if available, otherwise fallback to seed-based ones
    const sLat   = selectedOrder.farmerCoordinates?.lat || (28.42 + (seed1 % 10) / 100);
    const sLng   = selectedOrder.farmerCoordinates?.lng || (77.01 + (seed2 % 10) / 100);
    const eLat   = selectedOrder.vendorCoordinates?.lat || (28.61 + (seed3 % 10) / 100);
    const eLng   = selectedOrder.vendorCoordinates?.lng || (77.20 + (seed4 % 10) / 100);

    fetchRoute(sLat, sLng, eLat, eLng, id).then((route) => {
      if (!route || !mapInstanceRef.current) return;

      // Start marker
      if (!startMarkerRef.current)
        startMarkerRef.current = L.marker([sLat, sLng], { icon: mkIcon('agriculture', '#16a34a', 'My Farm') })
          .addTo(map).bindPopup('Dispatch Origin');

      // End marker
      if (!endMarkerRef.current)
        endMarkerRef.current = L.marker([eLat, eLng], { icon: mkIcon('storefront', '#2563eb', selectedOrder.vendor?.name || 'Vendor') })
          .addTo(map).bindPopup('Delivery Destination');

      // Route polyline
      if (polylineRef.current)
        polylineRef.current.setLatLngs(route);
      else
        polylineRef.current = L.polyline(route, {
          color: 'var(--color-primary-500, #22c55e)',
          weight: 4, opacity: 0.75, dashArray: '5, 8',
        }).addTo(map);

      // Draw or Update Driver Marker on top of route if active GPS is available
      if (driverLocation?.lat && driverLocation?.lng) {
        const dPos = [driverLocation.lat, driverLocation.lng];

        if (driverMarkerRef.current) {
          driverMarkerRef.current.setLatLng(dPos);
          const vehicleIcon =
            selectedOrder.driver?.vehicleType === 'Bike'    ? 'two_wheeler'    :
            selectedOrder.driver?.vehicleType === 'Tractor' ? 'agriculture'    : 'local_shipping';
          const color = isDriverOnline ? '#22c55e' : '#94a3b8';
          driverMarkerRef.current.setIcon(mkIcon(vehicleIcon, color, selectedOrder.driver?.name || 'Driver'));
          if (isDriverOnline) map.panTo(dPos, { animate: true });
        } else {
          const vehicleIcon =
            selectedOrder.driver?.vehicleType === 'Bike'    ? 'two_wheeler'    :
            selectedOrder.driver?.vehicleType === 'Tractor' ? 'agriculture'    : 'local_shipping';
          const color = isDriverOnline ? '#22c55e' : '#94a3b8';
          driverMarkerRef.current = L.marker(dPos, { icon: mkIcon(vehicleIcon, color, selectedOrder.driver?.name || 'Driver') })
            .addTo(map)
            .bindPopup('Live GPS Location');
        }
      } else {
        if (driverMarkerRef.current) {
          map.removeLayer(driverMarkerRef.current);
          driverMarkerRef.current = null;
        }
      }

      // ✅ fitBounds SIRF PEHLI BAAR - covers all 3 points
      if (!boundsSetRef.current) {
        const boundsList = [[sLat, sLng], [eLat, eLng]];
        if (driverLocation?.lat && driverLocation?.lng) {
          boundsList.push([driverLocation.lat, driverLocation.lng]);
        }
        map.fitBounds(L.latLngBounds(boundsList), { padding: [40, 40] });
        boundsSetRef.current = true;
      }
    });
  }, [mapLoaded, selectedOrder, driverLocation, mapStyle, isDriverOnline]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const activeTransitOrders = orders.filter(
    (o) => o.status === 'Accepted' &&
      (o.deliveryStatus === 'In Transit' || o.deliveryStatus === 'Arrived')
  );

  const getTrackingStatusLabel = () => {
    if (!selectedOrder) return null;
    if (isDriverOnline) return { label: 'GPS Live', color: 'text-[var(--color-success-600)]', dot: 'bg-[var(--color-success-500)] animate-ping' };
    if (isStale)        return { label: 'Weak Signal', color: 'text-[var(--color-warning-600)]', dot: 'bg-[var(--color-warning-500)] animate-pulse' };
    return               { label: 'Waiting for GPS...', color: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' };
  };

  const statusInfo = getTrackingStatusLabel();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 lg:h-[calc(100vh-100px)] lg:flex lg:flex-col lg:overflow-hidden pb-1">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-1 flex items-center gap-2">
          <span>🚚</span> Live Fleet Tracking
        </h1>
        <p className="text-[11.5px] text-[var(--color-text-secondary)] font-medium">
          Monitor dispatched shipments and driver locations in real time.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-[var(--color-primary-100)] border-t-[var(--color-primary-600)] animate-spin" />
        </div>
      ) : activeTransitOrders.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--card-border-radius)] shadow-[var(--shadow-card)] text-center py-16 px-6">
          <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]/50">
            <span className="material-symbols-outlined text-[28px] text-[var(--color-text-secondary)]">navigation</span>
          </div>
          <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">No Active Shipments</h3>
          <p className="text-[11.5px] text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
            Koi order abhi "In Transit" ya "Arrived" nahi hai. Orders page se driver assign karke dispatch karo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:flex-1 lg:min-h-0 lg:overflow-hidden">

          {/* ── Left Panel: Active Shipments List ── */}
          <div className="lg:col-span-3 space-y-3 flex flex-col lg:h-full lg:overflow-hidden">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider">
                Active ({activeTransitOrders.length})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-[9px] font-bold animate-pulse">
                LIVE
              </span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {activeTransitOrders.map((order) => {
                const isSel = selectedOrder?._id === order._id;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer shadow-sm flex flex-col justify-between ${
                      isSel
                        ? 'border-primary-500 bg-primary-50/10 ring-1 ring-primary-500/10'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <h4 className="text-[13px] font-bold text-[var(--color-text-primary)] mt-1.5 leading-none">
                          {order.crop?.name || 'Deleted Crop'}
                        </h4>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${
                        order.deliveryStatus === 'Arrived'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-primary-50 text-primary-700 border border-primary-100'
                      }`}>
                        {order.deliveryStatus || 'In Transit'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">local_shipping</span>
                        <span className="truncate font-semibold">{order.driver ? order.driver.name : 'Self-Delivery'}</span>
                      </div>
                      <span className="text-[9.5px] font-bold text-[var(--color-text-primary)]">
                        {order.requestedQuantity} {order.crop?.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right Panel: Map & Details ── */}
          <div className="lg:col-span-9 space-y-3 flex flex-col lg:h-full lg:overflow-hidden">
            {selectedOrder && (
              <>
                {/* Cargo Header */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] py-3 px-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">package_2</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[14px] font-black text-[var(--color-text-primary)] capitalize leading-none">
                          {selectedOrder.crop?.name || 'Deleted Crop'}
                        </h3>
                        <span className="text-[8.5px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          #{selectedOrder._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Stepper progress timeline indicator */}
                      <div className="flex items-center gap-1.5 mt-1 text-[8.5px] font-black tracking-wide">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-emerald-750 uppercase">Dispatched</span>
                        </div>
                        <span className="text-slate-300">➔</span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedOrder.deliveryStatus === 'Arrived' ? 'bg-emerald-500' : 'bg-primary-500 animate-pulse'}`} />
                          <span className={`uppercase ${selectedOrder.deliveryStatus === 'Arrived' ? 'text-emerald-750' : 'text-primary-700'}`}>In Transit</span>
                        </div>
                        <span className="text-slate-300">➔</span>
                        <div className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedOrder.deliveryStatus === 'Arrived' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className={`uppercase ${selectedOrder.deliveryStatus === 'Arrived' ? 'text-emerald-750' : 'text-slate-400'}`}>Arrived</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 md:gap-10 border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
                    <div>
                      <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Quantity</span>
                      <span className="font-extrabold text-[var(--color-text-primary)] text-[12px]">{selectedOrder.requestedQuantity} {selectedOrder.crop?.unit}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total</span>
                      <span className="font-extrabold text-[var(--color-text-primary)] text-[12px]">₹{(selectedOrder.requestedQuantity * selectedOrder.offeredPrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Payment</span>
                      <span className="font-extrabold text-primary-600 text-[12px] truncate max-w-[100px] block">{selectedOrder.crop?.paymentTerms}</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col lg:flex-1 lg:min-h-0" style={{ height: 'clamp(280px, 45vh, 450px)' }}>
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isDriverOnline ? 'bg-[var(--color-success-500)] animate-ping' : 'bg-[var(--color-text-muted)]'}`} />
                      {isDriverOnline ? 'Real-Time GPS Map' : 'Route Map'}
                    </span>
                    <div className="flex bg-slate-200/70 p-0.5 rounded-lg border border-slate-300/30">
                      {['streets', 'satellite'].map((style) => (
                        <button
                          key={style}
                          onClick={() => setMapStyle(style)}
                          className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                            mapStyle === style ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {style === 'streets' ? '🗺️ Streets' : '🛰️ Satellite'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 relative bg-slate-100">
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-bold text-slate-500">Loading Map...</span>
                      </div>
                    )}
                    <div ref={mapRef} id="farmer-tracking-map" className="w-full h-full z-0" />
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Card 1: GPS Info */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">GPS Info</span>
                      {isDriverOnline && driverLocation ? (
                        <div className="space-y-1.5">
                          <div>
                            <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Speed</span>
                            <span className="text-[16px] font-black text-[var(--color-text-primary)] leading-none">{driverLocation.speed ?? 0} <span className="text-[10px] font-semibold text-[var(--color-text-secondary)]">km/h</span></span>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">GPS Accuracy</span>
                            <span className="text-[11.5px] font-bold text-[var(--color-text-primary)]">{driverLocation.accuracy}m</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10.5px] text-[var(--color-text-secondary)] font-medium leading-snug">
                          {isStale ? '⚠️ Weak signal — last location shown' : '⏳ Waiting for driver GPS...'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Driver Details */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Carrier Logistics</span>
                      {selectedOrder.driver ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                              <span className="material-symbols-outlined text-[13px]">person</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-[var(--color-text-primary)] text-[11px] truncate leading-none">{selectedOrder.driver.name}</h5>
                              <p className="text-[8px] text-[var(--color-text-secondary)] font-medium mt-0.5">{selectedOrder.driver.vehicleType}</p>
                            </div>
                            <a href={`tel:${selectedOrder.driver.phone}`} className="w-5 h-5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors shrink-0">
                              <span className="material-symbols-outlined text-[10px]">call</span>
                            </a>
                          </div>
                          <div className="flex items-center justify-center bg-slate-50 border border-slate-200/50 py-1 rounded-lg">
                            <div className="bg-[#FFD54F] border border-amber-400 rounded px-2 py-0.2">
                              <span className="font-mono text-[9px] font-extrabold text-slate-900 tracking-wider uppercase">{selectedOrder.driver.vehicleNumber}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-between h-full">
                          <div>
                            <h5 className="font-bold text-[var(--color-text-primary)] text-[11px] leading-none">Self-Delivery</h5>
                            <p className="text-[9px] text-[var(--color-text-secondary)] mt-1 leading-snug">You are delivering this yourself. Verify OTP upon arrival.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              window.open(`${window.location.origin}/driver-track?orderId=${selectedOrder._id}&name=${encodeURIComponent(selectedOrder.farmer?.name || 'Farmer')}&crop=${encodeURIComponent(selectedOrder.crop?.name || 'Crop')}&vendor=${encodeURIComponent(selectedOrder.vendor?.name || 'Vendor')}`, '_blank');
                            }}
                            className="mt-1.5 w-full py-1 bg-primary-600 hover:bg-primary-700 text-white text-[9px] font-bold rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1 shadow-sm cursor-pointer border-0"
                          >
                            <span className="material-symbols-outlined text-[11px]">navigation</span>
                            <span>Start My Tracking 🚚</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Customer Details */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] mb-1 block">Customer / Destination</span>
                      <h5 className="font-bold text-[var(--color-text-primary)] text-[11px] truncate leading-none">{selectedOrder.vendor?.name}</h5>
                      <p className="text-[9.5px] text-[var(--color-text-secondary)] leading-snug mt-1.5 truncate">{selectedOrder.crop?.location || 'Vendor location'}</p>
                    </div>
                    <a href={`tel:${selectedOrder.vendor?.phone}`} className="mt-2 flex items-center justify-center gap-1 w-full py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer no-underline">
                      <span className="material-symbols-outlined text-[11px]">call</span>
                      Call Customer
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreightTracking;
