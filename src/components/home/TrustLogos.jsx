import { motion } from 'framer-motion';
import React from 'react';

const TrustLogos = () => {
    const allLogos = [
        // National Recognition
        { name: 'Startup India', icon: 'rocket_launch' },
        { name: 'Digital India', icon: 'lan' },
        { name: 'ICAR', icon: 'account_balance' },
        { name: 'Zee News', icon: 'dynamic_feed' },
        { name: 'NDTV', icon: 'newspaper' },
        // Industry Leaders
        { name: 'NABARD', icon: 'account_balance' },
        { name: 'Ministry of Agriculture', icon: 'eco' },
        { name: 'State Bank', icon: 'assured_workload' },
        { name: 'AgriTech Corp', icon: 'agriculture' },
        { name: 'FastLogistics', icon: 'local_shipping' },
    ];

    // Duplicate for seamless loop
    const displayLogos = [...allLogos, ...allLogos];

    return (
        <section className="py-14 bg-white border-y border-slate-50 overflow-hidden relative group">
            <style>{`
                @keyframes marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee-scroll {
                    animation: marquee-scroll 40s linear infinite;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative mb-12">
                <div className="flex items-center justify-center gap-4">
                    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-slate-200" />
                    <p className="text-center text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">
                        Trusted National & Industry Partners
                    </p>
                    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-slate-200" />
                </div>
            </div>

            <div className="relative flex overflow-x-hidden">
                <div className="animate-marquee-scroll flex items-center gap-12 md:gap-20 whitespace-nowrap">
                    {displayLogos.map((logo, i) => (
                        <div
                            key={`${logo.name}-${i}`}
                            className="flex items-center gap-3 grayscale hover:grayscale-0 opacity-40 hover:opacity-100 transition-all duration-500 cursor-help group/logo"
                            title={logo.name}
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/logo:bg-green-50 transition-colors">
                                <span className="material-symbols-outlined text-[22px] text-slate-400 group-hover/logo:text-[#00B464] transition-colors">
                                    {logo.icon}
                                </span>
                            </div>
                            <span className="text-[14px] sm:text-[15px] font-black text-slate-500 group-hover/logo:text-slate-900 tracking-tighter transition-colors uppercase">
                                {logo.name}
                            </span>
                        </div>
                    ))}
                </div>
                
                {/* Visual Fades */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
};

export default TrustLogos;
