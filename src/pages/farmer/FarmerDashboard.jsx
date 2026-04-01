import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const FarmerDashboard = () => {
    // Mock Data for UI
    const stats = [
        { label: 'Total Land', value: '12.5', unit: 'Acres', icon: 'landscape', color: 'bg-primary-500', glow: 'shadow-primary-500/20', trend: '+2% from last season' },
        { label: 'Active Crops', value: '04', unit: 'Types', icon: 'potted_plant', color: 'bg-amber-500', glow: 'shadow-amber-500/20', trend: '3 Harvests soon' },
        { label: 'Market Value', value: '₹4.2L', unit: 'Estimated', icon: 'account_balance_wallet', color: 'bg-info-500', glow: 'shadow-info-500/20', trend: 'Prices up by 5%' },
        { label: 'Health Score', value: '94%', unit: 'Optimal', icon: 'health_and_safety', color: 'bg-primary-500', glow: 'shadow-primary-500/20', trend: 'Perfect soil moisture' },
    ];

    const mandiPrices = [
        { crop: 'Wheat (Lokayat)', mandi: 'Nashik Mandi', price: '₹2,450', unit: 'per quintal', trend: 'up', change: '+₹45' },
        { crop: 'Soybean (Yellow)', mandi: 'Pune Mandi', price: '₹4,800', unit: 'per quintal', trend: 'down', change: '-₹20' },
        { crop: 'Onion (Red)', mandi: 'Mumbai Vashi', price: '₹1,900', unit: 'per quintal', trend: 'up', change: '+₹110' },
    ];

    const myCrops = [
        { id: 1, name: 'Premium Soybeans', status: 'Growing', health: 85, harvestDate: 'May 12, 2026', area: '5 Acres' },
        { id: 2, name: 'Lokayat Wheat', status: 'Mature', health: 92, harvestDate: 'April 05, 2026', area: '7.5 Acres' },
    ];

    return (
        <DashboardLayout role="farmer">
            {/* Z+ Layered Background Architecture */}
            <div className="relative min-h-screen">
                {/* Visual Tier 1: Abstract Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] -z-10" />

                <div className="space-y-8 lg:space-y-12 pb-20 max-w-7xl mx-auto pt-2">
                    {/* 1. Elite Header & Welcome */}
                    <section className="px-2">
                        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(0,210,120,0.6)]" />
                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Elite Farmer Pro</span>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-none">
                                    Kheti <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-500">Overview.</span>
                                </h1>
                                <p className="text-[12px] font-bold text-slate-400 mt-2 uppercase tracking-wide">Manage your crops with precision intelligence.</p>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-3"
                            >
                                <Button variant="outline" size="sm" icon="add_circle" className="!rounded-2xl !bg-white/50 backdrop-blur-md !border-slate-200/60 !py-3 !px-6 !text-[11px] font-black tracking-widest shadow-sm hover:shadow-md transition-all">NEW CROP</Button>
                                <Button variant="primary" size="sm" icon="auto_awesome" className="!rounded-2xl !py-3 !px-6 !text-[11px] font-black tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all">AI ADVICE</Button>
                            </motion.div>
                        </div>

                        {/* Premium Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                >
                                    <Card 
                                        className={`glass-card glass-shine group cursor-pointer transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-1 !rounded-[32px]`}
                                        padding="p-4 sm:p-6 lg:p-7"
                                    >
                                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg ${stat.glow} icon-pop`}>
                                                <span className="material-symbols-outlined text-[18px] sm:text-[20px] lg:text-[24px] leading-none mb-0">{stat.icon}</span>
                                            </div>
                                            <div className="flex flex-col items-end text-right">
                                                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[60px] sm:max-w-none">{stat.label}</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span className="text-[7px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Live</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-baseline gap-1 sm:gap-2">
                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-none tracking-tight">{stat.value}</h3>
                                            <span className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.unit}</span>
                                        </div>
                                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <p className="text-[7px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tight truncate max-w-[80%]">{stat.trend}</p>
                                            <span className="material-symbols-outlined text-slate-300 text-[14px] sm:text-[16px] group-hover:text-primary-500 transition-colors">arrow_forward</span>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* 2. Content Matrix */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 px-2">
                        {/* Market Ticker Widget */}
                        <div className="xl:col-span-4 space-y-5">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                    <h3 className="text-[11px] font-black text-slate-400 tracking-[0.15em] uppercase">Market Ticker</h3>
                                </div>
                                <button className="text-[10px] font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full border border-primary-100">Browse All</button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {mandiPrices.map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                        className="bg-white/70 backdrop-blur-md p-5 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-100/50 transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-all duration-300">
                                                <span className="material-symbols-outlined text-[20px] icon-pop">monitoring</span>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-slate-900 uppercase leading-none mb-1.5">{item.crop}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.mandi}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[14px] font-black text-slate-900 leading-none mb-1.5 font-mono tracking-tight">{item.price}</p>
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${item.trend === 'up' ? 'bg-primary-50 text-primary-600' : 'bg-rose-50 text-rose-600'} text-[9px] font-black uppercase tracking-tighter`}>
                                                {item.change} {item.trend === 'up' ? '▲' : '▼'}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Insight Card */}
                            <div className="p-6 rounded-[32px] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all" />
                                <span className="material-symbols-outlined text-primary-400 mb-3 block">lightbulb</span>
                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Market Insight</h4>
                                <p className="text-[11px] text-slate-400 leading-relaxed">Wheat prices in Nashik are expected to rise by 4% next week due to supply constraints. <span className="text-primary-400 font-bold">Consider holding stock.</span></p>
                            </div>
                        </div>

                        {/* Inventory/Crops Portfolio */}
                        <div className="xl:col-span-8 space-y-5">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                                    <h3 className="text-[11px] font-black text-slate-400 tracking-[0.15em] uppercase">Active Portfolio</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-primary-500 transition-colors">
                                        <span className="material-symbols-outlined text-[18px]">filter_list</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                                {myCrops.map((crop, idx) => (
                                    <motion.div
                                        key={crop.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + (idx * 0.1) }}
                                    >
                                        <Card 
                                            className="!rounded-[36px] border border-slate-100 p-6 lg:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 bg-white relative overflow-hidden group"
                                        >
                                            {/* Decorative Corner */}
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[80px] -z-0 transition-all group-hover:bg-primary-50" />
                                            
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className={`px-4 py-1.5 rounded-full ${crop.status === 'Growing' ? 'bg-info-50 text-info-600' : 'bg-primary-50 text-primary-600'} text-[9px] font-black uppercase tracking-widest border border-current/10`}>
                                                        {crop.status}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{crop.area}</span>
                                                </div>

                                                <div className="mb-8">
                                                    <h4 className="text-xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-primary-600 transition-colors">{crop.name}</h4>
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Harvest: {crop.harvestDate}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-end justify-between">
                                                        <div className="space-y-1">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Vitality Index</span>
                                                            <span className="text-2xl font-black text-slate-900 leading-none">{crop.health}%</span>
                                                        </div>
                                                        <div className="flex -space-x-2">
                                                            {[1, 2, 3].map(i => (
                                                                <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${crop.health}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                                            className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${crop.health > 90 ? 'from-primary-300 to-primary-500' : 'from-primary-400 to-primary-600'}`} 
                                                        />
                                                    </div>

                                                    <div className="pt-2 flex items-center justify-between">
                                                        <button className="text-[10px] font-black text-primary-600 hover:underline uppercase tracking-widest">Growth Report</button>
                                                        <button className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all shadow-sm">
                                                            <span className="material-symbols-outlined text-[18px]">settings</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}

                                {/* Add Action Card */}
                                <motion.button 
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="h-full min-h-[220px] rounded-[36px] border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-white/50 transition-all flex flex-col items-center justify-center gap-4 group shadow-sm bg-slate-50/50"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary-500 group-hover:shadow-lg group-hover:shadow-primary-500/10 transition-all duration-500">
                                        <span className="material-symbols-outlined text-[28px] font-black">add</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em]">Register Crop</p>
                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter mt-1">Expansion Slot Available</p>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Redesigned Premium Weather Alert */}
                    <section className="px-2">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="bg-slate-900 rounded-[40px] p-6 lg:p-10 relative overflow-hidden group shadow-2xl shadow-slate-900/20"
                        >
                            {/* Animated Background Elements */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary-500/15 transition-all duration-700" />
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 border-[1px] border-white/5 rounded-full pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col xl:flex-row items-center gap-8 lg:gap-12">
                                <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
                                    {/* Weather Icon Master */}
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                            <span className="material-symbols-outlined text-[40px] lg:text-[48px] animate-bounce-slow">rainy</span>
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-rose-500 border-4 border-slate-900 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-[14px] font-black">priority_high</span>
                                        </div>
                                    </div>

                                    <div className="text-center lg:text-left space-y-3">
                                        <div className="flex items-center justify-center lg:justify-start gap-3">
                                            <div className="flex items-center gap-1.5 bg-primary-500/20 px-3 py-1 rounded-full border border-primary-500/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                                                <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Priority Alert</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Verified: NASA Power</span>
                                        </div>
                                        <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tight leading-none uppercase italic">
                                            High Precipitation <span className="text-primary-400 normal-case italic">Expected Tonight</span>
                                        </h2>
                                        <p className="text-[13px] lg:text-sm font-medium text-slate-400 max-w-xl leading-relaxed">
                                            Our sensors detect an 85% probability of heavy rainfall in <span className="text-white font-bold">Nashik (Sector 4)</span> starting at 10:30 PM. We strongly recommend completing all harvesting operations and moving stock to covered depots immediately.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto shrink-0 border-t xl:border-t-0 xl:border-l border-white/5 pt-8 xl:pt-0 xl:pl-12">
                                    <div className="flex flex-col items-center xl:items-start gap-1 mr-4 hidden sm:flex">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expected Intensity</span>
                                        <span className="text-xl font-black text-white">42mm / hr</span>
                                    </div>
                                    <Button variant="primary" size="lg" className="w-full sm:w-auto !rounded-2xl !bg-white !text-slate-900 hover:!bg-slate-50 !py-4 !px-8 !text-[12px] font-black tracking-widest shadow-xl active:scale-95 transition-all">TAKE ACTION</Button>
                                    <Button variant="glass" size="lg" className="w-full sm:w-auto !rounded-2xl border-white/10 !bg-white/5 !text-white !py-4 !px-8 !text-[12px] font-black tracking-widest hover:!bg-white/10 transition-all">VIEW DOPPLER</Button>
                                </div>
                            </div>
                        </motion.div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FarmerDashboard;
