import React from 'react';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Trash2, RotateCcw, Truck, Box, Bike, HardHat } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoadSequenceSidebar = () => {
  const navigate = useNavigate();
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
    setDraggedItem
  } = useLoadPlannerStore();

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  const handleSave = async () => {
    try {
      await saveLoadPlan(navigate);
      toast.success('Load plan persisted to database! 🚚');
    } catch (err) {
      toast.error('Failed to save custom plan.');
      console.error(err);
    }
  };

  const getTemplateIcon = (type) => {
    switch (type) {
      case 'bike_delivery': return <Bike className="w-4 h-4" />;
      case 'tractor_trolley': return <HardHat className="w-4 h-4" />;
      case 'pickup_vehicle': return <Truck className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 border-l border-slate-150 flex flex-col bg-white h-full overflow-hidden shrink-0">
      
      {/* Templates Selector */}
      <div className="p-4 border-b border-slate-150 shrink-0">
        <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block mb-2">Select Transport Profile</span>
        <div className="grid grid-cols-2 gap-1.5">
          {Object.keys(vehicleTemplates).map(key => {
            const template = vehicleTemplates[key];
            const isSelected = activeTemplate.type === template.type;
            return (
              <button
                key={key}
                onClick={() => setActiveTemplate(key)}
                className={`py-1.5 px-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all border text-left cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-[1.02]' 
                    : 'bg-slate-50 border-slate-200/70 text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={isSelected ? 'text-white' : 'text-slate-450'}>
                  {getTemplateIcon(template.type)}
                </span>
                <span className="truncate">{template.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Title bar */}
      <div className="p-4 border-b border-slate-150 shrink-0 bg-slate-50/50 flex items-center justify-between">
        <h4 className="text-[11.5px] font-black text-slate-800 uppercase tracking-wider">Load Sequence</h4>
        <button
          onClick={() => {
            if (window.confirm('Reset stops sequence to default optimized route?')) {
              useLoadPlannerStore.setState({ 
                localRouteStops: batch?.optimizedRoute || [],
                removedOrderIds: new Set()
              });
              toast.success('Route reset.');
            }
          }}
          className="text-[9.5px] font-extrabold text-slate-450 hover:text-slate-800 transition-colors flex items-center gap-1 border-0 bg-transparent cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Draggable Stop list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/20">
        {deliveryStops.map((stop, idx, arr) => {
          const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
          return (
            <div 
              key={stop.orderId}
              draggable="true"
              onDragStart={() => setDraggedItem(stop)}
              onDragEnd={() => setDraggedItem(null)}
              className="flex items-center justify-between p-3 bg-white hover:border-indigo-200 rounded-2xl transition-all border border-slate-150 cursor-grab active:cursor-grabbing shadow-xs hover:shadow-sm"
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-extrabold text-[12px] text-slate-800 truncate">
                    {order?.crop?.name || 'Crop'}
                  </span>
                </div>
                <p className="text-[9.5px] text-slate-400 font-semibold pl-7 truncate leading-none mt-1">
                  🏪 {order?.vendor?.name}
                </p>
                <div className="flex items-center gap-2.5 pl-7 mt-2">
                  <span className="text-[8.5px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg uppercase">
                    Load #{stop.loadingSequence}
                  </span>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={idx === 0}
                  onClick={() => moveStop(idx, 'up')}
                  className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-20 flex items-center justify-center text-slate-500 cursor-pointer shadow-xs transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === arr.length - 1}
                  onClick={() => moveStop(idx, 'down')}
                  className="w-7 h-7 rounded-full border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-20 flex items-center justify-center text-slate-500 cursor-pointer shadow-xs transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Unassign this order?')) {
                      removeOrderFromBatch(stop.orderId);
                      toast.success('Order unassigned.');
                    }
                  }}
                  className="w-7 h-7 rounded-full border border-rose-100 bg-rose-50/30 hover:bg-rose-50 text-rose-600 cursor-pointer flex items-center justify-center shadow-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {deliveryStops.length === 0 && (
          <div className="text-center py-10 px-4">
            <p className="text-[11px] text-slate-400 font-bold">No active stops loaded.</p>
          </div>
        )}
      </div>

      {/* Footer Save Button */}
      <div className="p-4 border-t border-slate-150 bg-white shrink-0">
        <button
          onClick={handleSave}
          disabled={savingPlan || deliveryStops.length === 0}
          className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-750 disabled:opacity-50 text-white font-black text-[12.5px] rounded-xl cursor-pointer border-0 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
        >
          {savingPlan ? (
            <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : 'Save Load Plan'}
        </button>
      </div>

    </div>
  );
};

export default LoadSequenceSidebar;
