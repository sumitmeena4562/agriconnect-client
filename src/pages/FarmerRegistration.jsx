import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';

/**
 * EXPLANATION:
 * 1. Simple Header: Humne complex Navbar hata diya hai aur sirf Logo rakha hai.
 * 2. Layout: Navigation bar ko ekdum par (top) rakha hai as requested.
 */

const FarmerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        mobile: '',
        otp: '',
        fullName: '',
        state: '',
        district: '',
        pincode: '',
        language: 'Hindi'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const states = ["Maharashtra", "Madhya Pradesh", "Punjab", "Gujarat", "Uttar Pradesh"];
    const districts = ["Nashik", "Indore", "Amritsar", "Surat", "Lucknow"];

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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Welcome <span className="text-[#00B464]">Farmer!</span></h1>
                                <p className="text-slate-500 text-sm font-medium mt-1 italic">Enter mobile number to get started</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-[#00B464] transition-all">
                                    <span className="font-bold text-slate-400 mr-2">+91</span>
                                    <input 
                                        type="tel"
                                        name="mobile"
                                        placeholder="Enter 10 digits"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-none outline-none font-bold text-slate-800"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={nextStep}
                                disabled={formData.mobile.length < 10}
                                className="w-full bg-[#00B464] text-white py-4 rounded-xl font-black shadow-lg shadow-green-100 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                            >
                                SEND OTP <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            <button onClick={prevStep} className="text-slate-400 hover:text-slate-800 font-bold text-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                            </button>
                            
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Verify <span className="text-[#00B464]">OTP</span></h1>
                                <p className="text-slate-500 text-sm font-medium mt-1">Code sent to +91 {formData.mobile}</p>
                            </div>

                            <div className="grid grid-cols-6 gap-2">
                                {[1,2,3,4,5,6].map((i) => (
                                    <input 
                                        key={i}
                                        type="text"
                                        maxLength="1"
                                        className="w-full aspect-square bg-slate-50 border border-slate-200 rounded-lg text-center font-black text-slate-800 focus:border-[#00B464] outline-none"
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={nextStep}
                                className="w-full bg-[#00B464] text-white py-4 rounded-xl font-black shadow-lg shadow-green-100 transition-all"
                            >
                                VERIFY & CONTINUE
                            </button>

                            <p className="text-center text-[11px] font-bold text-slate-400">
                                Didn't receive code? <button className="text-[#00B464] underline">Resend OTP</button>
                            </p>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-tight">Almost <span className="text-[#00B464]">Finished</span></h1>
                                <p className="text-slate-500 text-sm font-medium mt-1">Provide your basic profile details</p>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Full Name</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter your legal name"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#00B464]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">State</label>
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none">
                                            <option>Select State</option>
                                            {states.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Pincode</label>
                                        <input 
                                            type="text"
                                            placeholder="6 Digits"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-sm outline-none focus:border-[#00B464]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Display Language</label>
                                    <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
                                        <button className="flex-1 text-slate-500 rounded-md text-[12px] font-black py-2">हिन्दी</button>
                                        <button className="flex-1 bg-white text-[#00B464] rounded-md text-[12px] font-black py-2 shadow-sm">ENGLISH</button>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg transition-all mt-2"
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
