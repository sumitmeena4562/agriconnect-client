import React from 'react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
    const features = [
        {
            title: "Verified Community",
            description: "Interact with 100% KYC verified Farmers and bulk buyers for a stress-free experience.",
            icon: "verified_user",
            colorClass: "bg-blue-50 text-blue-600"
        },
        {
            title: "Live Mandi Rates",
            description: "Access real-time APMC market prices across India to time your sales perfectly.",
            icon: "monitoring",
            colorClass: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Smart Logistics",
            description: "Farm gate to vendor doorstep. We handle everything including Mandi tax and paperwork.",
            icon: "local_shipping",
            colorClass: "bg-orange-50 text-orange-600"
        },
        {
            title: "QR Traceability",
            description: "Farmers can build a brand. Buyers scan QR to see soil report, farm origin and harvest date.",
            icon: "qr_code_scanner",
            colorClass: "bg-purple-50 text-purple-600"
        },
        {
            title: "Regional Language Support",
            description: "Available in Hindi, Marathi, Telugu and 5+ more regional languages for every Indian farmer.",
            icon: "translate",
            colorClass: "bg-pink-50 text-pink-600"
        },
        {
            title: "Weather Predictions",
            description: "Hyper-local weather updates and smart harvesting advice based on AI satellite data.",
            icon: "cloudy_snowing",
            colorClass: "bg-cyan-50 text-cyan-600"
        }
    ];

    return (
        <section id="features" className="py-12 sm:py-16 bg-transparent relative">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3E8FF] rounded-md mb-4"
                    >
                        <span className="text-[#A855F7] font-black text-[12px] leading-none mb-[2px]">#</span>
                        <span className="text-[#A855F7] font-bold text-[9px] tracking-[0.1em] uppercase">
                            FEATURES
                        </span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2616] mb-4 font-heading tracking-tight leading-tight"
                    >
                        Powerful Features, <span className="text-slate-300">Simple to Use</span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-500 text-[14px] sm:text-[15px] leading-[1.6]"
                    >
                        Everything you need to buy and sell agricultural produce efficiently.
                    </motion.p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 border border-gray-100/50 group cursor-default hover:-translate-y-1"
                        >
                            {/* Icon Container */}
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.colorClass} flex items-center justify-center mb-5 shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                <span className="material-symbols-outlined text-white text-[24px] sm:text-[28px]">
                                    {feature.icon}
                                </span>
                            </div>

                            {/* Text Content */}
                            <h3 className="text-[16px] sm:text-[17px] font-black text-[#0A2616] mb-2 group-hover:text-[#00B464] transition-colors duration-300 tracking-tight">
                                {feature.title}
                            </h3>
                            
                            <p className="text-slate-500 text-[12px] sm:text-[13px] leading-[1.5]">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default FeaturesSection;
