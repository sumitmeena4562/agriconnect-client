import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import useLiveTracking from '../../hooks/useLiveTracking';

// Haversine formula to compute distance in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Computes remaining distance along polyline starting from driver's projection
const calculateRemainingRoute = (driverLat, driverLng, routePoints) => {
  if (!routePoints || routePoints.length === 0) return { distance: 0, index: 0 };
  if (!driverLat || !driverLng) {
    let dist = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      dist += getDistance(routePoints[i][0], routePoints[i][1], routePoints[i+1][0], routePoints[i+1][1]);
    }
    return { distance: dist, index: 0 };
  }
  let minIndex = 0;
  let minDistance = Infinity;
  for (let i = 0; i < routePoints.length; i++) {
    const d = getDistance(driverLat, driverLng, routePoints[i][0], routePoints[i][1]);
    if (d < minDistance) {
      minDistance = d;
      minIndex = i;
    }
  }
  let totalRemaining = 0;
  for (let i = minIndex; i < routePoints.length - 1; i++) {
    totalRemaining += getDistance(
      routePoints[i][0], routePoints[i][1],
      routePoints[i+1][0], routePoints[i+1][1]
    );
  }
  return { distance: totalRemaining, index: minIndex };
};

const FreightTracking = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');
  const [otpValue, setOtpValue] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [shouldFollowDriver, setShouldFollowDriver] = useState(true);
  const [expandedTrips, setExpandedTrips] = useState({});

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
  const addonStartMarkerRef = useRef(null);
  const addonEndMarkerRef   = useRef(null);
  const batchMarkersRef     = useRef(null);
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
          (o.deliveryStatus === 'In Transit' || o.deliveryStatus === 'Arrived' || o.deliveryStatus === 'Out For Delivery' || o.deliveryStatus === 'Partially Delivered')
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

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpValue || otpValue.trim().length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }
    setIsVerifyingOtp(true);
    const toastId = toast.loading('Verifying delivery OTP & completing order...');
    try {
      await api.patch(`/orders/${selectedOrder._id}/status`, {
        status: 'Completed',
        otp: otpValue.trim()
      });
      toast.success('Order completed & dispatched successfully!', { id: toastId });
      setOtpValue('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete order. Check OTP again.', { id: toastId });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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

  useEffect(() => {
    boundsSetRef.current = false;
    setCurrentRoute(null);
    setShouldFollowDriver(true); // Re-enable auto-follow when a new order is selected
    if (mapInstanceRef.current) {
      [startMarkerRef, endMarkerRef, driverMarkerRef, polylineRef, addonStartMarkerRef, addonEndMarkerRef].forEach((r) => {
        if (r.current) { mapInstanceRef.current.removeLayer(r.current); r.current = null; }
      });
      if (batchMarkersRef.current) {
        batchMarkersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
        batchMarkersRef.current = null;
      }
    }
  }, [selectedOrder]);

  // ── 4. OSRM route fetch with multi-mirror fallback ───────────────────────
  const routeCacheRef = useRef({});
  const fetchRoute = useCallback(async (coords, key) => {
    if (routeCacheRef.current[key]) return routeCacheRef.current[key];
    
    const coordString = coords.map(([lat, lng]) => `${lng},${lat}`).join(';');
    // Try multiple OSRM server mirrors in sequence for reliability
    const endpoints = [
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${coordString}?overview=full&geometries=geojson`,
      `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`,
      `https://osrm.routing.digital/route/v1/driving/${coordString}?overview=full&geometries=geojson`
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.length) {
          const pts = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          routeCacheRef.current[key] = pts;
          return pts;
        }
      } catch (err) {
        console.warn(`Routing mirror failed: ${url}`, err);
      }
    }

    // High-fidelity highway simulator fallback instead of straight line
    const pts = [];
    for (let s = 0; s < coords.length - 1; s++) {
      const [ptA_Lat, ptA_Lng] = coords[s];
      const [ptB_Lat, ptB_Lng] = coords[s + 1];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        pts.push([
          ptA_Lat + (ptB_Lat - ptA_Lat) * t + 0.01 * Math.sin(t * Math.PI),
          ptA_Lng + (ptB_Lng - ptA_Lng) * t
        ]);
      }
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
      const m = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([28.6, 77.2], 10);
      // Stop auto-follow when user manually drags or zooms the map
      m.on('dragstart', () => setShouldFollowDriver(false));
      mapInstanceRef.current = m;
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

    // Helper: custom HTML marker with optional live pulsing ring
    const mkIcon = (icon, colorVar, label, isPulsing = false) =>
      L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="display:flex;flex-direction:column;align-items:center;position:relative">
          ${isPulsing ? `<div class="animate-ping absolute" style="width:32px;height:32px;border-radius:50%;background:${colorVar};opacity:0.45;top:0;left:0;z-index:-1"></div>` : ''}
          <div style="width:32px;height:32px;border-radius:50%;background:${colorVar};color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid #fff;position:relative;z-index:10">
            <span class="material-symbols-outlined" style="font-size:17px">${icon}</span>
          </div>
          <span style="background:rgba(15,23,42,.85);color:#fff;font-size:8.5px;font-weight:700;padding:1px 5px;border-radius:4px;margin-top:2px;white-space:nowrap;position:relative;z-index:10">${label}</span>
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

    // Build coordsList for multi-stop routing
    let coordsList = [];
    if (selectedOrder.deliveryBatchId && selectedOrder.deliveryBatchId.optimizedRoute) {
      coordsList = selectedOrder.deliveryBatchId.optimizedRoute.map(stop => [stop.coordinates.lat, stop.coordinates.lng]);
    } else {
      coordsList = [[sLat, sLng]];
      if (selectedOrder.consolidatedWith && selectedOrder.consolidatedWith.length > 0) {
        const addon = selectedOrder.consolidatedWith[0];
        if (addon.farmerCoordinates?.lat && addon.farmerCoordinates?.lng) {
          coordsList.push([addon.farmerCoordinates.lat, addon.farmerCoordinates.lng]);
        }
        if (addon.vendorCoordinates?.lat && addon.vendorCoordinates?.lng) {
          coordsList.push([addon.vendorCoordinates.lat, addon.vendorCoordinates.lng]);
        }
      }
      coordsList.push([eLat, eLng]);
    }

    fetchRoute(coordsList, id).then((route) => {
      if (!route || !mapInstanceRef.current) return;
      setCurrentRoute(route);

      // Draw stops markers
      if (selectedOrder.deliveryBatchId && selectedOrder.deliveryBatchId.optimizedRoute) {
        if (addonStartMarkerRef.current) { map.removeLayer(addonStartMarkerRef.current); addonStartMarkerRef.current = null; }
        if (addonEndMarkerRef.current)   { map.removeLayer(addonEndMarkerRef.current); addonEndMarkerRef.current = null; }
        if (startMarkerRef.current)      { map.removeLayer(startMarkerRef.current);      startMarkerRef.current = null; }
        if (endMarkerRef.current)        { map.removeLayer(endMarkerRef.current);        endMarkerRef.current = null; }

        if (!batchMarkersRef.current) batchMarkersRef.current = [];
        batchMarkersRef.current.forEach(m => map.removeLayer(m));
        batchMarkersRef.current = [];

        selectedOrder.deliveryBatchId.optimizedRoute.forEach(stop => {
          const isStopPickup = stop.stopType === 'pickup';
          const isCurrentOrderStop = stop.orderId === selectedOrder._id;
          
          const color = isStopPickup 
            ? '#16a34a' 
            : isCurrentOrderStop 
              ? '#ef4444' // Highlight selected stop in red
              : '#2563eb'; // Blue for other stops
          
          const label = isCurrentOrderStop 
            ? `🎯 ${stop.address.split('\'s')[0]}`
            : stop.address.split('\'s')[0];

          const marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], {
            icon: mkIcon(
              isStopPickup ? 'agriculture' : 'storefront', 
              color, 
              label, 
              isCurrentOrderStop // Pulse the selected order stop!
            )
          }).addTo(map).bindPopup(`${isStopPickup ? 'Pickup' : 'Delivery'} Stop: ${stop.address} ${isCurrentOrderStop ? '(Target Destination)' : ''}`);
          batchMarkersRef.current.push(marker);
        });
      } else {
        if (batchMarkersRef.current) {
          batchMarkersRef.current.forEach(m => map.removeLayer(m));
          batchMarkersRef.current = null;
        }

        // Start marker
        if (!startMarkerRef.current)
          startMarkerRef.current = L.marker([sLat, sLng], { icon: mkIcon('agriculture', '#16a34a', 'My Farm') })
            .addTo(map).bindPopup('Dispatch Origin');

        // End marker
        if (!endMarkerRef.current)
          endMarkerRef.current = L.marker([eLat, eLng], { icon: mkIcon('storefront', '#2563eb', selectedOrder.vendor?.name || 'Vendor') })
            .addTo(map).bindPopup('Delivery Destination');

        // Addon markers
        if (selectedOrder.consolidatedWith && selectedOrder.consolidatedWith.length > 0) {
          const addon = selectedOrder.consolidatedWith[0];
          if (addon.farmerCoordinates?.lat && addon.farmerCoordinates?.lng) {
            if (!addonStartMarkerRef.current) {
              addonStartMarkerRef.current = L.marker(
                [addon.farmerCoordinates.lat, addon.farmerCoordinates.lng],
                { icon: mkIcon('agriculture', '#9333ea', `Addon: ${addon.farmer?.name || 'Farmer'}`) }
              ).addTo(map).bindPopup('Addon Dispatch Origin');
            }
          }
          if (addon.vendorCoordinates?.lat && addon.vendorCoordinates?.lng) {
            if (!addonEndMarkerRef.current) {
              addonEndMarkerRef.current = L.marker(
                [addon.vendorCoordinates.lat, addon.vendorCoordinates.lng],
                { icon: mkIcon('storefront', '#4f46e5', `Addon Shop: ${addon.vendor?.name || 'Vendor'}`) }
              ).addTo(map).bindPopup('Addon Delivery Destination');
            }
          }
        } else {
          if (addonStartMarkerRef.current) { map.removeLayer(addonStartMarkerRef.current); addonStartMarkerRef.current = null; }
          if (addonEndMarkerRef.current)   { map.removeLayer(addonEndMarkerRef.current); addonEndMarkerRef.current = null; }
        }
      }

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
          driverMarkerRef.current.setIcon(mkIcon(vehicleIcon, color, selectedOrder.driver?.name || 'Driver', isDriverOnline));
          if (isDriverOnline && shouldFollowDriver) map.panTo(dPos, { animate: true });
        } else {
          const vehicleIcon =
            selectedOrder.driver?.vehicleType === 'Bike'    ? 'two_wheeler'    :
            selectedOrder.driver?.vehicleType === 'Tractor' ? 'agriculture'    : 'local_shipping';
          const color = isDriverOnline ? '#22c55e' : '#94a3b8';
          driverMarkerRef.current = L.marker(dPos, { icon: mkIcon(vehicleIcon, color, selectedOrder.driver?.name || 'Driver', isDriverOnline) })
            .addTo(map)
            .bindPopup('Live GPS Location');
        }
      } else {
        if (driverMarkerRef.current) {
          map.removeLayer(driverMarkerRef.current);
          driverMarkerRef.current = null;
        }
      }

      // ✅ fitBounds SIRF PEHLI BAAR - covers all points
      if (!boundsSetRef.current) {
        const boundsList = [...coordsList];
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
      (o.deliveryStatus === 'In Transit' || o.deliveryStatus === 'Arrived' || o.deliveryStatus === 'Out For Delivery' || o.deliveryStatus === 'Partially Delivered')
  );
  const getTrackingStatusLabel = () => {
    if (!selectedOrder) return null;
    if (isDriverOnline) return { label: 'GPS Live', color: 'text-[var(--color-success-600)]', dot: 'bg-[var(--color-success-500)] animate-ping' };
    if (isStale)        return { label: 'Weak Signal', color: 'text-[var(--color-warning-600)]', dot: 'bg-[var(--color-warning-500)] animate-pulse' };
    return               { label: 'Waiting for GPS...', color: 'text-[var(--color-text-muted)]', dot: 'bg-[var(--color-text-muted)]' };
  };

  const statusInfo = getTrackingStatusLabel();

  // Group active orders by batch or standalone trip
  const getGroupedTrips = useCallback(() => {
    const tripsMap = {};
    const standaloneOrders = [];

    activeTransitOrders.forEach(order => {
      if (order.deliveryBatchId && order.deliveryBatchId._id) {
        const batchId = order.deliveryBatchId._id;
        if (!tripsMap[batchId]) {
          tripsMap[batchId] = {
            id: batchId,
            type: 'batch',
            batch: order.deliveryBatchId,
            driver: order.driver || order.deliveryBatchId.driver,
            orders: [],
            deliveryStatus: order.deliveryBatchId.batchStatus || 'Out For Delivery'
          };
        }
        tripsMap[batchId].orders.push(order);
      } else {
        standaloneOrders.push({
          id: order._id,
          type: 'standalone',
          order: order,
          driver: order.driver,
          orders: [order],
          deliveryStatus: order.deliveryStatus
        });
      }
    });

    return [...Object.values(tripsMap), ...standaloneOrders];
  }, [activeTransitOrders]);

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

          {/* ── Left Panel: Active Trips Sidebar ── */}
          <div className="lg:col-span-3 space-y-3 flex flex-col lg:h-full lg:overflow-hidden">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider">
                Active Trips ({getGroupedTrips().length})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-[9px] font-bold animate-pulse">
                LIVE
              </span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
              {getGroupedTrips().map((trip) => {
                const isTripSelected = trip.orders.some(o => o._id === selectedOrder?._id);
                const isExpanded = expandedTrips[trip.id] !== undefined ? expandedTrips[trip.id] : isTripSelected;

                const toggleTripExpand = (tripId) => {
                  setExpandedTrips(prev => ({ ...prev, [tripId]: !isExpanded }));
                };

                return (
                  <div
                    key={trip.id}
                    className={`rounded-2xl border transition-all shadow-xs flex flex-col overflow-hidden ${
                      isTripSelected
                        ? 'border-primary-500 bg-primary-50/5 ring-1 ring-primary-500/10'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-slate-350'
                    }`}
                  >
                    {/* Main Trip Card Header */}
                    <div
                      onClick={() => {
                        if (!isTripSelected) {
                          setSelectedOrder(trip.orders[0]);
                        }
                        toggleTripExpand(trip.id);
                      }}
                      className="p-3 cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-650 shrink-0">
                            <span className="material-symbols-outlined text-[17px]">
                              {trip.driver?.vehicleType === 'Bike' ? 'two_wheeler' : trip.driver?.vehicleType === 'Tractor' ? 'agriculture' : 'local_shipping'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-[12.5px] font-black text-[var(--color-text-primary)] leading-tight">
                              {trip.driver ? trip.driver.name : 'Self-Delivery'}
                            </h4>
                            <p className="text-[9px] text-[var(--color-text-muted)] font-extrabold uppercase tracking-wide">
                              {trip.driver?.vehicleNumber || 'No Vehicle'} · {trip.driver?.vehicleType || 'Courier'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0 ${
                            trip.deliveryStatus === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-primary-50 text-primary-700 border border-primary-100'
                          }`}>
                            {trip.deliveryStatus}
                          </span>
                          <span className="text-[8px] font-black text-slate-400 bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded-full">
                            {trip.orders.length} {trip.orders.length > 1 ? 'Orders' : 'Order'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[9px] text-[var(--color-text-secondary)] font-bold">
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <span className="material-symbols-outlined text-[12px] text-slate-400">route</span>
                          {trip.type === 'batch'
                            ? `${trip.orders[0]?.crop?.location?.split(' ')[0] || 'Farm'} ➔ ${trip.orders.length} Stops`
                            : `${trip.orders[0]?.crop?.location?.split(' ')[0] || 'Farm'} ➔ ${trip.orders[0]?.vendor?.name?.split(' ')[0] || 'Shop'}`}
                        </span>
                        <span
                          className="material-symbols-outlined text-[14px] text-slate-400 transition-transform duration-200"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                        >
                          keyboard_arrow_down
                        </span>
                      </div>
                    </div>

                    {/* Expanded Orders List */}
                    {isExpanded && (
                      <div className="bg-slate-50/50 border-t border-slate-100 py-1.5 px-2.5 space-y-1.5">
                        {trip.orders.map(order => {
                          const isOrderSel = selectedOrder?._id === order._id;
                          const batchRoute = trip.batch?.optimizedRoute || [];
                          const deliveryStop = batchRoute.find(s => s.stopType === 'delivery' && String(s.orderId) === String(order._id));
                          const loadSeq = deliveryStop?.loadingSequence;
                          const totalDeliveries = batchRoute.filter(s => s.stopType === 'delivery').length;
                          const deliverSeq = loadSeq != null ? (totalDeliveries + 1 - loadSeq) : null;
                          return (
                            <div
                              key={order._id}
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                              className={`p-2 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                                isOrderSel ? 'bg-white border-primary-400 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[10px]">📦</span>
                                  <span className="truncate text-slate-700">{order.crop?.name || 'Crop'}</span>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400 shrink-0">{order.requestedQuantity} {order.crop?.unit}</span>
                              </div>
                              {loadSeq != null && (
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  <span className="text-[8px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Load #{loadSeq}</span>
                                  {deliverSeq && <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Deliver #{deliverSeq}</span>}
                                  {loadSeq === totalDeliveries && <span className="text-[7.5px] font-black bg-rose-100 text-rose-600 px-1 py-0.5 rounded-full">1st Delivered</span>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                        {selectedOrder.consolidationStatus && selectedOrder.consolidationStatus !== 'standalone' && (
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border ${
                            selectedOrder.consolidationStatus === 'primary'
                              ? 'bg-purple-55 text-purple-700 border-purple-200'
                              : 'bg-indigo-55 text-indigo-700 border-indigo-200'
                          }`}>
                            <span className="material-symbols-outlined text-[10px]">alt_route</span>
                            <span>{selectedOrder.consolidationStatus === 'primary' ? 'Primary Delivery' : 'Combined Pickup'}</span>
                          </span>
                        )}
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

                {/* Consolidated / Milk Run Notice Banner */}
                {selectedOrder.consolidationStatus && selectedOrder.consolidationStatus !== 'standalone' && (
                  <div className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">info_outline</span>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[11px] uppercase tracking-wider leading-none">Shared Delivery Route</h4>
                      <p className="text-[9.5px] font-medium mt-0.5 opacity-90 leading-relaxed">
                        {selectedOrder.consolidationStatus === 'primary'
                          ? 'Your shipment is consolidated with another pickup along the route to maximize truck efficiency.'
                          : 'This is an addon pickup. The carrier will retrieve and deliver this order along with their primary shipment.'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Emergency SOS Flashing Banner */}
                {driverLocation?.sos && (
                  <div className="bg-rose-600 text-white px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] font-bold">warning</span>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-[12px] uppercase tracking-wider leading-none">Emergency SOS Alert!</h4>
                        <p className="text-[10px] font-medium mt-0.5 opacity-90">Driver {selectedOrder.driver?.name || 'Driver'} is in emergency. Contact immediately!</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${selectedOrder.driver?.phone}`}
                      className="px-3 py-1 bg-white text-rose-700 text-[10px] font-black rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <span className="material-symbols-outlined text-[12px] font-bold">call</span>
                      <span>Call Driver</span>
                    </a>
                  </div>
                )}

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
                    {/* Floating Recenter / Follow Driver Button */}
                    {driverLocation?.lat && (
                      <button
                        type="button"
                        onClick={() => {
                          setShouldFollowDriver(true);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.panTo([driverLocation.lat, driverLocation.lng], { animate: true });
                          }
                        }}
                        title={shouldFollowDriver ? 'Auto-following driver' : 'Click to re-center on driver'}
                        className={`absolute bottom-3 right-3 z-[1000] w-9 h-9 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 active:scale-90 ${
                          shouldFollowDriver
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {shouldFollowDriver ? 'my_location' : 'location_searching'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Card 1: GPS Info & Transit details */}
                  {(() => {
                    let remainingDistanceStr = '—';
                    let etaStr = '—';
                    let arrivalStr = '—';

                    if (currentRoute && currentRoute.length > 0) {
                      const dLat = driverLocation?.lat;
                      const dLng = driverLocation?.lng;
                      const { distance } = calculateRemainingRoute(dLat, dLng, currentRoute);
                      
                      remainingDistanceStr = distance >= 1 ? `${distance.toFixed(1)} km` : `${(distance * 1000).toFixed(0)} m`;

                      const speed = driverLocation?.speed || 0;
                      const activeSpeed = speed > 10 ? speed : 50; // fallback to 50km/h
                      const hours = distance / activeSpeed;
                      const totalMinutes = Math.round(hours * 60);

                      if (totalMinutes < 60) {
                        etaStr = `${totalMinutes} mins`;
                      } else {
                        etaStr = `${(totalMinutes / 60).toFixed(1)} hrs`;
                      }

                      const arrivalDate = new Date();
                      arrivalDate.setMinutes(arrivalDate.getMinutes() + totalMinutes);
                      arrivalStr = arrivalDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                    }

                    return (
                      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)]">GPS Info</span>
                            {/* Signal Alert Badge */}
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold border ${
                              isDriverOnline
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : isStale
                                ? 'bg-amber-50 border-amber-200 text-amber-700'
                                : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isDriverOnline ? 'bg-emerald-500 animate-ping' : isStale ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                              }`} />
                              {isDriverOnline ? '🟢 GPS Live' : isStale ? '⚠️ Weak Signal' : '📡 No Signal'}
                            </span>
                          </div>
                          
                          {/* Info Grid */}
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {/* Left Col: Real-time Stats */}
                            <div className="space-y-1">
                              <div>
                                <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Speed</span>
                                <span className="text-[13px] font-black text-[var(--color-text-primary)] leading-none">
                                  {driverLocation && isDriverOnline ? `${driverLocation.speed ?? 0} ` : '0 '}
                                  <span className="text-[9px] font-semibold text-[var(--color-text-secondary)]">km/h</span>
                                </span>
                              </div>
                              <div>
                                <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Accuracy</span>
                                <span className="text-[11px] font-black text-[var(--color-text-primary)]">
                                  {driverLocation && isDriverOnline ? `${driverLocation.accuracy}m` : '—'}
                                </span>
                              </div>
                            </div>

                            {/* Right Col: Distance & ETA */}
                            <div className="space-y-1 border-l border-slate-100 pl-2">
                              <div>
                                <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Remaining</span>
                                <span className="text-[13px] font-black text-[var(--color-text-primary)] leading-none text-blue-600">{remainingDistanceStr}</span>
                              </div>
                              <div>
                                <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Est. Arrival</span>
                                <span className="text-[11px] font-black text-emerald-600 leading-none block">{etaStr}</span>
                                {arrivalStr !== '—' && (
                                  <span className="text-[7.5px] font-bold text-[var(--color-text-muted)] mt-0.5 block">{arrivalStr}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

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
                          
                          {/* Quick Link Share Controls */}
                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                const link = `${window.location.origin}/driver-track?orderId=${selectedOrder._id}&name=${encodeURIComponent(selectedOrder.driver?.name || 'Driver')}&crop=${encodeURIComponent(selectedOrder.crop?.name || 'Crop')}&vendor=${encodeURIComponent(selectedOrder.vendor?.name || 'Vendor')}`;
                                navigator.clipboard.writeText(link);
                                toast.success('Driver tracking link copied!');
                              }}
                              className="py-1 bg-white border border-slate-250 text-slate-700 text-[9px] font-black rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.98]"
                            >
                              <span className="material-symbols-outlined text-[11px]">content_copy</span>
                              <span>Copy Link</span>
                            </button>
                            <a
                              href={(() => {
                                let phone = selectedOrder.driver ? selectedOrder.driver.phone : '';
                                if (phone) {
                                  const clean = phone.replace(/\D/g, '');
                                  phone = clean.length === 10 ? `91${clean}` : clean;
                                }
                                const text = `Please click this link to start live GPS tracking for order #${selectedOrder._id.slice(-6).toUpperCase()}: ${window.location.origin}/driver-track?orderId=${selectedOrder._id}&name=${encodeURIComponent(selectedOrder.driver?.name || 'Driver')}&crop=${encodeURIComponent(selectedOrder.crop?.name || 'Crop')}&vendor=${encodeURIComponent(selectedOrder.vendor?.name || 'Vendor')}`;
                                return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
                              })()}
                              target="_blank"
                              rel="noreferrer"
                              className="py-1 bg-emerald-50 border border-emerald-250 text-emerald-700 text-[9px] font-black rounded-lg hover:bg-emerald-105 flex items-center justify-center gap-1 no-underline transition-all active:scale-[0.98]"
                            >
                              <span className="material-symbols-outlined text-[11px]">share</span>
                              <span>WhatsApp</span>
                            </a>
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

                  {/* Card 3: Customer Details & OTP Verification */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-col justify-between h-full">
                    <div>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--color-text-muted)] mb-1 block">Customer / Destination</span>
                      <h5 className="font-bold text-[var(--color-text-primary)] text-[11px] truncate leading-none">{selectedOrder.vendor?.name}</h5>
                      <p className="text-[9.5px] text-[var(--color-text-secondary)] leading-snug mt-1.5 truncate">{selectedOrder.crop?.location || 'Vendor location'}</p>
                      
                      {/* OTP Form */}
                      {selectedOrder.deliveryOTP && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60">
                          {selectedOrder.payment?.status === 'Verified' ? (
                            <form onSubmit={handleVerifyOtp} className="space-y-1.5">
                              <span className="text-[8.5px] font-bold text-amber-800 uppercase tracking-wider block">Verify Handover OTP</span>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  maxLength={4}
                                  value={otpValue}
                                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                                  placeholder="4-digit OTP"
                                  className="w-full px-2 py-1 border border-slate-350 rounded-lg text-[10px] font-bold tracking-widest text-center focus:outline-none focus:border-primary-500 bg-white"
                                  disabled={isVerifyingOtp}
                                />
                                <button
                                  type="submit"
                                  disabled={isVerifyingOtp || otpValue.length !== 4}
                                  className="px-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600 text-white text-[9.5px] font-black rounded-lg transition-all active:scale-[0.97] cursor-pointer border-0 shrink-0"
                                >
                                  Verify
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="bg-amber-50 border border-amber-250/60 rounded-lg p-1.5 text-[8.5px] font-bold text-amber-850 leading-snug text-center">
                              ⚠️ Payment verification pending.
                            </div>
                          )}
                        </div>
                      )}
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
