import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';

const HeroSection = () => {
    return (
        <section id="home" className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-green-50/50 via-white/40 to-transparent">

            {/* Background Blobs (Static) */}
            <div className="absolute top-20 -left-32 w-72 h-72 bg-green-200/30 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] blur-3xl pointer-events-none" />
            <div className="absolute bottom-10 -right-32 w-80 h-80 bg-emerald-200/20 rounded-[50%_50%_20%_80%/20%_80%_20%_80%] blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                    {/* Content */}
                    <div className="text-center lg:text-left">
                        {/* Badge */}
                        <Badge 
                            variant="success" 
                            size="md" 
                            className="mb-5 !bg-[#EEFDF3] !text-[#00B464] border-none"
                            animate={true}
                        >
                            India's Direct Farm-to-Market Network
                        </Badge>

                        {/* Headline */}
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                            className="text-4xl sm:text-5xl lg:text-[56px] font-black text-[#0A2616] leading-[1.1] tracking-tighter mb-5 font-heading">
                            Connect Direct.<br className="hidden lg:block"/>
                            <span className="text-[#00B464]"> Maximize Profit.</span>
                            <br className="hidden lg:block"/> Grow Together.
                        </motion.h1>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                            className="text-[15px] sm:text-[16px] text-[#556070] mb-8 leading-[1.6] max-w-lg mx-auto lg:mx-0 font-medium italic">
                            India's leading marketplace for farmers, bulk vendors, and health-conscious customers. Eliminating middlemen for a fairer, fresher future.
                        </motion.p>

                        {/* CTA Cards - Reverted to Small & Equal */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                            className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[440px] mx-auto lg:mx-0">
                            {[
                                { to: '/farmer-registration', icon: 'agriculture', label: 'Farmer', desc: 'Top Rates', color: 'text-primary-600', bg: 'bg-primary-50' },
                                { to: '/vendor-registration', icon: 'storefront', label: 'Vendor', desc: 'Bulk Deals', color: 'text-info-600', bg: 'bg-info-50' },
                                { to: '/customer-registration', icon: 'shopping_basket', label: 'Customer', desc: 'Zero Fees', color: 'text-accent-500', bg: 'bg-accent-50' },
                            ].map(cta => (
                                <Link key={cta.label} to={cta.to}
                                    className="group relative p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-[#00B464]/30 hover:shadow-xl hover:shadow-green-50 transition-all duration-300 text-center active:scale-[0.98] glass-shine">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto ${cta.bg} ${cta.color} rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                                        <span className="material-symbols-outlined text-xl sm:text-[24px] icon-pop">{cta.icon}</span>
                                    </div>
                                    <h3 className="font-black text-[12px] sm:text-[13px] text-gray-900">{cta.label}</h3>
                                    <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-tighter">{cta.desc}</p>
                                </Link>
                            ))}
                        </motion.div>

                        {/* Simple Stats Bar Below CTAs */}
                        <motion.div 
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.6 }}
                            className="mt-10 flex items-center justify-center lg:justify-start gap-6 border-t border-slate-100 pt-8"
                        >
                            <div className="text-center lg:text-left">
                                <p className="text-[18px] font-black text-[#0A2616] leading-none mb-1">25K+</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Farmers</p>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100" />
                            <div className="text-center lg:text-left">
                                <p className="text-[18px] font-black text-[#0A2616] leading-none mb-1">800+</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mandis</p>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-100" />
                            <div className="text-center lg:text-left">
                                <p className="text-[18px] font-black text-[#0A2616] leading-none mb-1">Instant</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payments</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image - Reverted to Right */}
                    <div className="relative flex items-center justify-center mt-10 lg:mt-0 lg:ml-4">
                        <div className="absolute inset-0 bg-green-200/40 rounded-full blur-[70px] scale-90" />
                        <div className="relative w-full max-w-[320px] sm:max-w-md lg:max-w-[480px] mx-auto">
                            <div className="rounded-[40px] overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] flex justify-center w-full border-[8px] border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Fresh farm produce"
                                    className="object-cover w-full h-[280px] sm:h-[380px] lg:h-[480px] hover:scale-105 transition-transform duration-1000"
                                    loading="eager"
                                />
                            </div>

                            {/* Floating Stats Card (Farmers Earning) */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}
                                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100 z-10 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#00B464]">trending_up</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth</p>
                                        <p className="text-[16px] font-black text-gray-900">+40% Higher Rates</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
