import React, { useState, useEffect } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import StatCardSkeleton from '../../components/dashboard/StatCardSkeleton';
import OrderCardSkeleton from '../../components/dashboard/OrderCardSkeleton';
import SkeletonBlock from '../../components/ui/SkeletonBlock';
import RevenueChart from '../../components/dashboard/RevenueChart';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { formatTimeAgo } from '../../utils/time';

/* ─── Batch status → theme color mapping ─── */
const getBatchStatusStyle = (status) => {
  switch (status) {
    case 'Dispatched': return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    case 'InTransit':  return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    case 'Delivered':  return 'bg-success-100 text-success-600 border-success-100';
    case 'Cancelled':  return 'bg-danger-100 text-danger-600 border-danger-100';
    default:           return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

/* ─── Weather emoji helper ─── */
const getWeatherEmoji = (condition) => {
  if (condition.includes('Rain')) return '🌧️';
  if (condition.includes('Cloud')) return '⛅';
  return '☀️';
};

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const localUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeCropsCount: 0,
    totalStockKg: 0,
    pendingOrdersCount: 0,
    totalOrdersCount: 0,
    driversCount: 0,
    availableDriversCount: 0,
    pendingOrdersList: [],
    activeBatches: [],
    hasBankDetails: false,
    locationName: 'Indore, MP',
    coordinates: { lat: 22.7196, lng: 75.8577 },
  });

  const [topCrops, setTopCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(true);

  const [weather, setWeather] = useState({
    temp: 27,
    humidity: 96,
    condition: 'Rainy / Shower',
    advisory: '🌧️ Heavy rain forecast: Ensure cargo tarp & packaging cover.',
  });

  const [usingGps, setUsingGps] = useState(false);
  const [gpsLocationName, setGpsLocationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const firstName = localUser.name ? localUser.name.split(' ')[0] : 'Farmer';

  /* ─── Humidity: use current hour index, not [0] ─── */
  const getCurrentHumidity = (hourlyData) => {
    const currentHour = new Date().getHours();
    return hourlyData?.relativehumidity_2m?.[currentHour] ?? 96;
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/farmers/stats');
      if (res.data.success) {
        setStats(res.data.data);
        fetchLiveWeather(res.data.data.coordinates);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopCrops = async () => {
    setCropsLoading(true);
    try {
      const res = await api.get('/crops?sort=newest&limit=3&page=1');
      if (res.data?.data) setTopCrops(res.data.data.slice(0, 3));
    } catch (err) {
      // Silent fail — not critical for dashboard
    } finally {
      setCropsLoading(false);
    }
  };

  const fetchLiveWeather = async (coords, isGps = false, customLocName = '') => {
    try {
      const lat = coords?.lat || 22.7196;
      const lng = coords?.lng || 75.8577;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m`
      );
      if (res.ok) {
        const data = await res.json();
        const temp = Math.round(data.current_weather?.temperature || 27);
        const code = data.current_weather?.weathercode || 0;

        let condition = 'Sunny / Clear';
        let advisory  = '🌾 Clear weather for harvest & batch shipment.';
        if (code >= 51 && code <= 99) {
          condition = 'Rainy / Shower';
          advisory  = '🌧️ Heavy rain forecast: Ensure cargo tarp & packaging cover.';
        } else if (code >= 1 && code <= 3) {
          condition = 'Partly Cloudy';
          advisory  = '⛅ Mild clouds: Good conditions for field work.';
        }

        setWeather({ temp, humidity: getCurrentHumidity(data.hourly), condition, advisory });
        if (isGps && customLocName) setGpsLocationName(customLocName);
      }
    } catch (e) {
      // Keep default weather state
    }
  };

  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    const toastId = toast.loading('Detecting high-precision GPS location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUsingGps(true);
        let detectedCity = '📍 Live GPS Location';
        try {
          const bdcRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`
          );
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            const locality = bdcData.locality || bdcData.localityInfo?.informative?.[0]?.name || '';
            const city = bdcData.city || bdcData.localityInfo?.administrative?.[2]?.name || bdcData.principalSubdivision || '';
            const state = bdcData.principalSubdivision || 'MP';
            if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
              detectedCity = `📍 ${locality}, ${city}`;
            } else if (city) {
              detectedCity = `📍 ${city}, ${state}`;
            } else if (locality) {
              detectedCity = `📍 ${locality}`;
            }
          }
        } catch (e) {
          try {
            const revRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&zoom=18`
            );
            if (revRes.ok) {
              const revData = await revRes.json();
              const village = revData.address?.village || revData.address?.suburb || revData.address?.town || revData.address?.city;
              if (village) detectedCity = `📍 ${village}`;
            }
          } catch (err) {}
        }
        fetchLiveWeather(coords, true, detectedCity);
        toast.success(`Weather updated for ${detectedCity}!`, { id: toastId, duration: 4000 });
      },
      () => {
        toast.error('Could not access device GPS. Using registered profile location.', { id: toastId });
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const [showLocSearch, setShowLocSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  const handleSearchVillageLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchingLoc(true);
    const toastId = toast.loading(`Searching location for "${searchQuery}"...`);
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}+Madhya+Pradesh+India&format=json&limit=1`
      );
      if (geoRes.ok) {
        const data = await geoRes.json();
        if (data && data.length > 0) {
          const item = data[0];
          const lat = parseFloat(item.lat);
          const lng = parseFloat(item.lon);
          const parts = item.display_name.split(',');
          const locName = `📍 ${parts[0].trim()}${parts[1] ? `, ${parts[1].trim()}` : ''}`;
          localStorage.setItem('custom_weather_location', JSON.stringify({ name: locName, lat, lng }));
          setUsingGps(true);
          fetchLiveWeather({ lat, lng }, true, locName);
          setShowLocSearch(false);
          setSearchQuery('');
          toast.success(`Weather updated for ${locName}!`, { id: toastId, duration: 4000 });
        } else {
          toast.error(`Location "${searchQuery}" not found. Try nearby town or district name.`, { id: toastId });
        }
      }
    } catch (err) {
      toast.error('Failed to search location', { id: toastId });
    } finally {
      setIsSearchingLoc(false);
    }
  };

  useEffect(() => {
    const savedLocStr = localStorage.getItem('custom_weather_location');
    if (savedLocStr) {
      try {
        const savedLoc = JSON.parse(savedLocStr);
        if (savedLoc?.lat && savedLoc?.lng) {
          setUsingGps(true);
          setGpsLocationName(savedLoc.name);
          fetchLiveWeather({ lat: savedLoc.lat, lng: savedLoc.lng }, true, savedLoc.name);
        }
      } catch (e) {}
    }
    fetchDashboardStats();
    fetchTopCrops();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    const toastId = toast.loading('Accepting order...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'Accepted' });
      if (res.data.success) {
        toast.success(`Accepted! OTP: ${res.data.data?.deliveryOTP || 'Generated'}`, { id: toastId, duration: 5000 });
        fetchDashboardStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept order', { id: toastId });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    const toastId = toast.loading('Rejecting order...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'Rejected' });
      if (res.data.success) {
        toast.success('Order rejected', { id: toastId });
        fetchDashboardStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject', { id: toastId });
    } finally {
      setProcessingOrderId(null);
    }
  };

  /* ─── Fleet Drivers label ─── */
  const fleetValue = stats.driversCount === 0
    ? 'No Drivers'
    : `${stats.availableDriversCount}/${stats.driversCount} Ready`;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8 max-w-[1400px] mx-auto px-1 sm:px-2">

      {/* ── 1. Header & Quick Action Toolbar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-[19px] sm:text-[22px] font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
            Hello, {firstName} <span className="inline-block animate-bounce text-[18px]">👋</span>
          </h1>
          <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium mt-1">
            Real-time farm overview, live orders, fleet & load dispatch hub.
          </p>
        </div>

        {/* Quick Action Buttons — all theme-colored & consistent */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full lg:w-auto">
          <Link
            to="/farmer-dashboard/crops/new"
            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            <span className="truncate">Add Crop</span>
          </Link>
          <Link
            to="/farmer-dashboard/batches"
            className="px-3 py-2 bg-secondary-600 hover:bg-secondary-700 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">alt_route</span>
            <span className="truncate">Batch Orders</span>
          </Link>
          <Link
            to="/farmer-dashboard/tracking"
            className="px-3 py-2 bg-info-600 hover:bg-info-700 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">local_shipping</span>
            <span className="truncate">Track Freight</span>
          </Link>
        </div>
      </div>

      {/* ── KYC / Bank Setup Alert Banner ── */}
      {!stats.hasBankDetails && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent-50 border border-accent-200 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center shrink-0 border border-accent-200">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
            <div>
              <h4 className="text-[12px] font-black text-accent-900 leading-none mb-0.5">Bank Setup Incomplete</h4>
              <p className="text-[10.5px] text-accent-800 font-semibold leading-normal">
                Add bank & UPI details to start receiving direct vendor payouts.
              </p>
            </div>
          </div>
          <Link
            to="/farmer-dashboard/profile"
            className="shrink-0 w-full sm:w-auto bg-accent-600 hover:bg-accent-700 text-white text-[10.5px] font-black py-1.5 px-3.5 rounded-xl transition-all text-center shadow-sm"
          >
            Complete Setup
          </Link>
        </motion.div>
      )}

      {/* ── 2. Key Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Earnings"
              value={`₹${(stats.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
              icon="account_balance_wallet"
              color="primary"
              to="/farmer-dashboard/bank"
            />
            <StatCard
              title="Stock Valuation"
              value={`₹${(topCrops.length > 0 ? topCrops.reduce((acc, c) => acc + ((c.pricePerUnit || 0) * (c.stockQuantity || 0)), 0) : (stats.totalStockKg ? stats.totalStockKg * 25 : 0)).toLocaleString('en-IN')}`}
              icon="payments"
              color="info"
              to="/farmer-dashboard/crops"
            />
            <StatCard
              title="Pending Orders"
              value={String(stats.pendingOrdersCount || 0)}
              icon="shopping_basket"
              color="warning"
              to="/farmer-dashboard/orders"
            />
            <StatCard
              title="Fleet Drivers"
              value={fleetValue}
              icon="directions_car"
              color="primary"
              to="/farmer-dashboard/fleet"
            />
          </>
        )}
      </div>

      {/* ── Mandi Price Surge Recommendation Banner ── */}
      <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-emerald-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[12px] font-black text-white leading-none">🔥 Market Price Surge Alert</h4>
              <span className="bg-emerald-400/20 text-emerald-300 text-[8.5px] font-black px-1.5 py-0.5 rounded border border-emerald-400/30 uppercase">Indore Mandi</span>
            </div>
            <p className="text-[10.5px] text-emerald-100/90 font-medium leading-normal mt-0.5">
              Wheat (Sharbati) prices are up <strong className="text-emerald-300">+2.5%</strong> today (₹2,650/q). Great time to list fresh harvest stock!
            </p>
          </div>
        </div>
        <Link
          to="/farmer-dashboard/crops/new"
          className="shrink-0 w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-[10.5px] font-black py-1.5 px-3.5 rounded-lg transition-all text-center shadow-sm flex items-center justify-center gap-1"
        >
          <span>List Stock Now</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
      </div>

      {/* ── 3. Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">

        {/* Left Column — Revenue Chart, Orders, Batches, My Crops (col-span-8) */}
        <div className="lg:col-span-8 space-y-4">

          {/* Revenue Analytics Curve Chart */}
          <RevenueChart totalEarnings={stats.totalEarnings} />

          {/* Incoming Vendor Orders Feed */}
          <div className="global-card p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-[11px] sm:text-[12px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-accent-500">pending_actions</span>
                Incoming Vendor Orders ({stats.pendingOrdersList?.length || 0})
              </h3>
              <Link to="/farmer-dashboard/orders" className="text-[10px] font-black text-primary-600 hover:text-primary-700">
                View All Orders →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2.5">
                <OrderCardSkeleton />
                <OrderCardSkeleton />
              </div>
            ) : stats.pendingOrdersList?.length === 0 ? (
              <div className="py-4 px-3 text-center bg-slate-50/70 rounded-xl border border-dashed border-slate-200 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-400">check_circle</span>
                <p className="text-[10.5px] font-bold text-slate-500">No pending order requests. New vendor orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.pendingOrdersList.map(order => (
                  <div key={order._id} className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-200 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-black text-slate-900">{order.crop?.name || 'Crop'}</span>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        {order.createdAt && (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {formatTimeAgo(order.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Vendor: <strong className="text-slate-700">{order.vendor?.name || 'Vendor'}</strong>
                        {' '}({order.requestedQuantity} {order.crop?.unit || 'kg'} · ₹{order.totalAmount?.toLocaleString()})
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={processingOrderId === order._id}
                        className="px-3 py-1.5 bg-success-600 hover:bg-success-500 text-white font-black text-[10px] rounded-lg cursor-pointer transition-colors shadow-sm disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order._id)}
                        disabled={processingOrderId === order._id}
                        className="px-2.5 py-1.5 bg-danger-50 hover:bg-danger-100 text-danger-600 font-black text-[10px] rounded-lg border border-danger-100 cursor-pointer transition-colors disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Batch Dispatches — always visible */}
          <div className={`global-card p-3.5 sm:p-4 border-l-4 ${stats.activeBatches?.length > 0 ? 'border-l-secondary-500' : 'border-l-slate-200'}`}>
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-[11px] sm:text-[12px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className={`material-symbols-outlined text-[16px] ${stats.activeBatches?.length > 0 ? 'text-secondary-600' : 'text-slate-400'}`}>route</span>
                Active Batch Dispatches En Route ({stats.activeBatches?.length || 0})
              </h3>
              <Link to="/farmer-dashboard/tracking" className="text-[10px] font-black text-secondary-600 hover:text-secondary-700">
                Track Live Map →
              </Link>
            </div>

            {loading ? (
              <SkeletonBlock className="h-14 w-full" />
            ) : stats.activeBatches?.length === 0 ? (
              <div className="py-5 text-center flex flex-col items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-slate-400">local_shipping</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-600">No active dispatches en route.</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Create a batch to start shipping produce to vendors.</p>
                </div>
                <Link
                  to="/farmer-dashboard/batches"
                  className="mt-1 px-3.5 py-1.5 bg-secondary-600 hover:bg-secondary-700 text-white font-black text-[10px] rounded-lg transition-colors shadow-sm"
                >
                  Create Batch
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.activeBatches.map(batch => (
                  <div key={batch._id} className="bg-secondary-50/40 border border-secondary-100 rounded-xl p-3 space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11.5px] font-black text-slate-900">Batch #{batch._id.slice(-6).toUpperCase()}</span>
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border ${getBatchStatusStyle(batch.batchStatus)}`}>
                            {batch.batchStatus}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">
                          Driver: <strong className="text-slate-700">{batch.driver?.name || 'Assigned Driver'}</strong>
                          {' '}({batch.driver?.vehicleType || 'Truck'} · {batch.driver?.vehicleNumber || 'MP-09-AB1234'})
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/farmer-dashboard/batches/${batch._id}/load-plan`)}
                        className="px-3 py-1.5 bg-secondary-600 hover:bg-secondary-700 text-white font-black text-[10px] rounded-lg shrink-0 cursor-pointer shadow-sm transition-colors"
                      >
                        View Load Plan
                      </button>
                    </div>

                    {/* Vehicle Capacity Utilization Progress Bar */}
                    <div className="bg-white/80 border border-secondary-100 rounded-lg p-2 text-[9.5px]">
                      <div className="flex justify-between items-center mb-1 font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-secondary-600">inventory_2</span>
                          Vehicle Capacity Filled
                        </span>
                        <span className="text-secondary-700 font-black">78% (780 kg / 1000 kg)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary-600 rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Crops Mini-Summary */}
          <div className="global-card p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h3 className="text-[11px] sm:text-[12px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary-600">yard</span>
                My Active Crops ({stats.activeCropsCount || 0})
              </h3>
              <Link to="/farmer-dashboard/crops" className="text-[10px] font-black text-primary-600 hover:text-primary-700">
                View All Crops →
              </Link>
            </div>

            {cropsLoading ? (
              <div className="space-y-2">
                <SkeletonBlock className="h-10 w-full" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            ) : topCrops.length === 0 ? (
              <div className="py-4 text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[24px] text-slate-300">grass</span>
                <p className="text-[10.5px] font-bold text-slate-500">No crops listed yet.</p>
                <Link
                  to="/farmer-dashboard/crops/new"
                  className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] rounded-lg transition-colors shadow-sm"
                >
                  Add First Crop
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {topCrops.map(crop => (
                  <div key={crop._id} className="flex items-center justify-between p-2.5 px-3 bg-primary-50 border border-primary-100 rounded-xl hover:border-primary-200 transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-primary-700">grass</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-800 leading-none truncate">{crop.name}</p>
                        <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">{crop.stockQuantity} {crop.unit} available</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-black text-slate-700">
                        ₹{crop.pricePerUnit?.toLocaleString('en-IN')}
                        <span className="text-[9px] font-semibold text-slate-400">/{crop.unit}</span>
                      </span>
                      <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${crop.status === 'Active' ? 'bg-success-50 text-success-600' : 'bg-slate-100 text-slate-500'}`}>
                        {crop.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column — Weather & Mandi Rates (col-span-4) */}
        <div className="lg:col-span-4 space-y-4">

          {/* Live Weather Forecast Widget */}
          <div className="global-card overflow-hidden">
            <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-info-500">partly_cloudy_day</span>
                <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-wide whitespace-nowrap">
                  Farm Weather & Advisory
                </h3>
              </div>

              {/* Location controls */}
              <div className="flex items-stretch gap-1.5 mt-2 h-7">
                <button
                  onClick={handleDetectGpsLocation}
                  aria-label="Detect live GPS location for weather"
                  className="flex items-center gap-1.5 px-2.5 bg-info-50 border border-info-200 rounded-md text-[9px] font-black text-info-700 hover:bg-info-100 transition-colors cursor-pointer flex-1 min-w-0"
                  title="Detect Live GPS Location"
                >
                  <span className="material-symbols-outlined text-[12px] text-info-500 shrink-0 animate-pulse">my_location</span>
                  <span className="truncate leading-none">
                    {usingGps ? (gpsLocationName || '📍 Live GPS') : (stats.locationName || 'Indore, MP')}
                  </span>
                </button>
                <button
                  onClick={() => setShowLocSearch(!showLocSearch)}
                  aria-label={showLocSearch ? 'Close location search' : 'Search by village or city name'}
                  className={`flex items-center justify-center w-7 rounded-md border transition-colors shrink-0 ${showLocSearch ? 'bg-info-100 border-info-300 text-info-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-info-600 hover:bg-info-50'}`}
                  title="Search by Village / City Name"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {showLocSearch ? 'close' : 'search'}
                  </span>
                </button>
              </div>

              {showLocSearch && (
                <form onSubmit={handleSearchVillageLocation} className="mt-2 flex items-center gap-1.5">
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Village / City name (e.g. Kolari)"
                    className="form-input flex-1 min-w-0 !h-8 !text-[10px]"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingLoc}
                    className="px-2.5 py-1.5 bg-info-600 hover:bg-info-700 disabled:opacity-60 text-white font-black text-[9.5px] rounded-lg cursor-pointer transition-colors shrink-0"
                  >
                    {isSearchingLoc ? '...' : 'Go'}
                  </button>
                </form>
              )}
            </div>

            {/* Temperature & Condition */}
            <div className="px-3.5 py-3 flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[32px] font-black text-slate-900 leading-none tracking-tight">
                    {weather.temp}°
                  </span>
                  <span className="text-[14px] font-bold text-slate-400 mb-0.5">C</span>
                </div>
                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">
                  {weather.condition} · Humidity {weather.humidity}%
                </p>
              </div>
              <span className="text-[36px] opacity-20 select-none">
                {getWeatherEmoji(weather.condition)}
              </span>
            </div>

            {/* Advisory Banner */}
            <div className="mx-3.5 mb-3.5 bg-info-50 border border-info-100 rounded-xl px-3 py-2 text-[9.5px] font-semibold text-info-900 leading-snug flex items-start gap-1.5">
              <span className="shrink-0">{getWeatherEmoji(weather.condition)}</span>
              <span>{weather.advisory}</span>
            </div>
          </div>

          {/* Mandi Market Rates */}
          <div className="global-card p-3.5">
            <div className="flex justify-between items-start mb-2.5 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-[11px] font-black text-slate-800 leading-none">Mandi Market Rates</h3>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Reference benchmarks · Updated today</p>
              </div>
              <span className="badge badge-accent shrink-0">Market Ref</span>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Wheat (Sharbati)', max: '₹2,650', trend: 2.5,  icon: 'grass'     },
                { name: 'Rice (Basmati)',   max: '₹3,800', trend: 1.2,  icon: 'eco'       },
                { name: 'Fresh Tomato',     max: '₹2,100', trend: -5.4, icon: 'nutrition' },
              ].map((crop, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 px-2.5 bg-slate-50/70 border border-slate-100 rounded-xl text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-primary-600">{crop.icon}</span>
                    <span className="font-bold text-slate-800">{crop.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-700">{crop.max}/q</span>
                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded ${crop.trend > 0 ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'}`}>
                      {crop.trend > 0 ? '▲' : '▼'} {Math.abs(crop.trend)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[8.5px] text-slate-400 font-medium mt-2.5 text-center">
              * Reference rates only. Check local mandi for actual prices.
            </p>
          </div>

          {/* Direct Bank Payout & Settlement Status Widget */}
          <div className="global-card p-3.5">
            <div className="flex justify-between items-center mb-2.5 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-[11px] font-black text-slate-800 leading-none">Bank Payout Settlement</h3>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">Direct UPI / Bank Transfer Status</p>
              </div>
              <Link to="/farmer-dashboard/bank" className="text-[9.5px] font-black text-primary-600 hover:text-primary-700">
                View Account →
              </Link>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 bg-success-50 border border-success-100 rounded-xl flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-success-100 text-success-700 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 leading-none">₹14,500 Disbursed</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5">Order #982A1 • HDFC Bank ****4921</p>
                  </div>
                </div>
                <span className="badge badge-success text-[8px]">SETTLED</span>
              </div>

              <div className="p-2.5 bg-accent-50 border border-accent-100 rounded-xl flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-accent-100 text-accent-700 flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
                  </div>
                  <div>
                    <p className="font-black text-slate-800 leading-none">₹8,200 Processing</p>
                    <p className="text-[9px] text-slate-500 font-medium mt-0.5">Order #983B4 • Expected today</p>
                  </div>
                </div>
                <span className="badge badge-accent text-[8px]">PROCESSING</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
