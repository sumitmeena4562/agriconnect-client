import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const VendorTracking = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const overlayLayerRef = useRef(null);
  const currentStyleRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const endMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  // 1. Fetch Orders on mount
  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      const data = res.data.data;
      setOrders(data);
      
      // Filter for active transit orders
      const activeTransit = data.filter(o => 
        o.status === 'Accepted' && 
        (o.deliveryStatus === 'In Transit' || o.deliveryStatus === 'Arrived')
      );

      // Check if orderId query parameter is present to auto-select
      const orderIdParam = searchParams.get('orderId');
      if (orderIdParam && activeTransit.length > 0) {
        const matchingOrder = activeTransit.find(o => o._id === orderIdParam);
        if (matchingOrder) {
          setSelectedOrder(matchingOrder);
          return;
        }
      }

      // If active transit orders exist and none is selected, auto-select the first one
      if (activeTransit.length > 0 && !selectedOrder) {
        setSelectedOrder(activeTransit[0]);
      }
    } catch (e) {
      toast.error('Failed to load active deliveries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchParams]);

  // 2. Load Leaflet CDN dynamically
  useEffect(() => {
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
  }, []);

  // 3. Fetch tracking details periodically for selected order
  const fetchTrackingDetails = async (orderId) => {
    try {
      const res = await api.get(`/orders/${orderId}/tracking`);
      if (res.data.success) {
        setTrackingData(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch live tracking coordinates', e);
    }
  };

  useEffect(() => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    if (selectedOrder) {
      fetchTrackingDetails(selectedOrder._id);
      trackingIntervalRef.current = setInterval(() => {
        fetchTrackingDetails(selectedOrder._id);
      }, 3000);
    } else {
      setTrackingData(null);
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [selectedOrder]);

  // 4. Draw/Redraw map, tiles, route and markers
  useEffect(() => {
    if (!mapLoaded || !trackingData || !mapRef.current) return;

    const L = window.L;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView(trackingData.currentCoords, 11);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Update tile layers if they don't exist or if style changed
    if (!tileLayerRef.current || currentStyleRef.current !== mapStyle) {
      // Remove old layers
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
        tileLayerRef.current = null;
      }
      if (overlayLayerRef.current) {
        map.removeLayer(overlayLayerRef.current);
        overlayLayerRef.current = null;
      }

      if (mapStyle === 'satellite') {
        tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(map);

        overlayLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          opacity: 0.85
        }).addTo(map);
      } else {
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
      }
      currentStyleRef.current = mapStyle;
    }

    // Helper for custom HTML markers
    const createHtmlIcon = (iconText, colorClass, textLabel) => {
      return L.divIcon({
        className: 'custom-leaflet-icon',
        html: `
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center shadow-lg border-2 border-white scale-100 hover:scale-105 transition-all">
              <span class="material-symbols-outlined text-[17px]!">${iconText}</span>
            </div>
            <span class="bg-slate-800/90 text-white font-bold text-[8.5px] px-1 py-0.2 rounded mt-0.5 whitespace-nowrap shadow border border-slate-700/50">${textLabel}</span>
          </div>
        `,
        iconSize: [32, 45],
        iconAnchor: [16, 40]
      });
    };

    // Update or Create Farmer (Start) Marker
    if (startMarkerRef.current) {
      startMarkerRef.current.setLatLng(trackingData.startCoords);
    } else {
      const icon = createHtmlIcon('agriculture', 'bg-emerald-600', 'Farmer');
      startMarkerRef.current = L.marker(trackingData.startCoords, { icon })
        .addTo(map)
        .bindPopup(`<b>${selectedOrder?.farmer?.name || 'Farmer'} (Seller)</b><br/>Dispatch Origin`);
    }

    // Update or Create Vendor (End) Marker
    if (endMarkerRef.current) {
      endMarkerRef.current.setLatLng(trackingData.endCoords);
    } else {
      const icon = createHtmlIcon('storefront', 'bg-blue-600', 'My Shop');
      endMarkerRef.current = L.marker(trackingData.endCoords, { icon })
        .addTo(map)
        .bindPopup("<b>My Shop (Vendor)</b><br/>Delivery Destination");
    }

    // Draw Route Polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(trackingData.route);
    } else {
      polylineRef.current = L.polyline(trackingData.route, {
        color: '#3b82f6', // Indigo blue for vendor
        weight: 4,
        opacity: 0.75,
        dashArray: '5, 8'
      }).addTo(map);
    }

    // Update or Create Driver Marker
    const vehicleIcon = trackingData.driver?.vehicleType === 'Bike' ? 'two_wheeler' : 
                         trackingData.driver?.vehicleType === 'Tractor' ? 'agriculture' : 'local_shipping';
    const driverLabel = trackingData.driver?.name || 'Self-Delivery';
    const driverColorClass = trackingData.deliveryStatus === 'Arrived' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse';

    if (driverMarkerRef.current) {
      driverMarkerRef.current.setLatLng(trackingData.currentCoords);
      // Pan map along with moving driver
      if (trackingData.deliveryStatus === 'In Transit') {
        map.panTo(trackingData.currentCoords);
      }
    } else {
      const icon = createHtmlIcon(vehicleIcon, driverColorClass, driverLabel);
      driverMarkerRef.current = L.marker(trackingData.currentCoords, { icon }).addTo(map);
    }

    // Fit map bounds to show complete path on initial selection
    const bounds = L.latLngBounds([trackingData.startCoords, trackingData.endCoords]);
    map.fitBounds(bounds, { padding: [40, 40] });

  }, [mapLoaded, trackingData, mapStyle]);

  // Clean up markers and polyline on order change
  useEffect(() => {
    if (mapInstanceRef.current) {
      if (startMarkerRef.current) mapInstanceRef.current.removeLayer(startMarkerRef.current);
      if (endMarkerRef.current) mapInstanceRef.current.removeLayer(endMarkerRef.current);
      if (driverMarkerRef.current) mapInstanceRef.current.removeLayer(driverMarkerRef.current);
      if (polylineRef.current) mapInstanceRef.current.removeLayer(polylineRef.current);

      startMarkerRef.current = null;
      endMarkerRef.current = null;
      driverMarkerRef.current = null;
      polylineRef.current = null;
    }
  }, [selectedOrder]);

  const activeTransitOrders = orders.filter(o => 
    o.status === 'Accepted' && 
    (o.deliveryStatus === 'In Transit' || o.deliveryStatus === 'Arrived')
  );

  const formatEta = (seconds) => {
    if (!seconds) return 'Arrived';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSpeed = () => {
    if (!trackingData || trackingData.deliveryStatus === 'Arrived') return '0 km/h';
    // Generate deterministic speed based on vehicle type
    const vType = trackingData.driver?.vehicleType;
    if (vType === 'Bike') return '40 km/h';
    if (vType === 'Tractor') return '25 km/h';
    if (vType === 'Mini Truck') return '45 km/h';
    return '50 km/h';
  };

  const getDistancePercent = () => {
    if (!trackingData) return '0%';
    const duration = 180; // Total simulation durations in seconds
    const left = trackingData.etaSeconds || 0;
    const covered = Math.max(0, duration - left);
    return `${Math.round((covered / duration) * 100)}%`;
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-1 flex items-center gap-2">
          <span>📦</span> Live Shipment Tracking
        </h1>
        <p className="text-[11.5px] text-[var(--color-text-secondary)] font-medium">
          Track incoming shipments, check ETA, and locate delivery drivers in real time.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-3 border-[var(--color-primary-100)] border-t-[var(--color-primary-600)] animate-spin"></div>
        </div>
      ) : activeTransitOrders.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--card-border-radius)] shadow-[var(--shadow-card)] text-center py-16 px-6">
          <div className="w-16 h-16 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--color-border)]/50">
            <span className="material-symbols-outlined text-[28px] text-[var(--color-text-secondary)]">navigation</span>
          </div>
          <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">No Incoming Shipments</h3>
          <p className="text-[11.5px] text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
            There are no orders currently "In Transit" or "Arrived" to your shop. Once the seller dispatches an order, it will show up here for live tracking.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel: Incoming Shipments List (Col Span 3) */}
          <div className="lg:col-span-3 space-y-3 flex flex-col max-h-[720px]">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider">
                Incoming ({activeTransitOrders.length})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold animate-pulse">
                LIVE
              </span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 max-h-[640px] pr-1">
              {activeTransitOrders.map((order) => {
                const isSelected = selectedOrder?._id === order._id;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/10 ring-1 ring-blue-500/10'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wide bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
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
                        <span className="truncate font-semibold">
                          {order.driver ? order.driver.name : 'Farmer Self-Delivery'}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-[var(--color-text-primary)]">
                        {order.requestedQuantity} {order.crop?.unit}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-[var(--color-text-muted)] font-semibold">
                      <span className="truncate max-w-[85px]">{order.farmer?.name}</span>
                      <span className="text-[10px] text-slate-300">➔</span>
                      <span className="truncate max-w-[85px] text-right">My Shop</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Map & Details Workspace (Col Span 9) */}
          <div className="lg:col-span-9 space-y-4">
            {selectedOrder && (
              <>
                {/* Cargo Header Card */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">package_2</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          #{selectedOrder._id.slice(-6).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          trackingData?.deliveryStatus === 'Arrived'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-blue-50 text-blue-700 border border-blue-100 animate-pulse'
                        }`}>
                          {trackingData?.deliveryStatus === 'Arrived' ? '⚡ Arrived' : '🚚 In Transit'}
                        </span>
                      </div>
                      <h3 className="text-[16px] font-black text-[var(--color-text-primary)] mt-1 truncate">
                        {selectedOrder.crop?.name || 'Deleted Crop'}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:flex md:items-center gap-4 md:gap-8 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Quantity</span>
                      <span className="font-bold text-[var(--color-text-primary)] text-[12.5px]">{selectedOrder.requestedQuantity} {selectedOrder.crop?.unit}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Total Cost</span>
                      <span className="font-bold text-[var(--color-text-primary)] text-[12.5px]">₹{(selectedOrder.requestedQuantity * selectedOrder.offeredPrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Payment</span>
                      <span className="font-bold text-blue-600 text-[12.5px] truncate max-w-[100px] block">{selectedOrder.crop?.paymentTerms}</span>
                    </div>
                  </div>
                </div>

                {/* Map Card */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[400px]">
                  <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                      Live Route Map
                    </span>

                    {/* Style Toggle */}
                    <div className="flex bg-slate-200/70 p-0.5 rounded-lg border border-slate-300/30">
                      <button
                        onClick={() => setMapStyle('streets')}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          mapStyle === 'streets'
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🗺️ Streets
                      </button>
                      <button
                        onClick={() => setMapStyle('satellite')}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          mapStyle === 'satellite'
                            ? 'bg-white text-slate-800 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🛰️ Satellite
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 relative bg-slate-100">
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-bold text-slate-500">Loading Map...</span>
                      </div>
                    )}
                    <div ref={mapRef} className="w-full h-full z-0" id="tracking-map-canvas" />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: ETA & Transit Progress */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Transit Details</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[22px] font-black text-[var(--color-text-primary)] leading-none">
                          {trackingData ? formatEta(trackingData.etaSeconds) : 'Calculating...'}
                        </span>
                        <span className="text-[9.5px] font-semibold text-[var(--color-text-secondary)]">Remaining ETA</span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10.5px]">
                        <div>
                          <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Estimated Speed</span>
                          <span className="font-bold text-[var(--color-text-primary)]">{getSpeed()}</span>
                        </div>
                        <div>
                          <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Progress</span>
                          <span className="font-bold text-blue-600">{getDistancePercent()} Covered</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: getDistancePercent() }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Driver & Vehicle */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 rounded-xl shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-2">Carrier Logistics</span>
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
                            <a
                              href={`tel:${selectedOrder.driver.phone}`}
                              className="w-6.5 h-6.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                              title="Call Driver"
                            >
                              <span className="material-symbols-outlined text-[12px]">call</span>
                            </a>
                          </div>

                          <div className="flex items-center justify-center bg-slate-50 border border-slate-200/50 py-1.5 rounded-lg mt-1">
                            <div className="bg-[#FFD54F] border border-amber-400 rounded px-3 py-0.5 shadow-xs text-center">
                              <span className="font-mono text-[10px] font-extrabold text-slate-900 tracking-wider uppercase select-all">
                                {selectedOrder.driver.vehicleNumber}
                              </span>
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
                              <h5 className="font-bold text-[var(--color-text-primary)] text-[11.5px] truncate">Self-Delivery</h5>
                              <p className="text-[8.5px] text-[var(--color-text-secondary)] font-medium leading-none">Farmer Fulfilling Order</p>
                            </div>
                            <a
                              href={`tel:${selectedOrder.farmer?.phone}`}
                              className="w-6.5 h-6.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                              title="Call Farmer"
                            >
                              <span className="material-symbols-outlined text-[12px]">call</span>
                            </a>
                          </div>
                          <p className="text-[9.5px] text-[var(--color-text-secondary)] leading-tight pt-1">
                            The farmer is delivering the crop personally. Contact them directly.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: OTP or Seller details */}
                  <div className="shadow-xs">
                    {selectedOrder.deliveryOTP ? (
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex flex-col justify-between h-full">
                        <div>
                          <h5 className="font-bold text-[10px] text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[14px] text-amber-700">lock_open</span>
                            Handover OTP
                          </h5>
                          <p className="text-[9.5px] text-amber-700/80 leading-snug mt-1">
                            Share this OTP with the driver upon delivery to verify completion.
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
                          <span className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block mb-1">Seller Location</span>
                          <h5 className="font-bold text-[var(--color-text-primary)] text-[12px]">{selectedOrder.farmer?.name}</h5>
                          <p className="text-[10px] text-[var(--color-text-secondary)] leading-snug mt-1">
                            {selectedOrder.farmer?.location || 'Farmer dispatch location'}
                          </p>
                        </div>
                        <a
                          href={`tel:${selectedOrder.farmer?.phone}`}
                          className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[10.5px] font-bold rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
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
}

export default VendorTracking;
