import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

const FarmerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    
    const [formData, setFormData] = useState({
        mobile: '',
        otp: ['', '', '', '', '', ''],
        fullName: '',
        state: '',
        district: '',
        pincode: '',
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
        if (name === 'mobile' || name === 'pincode') {
            if (!/^\d*$/.test(value)) return; // Only numbers
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

    const statesData = {
        "Maharashtra": ["Nashik", "Pune", "Nagpur", "Ahmednagar"],
        "Madhya Pradesh": ["Indore", "Bhopal", "Ujjain", "Ratlam"],
        "Punjab": ["Amritsar", "Ludhiana", "Patiala", "Jalandhar"],
        "Gujarat": ["Surat", "Ahmedabad", "Rajkot", "Vadodara"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"]
    };

    return (
        <div className="min-h-screen bg-[#e9faf4] flex flex-col font-sans">
            <nav className="w-full bg-white/90 backdrop-blur-2xl border-b border-slate-100 py-4 px-6 sm:px-12 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div className="h-5 w-[1.5px] bg-slate-200 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[11px] font-[900] text-slate-800 uppercase tracking-[0.25em] leading-tight">Farmer Portal</span>
                        <span className="text-[8px] font-bold text-primary-600 uppercase tracking-widest opacity-70">Verified Access</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Glass Language Toggle */}
                    <div className="flex bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
                        <button 
                            onClick={() => setFormData({...formData, language: 'Hindi'})}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all duration-300 ${formData.language === 'Hindi' ? 'bg-white text-primary-600 shadow-md border border-primary-50 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >हिन्दी</button>
                        <button 
                            onClick={() => setFormData({...formData, language: 'English'})}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all duration-300 ${formData.language === 'English' ? 'bg-white text-primary-600 shadow-md border border-primary-50 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                        >ENGLISH</button>
                    </div>
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
                {/* Subtle Background Decoration */}
                <div className="absolute top-1/4 -right-20 w-60 h-60 bg-primary-100/20 rounded-full blur-[80px] -z-10" />
                <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-green-100/20 rounded-full blur-[80px] -z-10" />

            {/* Production Standard Card - Maximum Compactness Edition */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[360px] bg-white rounded-[28px] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden border border-slate-100/80 relative"
            >
                {/* Visual Step Timeline */}
                <div className="flex w-full bg-slate-50 h-[3px]">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1 overflow-hidden">
                            <motion.div 
                                initial={false}
                                animate={{ 
                                    width: step >= s ? "100%" : "0%",
                                    backgroundColor: step >= s ? "var(--color-primary-600)" : "#f1f5f9"
                                }}
                                className="h-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
                            />
                        </div>
                    ))}
                </div>

                <div className="px-7 py-9 sm:px-8 sm:py-10">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            <div className="space-y-1">
                                <h1 className="text-[22px] font-[1000] text-slate-900 tracking-[-0.03em] leading-none">Portal <span className="text-primary-600 italic">Access.</span></h1>
                                <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em]">SECURE AUTHENTICATION — PHASE 01</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.15em] px-1 opacity-60">Authentication Phone</label>
                                    {formData.mobile.length === 10 && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                                            <span className="material-symbols-outlined text-[10px] font-bold">verified</span>
                                            <span className="text-[7px] font-black uppercase tracking-widest text-primary-700">Ready</span>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="group flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] transition-all duration-400">
                                    <span className="font-black text-slate-400 mr-2 border-r-[1.5px] border-slate-200 pr-4 text-sm tracking-tighter opacity-60">IN +91</span>
                                    <input 
                                        type="tel"
                                        name="mobile"
                                        maxLength="10"
                                        placeholder="00000 00000"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        autoFocus
                                        className="w-full bg-transparent border-none outline-none font-black text-slate-800 text-xl placeholder:text-slate-200 tracking-[0.12em] transition-opacity"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={nextStep}
                                disabled={formData.mobile.length < 10}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-[1000] text-[11px] uppercase tracking-[0.2em] shadow-lg hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 group"
                            >
                                GENERATE OTP
                                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform duration-300">shield_lock</span>
                            </button>
                            
                            <div className="flex items-center justify-center gap-4 py-1">
                                <div className="flex items-center gap-1.5 opacity-40 grayscale group-hover:grayscale-0 transition-all cursor-default">
                                    <span className="material-symbols-outlined text-sm font-bold">verified_user</span>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">Encrypted</span>
                                </div>
                                <div className="w-[1px] h-3 bg-slate-200" />
                                <div className="flex items-center gap-1.5 opacity-40 grayscale group-hover:grayscale-0 transition-all cursor-default">
                                    <span className="material-symbols-outlined text-sm font-bold">groups</span>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none">10k+ Active</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            <button onClick={prevStep} className="inline-flex items-center gap-1.5 text-slate-400 hover:text-primary-600 font-black text-[8px] uppercase tracking-widest group transition-all">
                                <span className="material-symbols-outlined text-[10px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span> Change Number
                            </button>
                            
                            <div className="space-y-1">
                                <h1 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">Verify <span className="text-primary-600 italic">Code.</span></h1>
                                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-1">Sent to +91 {formData.mobile}</p>
                            </div>

                            <div className="grid grid-cols-6 gap-2">
                                {formData.otp.map((digit, i) => (
                                    <input 
                                        key={i}
                                        ref={el => otpRefs.current[i] = el}
                                        type="tel"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className="w-full aspect-square bg-slate-50 border-2 border-slate-100 rounded-xl text-center font-black text-xl text-slate-800 focus:border-primary-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] outline-none transition-all duration-300"
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button 
                                    onClick={nextStep}
                                    disabled={formData.otp.join('').length < 6}
                                    className="w-full bg-primary-600 text-white py-4 rounded-xl font-black text-sm shadow-md hover:bg-primary-700 active:scale-[0.98] disabled:opacity-30 disabled:grayscale transition-all"
                                >
                                    VERIFY & CONTINUE
                                </button>

                                <div className="text-center">
                                    {canResend ? (
                                        <button onClick={startTimer} className="text-primary-600 font-black text-[9px] underline underline-offset-8 decoration-2 uppercase tracking-[0.2em] hover:text-primary-700 transition-colors">Resend Code</button>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-1 h-1 bg-primary-600 rounded-full animate-pulse" />
                                            <p className="text-slate-400 font-black text-[9px] uppercase tracking-widest leading-none">Resend in <span className="text-slate-900 font-mono tracking-normal">0:{timer < 10 ? `0${timer}` : timer}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="space-y-1">
                                <h1 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none">Your <span className="text-primary-600 italic">Profile.</span></h1>
                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Identity Link: +91 {formData.mobile}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                                    <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] transition-all duration-400">
                                        <span className="material-symbols-outlined text-slate-300 mr-3 text-lg font-bold">person</span>
                                        <input 
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Ex: Rajesh Kumar"
                                            className="w-full bg-transparent border-none outline-none font-black text-slate-800 text-sm placeholder:text-slate-200"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">State</label>
                                        <div className="relative group/select">
                                            <select 
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-black text-slate-800 text-[10px] appearance-none focus:border-primary-500 transition-all outline-none"
                                            >
                                                <option value="">Choose State</option>
                                                {Object.keys(statesData).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            <span className="material-symbols-outlined text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within/select:rotate-180 transition-transform font-bold text-lg">expand_more</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">District</label>
                                        <div className="relative group/select">
                                            <select 
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                disabled={!formData.state}
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-black text-slate-800 text-[10px] appearance-none focus:border-primary-500 transition-all outline-none disabled:opacity-30"
                                            >
                                                <option value="">Choose District</option>
                                                {formData.state && statesData[formData.state].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <span className="material-symbols-outlined text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within/select:rotate-180 transition-transform font-bold text-lg">expand_more</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Pincode</label>
                                    <div className="flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] transition-all duration-400">
                                        <span className="material-symbols-outlined text-slate-300 mr-3 text-lg font-bold">near_me</span>
                                        <input 
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            maxLength="6"
                                            placeholder="000 000"
                                            className="w-full bg-transparent border-none outline-none font-black text-slate-800 text-sm placeholder:text-slate-200 tracking-[0.2em]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/dashboard')}
                                disabled={!formData.fullName || !formData.state || !formData.district || formData.pincode.length < 6}
                                className="w-full bg-primary-600 text-white py-4 rounded-xl font-black text-sm shadow-md hover:bg-primary-700 active:scale-[0.98] transition-all mt-2 disabled:opacity-20 disabled:grayscale disabled:scale-[0.99] group"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    INITIALIZE ACCESS
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">bolt</span>
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </motion.div>

            </main>

            {/* Production Support/Link */}
            <div className="flex justify-center pb-12">
                <a href="#" className="flex items-center gap-3 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-slate-500 hover:text-primary-600 group">
                    <span className="material-symbols-outlined text-xl font-bold group-hover:rotate-12 transition-transform">help_center</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">AgriConnect Support Center</span>
                </a>
            </div>
        </div>
    );
};

export default FarmerRegistration;
