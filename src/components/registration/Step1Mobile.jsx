import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateMobile, validateEmail } from '../../utils/validation';
import { checkAvailability } from '../../services/api';

const Step1Mobile = ({ mobile, email, onChange, onContinue, loading, error, fieldErrors, colors }) => {
    const [mobileLoading, setMobileLoading] = useState(false);
    const [mobileAvailable, setMobileAvailable] = useState(null); // null, true, false
    const [mobileCheckError, setMobileCheckError] = useState("");

    const isMobileFormatValid = mobile.length === 10 && !validateMobile(mobile);
    const isEmailValid = email.length > 5 && !validateEmail(email);

    const checkMobileAvailability = async () => {
        if (!mobile || validateMobile(mobile)) return;
        
        setMobileLoading(true);
        setMobileCheckError("");
        try {
            const response = await checkAvailability({ mobile });
            setMobileAvailable(response.data.available);
            if (!response.data.available) {
                setMobileCheckError("This number is already registered");
            }
        } catch (err) {
            console.error("Availability check failed:", err);
        } finally {
            setMobileLoading(false);
        }
    };

    // Auto check after typing stops (debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (mobile && isMobileFormatValid) {
                checkMobileAvailability();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [mobile]);

    const canContinue = isMobileFormatValid && isEmailValid && mobileAvailable;
    return (
        <motion.div 
            key="step1" 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -15 }} 
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-6"
        >
            <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome! <span className={`${colors.text} block`}>Start AgriConnect.</span></h1>
                <p className="text-slate-500 text-sm">Enter your credentials to continue.</p>
            </div>

            <div className="space-y-4">
                <Input 
                    label="Mobile Number"
                    name="mobile"
                    maxLength="10"
                    placeholder="00000 00000"
                    value={mobile}
                    onChange={onChange}
                    prefix="+91"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    error={fieldErrors?.mobile || mobileCheckError}
                    success={isMobileFormatValid && mobileAvailable}
                    loading={mobileLoading}
                    colors={colors}
                    autoFocus
                />

                <Input 
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={onChange}
                    icon="mail"
                    error={fieldErrors?.email}
                    success={isEmailValid}
                    colors={colors}
                />

                <Button 
                    onClick={onContinue}
                    disabled={loading || mobileLoading || !canContinue}
                    fullWidth
                    variant={canContinue ? (colors.text.includes('primary') ? 'primary' : colors.text.includes('accent') ? 'accent' : 'dark') : 'dark'}
                    icon={loading ? "autorenew" : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 translate-y-[-0.5px]">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    )}
                >
                    {loading ? "SENDING..." : "SEND OTP"}
                </Button>
            </div>
            
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-50 text-red-500 p-3 rounded-xl text-[11px] font-black text-center uppercase tracking-widest border border-red-100"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <span className={`material-symbols-outlined text-[16px] ${colors.text}`}>verified_user</span> 100% Secure
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <span className={`material-symbols-outlined text-[16px] ${colors.text}`}>bolt</span> Swift
                </div>
            </div>
        </motion.div>
    );
};

export default Step1Mobile;
