import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
    const reviews = [
        {
            quote: "Earlier I used to get low rates at mandi with delayed payments. On AgriConnect I get instant payment and fair prices.",
            name: "Ram Patil",
            location: "Nashik, Maharashtra",
            role: "Farmer",
            roleColor: "bg-[#FFF3E5] text-[#FA8231]",
            roleIcon: "agriculture",
            stars: 5,
            img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=100&h=100"
        },
        {
            quote: "Buying bulk vegetables is now super easy. Quality is always fresh because it comes straight from the farm.",
            name: "Suresh Kumar (Fresh Mart)",
            location: "Pune, Maharashtra",
            role: "Vendor",
            roleColor: "bg-[#EFF5FF] text-[#2D80E3]",
            roleIcon: "storefront",
            stars: 5,
            img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=100&h=100"
        },
        {
            quote: "I love knowing exactly where my food comes from. The QR code traceability is amazing!",
            name: "Priya Sharma",
            location: "Mumbai, Maharashtra",
            role: "Customer",
            roleColor: "bg-[#EAF6ED] text-[#28A745]",
            roleIcon: "shopping_basket",
            stars: 4,
            img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100"
        }
    ];

    return (
        <section id="testimonials" className="py-12 sm:py-16 bg-[#F9FAFB] relative overflow-hidden">
            {/* Soft decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-50/50 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
                
                {/* Header */}
                <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF9C3] rounded-md mb-4"
                    >
                        <span className="material-symbols-outlined text-[#CA8A04] text-[13px]">grade</span>
                        <span className="text-[#CA8A04] font-bold text-[9px] tracking-[0.1em] uppercase">
                            TESTIMONIALS
                        </span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2616] mb-4 font-heading tracking-tight leading-tight"
                    >
                        Trusted by <span className="text-[#00B464]">Thousands</span>
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-500 text-[13px] sm:text-[14px] leading-[1.6]"
                    >
                        Hear from the community changing Indian agriculture.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-2xl p-5 sm:p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-500 border border-gray-100/50 group flex flex-col items-start"
                        >
                            {/* Quote Icon & Role */}
                            <div className="w-full flex items-center justify-between mb-5">
                                <span className="material-symbols-outlined text-[32px] text-gray-100 group-hover:text-green-50 transition-colors">format_quote</span>
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${review.roleColor} text-[8px] font-black tracking-wider uppercase`}>
                                    <span className="material-symbols-outlined text-[12px]">{review.roleIcon}</span>
                                    {review.role}
                                </div>
                            </div>

                            <p className="text-[#0A2616] font-medium text-[13px] sm:text-[14px] leading-[1.6] mb-6 italic">
                                "{review.quote}"
                            </p>

                            <div className="mt-auto w-full">
                                {/* Stars */}
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-symbols-outlined text-[14px]" 
                                              style={{ color: i < review.stars ? '#F59E0B' : '#E2E8F0' }}>
                                            star
                                        </span>
                                    ))}
                                </div>

                                {/* Profile */}
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-50">
                                        <img src={review.img} alt={review.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-black text-[#0A2616] leading-none mb-1">{review.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-400">{review.location}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
