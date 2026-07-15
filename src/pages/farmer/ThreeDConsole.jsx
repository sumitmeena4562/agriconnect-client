import React, { useState } from 'react';
import Scene from '../../components/farmer/load-planner-3d/Scene';
import UIOverlay from '../../components/farmer/load-planner-3d/UIOverlay';
import { toast } from 'react-hot-toast';

// Mock database output matching Google Sheets row structure
const INITIAL_SHEET_DATA = [
  { order_id: "ORD-101", box_type: "Tomato Pallet Space", width: 1.2, height: 1.5, depth: 1.2, color: "#f97316", pos_x: -3.5, pos_y: 0.75, pos_z: 0.4 },
  { order_id: "ORD-102", box_type: "Potato Heavy Crate",  width: 1.2, height: 1.2, depth: 1.2, color: "#a16207", pos_x: -3.5, pos_y: 0.6,  pos_z: -0.8 },
  { order_id: "ORD-103", box_type: "Dairy Cold Storage",  width: 1.0, height: 1.4, depth: 1.0, color: "#0284c7", pos_x: -1.0, pos_y: 0.7,  pos_z: 0.0 },
  { order_id: "ORD-104", box_type: "Wheat Grain Sacks",   width: 1.4, height: 1.6, depth: 1.2, color: "#10b981", pos_x: 2.0,  pos_y: 0.8,  pos_z: 0.2 }
];

const ThreeDConsole = () => {
  const [boxes, setBoxes] = useState(INITIAL_SHEET_DATA);
  const [isEditMode, setEditMode] = useState(false);

  const handleUpdatePosition = (orderId, newPos) => {
    setBoxes((prev) =>
      prev.map((box) =>
        box.order_id === orderId
          ? { ...box, pos_x: newPos[0], pos_y: newPos[1], pos_z: newPos[2] }
          : box
      )
    );
  };

  const handleExport = () => {
    console.log("Saving new coordinates back to Google Sheets database...", boxes);
    toast.success("Coordinates exported successfully! Check logs.");
  };

  return (
    <div className="space-y-4 pb-6 max-w-[1400px] mx-auto px-2">
      
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-black text-slate-800 tracking-tight leading-none">
            📦 R3F Google Sheets Load Planner
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Google Sheets synchronized spatial logistics & dynamic bin packing visualizer.
          </p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Column: 3D Scene */}
        <div className="lg:col-span-8">
          <Scene
            boxes={boxes}
            isEditMode={isEditMode}
            onUpdatePosition={handleUpdatePosition}
          />
        </div>

        {/* Right Column: UI Overlay */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[500px]">
          <UIOverlay
            boxes={boxes}
            isEditMode={isEditMode}
            setEditMode={setEditMode}
            onExport={handleExport}
          />
        </div>

      </div>

    </div>
  );
};

export default ThreeDConsole;
