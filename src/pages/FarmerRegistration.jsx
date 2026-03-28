import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { registerUser } from '../services/api';
import { validateEmail, validatePincode, validateName, validatePassword } from '../utils/validation';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import { REGISTRATION_ROLES, LANGUAGES } from '../constants/registration';

// UI Components
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Registration Sub-components
import Step1Mobile from '../components/registration/Step1Mobile';
import Step2OTP from '../components/registration/Step2OTP';
import Step3ProfileDetails from '../components/registration/Step3ProfileDetails';

const FarmerRegistration = () => {
    const navigate = useNavigate();
    const {
        step, loading, error, timer, canResend, verificationToken, fieldErrors,
        formData, setFormData, handleChange, handleSendOtp, handleVerifyOtp, handleSubmit: hookSubmit, prevStep
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
        language: 'English'
    });

    // Handle local success state
    const [success, setSuccess] = React.useState(false);
    
    // Automatic redirection after success
    useEffect(() => {
        if (success) {
            const redirectTimer = setTimeout(() => {
                navigate('/dashboard');
            }, 5000);
            return () => clearTimeout(redirectTimer);
        }
    }, [success, navigate]);

    const handleSubmit = () => {
        hookSubmit(REGISTRATION_ROLES.FARMER, () => setSuccess(true));
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...formData.otp];
        newOtp[index] = value.slice(-1);
        setFormData({ ...formData, otp: newOtp });

        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="h-[100dvh] overflow-hidden bg-slate-50 flex flex-col font-sans antialiased">
            <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 sm:px-12 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div className="h-5 w-[1.5px] bg-slate-100 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-tight">Farmer Registration</span>
                        <Badge variant="slate" size="xs" animate={false}>Secure Flow</Badge>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
                    {LANGUAGES.map(l => (
                        <button 
                            key={l}
                            onClick={() => setFormData({...formData, language: l})}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${formData.language === l ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-400'}`}
                        >{l === 'Hindi' ? 'हिन्दी' : 'ENGLISH'}</button>
                    ))}
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <Card 
                    className="w-full max-w-[390px] !rounded-[16px] border-none shadow-xl shadow-slate-200/50"
                    padding="p-0"
                    animate={false}
                >
                    <div className="flex w-full bg-slate-100 h-1">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`flex-1 ${step >= s ? 'bg-primary-500' : 'bg-transparent'} transition-colors duration-500`} />
                        ))}
                    </div>

                    <div className="px-6 py-8 sm:px-8 sm:py-10">
                        <AnimatePresence mode="wait">
                            {success ? (
                                <SuccessScreen 
                                    fullName={formData.fullName} 
                                    onDashboardClick={() => navigate('/dashboard')} 
                                />
                            ) : (
                                <>
                                    {step === 1 && (
                                        <Step1Mobile 
                                            mobile={formData.mobile}
                                            onChange={handleChange}
                                            onContinue={handleSendOtp}
                                            loading={loading}
                                            error={error}
                                            fieldErrors={fieldErrors}
                                        />
                                    )}

                                    {step === 2 && (
                                        <Step2OTP 
                                            otp={formData.otp}
                                            onChange={setFormData}
                                            onVerify={handleVerifyOtp}
                                            onResend={handleSendOtp}
                                            timer={timer}
                                            canResend={canResend}
                                            loading={loading}
                                            error={error}
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
                                            title="Farmer Profile."
                                            subtitle="Tell us about your farm location."
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

// Success Component Helper
const SuccessScreen = ({ fullName, onDashboardClick }) => (
    <motion.div 
        key="success-card" 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex flex-col items-center text-center space-y-6"
    >
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-[40px]">check_circle</span>
        </div>
        
        <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {fullName.split(' ')[0] || 'Member'}!</h1>
            <p className="text-slate-500 text-sm">Your registration is complete.</p>
        </div>

        <div className="w-full space-y-4 pt-4">
            <Button 
                onClick={onDashboardClick}
                fullWidth
                variant="dark"
                icon="space_dashboard"
            >
                GO TO DASHBOARD
            </Button>
            <p className="text-slate-400 text-[10px] italic">Redirecting automatically in 5s...</p>
        </div>
    </motion.div>
);

export default FarmerRegistration;
