import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OTPInput = ({ 
    otp, 
    onChange, 
    onKeyDown, 
    onPaste,
    otpRefs, 
    className = '',
    error = null,
    colors = null,
    ...props 
}) => {
    // Default theme colors
    const activeColors = colors || { text: 'text-primary-600', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    const baseColorName = activeColors.text.split('-')[1]; // e.g., 'primary', 'accent', 'secondary'

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
        if (pastedData && onPaste) {
            onPaste(pastedData);
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            <motion.div 
                className="grid grid-cols-6 gap-2"
                animate={error ? { x: [-4, 4, -4, 4, 0], scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.4 }}
            >
                {otp.map((digit, i) => (
                    <motion.input 
                        key={i}
                        whileFocus={{ scale: 1.05, y: -2 }}
                        ref={el => { if (otpRefs?.current) otpRefs.current[i] = el; }}
                        type="tel"
                        maxLength="1"
                        value={digit}
                        onPaste={handlePaste}
                        onChange={(e) => onChange(i, e.target.value)}
                        onKeyDown={(e) => onKeyDown(i, e)}
                        className={`
                            w-full aspect-square bg-white border rounded-xl 
                            text-center font-black text-xl text-slate-800 
                            outline-none transition-all duration-300
                            ${error ? 'border-red-300 text-red-500 focus:border-red-500 focus:shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]' : 
                              digit ? `border-${baseColorName}-400 bg-slate-50/50` : 
                              `border-slate-200 focus:border-${baseColorName}-500 focus:shadow-[0_0_15px_-3px_rgba(0,210,120,0.15)]`}
                        `}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        {...props}
                    />
                ))}
            </motion.div>
            
            <AnimatePresence>
                {error && (
                    <motion.p 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-red-500 text-[11px] font-black px-1 uppercase tracking-widest text-center"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OTPInput;
