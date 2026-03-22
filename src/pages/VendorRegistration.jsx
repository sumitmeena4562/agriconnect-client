import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

// UI Components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import OTPInput from '../components/ui/OTPInput';
import Card from '../components/ui/Card';

const VendorRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    
    const [formData, setFormData] = useState({
        mobile: '',
        otp: ['', '', '', '', '', ''],
        businessName: '',
        gstNumber: '',
        businessType: '',
        district: '',
        language: 'English'
    });

    const otpRefs = useRef([]);

    // Timer Logic for OTP
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

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
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
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

    const businessTypes = [
        "Retailer", "Wholesaler", "Exporter", "Processing Unit", "FPO / Cooperative"
    ];

    const districts = [
        "Mumbai", "Pune", "Nashik", "Nagpur", "Surat", "Ahmedabad", "Indore", "Bhopal", "Lucknow", "Delhi"
    ];

    return (
        <div className="min-h-screen bg-[#eaf2ff] flex flex-col font-sans">
            <nav className="w-full bg-white/90 backdrop-blur-2xl border-b border-slate-100 py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div className="h-5 w-[1.5px] bg-slate-200 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[11px] font-[900] text-slate-800 uppercase tracking-[0.25em] leading-tight text-info-600">Vendor Portal</span>
                        <Badge variant="info" size="xs" animate={false} className="!bg-blue-100 !text-blue-600 border-none">B2B Verified</Badge>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
                        {['Hindi', 'English'].map(l => (
                            <button 
                                key={l}
                                onClick={() => setFormData({...formData, language: l})}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all duration-300 ${formData.language === l ? 'bg-white text-info-600 shadow-md border border-info-50 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                            >{l === 'Hindi' ? 'हिन्दी' : 'ENGLISH'}</button>
                        ))}
                    </div>
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
                <div className="absolute top-1/4 -right-20 w-60 h-60 bg-blue-100/20 rounded-full blur-[80px] -z-10" />
                <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-info-100/20 rounded-full blur-[80px] -z-10" />

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
                                        backgroundColor: step >= s ? "#2F80ED" : "#f1f5f9"
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
                                        <h1 className="text-[22px] font-[1000] text-slate-900 tracking-[-0.03em] leading-none">Vendor <span className="text-info-600 italic">Access.</span></h1>
                                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em]">B2B AUTHENTICATION — PHASE 01</p>
                                    </div>

                                    <Input 
                                        label="Business Phone"
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
                                        icon="business_center"
                                    >
                                        GENERATE OTP
                                    </Button>
                                    
                                    <div className="flex items-center justify-center gap-4 py-1">
                                        <Badge variant="slate" size="xs" icon="verified" animate={false}>GST Verified</Badge>
                                        <div className="w-[1px] h-3 bg-slate-200" />
                                        <Badge variant="slate" size="xs" icon="rocket" animate={false}>Bulk Deals</Badge>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                                    <button onClick={prevStep} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-info-600 font-black text-[8px] uppercase tracking-widest group transition-all">
                                        <span className="material-symbols-outlined text-[10px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span> Change Number
                                    </button>
                                    
                                    <div className="space-y-1">
                                        <h1 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">Verify <span className="text-info-600 italic">Code.</span></h1>
                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Sent to +91 {formData.mobile}</p>
                                    </div>

                                    <OTPInput 
                                        otp={formData.otp}
                                        onChange={handleOtpChange}
                                        onKeyDown={handleOtpKeyDown}
                                        otpRefs={otpRefs}
                                        focusColor="border-info-500"
                                    />

                                    <div className="space-y-4">
                                        <Button 
                                            onClick={nextStep}
                                            disabled={formData.otp.join('').length < 6}
                                            fullWidth
                                            className="!bg-info-600"
                                        >
                                            VERIFY & CONTINUE
                                        </Button>

                                        <div className="text-center">
                                            {canResend ? (
                                                <button onClick={startTimer} className="text-info-600 font-black text-[9px] underline underline-offset-8 decoration-2 uppercase tracking-[0.2em] hover:text-info-700 transition-colors">Resend Code</button>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-1 h-1 bg-info-600 rounded-full animate-pulse" />
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
                                        <h1 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">Business <span className="text-info-600 italic">Details.</span></h1>
                                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">KYC Verification Process</p>
                                    </div>

                                    <div className="space-y-4">
                                        <Input 
                                            label="Business / Firm Name"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            placeholder="Ex: Fresh Mart Pvt Ltd"
                                            icon="store"
                                        />

                                        <Input 
                                            label="GST Number (Optional)"
                                            name="gstNumber"
                                            value={formData.gstNumber}
                                            onChange={handleChange}
                                            placeholder="22AAAAA0000A1Z5"
                                            icon="article"
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Select 
                                                label="Business Type"
                                                name="businessType"
                                                value={formData.businessType}
                                                onChange={handleChange}
                                                placeholder="Type"
                                                options={businessTypes}
                                            />
                                            <Select 
                                                label="Primary City"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                placeholder="City"
                                                options={districts}
                                            />
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={() => navigate('/dashboard')}
                                        disabled={!formData.businessName || !formData.businessType || !formData.district}
                                        fullWidth
                                        className="mt-2 !bg-info-600"
                                        icon="storefront"
                                    >
                                        REGISTER BUSINESS
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Card>
            </main>

            <div className="flex justify-center pb-12">
                <Button variant="glass" size="sm" icon="support_agent" iconPosition="left" className="!text-info-700 !border-info-100">
                    B2B Support Representative
                </Button>
            </div>
        </div>
    );
};

export default VendorRegistration;
