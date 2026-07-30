import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useLoadPlannerStore } from '../../store/useLoadPlannerStore';
import StatsHeader from '../../components/farmer/load-planner/StatsHeader';
import VehicleCanvas from '../../components/farmer/load-planner/VehicleCanvas';
import LoadSequenceSidebar, { getCropType } from '../../components/farmer/load-planner/LoadSequenceSidebar';
import AnalyticsSummary from '../../components/farmer/load-planner/AnalyticsSummary';
import { ArrowLeft, RefreshCw, Wifi, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const getPhysicalBlocks = (stops, activeTemplate, activeOrders) => {
  const cols = activeTemplate.cols || 3;
  const blocks = [];
  const deliveryStops = stops.filter(s => s.stopType === 'delivery');

  deliveryStops.forEach(stopA => {
    const idxA = stopA.loadingSequence - 1;
    const cA = idxA % cols;
    const rA = Math.floor(idxA / cols);
    const nameA = activeOrders.find(o => String(o._id) === String(stopA.orderId))?.crop?.name || 'Crop';
    const cropTypeA = getCropType(nameA).label;

    deliveryStops.forEach(stopB => {
      if (stopB.orderId === stopA.orderId) return;

      const idxB = stopB.loadingSequence - 1;
      const cB = idxB % cols;
      const rB = Math.floor(idxB / cols);
      const nameB = activeOrders.find(o => String(o._id) === String(stopB.orderId))?.crop?.name || 'Crop';
      const cropTypeB = getCropType(nameB).label;

      // 1. LIFO Door Obstruction: stopA must be delivered before stopB, but stopB is loaded closer to/at the door
      if (stopA.sequence < stopB.sequence && stopB.loadingSequence >= stopA.loadingSequence) {
        blocks.push(`⚠️ ${nameB} is blocking the rear door path for ${nameA}.`);
      }

      // 2. Heavy-on-Fragile Stacking Violation: Heavy item B is stacked on top of Fragile item A in same stack
      if (cA === cB && rB > rA && cropTypeB === 'Heavy' && cropTypeA === 'Fragile') {
        blocks.push(`⚠️ ${nameB} (Heavy) is stacked on top of ${nameA} (Fragile). Risk of crushing.`);
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

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header branding bar
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 19, 210, 1, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('AgriConnect™ - 3D Cargo Loading & Placement Manifest', 14, 13);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 140, 13);

      // Meta Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 25, 182, 22, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`Batch ID: #${batch._id?.toUpperCase() || 'N/A'}`, 18, 32);
      doc.text(`Vehicle Profile: ${activeTemplate?.name || 'Standard Truck'}`, 18, 41);

      doc.text(`Carrier Driver: ${batch.driver?.name || 'Unassigned'}`, 105, 32);
      doc.text(`Route Distance: ${batch.totalDistance || 0} km`, 105, 41);

      // Loading Table
      const tableColumn = ['Load Order', 'Slot #', 'Crop Produce Item', 'Qty Weight', 'Recipient & Address'];
      const tableRows = deliveryStops.map((stop, idx) => {
        const order = activeOrders.find(o => String(o._id) === String(stop.orderId));
        const cropLabel = order?.crop?.name ? `${order.crop.name} (${getCropType(order.crop.name).label})` : 'Produce Cargo';
        const qty = order?.requestedQuantity ? `${order.requestedQuantity} ${order.crop?.unit || 'Kg'}` : '-';
        const address = `${order?.vendor?.name || 'Vendor Store'} - ${stop.address || 'Address'}`;

        return [
          `Step #${idx + 1}`,
          `Slot #${stop.loadingSequence}`,
          cropLabel,
          qty,
          address
        ];
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 52,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [51, 65, 85], cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 22 },
          1: { fontStyle: 'bold', cellWidth: 20 },
          2: { fontStyle: 'bold', cellWidth: 48 },
          3: { fontStyle: 'bold', cellWidth: 25 },
          4: { cellWidth: 67 }
        }
      });

      // Signature Box
      const finalY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 15 : 180;
      if (finalY < 260) {
        doc.setDrawColor(203, 213, 225);
        doc.line(20, finalY + 12, 85, finalY + 12);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Warehouse Dispatcher Signature', 25, finalY + 16);

        doc.line(125, finalY + 12, 190, finalY + 12);
        doc.text('Driver Acknowledgment Signature', 130, finalY + 16);
      }

      doc.save(`AgriConnect_Load_Plan_#${batch._id?.slice(-6).toUpperCase() || 'MANIFEST'}.pdf`);
      toast.success('3D Loading Manifest PDF Downloaded! 📄');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate Loading Manifest PDF');
    }
  };

  useEffect(() => {
    fetchBatch();

    const handleLiveUpdate = () => {
      toast.success('Live update received 📡');
      fetchBatch();
    };

    window.addEventListener('agriconnect:notification', handleLiveUpdate);
    window.addEventListener('agriconnect:order-updated', handleLiveUpdate);
    window.addEventListener('agriconnect:refresh-data', handleLiveUpdate);

    setIsLive(true);

    return () => {
      window.removeEventListener('agriconnect:notification', handleLiveUpdate);
      window.removeEventListener('agriconnect:order-updated', handleLiveUpdate);
      window.removeEventListener('agriconnect:refresh-data', handleLiveUpdate);
    };
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
          <StatsHeader physicalBlocksCount={physicalBlocks.length} />

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
