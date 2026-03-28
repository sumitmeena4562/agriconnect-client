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
        otpRefs
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
        location: null
    });

    const [success, setSuccess] = useState(false);
    
    useEffect(() => {
        if (success) {
            const redirectTimer = setTimeout(() => {
                navigate('/dashboard');
            }, 5000);
            return () => clearTimeout(redirectTimer);
        }
    }, [success, navigate]);

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
        <div className="h-[100dvh] overflow-hidden bg-slate-50 flex flex-col font-sans antialiased">
            <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 sm:px-12 flex justify-between items-center z-50">
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
                <Card className="w-full max-w-[390px] !rounded-[16px] border-none shadow-xl shadow-slate-200/50" padding="p-0" animate={false}>
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
                                    onDashboardClick={() => navigate('/dashboard')} 
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
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center space-y-6">
        <div className={`w-16 h-16 ${colors.lightBg} rounded-full flex items-center justify-center ${colors.text}`}>
            <span className="material-symbols-outlined text-[40px]">check_circle</span>
        </div>
        <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">{(config?.title || "Welcome!").replace('{name}', fullName.split(' ')[0] || 'Member')}</h1>
            <p className="text-slate-500 text-sm">{config?.subtitle || "Registration complete."}</p>
        </div>
        <div className="w-full space-y-4 pt-4">
            <Button onClick={onDashboardClick} fullWidth variant={themeColor === 'primary' ? 'primary' : 'dark'} icon={config?.icon || 'done_all'}>
                {config?.buttonText || "CONTINUE"}
            </Button>
            <p className="text-slate-400 text-[10px] italic">Redirecting automatically in 5s...</p>
        </div>
    </motion.div>
);

export default BaseRegistrationPage;
