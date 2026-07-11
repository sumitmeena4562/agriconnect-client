import React from 'react';
import { useLoadPlannerStore } from '../../../store/useLoadPlannerStore';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const AnalyticsSummary = () => {
  const { batch, removedOrderIds, activeTemplate, localRouteStops } = useLoadPlannerStore();

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const totalWeight = activeOrders.reduce((sum, o) => sum + (o.requestedQuantity || 0), 0);
  const maxCapacity = activeTemplate.capacity || 10000;
  
  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  // Generate chart data based on active stops
  const chartData = deliveryStops.map(stop => {
    const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
    return {
      name: order?.crop?.name || 'Crop',
      weight: order?.requestedQuantity || 0,
      sequence: `S-${stop.sequence - localRouteStops.filter(s => s.stopType === 'pickup').length}`,
      loadSeq: `L-${stop.loadingSequence}`
    };
  });

  const efficiency = Math.min(100, Math.round((totalWeight / maxCapacity) * 100));

  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex flex-col justify-between min-h-[300px] shrink-0">
      <div>
        <h3 className="text-[12.5px] font-black text-slate-800 uppercase tracking-wider mb-1">Payload Weight Analytics</h3>
        <p className="text-[9.5px] text-slate-400 font-semibold mb-4">Visual distribution of crop cargo units across delivery sequences</p>
      </div>

      {chartData.length > 0 ? (
        <div className="flex-1 min-h-[140px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="sequence" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded-lg text-[9.5px] shadow-lg border-0">
                        <p className="font-black">{data.name}</p>
                        <p className="font-semibold text-slate-300 mt-0.5">Weight: {data.weight} kg</p>
                        <p className="text-indigo-350 font-semibold">{data.loadSeq} (Deliver seq: {data.sequence})</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="weight" radius={[4, 4, 0, 0]} barSize={24}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
          <span className="material-symbols-outlined text-[24px] text-slate-350">bar_chart</span>
          <p className="text-[10px] text-slate-400 font-bold mt-1">No cargo data to plot</p>
        </div>
      )}

      {/* Analytics Summary details */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500">
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Trailer Utilization</span>
          <span className={`text-[12px] font-black mt-0.5 block ${efficiency > 90 ? 'text-rose-600' : 'text-slate-800'}`}>{efficiency}% capacity used</span>
        </div>
        <div>
          <span className="block text-[8px] uppercase tracking-wider text-slate-400">Total Items</span>
          <span className="text-[12px] font-black text-slate-855 mt-0.5 block">{deliveryStops.length} stops loaded</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSummary;
