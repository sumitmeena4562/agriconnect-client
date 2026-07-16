import React, { useState } from 'react';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Trash2, RotateCcw, Truck, Box, Bike, HardHat, Save, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VEHICLE_EMOJIS = {
  bike_delivery:   '🛵',
  tractor_trolley: '🚜',
  pickup_vehicle:  '🛻',
  warehouse:       '🏗️',
};

// Color accent per stop index
const STOP_ACCENTS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4'];

const getCropType = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('tomato') || lower.includes('egg') || lower.includes('strawberr')) {
    return { label: 'Fragile', color: 'bg-amber-50 border-amber-250 text-amber-700', badge: '🥚 Fragile' };
  }
  if (lower.includes('milk') || lower.includes('paneer') || lower.includes('dairy') || lower.includes('berr')) {
    return { label: 'Perishable', color: 'bg-rose-50 border-rose-250 text-rose-700', badge: '🧊 Cold' };
  }
  if (lower.includes('potato') || lower.includes('wheat') || lower.includes('onion') || lower.includes('grain')) {
    return { label: 'Heavy', color: 'bg-indigo-50 border-indigo-250 text-indigo-700', badge: '⚓ Heavy' };
  }
  return { label: 'Standard', color: 'bg-emerald-50 border-emerald-250 text-emerald-700', badge: '📦 Standard' };
};

