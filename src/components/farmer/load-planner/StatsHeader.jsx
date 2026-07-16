import React from 'react';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { Scale, Layers, AlertCircle, CheckCircle, TrendingUp, Box } from 'lucide-react';

const StatsHeader = () => {
  const { batch, localRouteStops, removedOrderIds, activeTemplate, packagingReport } = useLoadPlannerStore();

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  const lifoAlerts = deliveryStops.filter(stop =>
    deliveryStops.some(other =>
      other.loadingSequence > stop.loadingSequence && stop.sequence < other.sequence
    )
  ).length;

  const maxCapacity = activeTemplate?.capacity || 10000;
  const maxCapacityVolume = activeTemplate?.capacityVolume || 12.0;

  const totalWeight = packagingReport?.totalWeight || 0;
  const totalVolume = parseFloat(packagingReport?.totalVolume || 0);
  const totalBoxesCount = packagingReport?.totalBoxesCount || 0;
  const weightPercent = packagingReport?.vehicleUtilization || 0;
  const remainingVolume = packagingReport?.remainingCapacityVolume || '0.000';
  const remainingWeight = packagingReport?.remainingCapacityWeight || 0;

  const isOverload = totalWeight > maxCapacity;
  const alertsCount = lifoAlerts + (isOverload ? 1 : 0);
  const unit = activeOrders[0]?.crop?.unit || 'kg';

  // ── Axle Load Calculations ──
  const cols = activeTemplate?.cols || 3;
  let frontWeight = 0;
  let rearWeight = 0;

  deliveryStops.forEach(stop => {
    const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
    if (order) {
      const slotIdx = stop.loadingSequence - 1;
      const c = slotIdx % cols;
      const weight = order.requestedQuantity || 0;
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

  // Box details helper summary
  const boxBreakdownString = packagingReport?.recommendedBoxes?.map(b => `${b.count}×[${b.boxType}]`).join(', ') || 'No Boxes';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 shrink-0 max-w-[780px]">

      {/* ── Weight & Volume Capacity utilization ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 hover:shadow-sm transition-shadow justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Scale className="w-3 h-3 text-primary-600" /> Payload & Volume
            </p>
            <h3 className="text-[16px] font-black text-slate-800 leading-none mt-1.5 tabular-nums">
              {totalWeight.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">{unit}</span>
              <span className="text-slate-300 mx-1.5">|</span>
              {totalVolume.toFixed(2)} <span className="text-[10px] text-slate-400 font-bold">m³</span>
            </h3>
          </div>
          <div className={`px-2 py-0.5 rounded-lg border text-[9.5px] font-black tabular-nums shrink-0 ${
            isOverload || totalVolume > maxCapacityVolume ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-250/70 text-emerald-700'
          }`}>
            {weightPercent}% Load
          </div>
        </div>
        
        {/* Remaining Capacity & Axle details */}
        <div className="pt-2 border-t border-slate-50 flex flex-col gap-1">
          <div className="flex justify-between text-[8px] font-bold text-slate-400">
            <span>Left: {remainingWeight} {unit}</span>
            <span>Vol: {remainingVolume} m³</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full flex overflow-hidden">
            <div className="h-full bg-primary-600" style={{ width: `${frontPercent}%` }} />
            <div className="h-full bg-emerald-500" style={{ width: `${rearPercent}%` }} />
          </div>
          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider mt-0.5">
            <span className={balanceStatus.includes('Balanced') ? 'text-emerald-600' : 'text-amber-600'}>
              Axle: {balanceStatus}
            </span>
          </div>
        </div>
      </div>

      {/* ── Pallet & Box Recommendation KPI ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs flex flex-col gap-3 hover:shadow-sm transition-shadow justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-primary-600" /> Box Optimization
            </p>
            <h3 className="text-[17px] font-black text-slate-800 leading-none mt-1.5 tabular-nums">
              {totalBoxesCount} <span className="text-[10px] text-slate-450 font-bold">Boxes</span>
            </h3>
          </div>
          <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-100 text-primary-750 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[9px]">
          <span className="text-slate-400 font-semibold truncate max-w-[130px]" title={boxBreakdownString}>
            📦 {boxBreakdownString}
          </span>
          <span className="text-primary-600 font-bold">{deliveryStops.length} Stops</span>
        </div>
      </div>

      {/* ── LIFO / Violations KPI ── */}
      <div className={`relative bg-white border rounded-xl p-3.5 shadow-xs flex flex-col gap-3 hover:shadow-sm transition-shadow overflow-hidden justify-between ${
        alertsCount > 0 ? 'border-rose-250 bg-rose-50/20' : 'border-slate-100'
      }`}>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-primary-600" /> Violations
            </p>
            <h3 className={`text-[17px] font-black leading-none mt-1.5 tabular-nums flex items-center gap-1 ${
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
        <div className="relative flex items-center gap-1.5 pt-2 border-t border-slate-50">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${alertsCount > 0 ? 'bg-rose-450' : 'bg-emerald-450'}`} />
          <span className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider text-[8px]">
            {isOverload ? 'Overloaded' : alertsCount > 0 ? 'LIFO error' : 'Valid sequence'}
          </span>
        </div>
      </div>

    </div>
  );
};

export default StatsHeader;
