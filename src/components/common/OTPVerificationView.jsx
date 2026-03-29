import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OTPInput from '../ui/OTPInput';
import Button from '../ui/Button';

/**
 * OTPVerificationView - A highly reusable "Enterprise" grade OTP verification screen.
 * Optimized for consistent UX across Registration and Login flows.
 */
const OTPVerificationView = ({ 
    title = "Verify Identity.",
    subtitle = "We've sent a 6-digit code to",
    identifier = "",
    otp, 
    onOtpChange, 
    onOtpPaste, 
    onOtpKeyDown, 
    otpRefs, 
    onVerify, 
    onResend, 
    timer, 
    canResend, 
    loading, 
    onBack, 
    colors,
    icon = "enhanced_encryption" 
}) => {
    const isOtpComplete = otp.join('').length === 6;

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6"
        >
            <button 
                onClick={onBack} 
                className={`inline-flex items-center gap-1.5 text-slate-400 hover:${colors.text} text-[11px] font-black uppercase tracking-widest transition-colors group px-0.5`}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Go Back
            </button>
            
            <div className="space-y-1 text-left">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`w-8 h-1 ${colors.bg} rounded-full`}></span>
                    <span className={`text-[10px] font-black ${colors.text} uppercase tracking-[0.2em]`}>Security Check</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <p className="text-slate-500 text-sm">{subtitle} <span className="text-slate-900 font-bold">{identifier}</span></p>
            </div>

            <div className="space-y-8 py-2">
                <OTPInput 
                    otp={otp}
                    onChange={onOtpChange}
                    onPaste={onOtpPaste}
                    onKeyDown={onOtpKeyDown}
                    otpRefs={otpRefs}
                    colors={colors}
                />

                <div className="space-y-4">
                    <Button 
                        onClick={onVerify}
                        disabled={!isOtpComplete || loading}
                        fullWidth
                        variant={isOtpComplete ? (colors.text.includes('primary') ? 'primary' : colors.text.includes('accent') ? 'accent' : 'dark') : 'dark'}
                        icon={loading ? "autorenew" : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <polyline points="9 12 11 14 15 10"></polyline>
                            </svg>
                        )}
                        size="lg"
                    >
                        {loading ? "VERIFYING..." : "CONFIRM & PROCEED"}
                    </Button>

                    <div className="text-center h-5">
                        <AnimatePresence mode="wait">
                            {canResend ? (
                                <motion.button 
                                    key="resend-btn"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    onClick={onResend} 
                                    disabled={loading} 
                                    className={`${colors.text} font-black text-[11px] uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity inline-flex items-center gap-1`}
                                >
                                    <span className="material-symbols-outlined text-xs">refresh</span>
                                    Resend Code
                                </motion.button>
                            ) : (
                                <motion.p 
                                    key="resend-timer"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-slate-400 text-[11px] font-bold uppercase tracking-widest"
                                >
                                    Resend in <span className="text-slate-900 font-mono text-xs">{timer < 10 ? `0${timer}` : timer}s</span>
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50/50 rounded-full">
                    <span className="material-symbols-outlined text-slate-400 text-sm">{icon}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
            </div>
        </motion.div>
    );
};

export default OTPVerificationView;
