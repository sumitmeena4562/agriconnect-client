import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpertToggle = () => {
    const [isOpen, setIsOpen] = useState(false);

    const actions = [
        { icon: 'mic', label: 'Voice Note' },
        { icon: 'photo_camera', label: 'Crop Photo' },
        { icon: 'chat', label: 'Expert Chat' }
    ];

    return (
        <div className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="flex flex-col-reverse items-end gap-3 mb-4"
                    >
                        {actions.map((action, idx) => (
                            <motion.button
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-3 group"
                            >
                                <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-black text-white/90 uppercase tracking-[0.2em] shadow-xl group-hover:bg-slate-900 transition-all">
                                    {action.label}
                                </span>
                                <div className="w-12 h-12 rounded-2xl bg-white shadow-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                                    <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] flex items-center justify-center shadow-2xl shadow-primary-500/30 transition-all duration-500 ${isOpen ? 'bg-slate-900 text-white' : 'bg-primary-500 text-slate-900'}`}
            >
                <div className="relative">
                    <motion.span 
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        className="material-symbols-outlined text-[28px] sm:text-[32px] font-black block"
                    >
                        {isOpen ? 'close' : 'support_agent'}
                    </motion.span>
                    {!isOpen && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 border-2 border-primary-500 rounded-full animate-ping" />
                    )}
                </div>
            </motion.button>
        </div>
    );
};

export default ExpertToggle;
