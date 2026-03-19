import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
    return (
        <section id="home" className="relative pt-10 pb-16 sm:pt-16 sm:pb-20 lg:pt-16 lg:pb-24 overflow-hidden bg-gradient-to-b from-green-50/80 via-white/40 to-transparent">

            {/* Background Blobs (Static) */}
            <div className="absolute top-20 -left-32 w-72 h-72 bg-green-200/30 rounded-[30%_70%_70%_30%/30%_30%_70%_70%] blur-3xl" />
            <div className="absolute bottom-10 -right-32 w-80 h-80 bg-emerald-200/20 rounded-[50%_50%_20%_80%/20%_80%_20%_80%] blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

                        {/* Content */}
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EEFDF3] rounded-full mb-5 max-w-fit mx-auto lg:mx-0">
                                <span className="w-1.5 h-1.5 bg-[#00B464] rounded-full animate-pulse" />
                                <span className="text-[#00B464] font-bold text-[10px] sm:text-[11px] tracking-[0.05em] uppercase">
                                    Farm to Fork — Direct & Fresh
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                                className="text-4xl sm:text-5xl lg:text-[52px] font-black text-[#0A2616] leading-[1.1] tracking-tight mb-5 font-heading">
                                Connecting<br className="hidden lg:block"/>
                                <span className="text-[#00B464]"> Farmers</span>, 
                                <span className="text-[#2F80ED]"> Vendors</span>
                                <br className="hidden lg:block"/>& Customers.
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                                className="text-[15px] sm:text-[16px] text-[#556070] mb-8 leading-[1.6] max-w-lg mx-auto lg:mx-0">
                                India's first unified platform — sell directly, buy in bulk, and get farm-fresh produce at fair prices. No middlemen.
                            </motion.p>

                            {/* CTA Cards */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
                                className="grid grid-cols-3 gap-3 sm:gap-4 max-w-[440px] mx-auto lg:mx-0">
                                {[
                                    { to: '/farmer-registration', icon: 'agriculture', label: 'Farmer', desc: 'Sell Produce', bgText: 'bg-[#00B464] text-white shadow-xl shadow-green-200/50 scale-105 z-10', primary: true },
                                    { to: '/vendor-registration', icon: 'storefront', label: 'Vendor', desc: 'Bulk Buy', bgText: 'bg-white text-[#2D80E3] border-slate-100' },
                                    { to: '/customer-registration', icon: 'shopping_basket', label: 'Customer', desc: 'Buy Fresh', bgText: 'bg-white text-[#28A745] border-slate-100' },
                                ].map(cta => (
                                    <Link key={cta.label} to={cta.to}
                                        className={`group relative p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 text-center active:scale-[0.98] ${cta.bgText} ${!cta.primary ? 'hover:border-[#00B464]/30 hover:shadow-lg' : 'hover:scale-110'}`}>
                                        {cta.primary && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest uppercase shadow-lg">Popular</div>
                                        )}
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-full flex items-center justify-center mb-2.5 transition-transform ${cta.primary ? 'bg-white/20' : 'bg-slate-50'}`}>
                                            <span className="material-symbols-outlined text-xl sm:text-[24px]">{cta.icon}</span>
                                        </div>
                                        <h3 className={`font-black text-[13px] sm:text-[14px] ${cta.primary ? 'text-white' : 'text-gray-900'}`}>{cta.label}</h3>
                                        <p className={`text-[10px] sm:text-[11px] mt-1 ${cta.primary ? 'text-white/70' : 'text-gray-500'}`}>{cta.desc}</p>
                                    </Link>
                                ))}
                            </motion.div>

                            {/* Trust Badges */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6">
                                {[
                                    { icon: 'verified', label: 'Verified Profiles' },
                                    { icon: 'bolt', label: 'Fast Logistics' },
                                    { icon: 'shield', label: 'Secure Payments' },
                                ].map(b => (
                                    <div key={b.label} className="flex items-center gap-1.5 text-gray-500 font-medium text-[12px] sm:text-[13px]">
                                        <span className="material-symbols-outlined text-[#00B464] text-[18px]">{b.icon}</span>
                                        <span>{b.label}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative flex items-center justify-center mt-10 lg:mt-0 lg:ml-4">
                            {/* Glow behind image */}
                            <div className="absolute inset-0 bg-green-200/40 rounded-full blur-[70px] scale-90" />

                            <div className="relative anim-float w-full max-w-[320px] sm:max-w-md lg:max-w-[460px] mx-auto">
                                <div className="rounded-[32px] overflow-hidden shadow-[0_20px_50px_-15px_rgba(0,0,0,0.15)] flex justify-center w-full">
                                    <img
                                        src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                        alt="Fresh farm produce"
                                        className="object-cover w-full h-[260px] sm:h-[340px] lg:h-[440px]"
                                        loading="eager"
                                    />
                                </div>

                                {/* Floating Stats Card (Farmers Earning) */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.8, ease: "easeOut" }}
                                    className="absolute -bottom-5 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] px-4 py-3 border border-gray-100 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#EEFDF3] rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#00B464] text-[22px]">trending_up</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-medium text-gray-400 mb-0.5">Farmers Earning</p>
                                            <p className="text-[17px] font-black text-gray-900 leading-none">
                                                +40% <span className="text-gray-400 text-[10px] font-medium ml-0.5 tracking-wide uppercase">more</span>
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Badge (Deliveries) */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
                                    className="absolute -top-5 -right-4 sm:-top-6 sm:-right-6 bg-white rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.08)] px-4 py-3 border border-gray-100 z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#FFF8E6] rounded-xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[#F5B01B] text-[22px]">local_shipping</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-gray-400 mb-0.5 tracking-wide uppercase">Deliveries</p>
                                            <p className="text-[17px] font-black text-gray-900 leading-none">15K+</p>
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
