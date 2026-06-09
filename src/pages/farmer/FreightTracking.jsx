import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const FreightTracking = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('order'); // 'order' | 'driver' | 'vehicle' | 'customer' | 'docs'

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
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

      // Check if driverId query parameter is present to auto-select
      const driverIdParam = searchParams.get('driverId');
      if (driverIdParam && activeTransit.length > 0) {
        const matchingOrder = activeTransit.find(o => o.driver?._id === driverIdParam);
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
      toast.error('Failed to load active shipments');
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

  // 4. Draw/Redraw map when mapLoaded or trackingData changes
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

      // CartoDB Positron Tiles for sleek premium gray aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(map);
    }

    const map = mapInstanceRef.current;

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
      const icon = createHtmlIcon('agriculture', 'bg-emerald-600', 'My Farm');
      startMarkerRef.current = L.marker(trackingData.startCoords, { icon })
        .addTo(map)
        .bindPopup("<b>My Farm (Seller)</b><br/>Dispatch Origin");
    }

    // Update or Create Vendor (End) Marker
    if (endMarkerRef.current) {
      endMarkerRef.current.setLatLng(trackingData.endCoords);
    } else {
      const icon = createHtmlIcon('storefront', 'bg-blue-600', 'Vendor Shop');
      endMarkerRef.current = L.marker(trackingData.endCoords, { icon })
        .addTo(map)
        .bindPopup(`<b>${selectedOrder?.vendor?.name || 'Vendor'}</b><br/>Delivery Destination`);
    }

    // Draw Route Polyline
    if (polylineRef.current) {
      polylineRef.current.setLatLngs(trackingData.route);
    } else {
      polylineRef.current = L.polyline(trackingData.route, {
        color: 'var(--color-primary-500, #22c55e)',
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

  }, [mapLoaded, trackingData]);

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
          <span>🚚</span> Live Fleet Tracking
        </h1>
        <p className="text-[11.5px] text-[var(--color-text-secondary)] font-medium">
          Monitor your dispatched shipments, drivers, and delivery routes in real time.
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
          <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">No Active Shipments</h3>
          <p className="text-[11.5px] text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
            There are no orders currently "In Transit" or "Arrived". Go to your Orders list to assign drivers and dispatch accepted orders.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel: Shipments List (Col Span 4) */}
          <div className="lg:col-span-4 space-y-3 flex flex-col max-h-[720px]">
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 shadow-sm flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider">
                Active Shipments ({activeTransitOrders.length})
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-[9px] font-bold animate-pulse">
                LIVE
              </span>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 max-h-[600px] pr-1">
              {activeTransitOrders.map((order) => {
                const isSelected = selectedOrder?._id === order._id;
                return (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer shadow-sm relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/10 ring-1 ring-primary-500/10'
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
                          : 'bg-primary-50 text-primary-700 border border-primary-100'
                      }`}>
                        {order.deliveryStatus || 'In Transit'}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[10.5px] text-[var(--color-text-secondary)]">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">local_shipping</span>
                        <span className="truncate font-semibold">
                          {order.driver ? order.driver.name : 'Self-Delivery'}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-[var(--color-text-primary)]">
                        {order.requestedQuantity} {order.crop?.unit}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-[var(--color-text-muted)] font-semibold">
                      <span className="truncate max-w-[100px]">{order.farmer?.location || 'My Farm'}</span>
                      <span className="text-[12px] font-normal text-slate-300">➔</span>
                      <span className="truncate max-w-[100px] text-right">{order.crop?.location}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Map & Tabs Detail View (Col Span 8) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedOrder && (
              <>
                {/* 1. Dynamic Info Badges Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Current Location */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Current Location</span>
                    <span className="text-[12px] font-bold text-[var(--color-text-primary)] mt-1 truncate">
                      {trackingData?.deliveryStatus === 'Arrived' ? 'At Destination' : 'In Transit Route'}
                    </span>
                  </div>

                  {/* Speed */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Current Speed</span>
                    <span className="text-[12px] font-bold text-[var(--color-text-primary)] mt-1">
                      {getSpeed()}
                    </span>
                  </div>

                  {/* Distance Covered Percentage */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Transit Distance</span>
                    <span className="text-[12px] font-bold text-[var(--color-text-primary)] mt-1">
                      {getDistancePercent()} Covered
                    </span>
                  </div>

                  {/* ETA */}
                  <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-xl shadow-sm flex flex-col justify-between">
                    <span className="text-[8.5px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Estimated ETA</span>
                    <span className="text-[12px] font-black text-primary-600 mt-1">
                      {trackingData ? formatEta(trackingData.etaSeconds) : 'Calculating...'}
                    </span>
                  </div>
                </div>

                {/* 2. Interactive Map */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-[var(--color-text-secondary)] tracking-wider">
                      Live Route Map
                    </span>
                    <span className="text-[9.5px] font-semibold text-[var(--color-text-secondary)] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Auto-refreshing every 3s
                    </span>
                  </div>
                  <div className="h-[340px] relative bg-slate-100">
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[11px] font-bold text-slate-500">Loading Map components...</span>
                      </div>
                    )}
                    <div ref={mapRef} className="w-full h-full z-0" id="tracking-map-canvas" />
                  </div>
                </div>

                {/* 3. Detail Tabs System */}
                <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex border-b border-[var(--color-border)] overflow-x-auto bg-[var(--color-bg-subtle)] text-[11px] font-bold">
                    <button
                      onClick={() => setActiveTab('order')}
                      className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                        activeTab === 'order'
                          ? 'border-primary-600 text-primary-600 bg-white'
                          : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >Order Details</button>
                    <button
                      onClick={() => setActiveTab('driver')}
                      className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                        activeTab === 'driver'
                          ? 'border-primary-600 text-primary-600 bg-white'
                          : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >Driver Info</button>
                    <button
                      onClick={() => setActiveTab('vehicle')}
                      className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                        activeTab === 'vehicle'
                          ? 'border-primary-600 text-primary-600 bg-white'
                          : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >Vehicle Specs</button>
                    <button
                      onClick={() => setActiveTab('customer')}
                      className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                        activeTab === 'customer'
                          ? 'border-primary-600 text-primary-600 bg-white'
                          : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >Customer Details</button>
                  </div>

                  <div className="p-4 text-[12px] text-[var(--color-text-secondary)] min-h-[140px] bg-white">
                    {/* Order Details Tab */}
                    {activeTab === 'order' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Crop Name</p>
                          <p className="font-bold text-[var(--color-text-primary)] mt-0.5">{selectedOrder.crop?.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Fulfillment Quantity</p>
                          <p className="font-bold text-[var(--color-text-primary)] mt-0.5">{selectedOrder.requestedQuantity} {selectedOrder.crop?.unit}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Total Amount</p>
                          <p className="font-bold text-[var(--color-text-primary)] mt-0.5">₹{(selectedOrder.requestedQuantity * selectedOrder.offeredPrice).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Payment Preference</p>
                          <p className="font-semibold text-slate-700 mt-0.5 text-[10.5px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50 w-fit">
                            {selectedOrder.crop?.paymentTerms}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Driver Info Tab */}
                    {activeTab === 'driver' && (
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        {selectedOrder.driver ? (
                          <>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                <span className="material-symbols-outlined text-[22px]">person</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-[var(--color-text-primary)] text-[13px]">{selectedOrder.driver.name}</h4>
                                <p className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-0.5">Fleet registered carrier</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <a
                                href={`tel:${selectedOrder.driver.phone}`}
                                className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-full h-8 px-4 text-emerald-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">call</span>
                                <span>Call Driver</span>
                              </a>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[22px]">directions_run</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-[var(--color-text-primary)] text-[13px]">Self-Delivery (Farmer)</h4>
                              <p className="text-[10.5px] text-[var(--color-text-secondary)] mt-0.5">You are fulfilling this crop delivery personally.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vehicle Tab */}
                    {activeTab === 'vehicle' && (
                      <div>
                        {selectedOrder.driver ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Vehicle Number</p>
                              <p className="font-mono font-bold text-[var(--color-text-primary)] mt-0.5 uppercase tracking-wide bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded w-fit">
                                {selectedOrder.driver.vehicleNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">Vehicle Type</p>
                              <p className="font-bold text-[var(--color-text-primary)] mt-0.5">{selectedOrder.driver.vehicleType}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text(--color-text-muted)">Payload Capacity</p>
                              <p className="font-bold text-[var(--color-text-primary)] mt-0.5">{(selectedOrder.driver.payloadCapacity || 0).toLocaleString()} kg</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase text-[var(--color-text-muted)]">DL Number</p>
                              <p className="font-mono font-bold text-[var(--color-text-primary)] mt-0.5 uppercase">{selectedOrder.driver.licenseNumber || 'None'}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic text-center py-4">No driver vehicle specs to show for self-delivery.</p>
                        )}
                      </div>
                    )}

                    {/* Customer Tab */}
                    {activeTab === 'customer' && (
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[22px]">storefront</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-[var(--color-text-primary)] text-[13px]">{selectedOrder.vendor?.name}</h4>
                            <p className="text-[10.5px] text-[var(--color-text-secondary)] mt-0.5 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-red-500">location_on</span>
                              {selectedOrder.crop?.location} (Destination)
                            </p>
                          </div>
                        </div>
                        <a
                          href={`tel:${selectedOrder.vendor?.phone}`}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-full h-8 px-4 text-blue-700 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">call</span>
                          <span>Call Customer</span>
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

export default FreightTracking;
