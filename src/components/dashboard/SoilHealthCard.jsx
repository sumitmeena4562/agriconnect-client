import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const SoilHealthCard = ({ data }) => {
    const defaultData = {
        nitrogen: 72,
        phosphorus: 58,
        potassium: 84,
        ph: 6.8,
        moisture: 42,
        lastTested: 'March 28, 2026',
        soilType: 'Black Cotton Soil'
    };

    const health = data || defaultData;

    const NutrientGauge = ({ label, value, color, delay }) => (
        <div className="flex flex-col items-center gap-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                    <circle 
                        cx="32" cy="32" r="28" 
                        fill="none" stroke="currentColor" 
                        strokeWidth="4" className="text-slate-100" 
                    />
                    <motion.circle 
                        cx="32" cy="32" r="28" 
                        fill="none" stroke="currentColor" 
                        strokeWidth="4" strokeDasharray="175.9"
                        initial={{ strokeDashoffset: 175.9 }}
                        animate={{ strokeDashoffset: 175.9 - (175.9 * value) / 100 }}
                        transition={{ duration: 1.5, delay, ease: "easeOut" }}
                        strokeLinecap="round" 
                        className={color}
                    />
                </svg>
                <span className="absolute text-[11px] font-black text-slate-900">{value}%</span>
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="!rounded-[36px] bg-white border border-slate-100 p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary-500 text-[18px]">science</span>
                            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Soil Intelligence</h3>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Last Lab Test: {health.lastTested}</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                        {health.soilType}
                    </div>
                </div>

                {/* NPK Gauges */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <NutrientGauge label="Nitrogen (N)" value={health.nitrogen} color="text-primary-500" delay={0.2} />
                    <NutrientGauge label="Phosphorus (P)" value={health.phosphorus} color="text-info-500" delay={0.4} />
                    <NutrientGauge label="Potassium (K)" value={health.potassium} color="text-amber-500" delay={0.6} />
                </div>

                {/* pH & Moisture Vitality */}
                <div className="space-y-6">
                    {/* pH Level */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">pH Level</span>
                            <span className="text-[11px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{health.ph} pH</span>
                        </div>
                        <div className="relative h-2 w-full bg-gradient-to-r from-rose-400 via-emerald-400 to-indigo-400 rounded-full">
                            <motion.div 
                                initial={{ left: 0 }}
                                animate={{ left: `${(health.ph / 14) * 100}%` }}
                                transition={{ duration: 1, delay: 0.8 }}
                                className="absolute -top-1 w-4 h-4 bg-white border-2 border-slate-900 rounded-full shadow-lg -translate-x-1/2"
                            />
                        </div>
                        <div className="flex justify-between mt-1 px-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Acidic</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Neutral</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Alkaline</span>
                        </div>
                    </div>

                    {/* Moisture Content */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VWC Moisture</span>
                            <span className="text-[11px] font-black text-info-600">{health.moisture}% Active</span>
                        </div>
                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${health.moisture}%` }}
                                transition={{ duration: 1, delay: 1 }}
                                className="h-full bg-gradient-to-r from-info-300 to-info-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 -mx-8 -mb-8 px-8 py-4">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-tight leading-relaxed">
                        <span className="text-primary-600">Pro Tip:</span> Nitrogen is slightly below optimal. <br/>Consider urea application in Sector 4.
                    </p>
                    <button className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-primary-500 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">history</span>
                    </button>
                </div>
            </Card>
        </motion.div>
    );
};

export default SoilHealthCard;
