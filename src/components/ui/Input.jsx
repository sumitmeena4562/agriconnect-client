import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const getStrengthColor = (strength) => {
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-orange-500';
    if (strength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
};

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
    loading = false,
    strength = 0,
    fullWidth = true,
    autoFocus = false,
    colors = null,
    ...props 
}, ref) => {
    const widthStyle = fullWidth ? "w-full" : "";
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Default to primary if no colors passed
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };

    // Success colors based on the theme
    const successBorderClass = activeColors.text.replace('text-', 'border-');
    const successBgClass = activeColors.lightBg;

    return (
        <div className={`space-y-1.5 ${widthStyle} ${className}`}>
            <div className="flex items-center justify-between px-1">
                {label && (
                    <label htmlFor={inputId} className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-70">
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
                    {success && !error && !loading && (
                        <motion.span 
                            initial={{ scale: 0 }} 
                            animate={{ scale: 1 }} 
                            className={`material-symbols-outlined ${activeColors.text} text-sm font-black`}
                        >
                            check_circle
                        </motion.span>
                    )}
                </div>
            </div>
            
            <div className={`
                group flex items-center bg-slate-50 border-2 rounded-xl px-3 py-1.5 
                focus-within:bg-white transition-all duration-300 min-h-[48px]
                ${error ? 'border-red-300 bg-red-50/10 focus-within:border-red-500' : 
                  success ? `${successBorderClass.replace('-600', '-300')} ${successBgClass}/10 focus-within:${successBorderClass}` : 
                  `border-slate-100 focus-within:${activeColors.text.replace('text-', 'border-')}`}
            `}>
                {icon && (
                    <span className={`material-symbols-outlined mr-2.5 text-base font-bold transition-colors ${error ? 'text-red-400' : success ? activeColors.text : 'text-slate-300'}`}>
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
                    onClick={(e) => {
                        if (type === 'date' && e.target.showPicker) {
                            try { e.target.showPicker(); } catch (err) { console.warn("showPicker not supported", err); }
                        }
                        if (props.onClick) props.onClick(e);
                    }}
                    onFocus={(e) => {
                        if (type === 'date' && e.target.showPicker) {
                            try { e.target.showPicker(); } catch (err) {}
                        }
                        if (props.onFocus) props.onFocus(e);
                    }}
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-[14px] placeholder:text-slate-300/80 tracking-tight cursor-pointer"
                    {...props}
                />
            </div>
            
            {/* Password Strength Meter */}
            {type === 'password' && value && (
                <div className="px-1 space-y-1">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${strength}%` }}
                            className={`h-full transition-colors duration-500 ${getStrengthColor(strength)}`}
                        />
                    </div>
                </div>
            )}

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
