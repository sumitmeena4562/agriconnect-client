import React from 'react';
import { motion } from 'framer-motion';

const FeaturesSection = () => {
    const features = [
        {
            title: "Verified Ecosystem",
            description: "Trade with 100% KYC-verified bulk buyers and farmers. Zero risk, absolute trust.",
            icon: "verified_user",
            colorClass: "bg-blue-50 text-blue-600"
        },
        {
            title: "Real-time Profit Pulse",
            description: "Live Mandi rates & APMC data from across India. Time your sales to maximize margins.",
            icon: "monitoring",
            colorClass: "bg-emerald-50 text-emerald-600"
        },
        {
            title: "Zero-Hassle Logistics",
            description: "Direct farm-gate collection. We handle Mandi tax, loading, and doorstep delivery.",
            icon: "local_shipping",
            colorClass: "bg-orange-50 text-orange-600"
        },
        {
            title: "Brand Traceability",
            description: "Build your farm's brand. QR codes show harvest date, origin, and soil quality reports.",
            icon: "qr_code_scanner",
            colorClass: "bg-purple-50 text-purple-600"
        },
        {
            title: "Regional Optimization",
            description: "Localized interface in Hindi, Marathi, Telugu & more. Built for every Indian village.",
            icon: "translate",
            colorClass: "bg-pink-50 text-pink-600"
        },
        {
            title: "Harvest Intelligence",
            description: "AI-driven local weather predictions and smart harvesting advice to secure your crop.",
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
                            className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,180,100,0.08)] transition-all duration-300 border border-gray-100 group cursor-default hover:-translate-y-1.5 glass-shine"
                        >
                            {/* Icon Container - Higher Contrast */}
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${feature.colorClass.split(' ')[0]} flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                <span className={`material-symbols-outlined ${feature.colorClass.split(' ')[1]} text-[24px] sm:text-[28px] font-bold icon-pop`}>
                                    {feature.icon}
                                </span>
                            </div>

                            {/* Text Content - Consistent Titles */}
                            <h3 className="text-[17px] sm:text-[18px] font-black text-[#0A2616] mb-2.5 transition-colors duration-300 tracking-tight">
                                {feature.title}
                            </h3>
                            
                            <p className="text-[#556070] text-[13px] sm:text-[14px] leading-[1.6] font-medium">
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
