import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OTPInput = ({ 
    otp, 
    onChange, 
    onKeyDown, 
    otpRefs, 
    className = '',
    error = null,
    ...props 
}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            <motion.div 
                className="grid grid-cols-6 gap-2"
                animate={error ? { x: [-2, 2, -2, 2, 0] } : {}}
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
                        onChange={(e) => onChange(i, e.target.value)}
                        onKeyDown={(e) => onKeyDown(i, e)}
                        className={`
                            w-full aspect-square bg-slate-50 border-2 rounded-xl 
                            text-center font-black text-xl text-slate-800 
                            focus:border-primary-500 focus:bg-white 
                            focus:shadow-[0_10px_15px_-3px_rgba(22,163,74,0.1),0_4px_6px_-4px_rgba(22,163,74,0.1)]
                            outline-none transition-all duration-300
                            ${error ? 'border-red-300 bg-red-50/20' : 'border-slate-100'}
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
