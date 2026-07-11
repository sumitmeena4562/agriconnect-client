import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { useLoadPlannerStore } from '../../store/useLoadPlannerStore';
import StatsHeader from '../../components/farmer/load-planner/StatsHeader';
import VehicleCanvas from '../../components/farmer/load-planner/VehicleCanvas';
import LoadSequenceSidebar from '../../components/farmer/load-planner/LoadSequenceSidebar';
import AnalyticsSummary from '../../components/farmer/load-planner/AnalyticsSummary';
import { ArrowLeft, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoadPlanning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBatch } = useLoadPlannerStore();
  const [loading, setLoading] = useState(true);

  // Fetch batch details
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

  useEffect(() => {
    fetchBatch();

    // Socket.io Real-time streams subscription
    const socketHost = window.location.origin.includes('localhost') 
      ? 'http://localhost:5000' 
      : window.location.origin;
    
    const socket = io(socketHost, {
      transports: ['websocket'],
      upgrade: false
    });

    socket.on('connect', () => {
      console.log('Socket.io connected to logistics server stream.');
    });

    socket.on(`batch-${id}-update`, (data) => {
      toast.success('Live load plan update received!');
      fetchBatch();
    });

    return () => {
      socket.disconnect();
    };
  }, [id, fetchBatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 rounded-full border-3 border-indigo-100 border-t-indigo-650 animate-spin" />
        <span className="text-[12px] font-bold text-slate-400">Loading dynamic load canvas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer-dashboard/batches')}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[20px] font-black text-slate-800 tracking-tight leading-none mb-1 flex items-center gap-2">
              <span>🚚</span> Logistics & Load Planning Console
            </h1>
            <p className="text-[11.5px] text-slate-400 font-semibold">
              Design trailer spatial arrangements, check LIFO order rules, and simulate load distribution.
            </p>
          </div>
        </div>

        <button
          onClick={fetchBatch}
          className="w-9 h-9 rounded-xl hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors shrink-0 self-start sm:self-center"
          title="Reload Batch Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main layout grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left main planner (xl:col-span-8) */}
        <div className="xl:col-span-8 space-y-6 flex flex-col min-h-0">
          
          {/* KPI metrics bar */}
          <StatsHeader />

          {/* Konva vehicle canvas */}
          <div className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
            <div>
              <h3 className="text-[12.5px] font-black text-slate-850 uppercase tracking-wider">Spatial Load Canvas</h3>
              <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Drag cargo items from the sequence list and drop them onto the slots</p>
            </div>
            <VehicleCanvas />
          </div>

          {/* Recharts Analytics distribution graph */}
          <AnalyticsSummary />

        </div>

        {/* Right load controller sidebar (xl:col-span-4) */}
        <div className="xl:col-span-4 bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-xs h-[680px]">
          <LoadSequenceSidebar />
        </div>
      </div>

    </div>
  );
};

export default LoadPlanning;
