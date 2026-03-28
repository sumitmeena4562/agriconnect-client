import React, { forwardRef, useRef, useImperativeHandle } from 'react';
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
    const inputRef = useRef();
    useImperativeHandle(ref, () => inputRef.current);

    const widthStyle = fullWidth ? "w-full" : "";
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    // Default to primary if no colors passed
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };

    // Elite focus styles helpers
    const getFocusStyles = () => {
        if (error) return 'border-red-400 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]';
        const colorBase = activeColors.text.replace('text-', '');
        return `border-${colorBase.replace('-600', '-500')} shadow-[0_0_15px_-3px_rgba(0,210,120,0.12)]`;
    };

    return (
        <div className={`space-y-1.5 ${widthStyle} ${className}`}>
            <div className="flex items-center justify-between px-1">
                {label && (
                    <label htmlFor={inputId} className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-60">
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
                group flex items-center bg-white border rounded-xl px-4 py-1.5 
                transition-all duration-300 min-h-[50px] outline-none
                ${error ? 'border-red-200 focus-within:border-red-400 focus-within:shadow-[0_0_15px_-3px_rgba(239,68,68,0.15)]' : 
                  `border-slate-200 focus-within:${getFocusStyles().split(' ')[0]} focus-within:${getFocusStyles().split(' ')[1]}`}
            `}>
                {icon && (
                    <span 
                        onClick={() => {
                            if (type === 'date' && inputRef.current?.showPicker) {
                                try { inputRef.current.showPicker(); } catch (err) {}
                            }
                        }}
                        className={`material-symbols-outlined mr-2.5 text-base font-bold transition-colors ${type === 'date' ? 'cursor-pointer hover:scale-110 active:scale-95 text-primary-500' : 'text-slate-300'} ${error ? 'text-red-400' : success ? activeColors.text : ''}`}
                    >
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
                    ref={inputRef}
                    type={type}
                    id={inputId}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    autoComplete="on"
                    className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-[14px] placeholder:text-slate-300/80 tracking-tight"
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
