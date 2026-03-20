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
        <div className="min-h-screen bg-[#F0FDF4] flex flex-col">
            {/* Simple Top Nav */}
            <nav className="w-full bg-white/80 backdrop-blur-md border-b border-green-100 py-3 px-6 flex justify-between items-center sticky top-0 z-50">
                <Logo size="md" />
                <div className="text-[10px] font-black text-green-700 bg-green-50 px-2.5 py-1.5 rounded-full uppercase tracking-widest">
                    Quick Signup
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-4 py-8">

            {/* Main Card: Compact & Glassy */}
            <div className="w-full max-w-md bg-white border border-green-100 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                
                {/* Progress Mini Bar */}
                <div className="w-full bg-slate-100 h-1">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="bg-[#00B464] h-full"
                    />
                </div>

                <div className="p-6 sm:p-8">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Welcome <span className="text-[#00B464]">Farmer!</span></h1>
                                <p className="text-slate-500 text-sm font-medium mt-1 italic">Enter your mobile number to get started</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                                <div className="group flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-[#00B464] focus-within:ring-4 focus-within:ring-green-50 transition-all">
                                    <span className="material-symbols-outlined text-slate-400 group-focus-within:text-[#00B464] mr-3">phone_iphone</span>
                                    <span className="font-bold text-slate-400 mr-2 border-r border-slate-200 pr-2">+91</span>
                                    <input 
                                        type="tel"
                                        name="mobile"
                                        maxLength="10"
                                        placeholder="00000 00000"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-lg placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={nextStep}
                                disabled={formData.mobile.length < 10}
                                className="w-full bg-[#00B464] text-white py-4 rounded-2xl font-black shadow-xl shadow-green-100/50 hover:bg-[#00a35a] active:scale-[0.98] disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 group"
                            >
                                SEND OTP 
                                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                            
                            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-wider">
                                Secure & Private • Trusted by 10k+ Farmers
                            </p>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <button onClick={prevStep} className="text-slate-400 hover:text-[#00B464] font-black text-xs flex items-center gap-1 transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> CHANGE NUMBER
                            </button>
                            
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Verify <span className="text-[#00B464]">OTP</span></h1>
                                <p className="text-slate-500 text-sm font-medium mt-1">Sent to <span className="text-slate-900 font-bold">+91 {formData.mobile}</span></p>
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
                                        className="w-full aspect-square bg-slate-50 border-2 border-slate-100 rounded-xl text-center font-black text-xl text-slate-800 focus:border-[#00B464] focus:bg-white outline-none transition-all"
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={nextStep}
                                disabled={formData.otp.join('').length < 6}
                                className="w-full bg-[#00B464] text-white py-4 rounded-2xl font-black shadow-xl shadow-green-100 transition-all disabled:opacity-30"
                            >
                                VERIFY & CONTINUE
                            </button>

                            <div className="text-center">
                                {canResend ? (
                                    <button onClick={startTimer} className="text-[#00B464] font-black text-xs underline decoration-2 underline-offset-4">RESEND OTP NOW</button>
                                ) : (
                                    <p className="text-slate-400 font-bold text-xs">Resend Code in <span className="text-slate-900">0:{timer < 10 ? `0${timer}` : timer}</span></p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-5"
                        >
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Almost <span className="text-[#00B464]">Finished</span></h1>
                                <p className="text-slate-500 text-sm font-medium mt-1 space-x-1 flex items-center">
                                    <span className="material-symbols-outlined text-xs text-[#00B464]">verified_user</span>
                                    <span>Provide your basic profile details</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-[#00B464] transition-all">
                                        <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">person</span>
                                        <input 
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Enter your legal name"
                                            className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">State</label>
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-[#00B464] transition-all">
                                            <select 
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-sm appearance-none"
                                            >
                                                <option value="">Select</option>
                                                {Object.keys(statesData).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">District</label>
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-[#00B464] transition-all">
                                            <select 
                                                name="district"
                                                value={formData.district}
                                                onChange={handleChange}
                                                disabled={!formData.state}
                                                className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-sm appearance-none disabled:opacity-40"
                                            >
                                                <option value="">Select</option>
                                                {formData.state && statesData[formData.state].map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pincode</label>
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-[#00B464] transition-all">
                                            <span className="material-symbols-outlined text-slate-400 mr-2 text-xl">map</span>
                                            <input 
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleChange}
                                                maxLength="6"
                                                placeholder="6 Digits"
                                                className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Language</label>
                                        <div className="flex bg-slate-100 rounded-xl p-1 gap-1 h-[46px]">
                                            <button 
                                                onClick={() => setFormData({...formData, language: 'Hindi'})}
                                                className={`flex-1 rounded-lg text-[11px] font-black transition-all ${formData.language === 'Hindi' ? 'bg-white text-[#00B464] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >हिन्दी</button>
                                            <button 
                                                onClick={() => setFormData({...formData, language: 'English'})}
                                                className={`flex-1 rounded-lg text-[11px] font-black transition-all ${formData.language === 'English' ? 'bg-white text-[#00B464] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                            >ENGLISH</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/dashboard')}
                                disabled={!formData.fullName || !formData.state || !formData.district || formData.pincode.length < 6}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 transition-all mt-4"
                            >
                                CREATE MY ACCOUNT
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                </div>
            </div>

            </main>

            {/* Help/WhatsApp */}
            <div className="flex justify-center pb-8 bg-[#F0FDF4]">
                <a href="#" className="flex items-center gap-2 text-slate-500 font-bold text-xs hover:text-[#00B464] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Need Help? WhatsApp Support
                </a>
            </div>
        </div>
    );
};

export default FarmerRegistration;
