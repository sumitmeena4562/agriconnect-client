import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/common/Logo';
import { registerUser, sendOtp, verifyOtp } from '../services/api';

// UI Components
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import OTPInput from '../components/ui/OTPInput';
import Card from '../components/ui/Card';

const CustomerRegistration = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [verificationToken, setVerificationToken] = useState("");
    
    // Automatic redirection after success
    useEffect(() => {
        if (isSuccess) {
            const redirectTimer = setTimeout(() => {
                navigate('/dashboard');
            }, 5000);
            return () => clearTimeout(redirectTimer);
        }
    }, [isSuccess, navigate]);

    const [formData, setFormData] = useState({
        mobile: '',
        otp: ['', '', '', '', '', ''],
        fullName: '',
        email: '',
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
            if (!/^\d*$/.test(value)) return;
        }
        setError("");
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSendOtp = async () => {
        if (formData.mobile.length !== 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const response = await sendOtp(formData.mobile);
            if (response.data.success) {
                setTimer(30);
                setCanResend(false);
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        setError("");
        try {
            const otpCode = formData.otp.join('');
            const response = await verifyOtp(formData.mobile, otpCode);
            if (response.data.success) {
                setVerificationToken(response.data.verificationToken);
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const userData = {
                name: formData.fullName,
                mobile: formData.mobile,
                email: formData.email, 
                password: "password123", 
                role: "buyer",
                state: formData.state,
                district: formData.district,
                pincode: formData.pincode,
                language: formData.language,
                verificationToken: verificationToken
            };

            const response = await registerUser(userData);
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setIsSuccess(true);
            }
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
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

    const prevStep = () => {
        setError("");
        setStep(prev => prev - 1);
    };

    const statesData = {
        "Maharashtra": ["Nashik", "Pune", "Nagpur", "Ahmednagar"],
        "Madhya Pradesh": ["Indore", "Bhopal", "Ujjain", "Ratlam"],
        "Punjab": ["Amritsar", "Ludhiana", "Patiala", "Jalandhar"],
        "Gujarat": ["Surat", "Ahmedabad", "Rajkot", "Vadodara"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra"]
    };

    return (
        <div className="h-[100dvh] overflow-hidden bg-slate-50 flex flex-col font-sans antialiased">
            <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 sm:px-12 flex justify-between items-center z-50">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div className="h-5 w-[1.5px] bg-slate-100 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-tight">Buyer Registration</span>
                        <Badge variant="warning" size="xs" animate={false} className="!bg-yellow-50 !text-yellow-600 border-none">Personal Account</Badge>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
                    {['Hindi', 'English'].map(l => (
                        <button 
                            key={l}
                            onClick={() => setFormData({...formData, language: l})}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${formData.language === l ? 'bg-white text-yellow-600 shadow-sm' : 'text-slate-400'}`}
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
                            <div key={s} className={`flex-1 ${step >= s ? 'bg-yellow-500' : 'bg-transparent'} transition-colors duration-500`} />
                        ))}
                    </div>

                    <div className="px-6 py-8 sm:px-8 sm:py-10">
                        <AnimatePresence mode="wait">
                            {isSuccess ? (
                                <motion.div 
                                    key="success-card" 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="flex flex-col items-center text-center space-y-6"
                                >
                                    <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600">
                                        <span className="material-symbols-outlined text-[40px]">check_circle</span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <h1 className="text-2xl font-bold text-slate-900">Welcome, {formData.fullName.split(' ')[0] || 'Member'}!</h1>
                                        <p className="text-slate-500 text-sm">Your registration is complete.</p>
                                    </div>

                                    <div className="w-full space-y-4 pt-4">
                                        <Button 
                                            onClick={() => navigate('/dashboard')}
                                            fullWidth
                                            variant="dark"
                                            className="!bg-yellow-600 hover:!bg-yellow-700"
                                            icon="shopping_basket"
                                        >
                                            START SHOPPING
                                        </Button>
                                        <p className="text-slate-400 text-[10px] italic">Redirecting automatically in 5s...</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    {step === 1 && (
                                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                            <div className="space-y-1">
                                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buy <span className="text-yellow-600 italic text-[24px]">Fresh.</span></h1>
                                                <p className="text-slate-500 text-sm">Direct from farm to your kitchen.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <Input 
                                                    label="Mobile Number"
                                                    name="mobile"
                                                    maxLength="10"
                                                    placeholder="00000 00000"
                                                    value={formData.mobile}
                                                    onChange={handleChange}
                                                    prefix="+91"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    autoFocus
                                                />

                                                <Button 
                                                    onClick={handleSendOtp}
                                                    disabled={loading}
                                                    fullWidth
                                                    className="!bg-yellow-600 hover:!bg-yellow-700"
                                                    icon={loading ? "autorenew" : "arrow_forward"}
                                                >
                                                    {loading ? "SENDING..." : "CONTINUE"}
                                                </Button>
                                            </div>
                                            
                                            <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-50">
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                                    <span className="material-symbols-outlined text-sm">verified</span> Verified
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                                    <span className="material-symbols-outlined text-sm">shopping_cart</span> Premium
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                            <button onClick={prevStep} className="inline-flex items-center gap-1 text-slate-400 hover:text-yellow-600 text-xs font-bold transition-colors">
                                                <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                                            </button>
                                            
                                            <div className="space-y-1">
                                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify <span className="text-yellow-600 italic text-[24px]">Identity.</span></h1>
                                                <p className="text-slate-500 text-sm">OTP sent to +91 {formData.mobile}</p>
                                            </div>

                                            <div className="space-y-6">
                                                <OTPInput 
                                                    otp={formData.otp}
                                                    onChange={handleOtpChange}
                                                    onKeyDown={handleOtpKeyDown}
                                                    otpRefs={otpRefs}
                                                    focusColor="border-yellow-500"
                                                />

                                                <div className="space-y-4">
                                                    <Button 
                                                        onClick={handleVerifyOtp}
                                                        disabled={formData.otp.join('').length < 6 || loading}
                                                        fullWidth
                                                        className="!bg-yellow-600 hover:!bg-yellow-700"
                                                        icon={loading ? "autorenew" : undefined}
                                                    >
                                                        {loading ? "VERIFYING..." : "VERIFY OTP"}
                                                    </Button>

                                                    <div className="text-center">
                                                        {canResend ? (
                                                            <button onClick={handleSendOtp} disabled={loading} className="text-yellow-600 font-bold text-sm hover:underline">Resend Code</button>
                                                        ) : (
                                                            <p className="text-slate-400 text-xs font-medium">Resend in <span className="text-slate-900 font-mono">0:{timer < 10 ? `0${timer}` : timer}</span></p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                            <div className="space-y-1">
                                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile <span className="text-yellow-600 italic text-[24px]">Setup.</span></h1>
                                                <p className="text-slate-500 text-sm">Tell us where to deliver.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <Input 
                                                    label="Full Name"
                                                    name="fullName"
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    icon="person"
                                                />

                                                <Input 
                                                    label="Email ID"
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="name@example.com"
                                                    icon="mail"
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Select 
                                                        label="State"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        options={Object.keys(statesData)}
                                                    />
                                                    <Select 
                                                        label="District"
                                                        name="district"
                                                        value={formData.district}
                                                        onChange={handleChange}
                                                        disabled={!formData.state}
                                                        options={formData.state ? statesData[formData.state] : []}
                                                    />
                                                </div>

                                                <Input 
                                                    label="Pincode"
                                                    name="pincode"
                                                    value={formData.pincode}
                                                    onChange={handleChange}
                                                    maxLength="6"
                                                    placeholder="6-digit code"
                                                    icon="location_on"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                />
                                            </div>

                                            {error && (
                                                <div className="text-red-500 text-xs font-bold text-center py-2 bg-red-50 rounded-lg">
                                                    {error}
                                                </div>
                                            )}

                                            <Button 
                                                onClick={handleSubmit}
                                                disabled={!formData.fullName || !formData.email || !formData.state || !formData.district || formData.pincode.length < 6 || loading}
                                                fullWidth
                                                className="!bg-yellow-600 hover:!bg-yellow-700"
                                                icon={loading ? "autorenew" : "done_all"}
                                            >
                                                {loading ? "SAVING..." : "COMPLETE REGISTRATION"}
                                            </Button>
                                        </motion.div>
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

export default CustomerRegistration;
