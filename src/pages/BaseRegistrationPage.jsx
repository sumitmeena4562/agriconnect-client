import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import { LANGUAGES } from '../constants/registration';

// UI Components
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Registration Sub-components
import Step1Mobile from '../components/registration/Step1Mobile';
import Step2OTP from '../components/registration/Step2OTP';
import Step3ProfileDetails from '../components/registration/Step3ProfileDetails';

/**
 * BaseRegistrationPage
 * A unified component that handles all 3 registration roles.
 */
const BaseRegistrationPage = ({ role, config }) => {
    const navigate = useNavigate();
    const {
        step, loading, error, timer, canResend, fieldErrors,
        formData, setFormData, handleChange, handleSendOtp, handleVerifyOtp, 
        handleOtpPaste, handleOtpChange, handleOtpKeyDown, handleSubmit: hookSubmit, prevStep,
        otpRefs, cooldown
    } = useRegistrationForm({
        mobile: '',
        otp: ['', '', '', '', '', ''],
        fullName: '',
        email: '',
        state: '',
        district: '',
        pincode: '',
        password: '',
        confirmPassword: '',
        language: 'English',
        gender: '',
        dob: '',
        profilePic: '',
        location: null,
        acceptTerms: false
    });

    const [success, setSuccess] = useState(false);
    
    useEffect(() => {
        if (success) {
            const redirectTimer = setTimeout(() => {
                let dashUrl = role === 'admin' ? '/admin/dashboard' : `/${role}/dashboard`;

                navigate(dashUrl);
            }, 6000); // 6s to allow success animation to breathe
            return () => clearTimeout(redirectTimer);
        }
    }, [success, role, navigate]);

    const handleSubmit = () => {
        hookSubmit(role, () => setSuccess(true));
    };

    // Safely get config values with defaults
    const title = config?.title || "Registration";
    const themeColor = config?.themeColor || 'primary';
    const badgeVariant = config?.badgeVariant || 'slate';
    const badgeText = config?.badgeText || "Secure Flow";
    const badgeClassName = config?.badgeClassName || "";
    
    // Mapping for dynamic classes to ensure static analysis works
    const colorClasses = {
        primary: { 
            text: 'text-primary-600', 
            bg: 'bg-primary-500', 
            lightBg: 'bg-primary-50' 
        },
        accent: { 
            text: 'text-accent-600', 
            bg: 'bg-accent-500', 
            lightBg: 'bg-accent-50' 
        },
        info: { 
            text: 'text-info-600', 
            bg: 'bg-info-500', 
            lightBg: 'bg-info-50' 
        }
    };

    const colors = colorClasses[themeColor] || colorClasses.primary;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased overflow-y-auto pb-10">
            <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 sm:px-12 flex justify-between items-center z-50 sticky top-0">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div className="h-5 w-[1.5px] bg-slate-100 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-tight">{title}</span>
                        <Badge variant={badgeVariant} size="xs" animate={false} className={badgeClassName}>{badgeText}</Badge>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
                    {LANGUAGES.map(l => (
                        <button 
                            key={l}
                            onClick={() => setFormData({...formData, language: l})}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${formData.language === l ? `bg-white ${colors.text} shadow-sm` : 'text-slate-400'}`}
                        >{l === 'Hindi' ? 'हिन्दी' : 'ENGLISH'}</button>
                    ))}
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <Card 
                    className={`w-full transition-all duration-500 !rounded-[16px] border-none shadow-xl shadow-slate-200/50 ${step === 3 && !success ? 'max-w-[700px]' : 'max-w-[390px]'}`} 
                    padding="p-0" 
                    animate={false}
                >
                    <div className="flex w-full bg-slate-100 h-1">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex-1 ${step >= s ? colors.bg : 'bg-transparent'} transition-colors duration-500`} />
                        ))}
                    </div>

                    <div className="px-6 py-8 sm:px-8 sm:py-10 text-left">
                        <AnimatePresence mode="wait">
                            {success ? (
                                <SuccessScreen 
                                    fullName={formData.fullName} 
                                    onDashboardClick={() => {
                                        let dashUrl = role === 'admin' ? '/admin/dashboard' : `/${role}/dashboard`;
                                        navigate(dashUrl);
                                    }} 
                                    config={config?.success}
                                    colors={colors}
                                    themeColor={themeColor}
                                />
                            ) : (
                                <>
                                    {step === 1 && (
                                        <Step1Mobile 
                                            mobile={formData.mobile} 
                                            email={formData.email} 
                                            onChange={handleChange} 
                                            onContinue={handleSendOtp} 
                                            loading={loading} 
                                            error={error} 
                                            fieldErrors={fieldErrors} 
                                            colors={colors}
                                            cooldown={cooldown}
                                        />
                                    )}

                                    {step === 2 && (
                                        <Step2OTP 
                                            mobile={formData.mobile} 
                                            email={formData.email} 
                                            otp={formData.otp} 
                                            onOtpChange={handleOtpChange} 
                                            onOtpPaste={handleOtpPaste}
                                            onOtpKeyDown={handleOtpKeyDown} 
                                            otpRefs={otpRefs} 
                                            onVerify={handleVerifyOtp} 
                                            onResend={handleSendOtp} 
                                            timer={timer} 
                                            canResend={canResend} 
                                            loading={loading} 
                                            error={error} 
                                            onBack={prevStep} 
                                            colors={colors}
                                        />
                                    )}

                                    {step === 3 && (
                                        <Step3ProfileDetails 
                                            formData={formData} 
                                            onChange={handleChange} 
                                            onSubmit={handleSubmit} 
                                            loading={loading} 
                                            error={error} 
                                            fieldErrors={fieldErrors} 
                                            title={config?.step3?.title || "Profile Setup"} 
                                            subtitle={config?.step3?.subtitle || "Fill your details"} 
                                            colors={colors}
                                        />
                                    )}
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </main>
        </div>
    );
};

const SuccessScreen = ({ fullName, onDashboardClick, config, colors, themeColor }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col items-center text-center space-y-8 py-4"
    >
        <div className="relative">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20`}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </motion.div>
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute inset-0 ${colors.bg} rounded-full -z-10`}
            />
        </div>

        <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
                {(config?.title || "Welcome!").replace('{name}', fullName.split(' ')[0] || 'Member')}
            </h1>
            <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                {config?.subtitle || "Your AgriConnect account has been created successfully."}
            </p>
        </div>

        <div className="w-full space-y-4 pt-2">
            <Button 
                onClick={onDashboardClick} 
                fullWidth 
                variant={themeColor === 'primary' ? 'primary' : 'dark'} 
                size="lg"
                icon={(
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                )}
            >
                {config?.buttonText || "GO TO DASHBOARD"}
            </Button>
            <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest pl-2">Syncing your workspace...</p>
            </div>
        </div>
    </motion.div>
);

export default BaseRegistrationPage;
