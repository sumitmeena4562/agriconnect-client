import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OTPInput from '../ui/OTPInput';
import Button from '../ui/Button';

const Step2OTP = ({ mobile, otp, onOtpChange, onOtpKeyDown, otpRefs, onVerify, onResend, timer, canResend, loading, onBack }) => {
    const isOtpComplete = otp.join('').length === 6;

    return (
        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-primary-600 text-[11px] font-black uppercase tracking-widest transition-colors group">
                <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-0.5">arrow_back</span> 
                Go Back
            </button>
            
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Security Check</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Identity.</h1>
                <p className="text-slate-500 text-sm">We've sent a 6-digit code to <span className="text-slate-900 font-bold">+91 {mobile}</span></p>
            </div>

            <div className="space-y-8 py-2">
                <OTPInput 
                    otp={otp}
                    onChange={onOtpChange}
                    onKeyDown={onOtpKeyDown}
                    otpRefs={otpRefs}
                />

                <div className="space-y-4">
                    <Button 
                        onClick={onVerify}
                        disabled={!isOtpComplete || loading}
                        fullWidth
                        variant={isOtpComplete ? 'primary' : 'dark'}
                        icon={loading ? "autorenew" : "verified_user"}
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
                                    className="text-primary-600 font-black text-[11px] uppercase tracking-widest hover:text-primary-700 transition-colors"
                                >
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
                    <span className="material-symbols-outlined text-slate-400 text-sm">enhanced_encryption</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
            </div>
        </motion.div>
    );
};

export default Step2OTP;
