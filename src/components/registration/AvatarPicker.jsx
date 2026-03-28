import React from 'react';
import { motion } from 'framer-motion';

const AVATARS = [
    { id: 'farmer_1', icon: 'agriculture', label: 'Classic Farmer' },
    { id: 'farmer_2', icon: 'psychology', label: 'Agri Expert' },
    { id: 'farmer_3', icon: 'home_work', label: 'Land Owner' },
    { id: 'vendor_1', icon: 'storefront', label: 'Trader' },
    { id: 'vendor_2', icon: 'local_shipping', label: 'Logistics' },
    { id: 'customer_1', icon: 'shopping_basket', label: 'Buyer' },
];

const AvatarPicker = ({ selectedAvatar, onSelect, colors = null }) => {
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    const borderClass = activeColors.text.replace('text-', 'border-');

    return (
        <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Selection (Choose Avatar)</p>
            <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((avatar) => (
                    <motion.button
                        key={avatar.id}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onSelect(avatar.id)}
                        className={`
                            relative h-12 w-full rounded-2xl flex items-center justify-center transition-all duration-300
                            ${selectedAvatar === avatar.id 
                                ? `${activeColors.bg} text-white shadow-lg shadow-slate-200` 
                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
                        `}
                        title={avatar.label}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {avatar.icon}
                        </span>
                        {selectedAvatar === avatar.id && (
                            <motion.div 
                                layoutId="avatar-check"
                                className={`absolute -top-1.5 -right-1.5 w-5 h-5 ${activeColors.bg} text-white rounded-full flex items-center justify-center border-2 border-white shadow-md z-10`}
                            >
                                <svg 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="4.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    className="w-2.5 h-2.5"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </motion.div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default AvatarPicker;
