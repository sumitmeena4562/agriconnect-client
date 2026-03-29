import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { validateMobile, validateEmail } from '../../utils/validation';
import { checkAvailability } from '../../services/api';

const Step1Mobile = ({ mobile, email, onChange, onContinue, loading, error, fieldErrors, colors, cooldown = 0 }) => {
    const [mobileLoading, setMobileLoading] = useState(false);
    const [mobileAvailable, setMobileAvailable] = useState(null); // null, true, false
    const [mobileCheckError, setMobileCheckError] = useState("");
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [emailCheckError, setEmailCheckError] = useState("");

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

    const checkEmailAvailability = async () => {
        if (!email || validateEmail(email)) return;
        
        setEmailLoading(true);
        setEmailCheckError("");
        try {
            const response = await checkAvailability({ email });
            setEmailAvailable(response.data.available);
            if (!response.data.available) {
                setEmailCheckError("This email is already registered");
            }
        } catch (err) {
            console.error("Email check failed:", err);
        } finally {
            setEmailLoading(false);
        }
    };

    // Auto check mobile after typing stops (debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (mobile && isMobileFormatValid) {
                checkMobileAvailability();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [mobile]);

    // Auto check email after typing stops (debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (email && isEmailValid) {
                checkEmailAvailability();
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [email]);

    const canContinue = isMobileFormatValid && isEmailValid && mobileAvailable && emailAvailable;
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
                    error={fieldErrors?.email || emailCheckError}
                    success={isEmailValid && emailAvailable}
                    loading={emailLoading}
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
            
            <AnimatePresence mode="wait">
                {(cooldown > 0 || error) && (
                    <motion.div 
                        key={cooldown > 0 ? `cooldown-${cooldown}` : 'error'}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`${cooldown > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-red-50 text-red-500 border-red-100'} p-3 rounded-xl text-[11px] font-black text-center uppercase tracking-widest border transition-colors duration-300`}
                    >
                        {cooldown > 0 ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                                Please wait {cooldown} seconds...
                            </div>
                        ) : error}
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
