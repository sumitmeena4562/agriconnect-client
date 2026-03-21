import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

// UI Components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import OTPInput from '../components/ui/OTPInput';
import Card from '../components/ui/Card';

const CustomerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    
    const [formData, setFormData] = useState({
        mobile: '',
        otp: ['', '', '', '', '', ''],
        firstName: '',
        lastName: '',
        email: '',
        language: 'English'
    });

    const otpRefs = useRef([]);

    // Timer Logic for OTP
    useEffect(() => {
        if (step !== 2) return;
        
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mobile') {
            if (!/^\d*$/.test(value)) return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...formData.otp];
        newOtp[index] = value.slice(-1);
        setFormData({ ...formData, otp: newOtp });

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const startTimer = () => {
        setTimer(30);
        setCanResend(false);
    };

    const nextStep = () => {
        if (step === 1) startTimer();
        setStep(prev => prev + 1);
    };
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="min-h-screen bg-[#fffbeb] flex flex-col font-sans">
            <nav className="w-full bg-white/90 backdrop-blur-2xl border-b border-slate-100 py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div className="h-5 w-[1.5px] bg-slate-200 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[11px] font-[900] text-slate-800 uppercase tracking-[0.25em] leading-tight text-accent-600">Customer Portal</span>
                        <Badge variant="warning" size="xs" animate={false} className="!bg-yellow-100 !text-yellow-700 border-none">Personal Account</Badge>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
                        {['Hindi', 'English'].map(l => (
                            <button 
                                key={l}
                                onClick={() => setFormData({...formData, language: l})}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all duration-300 ${formData.language === l ? 'bg-white text-accent-600 shadow-md border border-accent-50 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                            >{l === 'Hindi' ? 'हिन्दी' : 'ENGLISH'}</button>
                        ))}
                    </div>
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-1/4 -right-20 w-60 h-60 bg-yellow-100/20 rounded-full blur-[80px] -z-10" />
                <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-accent-100/20 rounded-full blur-[80px] -z-10" />

                <Card 
                    className="w-full max-w-[420px] !overflow-hidden border-slate-100/80 !rounded-[28px]"
                    padding="p-0"
                    animate={true}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex w-full bg-slate-50 h-[3px]">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1 overflow-hidden">
                                <motion.div 
                                    initial={false}
                                    animate={{ 
                                        width: step >= s ? "100%" : "0%",
                                        backgroundColor: step >= s ? "#F59E0B" : "#f1f5f9"
                                    }}
                                    className="h-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="px-7 py-9 sm:px-8 sm:py-10">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                    <div className="space-y-1">
                                        <h1 className="text-[22px] font-[1000] text-slate-900 tracking-[-0.03em] leading-none">Customer <span className="text-accent-600 italic">Access.</span></h1>
                                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em]">SECURE AUTH — PHASE 01</p>
                                    </div>

                                    <Input 
                                        label="Mobile Number"
                                        name="mobile"
                                        maxLength="10"
                                        placeholder="00000 00000"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        prefix="IN +91"
                                        autoFocus
                                    />

                                    <Button 
                                        onClick={nextStep}
                                        disabled={formData.mobile.length < 10}
                                        variant="dark"
                                        className="!bg-[#0B1527]"
                                        fullWidth
                                        icon="person_add"
                                    >
                                        GENERATE OTP
                                    </Button>
                                    
                                    <div className="flex items-center justify-center gap-4 py-1">
                                        <Badge variant="slate" size="xs" icon="lock" animate={false}>Secure</Badge>
                                        <div className="w-[1px] h-3 bg-slate-200" />
                                        <Badge variant="slate" size="xs" icon="shopping_cart" animate={false}>Direct Farm</Badge>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                    <button onClick={prevStep} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-accent-600 font-black text-[8px] uppercase tracking-widest group transition-all">
                                        <span className="material-symbols-outlined text-[10px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span> Change Number
                                    </button>
                                    
                                    <div className="space-y-1">
                                        <h1 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">Verify <span className="text-accent-600 italic">Code.</span></h1>
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Sent to +91 {formData.mobile}</p>
                                    </div>

                                    <OTPInput 
                                        otp={formData.otp}
                                        onChange={handleOtpChange}
                                        onKeyDown={handleOtpKeyDown}
                                        otpRefs={otpRefs}
                                        focusColor="border-accent-500"
                                    />

                                    <div className="space-y-4">
                                        <Button 
                                            onClick={nextStep}
                                            disabled={formData.otp.join('').length < 6}
                                            fullWidth
                                            className="!bg-accent-600"
                                        >
                                            VERIFY & CONTINUE
                                        </Button>

                                        <div className="text-center">
                                            {canResend ? (
                                                <button onClick={startTimer} className="text-accent-600 font-black text-[9px] underline underline-offset-8 decoration-2 uppercase tracking-[0.2em] hover:text-accent-700 transition-colors">Resend Code</button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-1 h-1 bg-accent-600 rounded-full animate-pulse" />
                                                    <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest leading-none">Resend in <span className="text-slate-900 font-mono tracking-normal">0:{timer < 10 ? `0${timer}` : timer}</span></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                    <div className="space-y-1">
                                        <h1 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">Personal <span className="text-accent-600 italic">Profile.</span></h1>
                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Join the Agri-Revolution</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input 
                                                label="First Name"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                placeholder="Rajesh"
                                                icon="person"
                                            />
                                            <Input 
                                                label="Last Name"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                placeholder="Kumar"
                                            />
                                        </div>

                                        <Input 
                                            label="Email ID (Optional)"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="rajesh@example.com"
                                            icon="alternate_email"
                                        />
                                    </div>

                                    <Button 
                                        onClick={() => navigate('/dashboard')}
                                        disabled={!formData.firstName || !formData.lastName}
                                        fullWidth
                                        className="mt-2 !bg-accent-600"
                                        icon="shopping_basket"
                                    >
                                        START SHOPPING
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </main>

            <div className="flex justify-center pb-12">
                <Button variant="glass" size="sm" icon="shopping_bag" iconPosition="left" className="!text-accent-700 !border-accent-100">
                    Browse Fresh Catalog
                </Button>
            </div>
        </div>
    );
};

export default CustomerRegistration;
