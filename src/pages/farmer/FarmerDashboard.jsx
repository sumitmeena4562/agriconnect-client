import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const FarmerDashboard = () => {
    // Mock Data for UI
    const stats = [
        { label: 'Total Land', value: '12.5', unit: 'Acres', icon: 'landscape', color: 'bg-primary-500', trend: '+2% from last season' },
        { label: 'Active Crops', value: '04', unit: 'Types', icon: 'potted_plant', color: 'bg-amber-500', trend: '3 Harvests soon' },
        { label: 'Market Value', value: '₹4.2L', unit: 'Estimated', icon: 'account_balance_wallet', color: 'bg-emerald-500', trend: 'Prices up by 5%' },
        { label: 'Health Score', value: '94%', unit: 'Optimal', icon: 'health_and_safety', color: 'bg-sky-500', trend: 'Perfect soil moisture' },
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
            <div className="space-y-6 lg:space-y-8 pb-10 max-w-7xl mx-auto">
                {/* 1. Welcome & Simplified Header */}
                <section className="px-2">
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Live Portfolio</span>
                            </div>
                            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">Kheti <span className="text-primary-600 underline decoration-primary-500/20 underline-offset-4">Overview.</span></h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" icon="add" className="!rounded-xl !text-[11px] !py-2.5">Add Crop</Button>
                            <Button variant="primary" size="sm" icon="bolt" className="!rounded-xl !text-[11px] !py-2.5 shadow-sm shadow-primary-500/10">Advice</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                        {stats.map((stat, idx) => (
                            <Card 
                                key={idx}
                                className="!rounded-[28px] border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer bg-white"
                                padding="p-5 lg:p-6"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-8 h-8 rounded-xl ${stat.color} text-white flex items-center justify-center shadow-lg shadow-inherit/10`}>
                                        <span className="material-symbols-outlined text-[16px] lg:text-[18px]">{stat.icon}</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 leading-none">{stat.value}</h3>
                                    <span className="text-[10px] font-bold text-slate-400">{stat.unit}</span>
                                </div>
                                <p className="text-[8px] font-bold text-slate-500 uppercase mt-2 opacity-0 group-hover:opacity-100 transition-opacity">{stat.trend}</p>
                            </Card>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                    {/* Market Prices Widget (Left/Top) */}
                    <div className="xl:col-span-4 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Mandi Feed
                            </h3>
                            <button className="text-[9px] font-bold text-primary-600 hover:underline uppercase tracking-widest">More</button>
                        </div>
                        
                        <div className="space-y-3">
                            {mandiPrices.map((item, i) => (
                                <div key={i} className="bg-white p-4 lg:p-5 rounded-[24px] border border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                                            <span className="material-symbols-outlined text-[18px]">agriculture</span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-800 uppercase leading-none mb-0.5">{item.crop}</p>
                                            <p className="text-[9px] font-medium text-slate-400 leading-none">{item.mandi}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-bold text-slate-900 leading-none mb-0.5">{item.price}</p>
                                        <p className={`text-[8px] font-bold uppercase ${item.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {item.change} {item.trend === 'up' ? '↑' : '↓'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Crops Portfolio (Center/Right) */}
                    <div className="xl:col-span-8 space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                Active Crops
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCrops.map((crop) => (
                                <Card 
                                    key={crop.id}
                                    className="!rounded-[28px] border border-slate-200/50 p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all duration-300 bg-white relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant={crop.status === 'Growing' ? 'primary' : 'success'} size="xs" className="!px-3 !py-1">
                                            {crop.status}
                                        </Badge>
                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{crop.area}</span>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{crop.name}</h4>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Harvest: {crop.harvestDate}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-slate-600 uppercase">Health Score</span>
                                            <span className="text-[10px] font-bold text-primary-600">{crop.health}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${crop.health}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className={`h-full ${crop.health > 90 ? 'bg-emerald-400' : 'bg-primary-400'} rounded-full`} 
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {/* Simple Add Crop Placeholder */}
                            <button className="h-full min-h-[160px] rounded-[28px] border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-white transition-all flex flex-col items-center justify-center gap-3 group shadow-sm hover:shadow-md">
                                <span className="material-symbols-outlined text-slate-300 text-[24px] group-hover:text-primary-400 transition-colors">add_circle</span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Expand Portfolio</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Redesigned Compact Weather Alert */}
                <section>
                    <div className="bg-slate-900 rounded-[32px] p-4 lg:p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-slate-900/10">
                        {/* Compact Decorative Background */}
                        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none" />
                        
                        <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center gap-4 lg:gap-8">
                            {/* Smaller Weather Icon Circle */}
                            <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-primary-400 shadow-inner">
                                <span className="material-symbols-outlined text-[32px] lg:text-[36px]">rainy</span>
                            </div>

                            <div className="text-center md:text-left space-y-1">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                    <Badge variant="primary" size="xs" className="!bg-primary-500/10 !text-primary-400 !border-primary-500/20 !px-2">ALERT</Badge>
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Weather Verified</span>
                                </div>
                                <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight uppercase italic leading-tight">
                                    Heavy Rain Alert <span className="text-slate-500 mx-1">•</span> <span className="text-primary-400 font-medium normal-case">Nashik Tonight</span>
                                </h2>
                                <p className="text-[11px] lg:text-xs font-medium text-slate-400 max-w-md">85% probability. Pause irrigation and protect harvested crops immediately.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                            <Button variant="primary" size="sm" className="flex-1 md:flex-none !rounded-xl !bg-white !text-slate-900 hover:!bg-slate-50 !py-2.5 !px-5 !text-[11px]">Security Guide</Button>
                            <Button variant="glass" size="sm" className="flex-1 md:flex-none !rounded-xl border-white/10 !bg-white/5 !text-white !py-2.5 !px-5 !text-[11px] hover:!bg-white/10">Expert Help</Button>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default FarmerDashboard;
