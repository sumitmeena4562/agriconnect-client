import React from 'react';

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
            img: "https://i.pravatar.cc/150?u=ram"
        },
        {
            quote: "Buying bulk vegetables is now super easy. Quality is always fresh because it comes straight from the farm.",
            name: "Suresh Kumar (Fresh Mart)",
            location: "Pune, Maharashtra",
            role: "Vendor",
            roleColor: "bg-[#EFF5FF] text-[#2D80E3]",
            roleIcon: "storefront",
            stars: 5,
            img: "https://i.pravatar.cc/150?u=suresh"
        },
        {
            quote: "I love knowing exactly where my food comes from. The QR code traceability is amazing!",
            name: "Priya Sharma",
            location: "Mumbai, Maharashtra",
            role: "Customer",
            roleColor: "bg-[#EAF6ED] text-[#28A745]",
            roleIcon: "shopping_basket",
            stars: 4,
            img: "https://i.pravatar.cc/150?u=priya"
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

                {/* Featured Video Success Story */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mb-16 lg:mb-20 relative group px-2 sm:px-0"
                >
                    <div className="aspect-[4/3] sm:aspect-video rounded-[24px] sm:rounded-[32px] overflow-hidden bg-slate-900 shadow-2xl relative border-[4px] sm:border-8 border-white">
                        <img 
                            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                            alt="Farmer Success Story" 
                            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 group-hover:opacity-60 transition-all duration-1000"
                        />
                        {/* Gradient overlay for perfect text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8 text-center z-10">
                            <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-[#00B464] text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,180,100,0.5)] mb-4 sm:mb-6 glass-shine transition-colors hover:bg-green-500"
                            >
                                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ml-1 sm:ml-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </motion.button>
                            
                            <h3 className="text-white text-[18px] sm:text-2xl lg:text-3xl font-black mb-2 drop-shadow-lg leading-tight px-4">
                                Watch: How Ram became a Digital Farmer
                            </h3>
                            
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full mt-1">
                                <span className="w-1.5 h-1.5 bg-[#00B464] rounded-full animate-pulse" />
                                <p className="text-white text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.1em] drop-shadow-md">Verified Success Story • Nashik</p>
                            </div>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -z-10 -bottom-4 sm:-bottom-6 -right-2 sm:-right-6 w-24 sm:w-32 h-24 sm:h-32 bg-[#2F80ED]/10 rounded-full blur-2xl" />
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="global-card group flex flex-col items-start glass-shine"
                        >
                            {/* Quote Icon & Role */}
                            <div className="w-full flex items-center justify-between mb-4">
                                <span className="material-symbols-outlined text-[40px] text-slate-200 group-hover:text-[#00B464]/20 transition-colors -ml-2 -mt-2">format_quote</span>
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${review.roleColor} text-[9px] font-black tracking-widest uppercase`}>
                                    <span className="material-symbols-outlined text-[14px]">{review.roleIcon}</span>
                                    {review.role}
                                </div>
                            </div>

                            <p className="text-slate-700 font-medium text-[14px] leading-relaxed mb-6 italic">
                                "{review.quote}"
                            </p>

                            <div className="mt-auto w-full">
                                {/* Solid SVG Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-4 h-4 ${i < review.stars ? 'text-[#F59E0B]' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
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
