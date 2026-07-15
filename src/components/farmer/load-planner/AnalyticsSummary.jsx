import React from 'react';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import { BarChart2 } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-[9px] shadow-md border border-slate-700">
        <p className="font-bold text-white mb-0.5">{d.name}</p>
        <p className="text-slate-300">{d.loadSeq} · Deliver {d.sequence}</p>
        <p className="text-emerald-400 font-bold mt-0.5">{d.weight} {d.unit}</p>
      </div>
    );
  }
  return null;
};

const BAR_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4'];

const AnalyticsSummary = () => {
  const { batch, removedOrderIds, activeTemplate, localRouteStops } = useLoadPlannerStore();

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const totalWeight  = activeOrders.reduce((sum, o) => sum + (o.requestedQuantity || 0), 0);
  const maxCapacity  = activeTemplate.capacity || 10000;

  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  const pickupCount = localRouteStops.filter(s => s.stopType === 'pickup').length;

  const chartData = deliveryStops.map(stop => {
    const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
    return {
      name:     order?.crop?.name || 'Crop',
      weight:   order?.requestedQuantity || 0,
      unit:     order?.crop?.unit || 'kg',
      sequence: `D${stop.sequence - pickupCount}`,
      loadSeq:  `L-${stop.loadingSequence}`,
    };
  });

  const efficiency = Math.min(100, Math.round((totalWeight / maxCapacity) * 100));

  const effColor =
    efficiency > 90 ? { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' } :
    efficiency > 70 ? { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' } :
                      { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex flex-col gap-3 shrink-0">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-indigo-500" />
            Payload Weight Distribution
          </h3>
        </div>
        <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black tabular-nums ${effColor.text} ${effColor.bg} ${effColor.border}`}>
          {efficiency}% utilized
        </div>
      </div>

      {/* Bar Chart */}
      {chartData.length > 0 ? (
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="sequence"
                tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.04)', radius: 4 }} />
              <Bar dataKey="weight" radius={[4, 4, 0, 0]} barSize={24} maxBarSize={30}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[100px] flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl gap-1">
          <BarChart2 className="w-5 h-5 text-slate-350" />
          <p className="text-[9px] text-slate-400 font-bold">No cargo data to plot</p>
        </div>
      )}

      {/* Summary stats row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <div className="text-center">
          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Trailer Utilization</p>
          <p className={`text-[12px] font-black mt-0.5 tabular-nums ${effColor.text}`}>
            {efficiency}%
          </p>
        </div>
        <div className="text-center border-x border-slate-100">
          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Total Cargo Weight</p>
          <p className="text-[12px] font-black text-slate-800 mt-0.5 tabular-nums">
            {totalWeight.toLocaleString()}
            <span className="text-[9px] font-semibold text-slate-450 ml-0.5">{activeOrders[0]?.crop?.unit || 'kg'}</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Active Stops</p>
          <p className="text-[12px] font-black text-slate-800 mt-0.5 tabular-nums">
            {deliveryStops.length}
          </p>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsSummary;
