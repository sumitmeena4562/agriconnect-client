import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * RevenueChart — Monthly/Weekly earnings analytics curve for Farmer Dashboard
 */
const mockMonthlyData = [
  { label: 'Jan', earnings: 18500, orders: 4 },
  { label: 'Feb', earnings: 24000, orders: 6 },
  { label: 'Mar', earnings: 31000, orders: 7 },
  { label: 'Apr', earnings: 29500, orders: 5 },
  { label: 'May', earnings: 42000, orders: 9 },
  { label: 'Jun', earnings: 56000, orders: 12 },
  { label: 'Jul', earnings: 68500, orders: 15 },
];

const mockWeeklyData = [
  { label: 'Mon', earnings: 8500, orders: 2 },
  { label: 'Tue', earnings: 12000, orders: 3 },
  { label: 'Wed', earnings: 6400, orders: 1 },
  { label: 'Thu', earnings: 15200, orders: 4 },
  { label: 'Fri', earnings: 11000, orders: 2 },
  { label: 'Sat', earnings: 9400, orders: 2 },
  { label: 'Sun', earnings: 6000, orders: 1 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 text-white p-2.5 px-3 rounded-xl shadow-xl text-[11px] border border-slate-700 backdrop-blur-md">
        <p className="font-bold text-slate-300 text-[10px] mb-1">{label}</p>
        <p className="font-black text-emerald-400 text-[13px] leading-tight">
          ₹{data.earnings.toLocaleString('en-IN')}
        </p>
        <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">
          {data.orders} Completed {data.orders === 1 ? 'Order' : 'Orders'}
        </p>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ totalEarnings = 0 }) => {
  const [timeframe, setTimeframe] = useState('monthly');
  const chartData = timeframe === 'monthly' ? mockMonthlyData : mockWeeklyData;

  return (
    <div className="global-card p-3.5 sm:p-4">
      {/* Header & Toggle Controls */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
        <div>
          <h3 className="text-[11px] sm:text-[12px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary-600">trending_up</span>
            Revenue & Earnings Analytics
          </h3>
          <p className="text-[9.5px] font-semibold text-slate-400 mt-0.5">
            Gross payouts • Total YTD: <strong className="text-slate-700">₹{(totalEarnings || 270400).toLocaleString('en-IN')}</strong>
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[9.5px] font-bold text-slate-600">
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              timeframe === 'monthly' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              timeframe === 'weekly' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {/* Recharts Area Curve */}
      <div className="h-[180px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="primaryGreenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
              dy={5}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fontWeight: 600, fill: '#94a3b8' }}
              tickFormatter={(val) => `₹${val / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="#16a34a"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#primaryGreenGradient)"
              activeDot={{ r: 6, fill: '#16a34a', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
