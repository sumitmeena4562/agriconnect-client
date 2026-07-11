import React from 'react';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { Scale, Layers, AlertCircle, CheckCircle } from 'lucide-react';

const StatsHeader = () => {
  const { batch, localRouteStops, removedOrderIds, activeTemplate } = useLoadPlannerStore();

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const totalWeight = activeOrders.reduce((sum, o) => sum + (o.requestedQuantity || 0), 0);
  const maxCapacity = activeTemplate.capacity || 10000;
  const weightPercent = Math.min(100, Math.round((totalWeight / maxCapacity) * 100));
  const totalPallets = Math.ceil(totalWeight / 250);
  
  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );
  
  const lifoAlerts = deliveryStops.filter(stop => {
    return deliveryStops.some(other => {
      return other.loadingSequence > stop.loadingSequence && stop.sequence < other.sequence;
    });
  }).length;
  
  const isOverload = totalWeight > maxCapacity;
  const alertsCount = lifoAlerts + (isOverload ? 1 : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
      {/* Weight KPI */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="space-y-1">
          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            Total Loaded Weight
          </span>
          <h3 className="text-[17px] font-black text-slate-800 leading-none mt-1">
            {totalWeight.toLocaleString()} <span className="text-[11.5px] font-bold text-slate-450">{activeOrders[0]?.crop?.unit || 'kg'}</span>
          </h3>
          <p className="text-[8.5px] text-slate-400 font-medium">Max Limit: {maxCapacity} {activeOrders[0]?.crop?.unit || 'kg'}</p>
        </div>
        <div className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl border shrink-0 ${
          isOverload ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <span className="text-[12.5px] font-black leading-none">{weightPercent}%</span>
          <span className="text-[7.5px] font-bold uppercase">Loaded</span>
        </div>
      </div>

      {/* Pallet KPI */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="space-y-1">
          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Estimated Pallet Units
          </span>
          <h3 className="text-[17px] font-black text-slate-800 leading-none mt-1">
            {totalPallets} <span className="text-[11.5px] font-bold text-slate-450">Pallets</span>
          </h3>
          <p className="text-[8.5px] text-slate-400 font-medium">Calculated at ~250kg per unit</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-650 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">pallet</span>
        </div>
      </div>

      {/* Routing alerts KPI */}
      <div className="bg-white border border-slate-150 rounded-2xl p-4 flex items-center justify-between shadow-xs">
        <div className="space-y-1">
          <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Fulfillment Violations
          </span>
          <h3 className="text-[17px] font-black text-slate-800 leading-none mt-1 flex items-center gap-1.5">
            {alertsCount}
            {alertsCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
          </h3>
          <p className="text-[8.5px] text-slate-400 font-medium">
            {lifoAlerts > 0 ? `${lifoAlerts} LIFO warning(s) active` : 'No LIFO sequence errors'}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
          alertsCount > 0 
            ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
        }`}>
          {alertsCount > 0 ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
        </div>
      </div>
    </div>
  );
};

export default StatsHeader;
