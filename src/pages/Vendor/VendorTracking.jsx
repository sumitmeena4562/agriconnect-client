import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useLiveTracking from '../../hooks/useLiveTracking';

const VendorTracking = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');

  // Firebase real-time GPS receiver
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
  const routeCacheRef    = useRef({});

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

      const orderIdParam = searchParams.get('orderId');
      if (orderIdParam) {
        const match = activeTransit.find((o) => o._id === orderIdParam);
        if (match) { setSelectedOrder(match); return; }
      }
      if (activeTransit.length > 0) setSelectedOrder(activeTransit[0]);
    } catch {
      toast.error('Failed to load active deliveries');
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

    const script  = document.createElement('script');
    script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async  = true;
    script.onload = () => setMapLoaded(true);
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

  // ── 4. OSRM route fetch with cache ───────────────────────────────────────
  const fetchRoute = useCallback(async (sLat, sLng, eLat, eLng, key) => {
    if (routeCacheRef.current[key]) return routeCacheRef.current[key];
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes?.length) {
        const pts = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        routeCacheRef.current[key] = pts;
        return pts;
      }
    } catch { /* sine fallback */ }
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      pts.push([sLat + (eLat - sLat) * t + 0.02 * Math.sin(t * Math.PI), sLng + (eLng - sLng) * t]);
    }
    routeCacheRef.current[key] = pts;
    return pts;
  }, []);

  // ── 5. Draw / Update Map ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !selectedOrder) return;
    const L = window.L;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true })
        .setView([28.6, 77.2], 10);
    }
    const map = mapInstanceRef.current;

    // Tile layers
    if (!tileLayerRef.current || currentStyleRef.current !== mapStyle) {
      if (tileLayerRef.current)    { map.removeLayer(tileLayerRef.current);   tileLayerRef.current  = null; }
      if (overlayLayerRef.current) { map.removeLayer(overlayLayerRef.current); overlayLayerRef.current = null; }

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

    // Vendor theme blue color for icons
    const mkIcon = (icon, color, label) =>
      L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="display:flex;flex-direction:column;align-items:center">
          <div style="width:32px;height:32px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid #fff">
            <span class="material-symbols-outlined" style="font-size:17px">${icon}</span>
          </div>
          <span style="background:rgba(15,23,42,.85);color:#fff;font-size:8.5px;font-weight:700;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap">${label}</span>
        </div>`,
        iconSize: [32, 48],
        iconAnchor: [16, 44],
      });

    const id    = selectedOrder._id;
    const s1    = id.charCodeAt(id.length - 1) || 0;
    const s2    = id.charCodeAt(id.length - 2) || 0;
    const s3    = id.charCodeAt(id.length - 3) || 0;
    const s4    = id.charCodeAt(id.length - 4) || 0;

    // Use real coordinates if available, otherwise fallback to seed-based ones
    const sLat  = selectedOrder.farmerCoordinates?.lat || (28.42 + (s1 % 10) / 100);
    const sLng  = selectedOrder.farmerCoordinates?.lng || (77.01 + (s2 % 10) / 100);
    const eLat  = selectedOrder.vendorCoordinates?.lat || (28.61 + (s3 % 10) / 100);
    const eLng  = selectedOrder.vendorCoordinates?.lng || (77.20 + (s4 % 10) / 100);

    fetchRoute(sLat, sLng, eLat, eLng, id).then((route) => {
      if (!route || !mapInstanceRef.current) return;

      // Start marker
      if (!startMarkerRef.current)
        startMarkerRef.current = L.marker([sLat, sLng], { icon: mkIcon('agriculture', '#16a34a', selectedOrder.farmer?.name || 'Farmer') })
          .addTo(map).bindPopup('Dispatch Origin');

      // End marker
      if (!endMarkerRef.current)
        endMarkerRef.current = L.marker([eLat, eLng], { icon: mkIcon('storefront', '#2563eb', 'My Shop') })
          .addTo(map).bindPopup('Your Shop — Delivery Destination');

      // Route polyline
      if (polylineRef.current)
        polylineRef.current.setLatLngs(route);
      else
        polylineRef.current = L.polyline(route, {
          color: '#3b82f6', weight: 4, opacity: 0.75, dashArray: '5, 8',
        }).addTo(map);

      // Draw or Update Driver Marker on top of route if active GPS is available
      if (driverLocation?.lat && driverLocation?.lng) {
        const dPos = [driverLocation.lat, driverLocation.lng];

        if (driverMarkerRef.current) {
          driverMarkerRef.current.setLatLng(dPos);
          const vehicleIcon =
            selectedOrder.driver?.vehicleType === 'Bike'    ? 'two_wheeler' :
            selectedOrder.driver?.vehicleType === 'Tractor' ? 'agriculture' : 'local_shipping';
          const color = isDriverOnline ? '#f59e0b' : '#94a3b8';
          driverMarkerRef.current.setIcon(mkIcon(vehicleIcon, color, selectedOrder.driver?.name || 'Driver'));
          if (isDriverOnline) map.panTo(dPos, { animate: true });
        } else {
          const vehicleIcon =
            selectedOrder.driver?.vehicleType === 'Bike'    ? 'two_wheeler' :
            selectedOrder.driver?.vehicleType === 'Tractor' ? 'agriculture' : 'local_shipping';
          const color = isDriverOnline ? '#f59e0b' : '#94a3b8';
          driverMarkerRef.current = L.marker(dPos, {
            icon: mkIcon(vehicleIcon, color, selectedOrder.driver?.name || 'Driver'),
          }).addTo(map).bindPopup('Live GPS Location');
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

  const statusInfo = () => {
    if (isDriverOnline) return { label: 'GPS Live', dot: 'bg-emerald-500 animate-ping', color: 'text-emerald-600' };
    if (isStale)        return { label: 'Weak Signal', dot: 'bg-amber-500 animate-pulse', color: 'text-amber-600' };
    return               { label: 'Waiting for GPS...', dot: 'bg-slate-400', color: 'text-slate-500' };
  };

  const si = statusInfo();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-1 flex items-center gap-2">
          <span>📦</span> Live Shipment Tracking
        </h1>
        <p className="text-[11.5px] text-[var(--color-text-secondary)] font-medium">
          Track incoming shipments and locate delivery drivers in real time.
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
          <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">No Incoming Shipments</h3>
          <p className="text-[11.5px] text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
            Koi order abhi "In Transit" ya "Arrived" nahi hai. Jab farmer dispatch karega, woh yahan dikhega.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ── Left: Incoming List ── */}
          <div className="lg:col-span-3 space-y-3 flex flex-col max-h-[720px]">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider">
                Incoming ({activeTransitOrders.length})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold animate-pulse">LIVE</span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 max-h-[640px] pr-1">
              {activeTransitOrders.map((order) => {
                const isSel = selectedOrder?._id === order._id;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer shadow-sm flex flex-col justify-between ${
                      isSel
                        ? 'border-blue-500 bg-blue-50/10 ring-1 ring-blue-500/10'
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
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {order.deliveryStatus || 'In Transit'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">local_shipping</span>
                        <span className="truncate font-semibold">{order.driver ? order.driver.name : 'Farmer Self-Delivery'}</span>
                      </div>
                      <span className="text-[9.5px] font-bold text-[var(--color-text-primary)]">{order.requestedQuantity} {order.crop?.unit}</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-[var(--color-text-muted)] font-semibold">
                      <span className="truncate max-w-[85px]">{order.farmer?.name}</span>
                      <span className="text-slate-300">➔</span>
                      <span className="truncate max-w-[85px] text-right">My Shop</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Map & Details ── */}
          <div className="lg:col-span-9 space-y-4">
            {selectedOrder && (
              <>
                {/* Cargo Header */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] py-2.5 px-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
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
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${si.dot}`} />
                        <span className={`text-[9.5px] font-bold ${si.color}`}>{si.label}</span>
                        {driverLocation?.speed != null && isDriverOnline && (
                          <span className="text-[9px] text-[var(--color-text-muted)] font-semibold ml-1">
                            · {driverLocation.speed} km/h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 md:gap-10 border-t md:border-t-0 border-slate-100 pt-2.5 md:pt-0">
                    <div>
                      <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Quantity</span>
                      <span className="font-extrabold text-[var(--color-text-primary)] text-[12px]">{selectedOrder.requestedQuantity} {selectedOrder.crop?.unit}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Cost</span>
                      <span className="font-extrabold text-[var(--color-text-primary)] text-[12px]">₹{(selectedOrder.requestedQuantity * selectedOrder.offeredPrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Payment</span>
                      <span className="font-extrabold text-blue-600 text-[12px] truncate max-w-[100px] block">{selectedOrder.crop?.paymentTerms}</span>
                    </div>
                  </div>
                </div>

                {/* Map */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ height: 'clamp(300px, 50vh, 500px)' }}>
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isDriverOnline ? 'bg-blue-500 animate-ping' : 'bg-slate-400'}`} />
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
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-bold text-slate-500">Loading Map...</span>
                      </div>
                    )}
                    <div ref={mapRef} id="vendor-tracking-map" className="w-full h-full z-0" />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: GPS Info */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-caption mb-2 block">Transit Details</span>
                      {isDriverOnline && driverLocation ? (
                        <>
                          <div className="text-[22px] font-black text-[var(--color-text-primary)] leading-none">
                            {driverLocation.speed ?? 0}
                            <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] ml-1">km/h</span>
                          </div>
                          <div className="mt-2 text-[10.5px]">
                            <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">GPS Accuracy</span>
                            <span className="font-bold text-[var(--color-text-primary)]">{driverLocation.accuracy}m</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-[11px] text-[var(--color-text-secondary)] font-medium leading-snug">
                          {isStale ? '⚠️ Weak signal — last location shown' : '⏳ Waiting for driver to share GPS...'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card 2: Driver / Carrier */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-caption mb-2 block">Carrier Logistics</span>
                      {selectedOrder.driver ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                              <span className="material-symbols-outlined text-[15px]">person</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-[var(--color-text-primary)] text-[11.5px] truncate">{selectedOrder.driver.name}</h5>
                              <p className="text-[8.5px] text-[var(--color-text-secondary)] font-medium leading-none">Vehicle: {selectedOrder.driver.vehicleType}</p>
                            </div>
                            <a href={`tel:${selectedOrder.driver.phone}`}
                              className="w-6 h-6 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors shrink-0">
                              <span className="material-symbols-outlined text-[12px]">call</span>
                            </a>
                          </div>
                          <div className="flex items-center justify-center bg-slate-50 border border-slate-200/50 py-1.5 rounded-lg">
                            <div className="bg-[#FFD54F] border border-amber-400 rounded px-3 py-0.5">
                              <span className="font-mono text-[10px] font-extrabold text-slate-900 tracking-wider uppercase select-all">{selectedOrder.driver.vehicleNumber}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[15px]">agriculture</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-[var(--color-text-primary)] text-[11.5px]">Self-Delivery</h5>
                              <p className="text-[8.5px] text-[var(--color-text-secondary)] font-medium">Farmer Fulfilling Order</p>
                            </div>
                            <a href={`tel:${selectedOrder.farmer?.phone}`}
                              className="w-6 h-6 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors shrink-0">
                              <span className="material-symbols-outlined text-[12px]">call</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: OTP or Seller */}
                  <div className="shadow-xs">
                    {selectedOrder.deliveryOTP ? (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between h-full">
                        <div>
                          <h5 className="font-bold text-[10px] text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px] text-amber-700">lock_open</span>
                            Handover OTP
                          </h5>
                          <p className="text-[9.5px] text-amber-700/80 leading-snug mt-1">
                            Ye OTP driver ko delivery ke waqt do — completion verify hogi.
                          </p>
                        </div>
                        <div className="mt-3 bg-white border border-amber-200 rounded-lg py-1.5 text-center shadow-xs">
                          <span className="text-[17px] font-black text-amber-950 tracking-widest font-mono">
                            {selectedOrder.deliveryOTP}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between h-full">
                        <div>
                          <span className="text-caption mb-1 block">Seller Location</span>
                          <h5 className="font-bold text-[var(--color-text-primary)] text-[12px]">{selectedOrder.farmer?.name}</h5>
                          <p className="text-[10px] text-[var(--color-text-secondary)] leading-snug mt-1">
                            {selectedOrder.farmer?.location || 'Farmer dispatch location'}
                          </p>
                        </div>
                        <a href={`tel:${selectedOrder.farmer?.phone}`}
                          className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[10.5px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-[13px]">call</span>
                          Call Farmer
                        </a>
                      </div>
                    )}
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

export default VendorTracking;
