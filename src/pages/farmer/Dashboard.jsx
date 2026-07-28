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
    temp: 32,
    humidity: 45,
    condition: 'Partly Cloudy',
    advisory: '🌾 Clear skies expected: Ideal for crop harvesting & open batch dispatch.',
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
        const temp = Math.round(data.current_weather?.temperature || 32);
        const code = data.current_weather?.weathercode || 0;
        
        let condition = 'Sunny / Clear';
        let advisory  = '🌾 Ideal weather for harvest & batch shipment dispatch.';
        if (code >= 51 && code <= 99) {
          condition = 'Rainy / Shower';
          advisory  = '🌧️ Heavy rain forecast: Ensure cargo tarp & packaging cover.';
        } else if (code >= 1 && code <= 3) {
          condition = 'Partly Cloudy';
          advisory  = '⛅ Mild cloud cover: Good conditions for open field operations.';
        }

        setWeather({
          temp,
          humidity: data.hourly?.relativehumidity_2m?.[0] || 50,
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

  // Handle Order Accept directly from Dashboard
  const handleAcceptOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    const toastId = toast.loading('Accepting order & generating handover OTP...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'Accepted' });
      if (res.data.success) {
        toast.success(`Order accepted! Handover OTP: ${res.data.data?.deliveryOTP || 'Generated'}`, { id: toastId, duration: 6000 });
        fetchDashboardStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept order', { id: toastId });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Handle Order Reject
  const handleRejectOrder = async (orderId) => {
    setProcessingOrderId(orderId);
    const toastId = toast.loading('Rejecting order request...');
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: 'Rejected' });
      if (res.data.success) {
        toast.success('Order request rejected', { id: toastId });
        fetchDashboardStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reject order', { id: toastId });
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header & Quick Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-black text-slate-850 tracking-tight leading-none">
            Hello, {firstName} <span className="inline-block animate-bounce text-[18px]">👋</span>
          </h1>
          <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium mt-1">
            Real-time farm overview, live orders, fleet & load dispatch hub.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/farmer-dashboard/crops/add"
            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white font-black text-[11px] rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">add_circle</span>
            <span>Add Crop</span>
          </Link>
          <Link
            to="/farmer-dashboard/batches"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-[11px] rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">alt_route</span>
            <span>Batch Orders</span>
          </Link>
          <Link
            to="/farmer-dashboard/freight-tracking"
            className="px-3 py-2 bg-emerald-50 border border-emerald-250 text-emerald-750 hover:bg-emerald-100 font-black text-[11px] rounded-xl transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">local_shipping</span>
            <span>Track Freight</span>
          </Link>
        </div>
      </div>

      {/* KYC / Bank Details Alert Banner — shown ONLY if bank details are missing */}
      {!stats.hasBankDetails && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-50 border border-warning-250 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-warning-100 flex items-center justify-center shrink-0 border border-warning-200">
              <span className="material-symbols-outlined text-[20px] text-warning-600">account_balance</span>
            </div>
            <div>
              <h3 className="text-[13px] font-black text-warning-850 leading-none mb-1">Bank Setup Incomplete</h3>
              <p className="text-[10.5px] text-warning-750 font-semibold leading-relaxed">
                Add your bank account & UPI details to receive direct payouts from vendor crop purchases.
              </p>
            </div>
          </div>
          <Link to="/farmer-dashboard/profile" className="shrink-0 w-full sm:w-auto bg-warning-500 hover:bg-warning-600 text-white text-[11px] font-black py-2 px-4 rounded-xl transition-all text-center shadow-xs">
            Complete Setup Now
          </Link>
        </motion.div>
      )}

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Left Column: Live Action Feed & Active Dispatches */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Actionable Pending Orders Feed */}
          <div className="global-card p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-[13px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-500">pending_actions</span>
                  Incoming Vendor Orders ({stats.pendingOrdersList?.length || 0})
                </h3>
              </div>
              <Link to="/farmer-dashboard/orders" className="text-[10px] font-black text-primary-600 hover:text-primary-700">
                View All Orders →
              </Link>
            </div>

            {stats.pendingOrdersList?.length === 0 ? (
              <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <span className="material-symbols-outlined text-[28px] text-slate-300">check_circle</span>
                <p className="text-[11px] font-bold text-slate-500 mt-1">No pending order requests</p>
                <p className="text-[9.5px] text-slate-400">New vendor purchase requests will appear here instantly.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.pendingOrdersList.map(order => (
                  <div key={order._id} className="bg-slate-50/60 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-200 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-black text-slate-850">{order.crop?.name || 'Crop'}</span>
                        <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded border border-slate-200">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Vendor: <strong className="text-slate-700">{order.vendor?.name || 'Vendor'}</strong> ({order.vendor?.phone})
                      </p>
                      <p className="text-[9.5px] font-bold text-emerald-600 mt-0.5">
                        Qty: {order.requestedQuantity} {order.crop?.unit || 'kg'} · Total: ₹{order.totalAmount?.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleAcceptOrder(order._id)}
                        disabled={processingOrderId === order._id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg shadow-2xs cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">check</span>
                        <span>Accept & OTP</span>
                      </button>
                      <button
                        onClick={() => handleRejectOrder(order._id)}
                        disabled={processingOrderId === order._id}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-black text-[10px] rounded-lg cursor-pointer transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Dispatch & Driver Tracking Widget */}
          {stats.activeBatches?.length > 0 && (
            <div className="global-card p-4 border-l-4 border-l-indigo-500">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">route</span>
                  Active Batch Dispatches En Route ({stats.activeBatches.length})
                </h3>
                <Link to="/farmer-dashboard/freight-tracking" className="text-[10px] font-black text-indigo-600 hover:text-indigo-700">
                  Track Live Map →
                </Link>
              </div>

              <div className="space-y-2.5">
                {stats.activeBatches.map(batch => (
                  <div key={batch._id} className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-850">Batch #{batch._id.slice(-6).toUpperCase()}</span>
                        <span className="text-[8.5px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                          {batch.batchStatus}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-500 font-semibold mt-1">
                        Driver: <strong className="text-slate-700">{batch.driver?.name || 'Assigned Driver'}</strong> ({batch.driver?.vehicleType} · {batch.driver?.vehicleNumber})
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/farmer-dashboard/load-planning/${batch._id}`)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] rounded-lg shadow-2xs cursor-pointer transition-colors"
                    >
                      View Load Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Live Weather & Mandi Rates */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Live Weather Forecast Widget */}
          <div className="global-card-flush flex flex-col bg-gradient-to-br from-info-500 to-indigo-600 relative overflow-hidden text-white p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9.5px] font-black text-info-100 uppercase tracking-wider mb-0.5">Farm Weather & Advisory</p>
                <h3 className="text-[15px] font-black leading-none">Your Region</h3>
              </div>
              <span className="material-symbols-outlined text-[26px] text-yellow-300">partly_cloudy_day</span>
            </div>

            <div className="mt-4 mb-2">
              <h2 className="text-[34px] font-black text-white tracking-tighter leading-none">
                {weather.temp}°<span className="text-[16px] text-info-200">C</span>
              </h2>
              <p className="text-[10px] font-bold text-info-100 mt-1">{weather.condition} · Humidity {weather.humidity}%</p>
            </div>

            <div className="mt-2 pt-2.5 border-t border-white/20">
              <p className="text-[9.5px] font-bold text-yellow-100 leading-snug">
                {weather.advisory}
              </p>
            </div>
          </div>

          {/* Mandi Rates Widget */}
          <div className="global-card p-4">
            <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-[12px] font-black text-slate-800 leading-none mb-0.5">Live Mandi Prices</h3>
                <p className="text-[9.5px] font-semibold text-slate-400">Local market benchmarks</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Wheat (Sharbati)', min: '₹2,400', max: '₹2,650', trend: 2.5, icon: 'grass' },
                { name: 'Rice (Basmati)', min: '₹3,200', max: '₹3,800', trend: 1.2, icon: 'eco' },
                { name: 'Fresh Tomato', min: '₹1,500', max: '₹2,100', trend: -5.4, icon: 'nutrition' },
              ].map((crop, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50/70 border border-slate-100 rounded-xl text-[10.5px]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[15px] text-emerald-600">{crop.icon}</span>
                    <span className="font-bold text-slate-800">{crop.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-700">{crop.max}/q</span>
                    <span className={`text-[8.5px] font-black px-1.5 py-0.2 rounded ${crop.trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
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
