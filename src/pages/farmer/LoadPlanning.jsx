import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { useLoadPlannerStore } from '../../store/useLoadPlannerStore';
import StatsHeader from '../../components/farmer/load-planner/StatsHeader';
import VehicleCanvas from '../../components/farmer/load-planner/VehicleCanvas';
import LoadSequenceSidebar from '../../components/farmer/load-planner/LoadSequenceSidebar';
import AnalyticsSummary from '../../components/farmer/load-planner/AnalyticsSummary';
import { ArrowLeft, RefreshCw, Wifi } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LoadPlanning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setBatch, batch } = useLoadPlannerStore();
  const [loading, setLoading]     = useState(true);
  const [isLive, setIsLive]       = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin" />
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
              <h1 className="text-[16px] font-black text-slate-800 tracking-tight leading-none">
                🚚 Load Planning Console
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

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          title="Reload"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Grid (Unified Height) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        
        {/* Left Column: Visualizer, KPIs, Analytics */}
        <div className="xl:col-span-8 space-y-4 flex flex-col justify-between">
          <StatsHeader />

          {/* 3D Canvas Box */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  Spatial Load Canvas
                </h3>
              </div>
              <span className="text-[8px] font-black bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase tracking-wide">
                {useLoadPlannerStore.getState().activeTemplate?.name}
              </span>
            </div>
            <VehicleCanvas />
          </div>

          <AnalyticsSummary />
        </div>

        {/* Right Column: Sidebar */}
        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[500px]">
          <LoadSequenceSidebar />
        </div>

      </div>
    </div>
  );
};

export default LoadPlanning;
