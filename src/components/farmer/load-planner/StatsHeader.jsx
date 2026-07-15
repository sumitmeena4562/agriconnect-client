import React from 'react';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { Scale, Layers, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const StatsHeader = () => {
  const { batch, localRouteStops, removedOrderIds, activeTemplate } = useLoadPlannerStore();

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const totalWeight   = activeOrders.reduce((sum, o) => sum + (o.requestedQuantity || 0), 0);
  const maxCapacity   = activeTemplate.capacity || 10000;
  const weightPercent = Math.min(100, Math.round((totalWeight / maxCapacity) * 100));
  const totalPallets  = Math.ceil(totalWeight / 250);

  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  const lifoAlerts = deliveryStops.filter(stop =>
    deliveryStops.some(other =>
      other.loadingSequence > stop.loadingSequence && stop.sequence < other.sequence
    )
  ).length;

  const isOverload   = totalWeight > maxCapacity;
  const alertsCount  = lifoAlerts + (isOverload ? 1 : 0);
  const unit         = activeOrders[0]?.crop?.unit || 'kg';

  const barColor =
    weightPercent > 90 ? '#ef4444' :
    weightPercent > 70 ? '#f59e0b' : '#10b981';

  // ── Axle Load Calculations ──
  const cols = activeTemplate.cols || 3;
  let frontWeight = 0;
  let rearWeight = 0;

  deliveryStops.forEach(stop => {
    const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
    if (order) {
      const slotIdx = stop.loadingSequence - 1;
      const c = slotIdx % cols;
      const weight = order.requestedQuantity || 0;
      // Front is c < cols / 2, Rear is c >= cols / 2
      if (c < cols / 2) {
        frontWeight += weight;
      } else {
        rearWeight += weight;
      }
    }
  });

  const totalLoaded = frontWeight + rearWeight;
  const frontPercent = totalLoaded > 0 ? Math.round((frontWeight / totalLoaded) * 100) : 50;
  const rearPercent = totalLoaded > 0 ? 100 - frontPercent : 50;

  const balanceStatus = 
    totalLoaded === 0 ? 'Empty' :
    frontPercent > 70 ? '⚠️ Front Heavy' :
    rearPercent > 70 ? '⚠️ Rear Heavy' : '✅ Balanced';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">

      {/* ── Weight & Axle Balance KPI ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs flex flex-col gap-2 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <Scale className="w-2.5 h-2.5" /> Total Weight
            </p>
            <h3 className="text-[18px] font-black text-slate-800 leading-none tabular-nums">
              {totalWeight.toLocaleString()} <span className="text-[10px] text-slate-400 font-semibold">{unit}</span>
            </h3>
          </div>
          <div className={`px-2 py-0.5 rounded-lg border text-[9.5px] font-black tabular-nums shrink-0 ${
            isOverload ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-250/70 text-emerald-700'
          }`}>
            {weightPercent}%
          </div>
        </div>
        
        {/* Axle load balance bar */}
        <div className="pt-1.5 border-t border-slate-50 flex flex-col gap-1">
          <div className="flex justify-between text-[8px] font-bold text-slate-400">
            <span>Front ({frontPercent}%)</span>
            <span>Rear ({rearPercent}%)</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full flex overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${frontPercent}%` }} />
            <div className="h-full bg-emerald-500" style={{ width: `${rearPercent}%` }} />
          </div>
          <span className={`text-[7.5px] font-black uppercase tracking-wider ${
            balanceStatus.includes('Balanced') ? 'text-emerald-600' : 'text-amber-600'
          }`}>
            Axle: {balanceStatus}
          </span>
        </div>
      </div>

      {/* ── Pallet KPI ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-xs flex flex-col gap-2 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <Layers className="w-2.5 h-2.5" /> Est. Pallets
            </p>
            <h3 className="text-[18px] font-black text-slate-800 leading-none tabular-nums">
              {totalPallets} <span className="text-[10px] text-slate-450 font-bold">Pallets</span>
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-50">
          <TrendingUp className="w-2.5 h-2.5 text-slate-350" />
          <span className="text-[8px] text-slate-400 font-semibold">{deliveryStops.length} delivery stop(s)</span>
        </div>
      </div>

      {/* ── LIFO / Violations KPI ── */}
      <div className={`relative bg-white border rounded-xl p-3 shadow-xs flex flex-col gap-2 hover:shadow-sm transition-shadow overflow-hidden ${
        alertsCount > 0 ? 'border-rose-250 bg-rose-50/20' : 'border-slate-100'
      }`}>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <AlertCircle className="w-2.5 h-2.5" /> Violations
            </p>
            <h3 className={`text-[18px] font-black leading-none tabular-nums flex items-center gap-1 ${
              alertsCount > 0 ? 'text-rose-600' : 'text-slate-800'
            }`}>
              {alertsCount}
              {alertsCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
            </h3>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
            alertsCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}>
            {alertsCount > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </div>
        </div>
        <div className="relative flex items-center gap-1.5 pt-1.5 border-t border-slate-50">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${alertsCount > 0 ? 'bg-rose-450' : 'bg-emerald-450'}`} />
          <span className="text-[8px] font-semibold text-slate-400">
            {isOverload ? 'Overloaded' : alertsCount > 0 ? 'LIFO error' : 'Valid sequence'}
          </span>
        </div>
      </div>

    </div>
  );
};

export default StatsHeader;
