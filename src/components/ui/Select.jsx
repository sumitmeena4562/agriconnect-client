import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Select = forwardRef(({ 
    label, 
    value, 
    onChange, 
    options = [], 
    name, 
    id,
    placeholder = 'Choose Option', 
    disabled = false, 
    className = '', 
    error = null,
    success = false,
    loading = false,
    fullWidth = true,
    colors = null,
    ...props 
}, ref) => {
    const widthStyle = fullWidth ? "w-full" : "";
    const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;
    
    // Default theme colors
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    const focusBorderClass = activeColors.text.replace('text-', 'border-');

    return (
        <div className={`space-y-1.5 ${widthStyle} ${className}`}>
            <div className="flex items-center justify-between px-1">
                {label && (
                    <label htmlFor={selectId} className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-70">
                        {label}
                    </label>
                )}
                <div className="flex items-center gap-2">
                    {loading && (
                        <motion.span 
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className={`material-symbols-outlined ${activeColors.text} text-xs font-black`}
                        >
                            autorenew
                        </motion.span>
                    )}
                </div>
            </div>

            <div className={`
                relative group/select border rounded-xl transition-all duration-300
                ${error ? 'border-red-200 focus-within:border-red-400 focus-within:shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]' : 
                  `border-slate-200 focus-within:border-${activeColors.text.replace('text-', '').replace('-600', '-500')} focus-within:shadow-[0_0_15px_-3px_rgba(0,210,120,0.12)]`}
            `}>
                <select 
                    ref={ref}
                    id={selectId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full bg-white rounded-xl px-4 ${success ? 'pr-14' : 'pr-10'} py-1.5 font-bold text-slate-800 text-[14px] appearance-none outline-none disabled:opacity-30 min-h-[50px]`}
                    {...props}
                >
                    <option value="" disabled className="text-slate-400">{placeholder}</option>
                    {options.map((opt, i) => (
                        <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
                            {typeof opt === 'string' ? opt : opt.label}
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                    {success && !error && !loading && (
                        <motion.div 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }}
                            className={`w-4 h-4 ${activeColors.bg} text-white rounded-full flex items-center justify-center border border-white shadow-sm shrink-0`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </motion.div>
                    )}
                    <span className={`material-symbols-outlined transition-transform font-bold text-base group-focus-within/select:rotate-180 ${error ? 'text-red-400' : success ? activeColors.text : 'text-slate-300'}`}>
                        expand_more
                    </span>
                </div>
            </div>
            <AnimatePresence>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-red-500 text-[11px] font-bold px-1 uppercase tracking-widest"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
});

export default Select;
