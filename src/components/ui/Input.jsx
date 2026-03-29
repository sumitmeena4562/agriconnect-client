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
    strength = null,
    fullWidth = true,
    autoFocus = false,
    colors = null,
    ...props 
}, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
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

    const isPassword = type === 'password';
    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
            <div className={`space-y-1.5 ${widthStyle} ${className}`}>
                <div className="flex items-center justify-between px-1">
                    {label && (
                        <label htmlFor={inputId} className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
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
                    group flex items-center bg-white border-[1px] border-slate-100 rounded-[14px] px-4 py-1.5 
                    transition-all duration-300 min-h-[52px] outline-none shadow-sm shadow-slate-100/50
                    ${error ? 'border-red-200 focus-within:border-red-400 focus-within:shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]' : 
                      `focus-within:border-slate-300 focus-within:shadow-[0_0_20px_-5px_rgba(0,0,0,0.05)]`}
                `}>
                    {icon && (
                        <span 
                            onClick={() => {
                                if (type === 'date' && inputRef.current?.showPicker) {
                                    try { inputRef.current.showPicker(); } catch (err) {}
                                }
                            }}
                            className={`material-symbols-outlined mr-2.5 text-base font-bold transition-colors ${type === 'date' ? 'cursor-pointer hover:scale-110 active:scale-95 text-primary-500' : 'text-slate-400'} ${error ? 'text-red-400' : success ? activeColors.text : ''}`}
                        >
                            {icon}
                        </span>
                     )}
                    {prefix && (
                        <div className="flex items-center self-stretch mr-3 pr-3 border-r-[1.5px] border-slate-200/60">
                            <span className="font-black text-slate-500 text-[11px] tracking-tight whitespace-nowrap">
                                {prefix}
                            </span>
                        </div>
                    )}
                    <input 
                        ref={inputRef}
                        type={currentType}
                        id={inputId}
                        name={name}
                        value={value || ''}
                        onChange={onChange}
                        maxLength={maxLength}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        autoComplete="on"
                        className="w-full bg-transparent border-none outline-none font-medium text-slate-700 text-[14px] placeholder:text-slate-300 tracking-tight"
                        {...props}
                    />

                {isPassword && value && !error && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`ml-2 text-slate-300 hover:${activeColors.text} transition-colors focus:outline-none`}
                    >
                        <span className="material-symbols-outlined text-[18px] font-bold">
                            {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                    </button>
                )}

                {success && !error && !loading && (
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className={`w-4 h-4 ${activeColors.bg} text-white rounded-full flex items-center justify-center border border-white shadow-sm ml-2 shrink-0`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </motion.div>
                )}
            </div>
            
            {/* Password Strength Meter */}
            {isPassword && value && strength !== null && (
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
