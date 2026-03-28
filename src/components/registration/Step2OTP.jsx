import React from 'react';
import { motion } from 'framer-motion';
import OTPInput from '../ui/OTPInput';
import Button from '../ui/Button';

const Step2OTP = ({ mobile, otp, onOtpChange, onOtpKeyDown, otpRefs, onVerify, onResend, timer, canResend, loading, onBack }) => {
    return (
        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <button onClick={onBack} className="inline-flex items-center gap-1 text-slate-400 hover:text-primary-600 text-xs font-bold transition-colors">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
            </button>
            
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">Verification.</h1>
                <p className="text-slate-500 text-sm">OTP sent to +91 {mobile}</p>
            </div>

            <div className="space-y-6">
                <OTPInput 
                    otp={otp}
                    onChange={onOtpChange}
                    onKeyDown={onOtpKeyDown}
                    otpRefs={otpRefs}
                />

                <div className="space-y-4">
                    <Button 
                        onClick={onVerify}
                        disabled={otp.join('').length < 6 || loading}
                        fullWidth
                        icon={loading ? "autorenew" : undefined}
                    >
                        {loading ? "VERIFYING..." : "VERIFY OTP"}
                    </Button>

                    <div className="text-center">
                        {canResend ? (
                            <button onClick={onResend} disabled={loading} className="text-primary-600 font-bold text-sm hover:underline">Resend Code</button>
                        ) : (
                            <p className="text-slate-400 text-xs font-medium">Resend in <span className="text-slate-900 font-mono">0:{timer < 10 ? `0${timer}` : timer}</span></p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Step2OTP;
