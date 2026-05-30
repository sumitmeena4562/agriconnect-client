import React from 'react';
import StatCard from '../../components/dashboard/StatCard';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FarmerDashboard = () => {
  // Dummy data for now (to be replaced with API later)
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  const firstName = user.name ? user.name.split(' ')[0] : 'Farmer';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Welcome & Alerts Section */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-black text-slate-800 tracking-tight leading-none">
            Hello, {firstName} <span className="inline-block animate-bounce text-[18px]">👋</span>
          </h1>
          <p className="text-[11px] sm:text-[12px] text-slate-500 font-medium mt-1.5">
            Here's what's happening with your farm today.
          </p>
        </div>

        {/* KYC / Bank Details Alert Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-50 border border-warning-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-warning-100 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px] text-warning-500">account_balance</span>
            </div>
            <div className="mt-0.5">
              <h3 className="text-[12px] font-bold text-warning-800 leading-none mb-1">Complete Your Setup</h3>
              <p className="text-[10px] text-warning-700 font-medium leading-relaxed">
                Add your bank account details to start receiving payments for your crops directly.
              </p>
            </div>
          </div>
          <Link to="/farmer-dashboard/profile" className="shrink-0 w-full sm:w-auto bg-warning-500 hover:bg-warning-600 text-white text-[11px] font-bold py-2 px-4 rounded-lg transition-colors text-center shadow-sm">
            Add Details
          </Link>
        </motion.div>
      </div>

      {/* 2. Key Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Total Earnings" value="₹0.00" icon="account_balance_wallet" color="primary" trend={0} trendLabel="vs last month" />
        <StatCard title="Active Crops" value="0" icon="grass" color="info" />
        <StatCard title="Pending Orders" value="0" icon="shopping_basket" color="warning" />
        <StatCard title="Profile Views" value="0" icon="visibility" color="primary" />
      </div>

      {/* 3. Weather & Market Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Weather Widget */}
        <div className="lg:col-span-1 global-card-flush flex flex-col h-full bg-gradient-to-br from-info-500 to-info-600 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="p-4 flex-1 flex flex-col justify-between relative z-10">
            <div className="flex justify-between items-start text-white">
              <div>
                <p className="text-[10px] font-bold text-info-100 uppercase tracking-wider mb-0.5">Weather Forecast</p>
                <h3 className="text-[16px] font-black leading-none">Your Farm</h3>
              </div>
              <span className="material-symbols-outlined text-[28px] text-yellow-300 icon-pop">partly_cloudy_day</span>
            </div>
            
            <div className="mt-5 mb-3">
              <h2 className="text-[36px] font-black text-white tracking-tighter leading-none">
                32°<span className="text-[18px] text-info-200">C</span>
              </h2>
              <p className="text-[10px] font-medium text-info-100 mt-1.5">Partly Cloudy • Humidity 45%</p>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-white/20 text-white mt-auto">
              <div className="text-center">
                <p className="text-[9px] text-info-200 font-bold uppercase mb-0.5">Tomorrow</p>
                <div className="flex items-center gap-0.5 text-[11px]"><span className="material-symbols-outlined text-[12px]">sunny</span> 34°</div>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-info-200 font-bold uppercase mb-0.5">Friday</p>
                <div className="flex items-center gap-0.5 text-[11px]"><span className="material-symbols-outlined text-[12px]">rainy</span> 28°</div>
              </div>
              <div className="text-center">
                <p className="text-[9px] text-info-200 font-bold uppercase mb-0.5">Saturday</p>
                <div className="flex items-center gap-0.5 text-[11px]"><span className="material-symbols-outlined text-[12px]">cloud</span> 30°</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mandi Rates Widget */}
        <div className="lg:col-span-2 global-card h-full flex flex-col !p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[14px] font-black text-slate-800 leading-none mb-1">Current Mandi Rates</h3>
              <p className="text-[10px] font-medium text-slate-500 leading-none">Live prices near your location</p>
            </div>
            <button className="text-[10px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-[6px] transition-colors">
              View All
            </button>
          </div>
          
          <div className="flex-1 overflow-x-auto pb-1">
            <div className="min-w-[400px]">
              <div className="grid grid-cols-5 gap-3 px-3 py-2 bg-slate-50 rounded-lg mb-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="col-span-2">Crop</div>
                <div className="col-span-1 text-right">Min Price</div>
                <div className="col-span-1 text-right">Max Price</div>
                <div className="col-span-1 text-right">Trend</div>
              </div>
              
              {/* Dummy Data Rows */}
              {[
                { name: 'Wheat (Sharbati)', min: '₹2,400', max: '₹2,650', trend: 2.5, icon: 'grass' },
                { name: 'Rice (Basmati)', min: '₹3,200', max: '₹3,800', trend: 1.2, icon: 'eco' },
                { name: 'Tomato', min: '₹1,500', max: '₹2,100', trend: -5.4, icon: 'nutrition' },
              ].map((crop, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-3 px-3 py-2.5 items-center border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors rounded-lg">
                  <div className="col-span-2 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-success-50 flex items-center justify-center text-success-600 shrink-0">
                      <span className="material-symbols-outlined text-[16px]">{crop.icon}</span>
                    </div>
                    <span className="text-[12px] font-bold text-slate-800 truncate">{crop.name}</span>
                  </div>
                  <div className="col-span-1 text-right text-[11.5px] font-bold text-slate-600">{crop.min}<span className="text-[9px] text-slate-400 font-medium">/q</span></div>
                  <div className="col-span-1 text-right text-[11.5px] font-bold text-slate-800">{crop.max}<span className="text-[9px] text-slate-400 font-medium">/q</span></div>
                  <div className="col-span-1 flex justify-end">
                    <span className={`flex items-center gap-0.5 text-[9.5px] font-bold px-1.5 py-0.5 rounded ${crop.trend > 0 ? 'text-success-600 bg-success-100' : 'text-danger-600 bg-danger-100'}`}>
                      <span className="material-symbols-outlined text-[10px]">{crop.trend > 0 ? 'trending_up' : 'trending_down'}</span>
                      {Math.abs(crop.trend)}%
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
