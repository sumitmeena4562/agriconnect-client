import React, { useState, useEffect } from 'react';
import StatCard from '../../components/dashboard/StatCard';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

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
    coordinates: { lat: 22.7196, lng: 75.8577 },
  });

  const [weather, setWeather] = useState({
    temp: 27,
    humidity: 96,
    condition: 'Rainy / Shower',
    advisory: '🌧️ Heavy rain forecast: Ensure cargo tarp & packaging cover.',
  });

  const [loading, setLoading] = useState(true);
  const [processingOrderId, setProcessingOrderId] = useState(null);

  const firstName = localUser.name ? localUser.name.split(' ')[0] : 'Farmer';

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

  const fetchLiveWeather = async (coords) => {
    try {
      const lat = coords?.lat || 22.7196;
      const lng = coords?.lng || 75.8577;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m`);
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

        setWeather({
          temp,
          humidity: data.hourly?.relativehumidity_2m?.[0] || 96,
          condition,
          advisory
        });
      }
    } catch (e) {
      // Keep default weather state
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    const toastId = toast.loading('Accepting order...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'Accepted' });
      if (res.data.success) {
        toast.success(`Accepted! OTP: ${res.data.data?.deliveryOTP || 'Generated'}`, { id: toastId });
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

  return (
    <div className="space-y-3.5 pb-6 max-w-[1350px] mx-auto">
      {/* 1. Header & Quick Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-slate-100 pb-2.5">
        <div>
          <h1 className="text-[17px] font-black text-slate-850 tracking-tight leading-none">
            Hello, {firstName} <span className="inline-block animate-bounce text-[15px]">👋</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Real-time farm overview, live orders, fleet & load dispatch hub.
          </p>
        </div>

        {/* Quick Action Buttons - Compact */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/farmer-dashboard/crops/add"
            className="px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] rounded-lg shadow-2xs transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">add_circle</span>
            <span>Add Crop</span>
          </Link>
          <Link
            to="/farmer-dashboard/batches"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] rounded-lg shadow-2xs transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">alt_route</span>
            <span>Batch Orders</span>
          </Link>
          <Link
            to="/farmer-dashboard/freight-tracking"
            className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-250 text-emerald-750 hover:bg-emerald-100 font-black text-[10px] rounded-lg transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">local_shipping</span>
            <span>Track Freight</span>
          </Link>
        </div>
      </div>

      {/* KYC / Bank Alert Banner — Compact */}
      {!stats.hasBankDetails && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-50/90 border border-warning-200 rounded-xl p-2.5 px-3 flex items-center justify-between gap-2 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-warning-600 shrink-0">account_balance</span>
            <p className="text-[10px] text-warning-800 font-bold leading-tight">
              Bank Setup Incomplete — Add bank & UPI details to receive direct crop payouts.
            </p>
          </div>
          <Link to="/farmer-dashboard/profile" className="shrink-0 bg-warning-500 hover:bg-warning-600 text-white text-[9.5px] font-black py-1 px-3 rounded-md transition-all shadow-2xs">
            Complete Setup
          </Link>
        </motion.div>
      )}

      {/* 2. Key Stats Grid - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <StatCard 
          title="Total Earnings" 
          value={`₹${(stats.totalEarnings || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} 
          icon="account_balance_wallet" 
          color="primary" 
        />
        <StatCard 
          title="Active Stock" 
          value={`${(stats.totalStockKg || 0).toLocaleString()} kg`} 
          icon="grass" 
          color="info" 
        />
        <StatCard 
          title="Pending Orders" 
          value={String(stats.pendingOrdersCount || 0)} 
          icon="shopping_basket" 
          color="warning" 
        />
        <StatCard 
          title="Fleet Drivers" 
          value={`${stats.availableDriversCount || 0} / ${stats.driversCount || 0} Ready`} 
          icon="directions_car" 
          color="primary" 
        />
      </div>

      {/* 3. Main Dashboard Content Grid - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* Left Column: Orders & Active Batches */}
        <div className="lg:col-span-8 space-y-3">
          
          {/* Actionable Pending Orders Feed - Compact */}
          <div className="global-card p-3">
            <div className="flex items-center justify-between mb-2 border-b border-slate-50 pb-1.5">
              <h3 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-amber-500">pending_actions</span>
                Incoming Vendor Orders ({stats.pendingOrdersList?.length || 0})
              </h3>
              <Link to="/farmer-dashboard/orders" className="text-[9.5px] font-black text-primary-600 hover:text-primary-700">
                View All Orders →
              </Link>
            </div>

            {stats.pendingOrdersList?.length === 0 ? (
              <div className="py-3 px-3 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200/80 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-slate-300">check_circle</span>
                <p className="text-[10px] font-bold text-slate-400">No pending order requests. New vendor orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.pendingOrdersList.map(order => (
                  <div key={order._id} className="bg-slate-50/60 border border-slate-100 rounded-lg p-2.5 flex items-center justify-between gap-2 hover:border-slate-200 transition-all">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-black text-slate-850">{order.crop?.name || 'Crop'}</span>
                        <span className="text-[8.5px] font-mono font-bold bg-slate-100 text-slate-500 px-1 py-0.2 rounded">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">
                        Vendor: <strong className="text-slate-700">{order.vendor?.name || 'Vendor'}</strong> ({order.requestedQuantity} {order.crop?.unit || 'kg'} · ₹{order.totalAmount?.toLocaleString()})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={processingOrderId === order._id}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9.5px] rounded cursor-pointer transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order._id)}
                        disabled={processingOrderId === order._id}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-[9.5px] rounded border border-rose-200 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Dispatch & Driver Tracking Card - Compact */}
          {stats.activeBatches?.length > 0 && (
            <div className="global-card p-3 border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between mb-2 border-b border-slate-50 pb-1.5">
                <h3 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-indigo-600">route</span>
                  Active Batch Dispatches En Route ({stats.activeBatches.length})
                </h3>
                <Link to="/farmer-dashboard/freight-tracking" className="text-[9.5px] font-black text-indigo-600 hover:text-indigo-700">
                  Track Live Map →
                </Link>
              </div>

              <div className="space-y-2">
                {stats.activeBatches.map(batch => (
                  <div key={batch._id} className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10.5px] font-black text-slate-850">Batch #{batch._id.slice(-6).toUpperCase()}</span>
                        <span className="text-[8px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full border border-indigo-200">
                          {batch.batchStatus}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                        Driver: <strong className="text-slate-700">{batch.driver?.name || 'Assigned Driver'}</strong> ({batch.driver?.vehicleType} · {batch.driver?.vehicleNumber})
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/farmer-dashboard/load-planning/${batch._id}`)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9.5px] rounded shrink-0"
                    >
                      View Load Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Weather & Mandi Rates */}
        <div className="lg:col-span-4 space-y-3">
          
          {/* Live Weather Forecast Widget - Clean & Minimal */}
          <div className="global-card p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-sky-500">partly_cloudy_day</span>
                <h3 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider">
                  Farm Weather & Advisory
                </h3>
              </div>
              <span className="text-[8.5px] font-black text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-150 flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">location_on</span>
                {stats.locationName || 'Indore, MP'}
              </span>
            </div>

            <div className="my-2 flex items-baseline justify-between">
              <div>
                <span className="text-[28px] font-black text-slate-850 leading-none tracking-tight">
                  {weather.temp}°
                </span>
                <span className="text-[14px] font-bold text-slate-400 ml-0.5">C</span>
                <p className="text-[9.5px] font-bold text-slate-500 mt-0.5">
                  {weather.condition} · <span className="text-slate-400">Humidity {weather.humidity}%</span>
                </p>
              </div>
            </div>

            <div className="bg-sky-50/80 border border-sky-150 rounded-lg p-2 text-[9px] font-semibold text-sky-850 leading-snug flex items-start gap-1.5">
              <span className="text-[11px] shrink-0">🌾</span>
              <span>{weather.advisory}</span>
            </div>
          </div>

          {/* Mandi Rates Widget - Compact */}
          <div className="global-card p-3">
            <div className="flex justify-between items-center mb-2 border-b border-slate-50 pb-1.5">
              <div>
                <h3 className="text-[10.5px] font-black text-slate-800 leading-none">Live Mandi Prices</h3>
                <p className="text-[8.5px] font-semibold text-slate-400">Local market benchmarks</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {[
                { name: 'Wheat (Sharbati)', max: '₹2,650', trend: 2.5, icon: 'grass' },
                { name: 'Rice (Basmati)', max: '₹3,800', trend: 1.2, icon: 'eco' },
                { name: 'Fresh Tomato', max: '₹2,100', trend: -5.4, icon: 'nutrition' },
              ].map((crop, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 px-2 bg-slate-50/70 border border-slate-100 rounded-lg text-[9.5px]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px] text-emerald-600">{crop.icon}</span>
                    <span className="font-bold text-slate-800">{crop.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-700">{crop.max}/q</span>
                    <span className={`text-[8px] font-black px-1 py-0.2 rounded ${crop.trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {crop.trend > 0 ? '▲' : '▼'} {Math.abs(crop.trend)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FarmerDashboard;
