import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';

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
                <SectionHeader 
                    badge="TESTIMONIALS"
                    badgeIcon="grade"
                    badgeClassName="!bg-yellow-100 !text-yellow-700 border-none"
                    title={<>Trusted by <span className="text-primary-600">Thousands</span></>}
                    description="Hear from the community changing Indian agriculture."
                />

                {/* Featured Video Success Story */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mb-16 lg:mb-20 relative group"
                >
                    <div className="aspect-video rounded-[32px] overflow-hidden bg-slate-900 shadow-2xl relative border-8 border-white">
                        <img 
                            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                            alt="Farmer Success Story" 
                            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                            <Button 
                                variant="primary"
                                className="!w-20 !h-20 sm:!w-24 sm:!h-24 !rounded-full !shadow-[0_0_30px_rgba(0,180,100,0.5)] mb-6 glass-shine"
                                icon="play_arrow"
                                iconPosition="right"
                                style={{ '--icon-size': '40px' }}
                            />
                            <h3 className="text-white text-xl sm:text-2xl lg:text-3xl font-black mb-2 drop-shadow-lg">Watch: How Ram became a Digital Farmer</h3>
                            <p className="text-white/80 text-[13px] sm:text-[14px] font-bold uppercase tracking-widest drop-shadow-md">Verified Success Story • Nashik, Maharashtra</p>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -z-10 -bottom-6 -right-6 w-32 h-32 bg-[#2F80ED]/10 rounded-full blur-2xl" />
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {reviews.map((review, index) => (
                        <Card
                            key={index}
                            className="flex flex-col items-start glass-shine"
                            transition={{ duration: 0.5, delay: index * 0.1 }}
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
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
