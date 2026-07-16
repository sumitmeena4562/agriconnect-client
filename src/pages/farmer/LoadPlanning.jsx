import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { useLoadPlannerStore } from '../../store/useLoadPlannerStore';
import StatsHeader from '../../components/farmer/load-planner/StatsHeader';
import VehicleCanvas from '../../components/farmer/load-planner/VehicleCanvas';
import LoadSequenceSidebar, { getCropType } from '../../components/farmer/load-planner/LoadSequenceSidebar';
import AnalyticsSummary from '../../components/farmer/load-planner/AnalyticsSummary';
import { ArrowLeft, RefreshCw, Wifi, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const getPhysicalBlocks = (stops, activeTemplate, activeOrders) => {
  const cols = activeTemplate.cols || 3;
  const blocks = [];
  const deliveryStops = stops.filter(s => s.stopType === 'delivery');

  deliveryStops.forEach(stopA => {
    const idxA = stopA.loadingSequence - 1;
    const cA = idxA % cols;
    const rA = Math.floor(idxA / cols);
    const nameA = activeOrders.find(o => String(o._id) === String(stopA.orderId))?.crop?.name || 'Crop';

    deliveryStops.forEach(stopB => {
      if (stopB.orderId === stopA.orderId) return;

      const idxB = stopB.loadingSequence - 1;
      const cB = idxB % cols;
      const rB = Math.floor(idxB / cols);
      const nameB = activeOrders.find(o => String(o._id) === String(stopB.orderId))?.crop?.name || 'Crop';

      // If stopA must be delivered before stopB
      if (stopA.sequence < stopB.sequence) {
        // 1. Stacking Block: B sits on top of A
        if (cA === cB && rB > rA) {
          blocks.push(`⚠️ ${nameB} is stacked on top of ${nameA}. You must unload ${nameB} first.`);
        }
        // 2. Door/Corridor Block: B is in the same row but closer to the door (column is larger)
        if (rA === rB && cB > cA) {
          blocks.push(`⚠️ ${nameB} is blocking the rear door path for ${nameA}.`);
        }
      }
    });
  });

  return Array.from(new Set(blocks));
};

const LoadPlanning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBatch, batch, localRouteStops, removedOrderIds, activeTemplate, packagingReport } = useLoadPlannerStore();
  const [loading, setLoading]     = useState(true);
  const [isLive, setIsLive]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeOrders = batch?.orders?.filter(o => !removedOrderIds.has(String(o._id))) || [];
  const deliveryStops = localRouteStops.filter(
    s => s.stopType === 'delivery' && !removedOrderIds.has(String(s.orderId))
  );

  const fetchBatch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/batches/${id}`);
      if (res.data.success) {
        setBatch(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load batch data.');
    } finally {
      setLoading(false);
    }
  }, [id, setBatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBatch();
    setRefreshing(false);
    toast.success('Batch refreshed');
  };

  const handlePrintManifest = () => {
    if (deliveryStops.length === 0) {
      toast.error('No cargo in loading plan to print.');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>AgriConnect - Loading Manifest</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            h1 { font-size: 22px; font-weight: 900; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; color: #0f172a; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 13px; }
            .meta div { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 13px; }
            th { background: #f1f5f9; font-weight: 800; color: #334155; }
            .step { font-weight: 800; color: #4f46e5; }
            .sign { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
            .sign-box { border-top: 1px solid #cbd5e1; padding-top: 12px; text-align: center; font-size: 12px; font-weight: bold; color: #64748b; }
          </style>
        </head>
        <body>
          <h1>📦 Loading Manifest & Dispatch Checklist</h1>
          <div class="meta">
            <div><strong>Batch ID:</strong> #${batch._id.toUpperCase()}</div>
            <div><strong>Driver Name:</strong> ${batch.driver?.name || 'Unassigned'}</div>
            <div><strong>Vehicle Profile:</strong> ${activeTemplate.name}</div>
            <div><strong>Consolidation Route Distance:</strong> ${batch.totalDistance} km</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Load Order</th>
                <th>Placement Slot</th>
                <th>Crop Type</th>
                <th>Weight Quantity</th>
                <th>Delivery Address</th>
              </tr>
            </thead>
            <tbody>
              ${deliveryStops.map((stop, idx) => {
                const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
                return `
                  <tr>
                    <td class="step">Step ${idx + 1}</td>
                    <td>Slot #${stop.loadingSequence}</td>
                    <td><strong>${order?.crop?.name}</strong> (${getCropType(order?.crop?.name).label})</td>
                    <td>${order?.requestedQuantity} ${order?.crop?.unit}</td>
                    <td>${order?.vendor?.name} - ${stop.address}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="sign">
            <div class="sign-box">Warehouse Dispatcher Signature</div>
            <div class="sign-box">Driver Acknowledgment Signature</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    fetchBatch();

    const socketHost = window.location.origin.includes('localhost')
      ? 'http://localhost:5000'
      : window.location.origin;

    const socket = io(socketHost, { transports: ['websocket'], upgrade: false });

    socket.on('connect', () => {
      setIsLive(true);
    });

    socket.on('disconnect', () => setIsLive(false));

    socket.on(`batch-${id}-update`, () => {
      toast.success('Live update received 📡');
      fetchBatch();
    });

    return () => socket.disconnect();
  }, [id, fetchBatch]);

  const physicalBlocks = getPhysicalBlocks(localRouteStops, activeTemplate, activeOrders);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        <span className="text-[11px] font-bold text-slate-400">Loading Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto px-2">

      {/* Header (Compact) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer-dashboard/batches')}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[16px] font-black text-slate-800 tracking-tight leading-none flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-primary-600">local_shipping</span>
                Load Planning Console
              </h1>
              {batch?._id && (
                <span className="font-mono text-[8.5px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                  #{batch._id.slice(-6).toUpperCase()}
                </span>
              )}
              <span className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-full border ${
                isLive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                <Wifi className="w-2 h-2" />
                {isLive ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
              Arrange trailer cargo and verify LIFO rules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Manifest Button - Styled with primary theme colors */}
          <button
            onClick={handlePrintManifest}
            className="px-3 py-1.5 bg-primary-50 border border-primary-200 hover:bg-primary-100 text-primary-750 rounded-lg text-[10px] font-black cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            title="Print Cargo Manifest Checklist"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print Manifest</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
            title="Reload"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid (Unified Height) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Column: Visualizer, KPIs, Analytics */}
        <div className="xl:col-span-8 space-y-4 flex flex-col justify-between">
          <StatsHeader />

          {/* 3D Canvas Box - Styled as global-card */}
          <div className="global-card p-4 hover:shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
              <div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary-600">view_in_ar</span>
                  Spatial Load Canvas
                </h3>
              </div>
              <span className="text-[8px] font-black bg-primary-50 border border-primary-200 text-primary-700 px-2 py-0.5 rounded uppercase tracking-wide">
                {activeTemplate?.name}
              </span>
            </div>
            <VehicleCanvas />
          </div>

          {/* Vegetable Packaging & Box Optimization recommendations card */}
          {packagingReport && packagingReport.recommendedBoxes?.length > 0 && (
            <div className="global-card p-4 hover:shadow-sm">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-slate-50 pb-2">
                <span className="material-symbols-outlined text-[15px] text-primary-600">inventory_2</span>
                Vegetable Packaging & Box Optimization
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packagingReport.recommendedBoxes.map((box, index) => (
                  <div key={index} className="bg-slate-50/50 border border-slate-100/70 rounded-xl p-3 flex items-start gap-3">
                    {/* Visual Cardboard Icon box */}
                    <div 
                      className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 border"
                      style={{ backgroundColor: box.color + '20', borderColor: box.color }}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ color: box.tapeColor }}>
                        box
                      </span>
                      <span className="text-[8px] font-black" style={{ color: box.tapeColor }}>
                        {box.boxType}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-[11px] font-black text-slate-850 truncate">
                          {box.cropName}
                        </h4>
                        <span className="text-[8px] font-black bg-primary-50 border border-primary-100 text-primary-750 px-1.5 py-0.5 rounded shrink-0">
                          {box.count} {box.count === 1 ? 'Box' : 'Boxes'}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">
                        Size: {box.boxName} ({box.boxDimensions})
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[7.5px] font-black px-1.5 py-0.2 rounded border ${
                          box.fragility === 'High' 
                            ? 'bg-rose-50 border-rose-100 text-rose-600' 
                            : box.fragility === 'Low'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                            : 'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                          Fragility: {box.fragility}
                        </span>
                        <span className="text-[7.5px] font-bold text-slate-450">
                          Avg: {Math.round(box.weightPerBox)} kg/box
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stacking / Blocking Warnings Board - Styled as alert card */}
          {physicalBlocks.length > 0 && (
            <div className="bg-rose-50 border border-rose-250 rounded-2xl p-3 shadow-xs">
              <h4 className="text-[9.5px] font-black text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                Physical Accessibility Warnings (LIFO Obstruction)
              </h4>
              <ul className="space-y-1">
                {physicalBlocks.map((block, idx) => (
                  <li key={idx} className="text-[9px] font-bold text-rose-650 list-disc ml-4">
                    {block}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AnalyticsSummary />
        </div>

        {/* Right Column: Sidebar - Styled as global-card flush */}
        <div className="xl:col-span-4 global-card-flush flex flex-col min-h-[500px]">
          <LoadSequenceSidebar />
        </div>

      </div>
    </div>
  );
};

export default LoadPlanning;
