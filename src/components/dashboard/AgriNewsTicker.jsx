import React from 'react';
import { motion } from 'framer-motion';

const AgriNewsTicker = () => {
    const news = [
        "Govt announces 4% subsidy on solar pump installations for small farmers.",
        "Monsoon arrival in Maharashtra expected by June 12, 2026.",
        "Special wheat procurement centers opening in Nashik district tomorrow.",
        "Kisan Credit Card (KCC) limit increased by 15% for early payers.",
        "AgriConnect: Expert session on organic pest control at 4:30 PM."
    ];

    return (
        <div className="w-full bg-slate-900 overflow-hidden py-3 relative border-y border-white/5">
            {/* Ticker Container */}
            <div className="flex items-center gap-10 whitespace-nowrap">
                <div className="px-4 py-1.5 bg-primary-500 rounded-lg text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 shrink-0 ml-4">
                    <span className="material-symbols-outlined text-[14px]">bolt</span>
                    LIVE NEWS
                </div>

                <motion.div 
                    animate={{ x: [0, -1000] }}
                    transition={{ 
                        duration: 30, 
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="flex items-center gap-20"
                >
                    {news.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 px-4 py-2 rounded-xl transition-all">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight group-hover:text-primary-400">
                                {item}
                            </p>
                        </div>
                    ))}
                    {/* Duplicate for Seamless Loop */}
                    {news.map((item, idx) => (
                        <div key={`dup-${idx}`} className="flex items-center gap-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight">
                                {item}
                            </p>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Gradient Overlays */}
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10" />
        </div>
    );
};

export default AgriNewsTicker;
