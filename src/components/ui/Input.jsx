import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = forwardRef(({ 
    label, 
    value, 
    onChange, 
    type = 'text', 
    placeholder = '', 
    name, 
    id,
    maxLength, 
    className = '', 
    icon = null,
    prefix = null,
    error = null,
    success = false,
    fullWidth = true,
    autoFocus = false,
    ...props 
}, ref) => {
    const widthStyle = fullWidth ? "w-full" : "";
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
        <div className={`space-y-1 ${widthStyle} ${className}`}>
            <div className="flex items-center justify-between px-1">
                {label && (
                    <label htmlFor={inputId} className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-70">
                        {label}
                    </label>
                )}
                {success && !error && (
                    <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="material-symbols-outlined text-green-500 text-sm font-black"
                    >
                        check_circle
                    </motion.span>
                )}
            </div>
            
            <div className={`
                group flex items-center bg-slate-50 border-2 rounded-xl px-3 py-1.5 
                focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] 
                transition-all duration-300 min-h-[48px]
                ${error ? 'border-red-300 bg-red-50/10 focus-within:border-red-500' : 
                  success ? 'border-green-300 bg-green-50/10 focus-within:border-green-500' : 
                  'border-slate-100 focus-within:border-primary-500'}
            `}>
                {icon && (
                    <span className={`material-symbols-outlined mr-2.5 text-base font-bold transition-colors ${error ? 'text-red-400' : success ? 'text-green-500' : 'text-slate-300'}`}>
                        {icon}
                    </span>
                 )}
                {prefix && (
                    <div className="flex items-center self-stretch mr-3 pr-3 border-r-[1.5px] border-slate-200/60">
                        <span className="font-black text-slate-400 text-[11px] tracking-tight whitespace-nowrap opacity-70">
                            {prefix}
                        </span>
                    </div>
                )}
                <input 
                    ref={ref}
                    type={type}
                    id={inputId}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-[14px] placeholder:text-slate-300/80 tracking-tight"
                    {...props}
                />
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

export default Input;
