import React from 'react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const MobileAppSection = () => {
    return (
        <section id="mobile-app" className="py-20 lg:py-28 bg-gradient-to-br from-[#059669] via-[#00B464] to-[#0D9488] relative overflow-hidden">
            {/* Interactive Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-white/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-black/10 rounded-full blur-[80px]" />
            </div>

            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Content Side */}
                    <div className="text-center lg:text-left order-2 lg:order-1">
                        <Badge 
                            variant="glass" 
                            icon="cell_tower"
                            className="mb-6 !rounded-full !py-1.5 !px-4 !bg-white/10 !text-white border-white/20 shadow-xl"
                        >
                            ALWAYS CONNECTED
                        </Badge>

                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 font-heading tracking-tight leading-[1.1]"
                        >
                            Command your farm <span className="text-green-200">anywhere.</span>
                        </motion.h2>

                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-green-50/90 text-[15px] sm:text-[16px] leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0 font-medium italic"
                        >
                            Execute trades, track live logistics, and secure instant payments. India's most powerful agricultural super-app, built for elite scale.
                        </motion.p>

                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-wrap items-center gap-4 justify-center lg:justify-start"
                        >
                            <Button 
                                href="#" 
                                variant="glass" 
                                className="!p-0.5 !bg-white border-none hover:shadow-[0_15px_30px_-8px_rgba(255,255,255,0.3)]"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-[44px]" />
                            </Button>

                            <Button 
                                href="#" 
                                variant="glass" 
                                className="!p-0.5 !bg-black !border-white/10 hover:shadow-[0_15px_30px_-8px_rgba(0,0,0,0.3)]"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-[44px]" />
                            </Button>
                        </motion.div>
                        
                        {/* Stats Summary */}
                        <div className="mt-12 pt-10 border-t border-white/10 flex flex-wrap justify-center lg:justify-start gap-8">
                            {[
                                { label: 'Downloads', val: '500K+' },
                                { label: 'Rating', val: '4.9/5' },
                                { label: 'Sellers', val: '50K+' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center lg:text-left">
                                    <div className="text-xl font-black text-white">{stat.val}</div>
                                    <div className="text-[10px] font-bold text-green-200 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Premium Phone Side */}
                    <div className="relative order-1 lg:order-2 flex justify-center py-6">
                        {/* Floating Glass Badges - Scaled Down */}
                        <motion.div 
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-16 -left-6 z-20 bg-white/20 backdrop-blur-xl border border-white/30 p-3 rounded-xl shadow-2xl hidden md:block"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
                                    <span className="material-symbols-outlined text-[#00B464] text-[18px]">paid</span>
                                </div>
                                <div className="pr-3">
                                    <div className="text-white text-[13px] font-black">₹ 14,500</div>
                                    <div className="text-green-100 text-[9px] font-bold">Payment Recieved</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div 
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute bottom-16 -right-6 z-20 bg-black/20 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl hidden md:block"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
                                    <span className="material-symbols-outlined text-white text-[18px]">trending_up</span>
                                </div>
                                <div className="pr-3">
                                    <div className="text-white text-[13px] font-black">+ 12.5 %</div>
                                    <div className="text-green-100 text-[9px] font-bold">Market Update</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Phone Mockup Case - Scaled Down */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
                            className="relative z-10 w-full max-w-[290px] hover:rotate-0 transition-transform duration-700 group cursor-default"
                        >
                            <div className="bg-[#0A2616] p-3 rounded-[3rem] shadow-[0_50px_100px_-25px_rgba(0,0,0,0.5),_0_0_0_10px_rgba(0,0,0,0.1)] relative">
                                {/* Buttons/Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-28 bg-[#0A2616] rounded-b-2xl z-30" />
                                <div className="absolute top-28 -left-3 h-14 w-1 bg-black rounded-l-md" />

                                {/* Screen Content */}
                                <div className="bg-white rounded-[2.2rem] overflow-hidden aspect-[9/18.5] relative shadow-inner">
                                    {/* App UI Implementation */}
                                    <div className="absolute top-0 left-0 w-full bg-[#00B464] h-[32%] p-6 pt-10 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                                                <span className="material-symbols-outlined text-white text-[20px]">grid_view</span>
                                            </div>
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xl">
                                                <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100">
                                                    <img src="https://i.pravatar.cc/100?u=farmer" alt="user" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-green-100 text-[12px]">Hello, Ramji 👋</p>
                                            <h3 className="text-white text-[20px] font-black leading-tight">Dashboard</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-[32%] left-0 w-full p-5 space-y-4 bg-[#F8FAF9] min-h-full">
                                        <div className="grid grid-cols-2 gap-3 -mt-8">
                                            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/[0.03] space-y-2">
                                                <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-orange-600 text-[18px]">inventory</span>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black text-slate-800">12 Active</div>
                                                    <div className="text-[9px] text-slate-400">Listings</div>
                                                </div>
                                            </div>
                                            <div className="bg-white p-3 rounded-2xl shadow-xl shadow-black/[0.03] space-y-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-blue-600 text-[18px]">local_shipping</span>
                                                </div>
                                                <div>
                                                    <div className="text-[11px] font-black text-slate-800">4 En route</div>
                                                    <div className="text-[9px] text-slate-400">Deliveries</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 pt-2">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-[12px] font-black text-slate-900">Recent Updates</h4>
                                                <span className="text-[10px] font-bold text-[#00B464]">View All</span>
                                            </div>
                                            {[
                                                { n: 'Onion (Nashik)', p: '₹ 2,450', d: '↑ 5%' },
                                                { n: 'Potato (Pune)', p: '₹ 1,120', d: '↓ 2%' }
                                            ].map((item, id) => (
                                                <div key={id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 bg-slate-50 rounded-lg" />
                                                        <div>
                                                            <div className="text-[11px] font-bold text-slate-800">{item.n}</div>
                                                            <div className="text-[9px] text-slate-400">Market Price</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[11px] font-black text-slate-900">{item.p}</div>
                                                        <div className={`text-[9px] font-bold ${item.d.includes('↑') ? 'text-green-500' : 'text-red-400'}`}>{item.d}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Bottom Nav Mockup */}
                                    <div className="absolute bottom-0 w-full h-[60px] bg-white border-t border-slate-50 flex items-center justify-around px-4">
                                        {['home', 'monitoring', 'local_mall', 'settings'].map((icon, i) => (
                                            <span key={i} className={`material-symbols-outlined text-[18px] ${i===0?'text-[#00B464]':'text-slate-300'}`}>{icon}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default MobileAppSection;
