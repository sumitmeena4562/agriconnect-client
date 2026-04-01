import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';

const FinancialSnapshot = () => {
    const data = [
        { label: 'Total Investment', value: '₹1.2L', trend: 'Season 26', color: 'text-slate-900', icon: 'account_balance' },
        { label: 'Expected Revenue', value: '₹4.8L', trend: '+12% Forecast', color: 'text-primary-600', icon: 'trending_up' },
        { label: 'Pending Payments', value: '₹15k', trend: '2 Invoices', color: 'text-amber-600', icon: 'payments' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card className="!rounded-[36px] bg-slate-900 text-white p-6 lg:p-8 shadow-2xl relative overflow-hidden group border-none">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl translate-y-12 -translate-x-12" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-primary-400 text-[18px]">account_balance_wallet</span>
                                <h3 className="text-[12px] font-black text-white/90 uppercase tracking-widest">Financial Vault</h3>
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Real-time revenue tracking</p>
                        </div>
                        <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-[20px] text-primary-400">add</span>
                        </button>
                    </div>

                    <div className="space-y-6">
                        {data.map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (idx * 0.1) }}
                                className="flex items-center justify-between group/item p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover/item:text-primary-400 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{item.trend}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-[16px] font-black ${item.color.includes('primary') ? 'text-primary-400' : item.color.includes('amber') ? 'text-amber-400' : 'text-white'} leading-none font-mono tracking-tight`}>{item.value}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500">
                                    INV
                                </div>
                            ))}
                        </div>
                        <button className="text-[10px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-[0.2em] transition-all">VIEW LEDGER</button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default FinancialSnapshot;
