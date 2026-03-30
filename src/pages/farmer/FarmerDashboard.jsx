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
            <div className="space-y-8 lg:space-y-10 pb-10">
                {/* 1. Welcome & Stats Grid */}
                <section>
                    <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2 lg:mb-1">
                                <Badge variant="primary" size="xs">Z+ Secure</Badge>
                                <div className="lg:hidden flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-primary-500 animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Live</span>
                                </div>
                            </div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Kheti <span className="text-primary-600">Overview.</span></h1>
                            <p className="text-[13px] lg:text-[14px] font-bold text-slate-400">Welcome back! Manage your farm ecosystem.</p>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3">
                            <Button variant="outline" size="md" icon="add" className="flex-1 lg:flex-none !rounded-2xl !py-3 lg:!py-3.5">Add Crop</Button>
                            <Button variant="primary" size="md" icon="bolt" className="flex-1 lg:flex-none !rounded-2xl !py-3 lg:!py-3.5">Advice</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                        {stats.map((stat, idx) => (
                            <Card 
                                key={idx}
                                className="!rounded-[28px] lg:!rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 overflow-hidden relative group cursor-pointer"
                                padding="p-0"
                            >
                                <div className="p-5 lg:p-6">
                                    <div className="flex items-center justify-between mb-3 lg:mb-4">
                                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg shadow-inherit/20`}>
                                            <span className="material-symbols-outlined text-[20px] lg:text-[24px]">{stat.icon}</span>
                                        </div>
                                        <span className="text-[9px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900">{stat.value}</h3>
                                        <span className="text-[11px] lg:text-xs font-bold text-slate-400">{stat.unit}</span>
                                    </div>
                                </div>
                                <div className="px-5 lg:px-6 py-3 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tight">{stat.trend}</span>
                                    <span className="material-symbols-outlined text-[14px] text-primary-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* 2. Main Dashboard Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    
                    {/* Market Prices Widget */}
                    <div className="xl:col-span-1 space-y-4 lg:space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-base lg:text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Mandi Feed
                            </h3>
                            <button className="text-[9px] lg:text-[10px] font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest">More Mandis</button>
                        </div>
                        
                        {/* Mobile Horizontal Snap List / Desktop Vertical List */}
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-4 snap-x no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                            {mandiPrices.map((item, i) => (
                                <div key={i} className="min-w-[280px] lg:min-w-full snap-center bg-white p-4 lg:p-5 rounded-[24px] lg:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-emerald-600 text-[18px] lg:text-[20px]">agriculture</span>
                                            </div>
                                            <div>
                                                <p className="text-[12px] lg:text-[13px] font-black text-slate-800 uppercase tracking-tight">{item.crop}</p>
                                                <p className="text-[9px] lg:text-[10px] font-bold text-slate-400">{item.mandi}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[14px] lg:text-[15px] font-black text-slate-900 tracking-tight">{item.price}</p>
                                            <p className={`text-[9px] lg:text-[10px] font-black uppercase ${item.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {item.change} {item.trend === 'up' ? '↑' : '↓'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Crops Portfolio Grid */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                Active Portfolio
                            </h3>
                            <button className="text-[10px] font-black text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest">History</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                            {myCrops.map((crop) => (
                                <Card 
                                    key={crop.id}
                                    className="!rounded-[28px] lg:!rounded-[40px] border border-slate-100 p-6 lg:p-8 shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 bg-white group overflow-hidden relative"
                                >
                                    <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-5 group-hover:opacity-10 scale-125 lg:scale-150 transition-all">
                                        <span className="material-symbols-outlined text-[60px] lg:text-[80px]">psychology_alt</span>
                                    </div>

                                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                                        <Badge variant={crop.status === 'Growing' ? 'primary' : 'success'} size="xs" icon={crop.status === 'Growing' ? 'autorenew' : 'done_all'}>
                                            {crop.status}
                                        </Badge>
                                        <span className="text-[9px] lg:text-[11px] font-black text-slate-300 uppercase tracking-widest italic">{crop.area}</span>
                                    </div>

                                    <div className="mb-6 lg:mb-8 pr-12">
                                        <h4 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">{crop.name}</h4>
                                        <p className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Harvest: {crop.harvestDate}</p>
                                    </div>

                                    <div className="space-y-3 lg:space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] lg:text-[10px] font-black text-slate-600 uppercase tracking-tight">Health Score</span>
                                            <span className="text-[11px] lg:text-xs font-black text-primary-600">{crop.health}%</span>
                                        </div>
                                        <div className="w-full h-2.5 lg:h-3 bg-slate-100 rounded-full overflow-hidden flex">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${crop.health}%` }}
                                                transition={{ duration: 1.5, delay: 0.2 }}
                                                className={`h-full ${crop.health > 90 ? 'bg-emerald-500' : 'bg-primary-500'} rounded-full`} 
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-slate-50 flex items-center justify-between">
                                        <button className="flex items-center gap-2 text-[10px] lg:text-[11px] font-black text-slate-800 hover:text-primary-600 transition-colors uppercase tracking-tight">
                                           Analysis <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                                        </button>
                                        <div className="flex -space-x-2">
                                            {[1, 2].map(i => (
                                                <div key={i} className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-white bg-slate-200" />
                                            ))}
                                            <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 border-white bg-primary-100 flex items-center justify-center text-primary-600 text-[7px] lg:text-[8px] font-black italic">+3</div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {/* Add New Crop Card */}
                            <button className="h-full min-h-[240px] lg:min-h-[300px] rounded-[28px] lg:rounded-[40px] border-2 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50/30 transition-all flex flex-col items-center justify-center gap-4 group">
                                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-[24px] bg-white border border-slate-100 shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <span className="material-symbols-outlined text-slate-300 text-[24px] lg:text-[32px] group-hover:text-primary-500 transition-colors">add</span>
                                </div>
                                <div className="text-center px-4">
                                    <p className="text-[13px] lg:text-[14px] font-black text-slate-800 uppercase tracking-tight">Expand Portfolio</p>
                                    <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Add next crop season</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Weather & Advice Banner */}
                <section>
                    <div className="bg-slate-900 rounded-[44px] p-8 lg:p-12 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10">
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
                        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10 w-full lg:max-w-2xl text-center lg:text-left space-y-3 lg:space-y-4">
                            <Badge variant="primary" size="xs" icon="cloud">Weather Verified</Badge>
                            <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight italic uppercase">
                                Heavy Rain <span className="text-primary-400 underline decoration-primary-400/30">Alert</span> In Nashik.
                            </h2>
                            <p className="text-slate-400 text-base lg:text-lg font-medium leading-relaxed max-w-xl">
                                85% probability of rain tonight. Protect your crops and pause irrigation systems immediately.
                            </p>
                            <div className="pt-2 lg:pt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-3 lg:gap-4">
                                <Button variant="primary" size="lg" icon="shield" className="!rounded-2xl !py-4">Security Guide</Button>
                                <Button variant="glass" size="lg" icon="call" className="!rounded-2xl border-white/10 !bg-white/5 !text-white !py-4">Expert Help</Button>
                            </div>
                        </div>

                        <div className="relative shrink-0 w-full lg:w-96 flex flex-col items-center lg:items-end gap-6 lg:gap-10">
                            <div className="flex items-center gap-6 lg:gap-8">
                                <div className="text-right">
                                    <h4 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none">24°</h4>
                                    <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">Temperature</p>
                                </div>
                                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[28px] lg:rounded-[32px] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-primary-400 shadow-2xl">
                                    <span className="material-symbols-outlined text-[40px] lg:text-[48px]">partly_sunny</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 lg:gap-6 w-full">
                               {[
                                 { label: 'Wind', val: '12km/h', icon: 'air' },
                                 { label: 'Humid', val: '64%', icon: 'water_drop' },
                                 { label: 'Rain', val: '0.4mm', icon: 'rainy' }
                               ].map((i, idx) => (
                                 <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[20px] lg:rounded-[24px] p-3 lg:p-4 text-center space-y-1.5 lg:space-y-2 group hover:bg-white/10 transition-colors">
                                    <span className="material-symbols-outlined text-slate-500 text-[18px] lg:text-[20px] group-hover:text-primary-400 transition-colors">{i.icon}</span>
                                    <div>
                                        <p className="text-[11px] lg:text-[12px] font-black text-white">{i.val}</p>
                                        <p className="text-[7px] lg:text-[8px] font-bold text-slate-500 uppercase tracking-widest">{i.label}</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
};

export default FarmerDashboard;