const LoadSequenceSidebar = () => {
  const navigate = useNavigate();
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  const {
    batch,
    localRouteStops,
    removedOrderIds,
    vehicleTemplates,
    activeTemplate,
    setActiveTemplate,
    moveStop,
    removeOrderFromBatch,
    saveLoadPlan,
    savingPlan,
    setDraggedItem,
  } = useLoadPlannerStore();

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  const handleSave = async () => {
    try {
      await saveLoadPlan(navigate);
      toast.success('Load plan saved! 🚚');
    } catch (err) {
      toast.error('Failed to save plan.');
      console.error(err);
    }
  };

  const handleReset = () => {
    useLoadPlannerStore.setState({
      localRouteStops: batch?.optimizedRoute || [],
      removedOrderIds: new Set(),
    });
    toast.success('Route reset to default.');
  };

  const handleRemoveConfirm = (orderId) => {
    removeOrderFromBatch(orderId);
    setConfirmRemoveId(null);
    toast.success('Order removed from batch.');
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'bike_delivery':   return <Bike className="w-3.5 h-3.5" />;
      case 'tractor_trolley': return <HardHat className="w-3.5 h-3.5" />;
      case 'pickup_vehicle':  return <Truck className="w-3.5 h-3.5" />;
      default:                return <Box className="w-3.5 h-3.5" />;
    }
  };

  // ── Stacking Safety Rule Checks ──
  const cols = activeTemplate.cols || 3;
  const getStopGrid = (stop) => {
    const idx = stop.loadingSequence - 1;
    return {
      c: idx % cols,
      r: Math.floor(idx / cols)
    };
  };

  const checkStackingViolation = (stop) => {
    const cropName = activeOrders.find(o => String(o._id) === String(stop.orderId))?.crop?.name;
    const cropType = getCropType(cropName).label;
    if (cropType !== 'Heavy') return false;

    const thisGrid = getStopGrid(stop);

    return deliveryStops.some(other => {
      if (other.orderId === stop.orderId) return false;
      const otherGrid = getStopGrid(other);
      // Same column but in a lower row index (loaded first/bottom)
      if (otherGrid.c !== thisGrid.c || otherGrid.r >= thisGrid.r) return false;

      const otherCropName = activeOrders.find(o => String(o._id) === String(other.orderId))?.crop?.name;
      const otherCropType = getCropType(otherCropName).label;
      return otherCropType === 'Fragile';
    });
  };

  // ── Determine if vehicle template is locked to driver's vehicle type ──────
  // Map driver.vehicleType strings → VEHICLE_TEMPLATES keys
  const DRIVER_VEHICLE_MAP = {
    'Bike':       'bike_delivery',
    'Tractor':    'tractor_trolley',
    'Mini Truck': 'mini_truck',
    'Pickup':     'pickup_vehicle',
  };
  const driverVehicleType = batch?.driver?.vehicleType || null;
  const driverTemplateKey = driverVehicleType ? (DRIVER_VEHICLE_MAP[driverVehicleType] || 'container_truck') : null;
  const isTemplateLocked  = !!batch?.driver; // lock once a driver is assigned

  return (
    <div className="flex flex-col bg-white h-full overflow-hidden">

      {/* ── Transport Profile Selector ── */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Transport Profile
          </p>
          {isTemplateLocked && (
            <span className="flex items-center gap-1 text-[8px] font-black text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" />
              Locked to Driver
            </span>
          )}
        </div>

        {isTemplateLocked ? (
          // ── Driver assigned: show ONLY the matching vehicle template (locked) ──
          <div className="space-y-2">
            {(() => {
              const template = vehicleTemplates[driverTemplateKey];
              if (!template) return null;
              return (
                <div className="py-2.5 px-3 rounded-xl text-[10px] font-black flex items-center gap-2 bg-slate-900 border-slate-900 text-white shadow-md">
                  <span className="text-white">{getTemplateIcon(template.type)}</span>
                  <span className="truncate leading-tight flex-1">
                    <span className="mr-0.5">{VEHICLE_EMOJIS[template.type] || '📦'}</span>
                    {template.name}
                  </span>
                  <span className="text-[7.5px] font-black bg-white/20 text-white/80 px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0">
                    {driverVehicleType}
                  </span>
                </div>
              );
            })()}
            <p className="text-[8.5px] text-slate-400 font-semibold flex items-center gap-1 pt-0.5">
              <Lock className="w-2.5 h-2.5 shrink-0" />
              Canvas locked to <strong className="text-slate-600">{batch?.driver?.name}</strong>'s vehicle.
              Unassign driver to change.
            </p>
          </div>
        ) : (
          // ── No driver yet: show all templates for pre-planning ──
          <>
            <p className="text-[8px] text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              Assign a driver to auto-lock the correct vehicle canvas.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.keys(vehicleTemplates).map(key => {
                const template   = vehicleTemplates[key];
                const isSelected = activeTemplate.type === template.type;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTemplate(key)}
                    className={`py-2 px-2.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 transition-all border text-left cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className={isSelected ? 'text-white' : 'text-slate-400'}>
                      {getTemplateIcon(template.type)}
                    </span>
                    <span className="truncate leading-tight">
                      <span className="mr-0.5">{VEHICLE_EMOJIS[template.type] || '📦'}</span>
                      {template.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Crop Class Legend ── */}
      <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between gap-1 flex-wrap shrink-0">
        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">Legend:</span>
        <span className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-rose-500" /> Cold
        </span>
        <span className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Fragile
        </span>
        <span className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-indigo-500" /> Heavy
        </span>
        <span className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Standard
        </span>
      </div>

      {/* ── Sidebar Header ── */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0 flex items-center justify-between bg-slate-50/20">
        <div>
          <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-wider leading-none">
            Load Sequence
          </h4>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
            {deliveryStops.length} stop{deliveryStops.length !== 1 ? 's' : ''} · drag to reorder
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[9.5px] font-bold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-slate-100 border-0 bg-transparent cursor-pointer"
          title="Reset to default route"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* ── Stop List ── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {deliveryStops.length === 0 ? (
          <div className="text-center py-12 px-4 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Box className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-[11px] text-slate-400 font-bold">No active stops</p>
            <p className="text-[9.5px] text-slate-300 font-semibold">Add orders to see them here</p>
          </div>
        ) : (
          deliveryStops.map((stop, idx, arr) => {
            const order       = activeOrders.find(o => String(o._id) === String(stop.orderId));
            const accentColor = STOP_ACCENTS[idx % STOP_ACCENTS.length];
            const isRemoving  = confirmRemoveId === stop.orderId;
            const typeInfo    = getCropType(order?.crop?.name);
            const hasViolation = checkStackingViolation(stop);

            return (
              <div
                key={stop.orderId}
                draggable="true"
                onDragStart={() => setDraggedItem(stop)}
                onDragEnd={() => setDraggedItem(null)}
                className={`relative bg-white rounded-2xl border transition-all cursor-grab active:cursor-grabbing shadow-xs group ${
                  isRemoving
                    ? 'border-rose-200 bg-rose-50/30'
                    : hasViolation
                    ? 'border-rose-300 bg-rose-50/5 hover:border-rose-450 hover:shadow-md'
                    : 'border-slate-150 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Left color accent bar */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                  style={{ backgroundColor: accentColor }}
                />

                <div className="flex items-center gap-2 p-3 pl-4">
                  {/* Sequence number */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {idx + 1}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-[11.5px] text-slate-800 truncate leading-none">
                      {order?.crop?.name || 'Crop'}
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">
                      🏪 {order?.vendor?.name || 'Vendor'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[8px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md uppercase">
                        Load #{stop.loadingSequence}
                      </span>
                      <span className={`text-[8px] font-black border px-1.5 py-0.5 rounded-md ${typeInfo.color}`}>
                        {typeInfo.badge}
                      </span>
                      <span className="text-[8px] font-bold text-slate-450 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                        {order?.requestedQuantity} {order?.crop?.unit}
                      </span>
                    </div>

                    {/* Stacking Rule Warning */}
                    {hasViolation && (
                      <div className="mt-2 flex items-center gap-1 text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>Heavy cargo loaded above Fragile cargo!</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveStop(idx, 'up')}
                      className="w-6 h-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 flex items-center justify-center text-slate-500 cursor-pointer shadow-xs transition-colors"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={idx === arr.length - 1}
                      onClick={() => moveStop(idx, 'down')}
                      className="w-6 h-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-20 flex items-center justify-center text-slate-500 cursor-pointer shadow-xs transition-colors"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmRemoveId(isRemoving ? null : stop.orderId)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer shadow-xs transition-colors ${
                        isRemoving
                          ? 'bg-rose-500 border-rose-500 text-white'
                          : 'border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-400 hover:text-rose-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline remove confirmation */}
                {isRemoving && (
                  <div className="mx-3 mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="text-[9px] font-bold text-rose-700">Remove from batch?</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="px-2 py-0.5 text-[8.5px] font-bold rounded-lg border border-slate-200 bg-white text-slate-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRemoveConfirm(stop.orderId)}
                        className="px-2 py-0.5 text-[8.5px] font-bold rounded-lg bg-rose-500 text-white border-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Save Button ── */}
      <div className="p-3 border-t border-slate-100 bg-white shrink-0">
        <button
          onClick={handleSave}
          disabled={savingPlan || deliveryStops.length === 0}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-[12px] rounded-2xl cursor-pointer border-0 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
        >
          {savingPlan ? (
            <>
              <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Load Plan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default LoadSequenceSidebar;
export { getCropType };
