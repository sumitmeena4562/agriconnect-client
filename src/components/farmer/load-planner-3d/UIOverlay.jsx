import React from 'react';
import { ToggleLeft, ToggleRight, Layers, FileText, CheckCircle } from 'lucide-react';

const UIOverlay = ({ boxes, isEditMode, setEditMode, onExport }) => {
  // Volumetric calculations
  const totalVolume = boxes.reduce((acc, box) => acc + (box.width * box.height * box.depth), 0);
  const containerVolume = 13.6 * 2.6 * 2.4; // ~84.8 m³
  const fillPercent = Math.min(100, Math.round((totalVolume / containerVolume) * 100));

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-full max-h-[600px] overflow-hidden">
      
      {/* Header and Toggle Edit Mode */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
        <div>
          <h2 className="text-[12px] font-black text-slate-800 tracking-tight uppercase">Manifest & Placement</h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{boxes.length} Active Cargo Units</p>
        </div>
        <button
          onClick={() => setEditMode(!isEditMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black cursor-pointer transition-colors ${
            isEditMode
              ? 'bg-rose-50 border-rose-250 text-rose-700'
              : 'bg-indigo-50 border-indigo-250 text-indigo-700'
          }`}
        >
          {isEditMode ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          <span>{isEditMode ? 'MANUAL EDIT ON' : 'LOCK POSITION'}</span>
        </button>
      </div>

      {/* Volumetric Metrics Card */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 shrink-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Volumetric Fill</span>
          <span className="text-[11px] font-black text-indigo-600">{fillPercent}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${fillPercent}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
          <span>Loaded: {Math.round(totalVolume * 10) / 10} m³</span>
          <span>Max Space: {Math.round(containerVolume)} m³</span>
        </div>
      </div>

      {/* Manifest Box Lists */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {boxes.map((box) => (
          <div
            key={box.order_id}
            className="flex items-center justify-between border border-slate-150 rounded-xl p-2.5 bg-white hover:border-slate-350 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-3.5 h-3.5 rounded-md border border-white shrink-0 shadow-xs" style={{ backgroundColor: box.color }} />
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-800 truncate leading-none">{box.box_type}</p>
                <p className="text-[9px] text-slate-400 font-semibold truncate mt-0.5">#{box.order_id}</p>
              </div>
            </div>
            
            <div className="text-right shrink-0">
              <p className="text-[9.5px] font-bold text-slate-600 tabular-nums">
                {box.width}x{box.height}x{box.depth}m
              </p>
              <p className="text-[8.5px] text-indigo-500 font-black tabular-nums mt-0.5">
                XYZ: {box.pos_x}, {box.pos_y}, {box.pos_z}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Export Action Trigger */}
      <div className="pt-3 border-t border-slate-100 shrink-0">
        <button
          onClick={onExport}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] rounded-xl shadow-md cursor-pointer border-0 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>EXPORT GOOGLE SHEETS STATE</span>
        </button>
      </div>

    </div>
  );
};

export default UIOverlay;
