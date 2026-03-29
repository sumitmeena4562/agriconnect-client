import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import Logo from '../components/common/Logo';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import OTPInput from '../components/ui/OTPInput';
import { loginUser as apiLoginUser, sendForgotPasswordOtp, resetPassword, sendLoginOtp, verifyLoginOtp, checkAvailability } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    // Auth States
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    // OTP Login States
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
    const [otpSent, setOtpSent] = useState(false);
    const [loginOtp, setLoginOtp] = useState('');

    // Forgot Password States
    const [forgotMode, setForgotMode] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: ID entry, 2: OTP + New Password
    const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6-digit array
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [forgotTimer, setForgotTimer] = useState(0);
    const [canResendForgot, setCanResendForgot] = useState(true);
    const forgotRefs = useRef([]);

    const [themeRole, setThemeRole] = useState(null);

    const isEmail = identifier.includes('@');
    const isValidIdentifier = identifier.length > 0 && (isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) : /^[6-9]\d{9}$/.test(identifier));
    const isPasswordValid = password.length >= 6; 
    const isNewPasswordValid = newPassword.length >= 8;
    const isConfirmValid = confirmPassword === newPassword && confirmPassword.length >= 8;
    const isOtpComplete = otp.join('').length === 6;
    
    // Z+ Intelligence: Strength calculation from validation utils replacement
    const calculateStrength = (p) => {
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s += 25;
        if (/[A-Z]/.test(p)) s += 25;
        if (/[0-9]/.test(p)) s += 25;
        if (/[^A-Za-z0-9]/.test(p)) s += 25;
        return s;
    };

    const maskIdentifier = (id) => {
        if (!id) return '';
        if (id.includes('@')) {
            const [user, domain] = id.split('@');
            return `${user.slice(0, 1)}***@${domain.slice(0, 1)}***.${domain.split('.').pop()}`;
        }
        return `${id.slice(0, 2)}******${id.slice(-2)}`;
    };

    // Z+ UI: Self-cleaning timer
    useEffect(() => {
        let interval;
        if (forgotTimer > 0) {
            interval = setInterval(() => {
                setForgotTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResendForgot(true);
        }
        return () => clearInterval(interval);
    }, [forgotTimer]);

    const roleColors = {
        farmer: { text: 'text-primary-600', bg: 'bg-primary-500', lightBg: 'bg-primary-50' },
        vendor: { text: 'text-accent-600', bg: 'bg-accent-500', lightBg: 'bg-accent-50' },
        customer: { text: 'text-info-600', bg: 'bg-info-500', lightBg: 'bg-info-50' },
        admin: { text: 'text-slate-800', bg: 'bg-slate-800', lightBg: 'bg-slate-100' }
    };

    const colors = themeRole ? roleColors[themeRole] : roleColors.farmer;
    const activeVariant = themeRole === 'vendor' ? 'accent' : themeRole === 'customer' ? 'info' : themeRole === 'admin' ? 'dark' : 'primary';

    React.useEffect(() => {
        if (!isValidIdentifier) {
            setThemeRole(null);
            return;
        }
        const timeoutId = setTimeout(async () => {
            try {
                const res = await checkAvailability({ [isEmail ? 'email' : 'mobile']: identifier });
                if (res.data && res.data.role) {
                    setThemeRole(res.data.role);
                } else {
                    setThemeRole(null);
                }
            } catch (err) {
                // Ignore background errors
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [identifier, isValidIdentifier, isEmail]);


    const handleSuccessLogin = (data) => {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', data.token);
        storage.setItem('user', JSON.stringify(data.user));
        
        toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
        
        setTimeout(() => {
            const role = data.user.role;
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'farmer') navigate('/farmer/dashboard');
            else if (role === 'vendor') navigate('/vendor/dashboard');
            else navigate('/customer/dashboard');
        }, 1000);
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidIdentifier) {
            toast.error("Please ensure your identifier is valid.");
            return;
        }

        if (loginMethod === 'password') {
            if (!isPasswordValid) return;
            setLoading(true);
            try {
                // Z+ UI: Trim for frontend speed/reliability
                const response = await apiLoginUser({ identifier: identifier.trim(), password });
                if (response.data.success) {
                    handleSuccessLogin(response.data);
                }
            } catch (err) {
                const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
                setError(msg);
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        } else {
            // OTP Password-less execution
            if (!otpSent) {
                setLoading(true);
                try {
                    const res = await sendLoginOtp({ identifier });
                    if (res.data.success) {
                        toast.success(res.data.message || "Login OTP Sent!");
                        setOtpSent(true);
                    }
                } catch(err) {
                    setError(err.response?.data?.message || "Failed to send OTP");
                } finally {
                    setLoading(false);
                }
            } else {
                if (loginOtp.length !== 6) return;
                setLoading(true);
                try {
                    const res = await verifyLoginOtp({ identifier, otp: loginOtp });
                    if (res.data.success) {
                        handleSuccessLogin(res.data);
                    }
                } catch(err) {
                    setError(err.response?.data?.message || "Invalid OTP");
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const handleSendForgotOtp = async () => {
        if (!isValidIdentifier) return;
        setLoading(true);
        try {
            const response = await sendForgotPasswordOtp({ identifier: identifier.trim() });
            if (response.data.success) {
                toast.success("Identity verified! Check your inbox.");
                setForgotStep(2);
                setForgotTimer(60);
                setCanResendForgot(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };


    const handleForgotOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) forgotRefs.current[index + 1]?.focus();
    };

    const handleForgotOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            forgotRefs.current[index - 1]?.focus();
        }
    };

    const handleForgotOtpPaste = (pastedData) => {
        const digits = pastedData.split('').slice(0, 6);
        const newOtp = [...otp];
        digits.forEach((d, i) => { newOtp[i] = d; });
        setOtp(newOtp);
        const nextIndex = Math.min(digits.length, 5);
        forgotRefs.current[nextIndex]?.focus();
    };

    const handleResetPassword = async () => {
        if (!isOtpComplete || !isNewPasswordValid || !isConfirmValid) return;
        setLoading(true);
        try {
            const response = await resetPassword({ 
                identifier: identifier.trim(), 
                otp: otp.join(''), 
                newPassword 
            });
            if (response.data.success) {
                toast.success("Password reset successful! Please login.");
                setForgotMode(false);
                setForgotStep(1);
                setOtp(['', '', '', '', '', '']);
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Reset failed.");
        } finally {
            setLoading(false);
        }
    };

    const domains = ['@gmail.com', '@outlook.com', '@hotmail.com', '.com'];
    const showChips = identifier.length > 2 && !identifier.includes('@') && !/^\d+$/.test(identifier);

    const handleDomainClick = (domain) => {
        setIdentifier(identifier + domain);
    };

    return (
        <div className="min-h-screen bg-white flex font-sans antialiased overflow-hidden">
            {/* Left Panel - Minimal Branding (Desktop Only) */}
            <div className="hidden lg:flex w-[35%] bg-slate-50 relative overflow-hidden flex-col justify-center border-r border-slate-100 p-16">
                <div className="space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Logo size="lg" />
                    </motion.div>

                    <div className="space-y-4">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-3xl xl:text-4xl font-bold text-slate-800 leading-tight tracking-tight"
                        >
                            Grow Smarter. <br />
                            <span className={colors.text}>Connected.</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-slate-500 text-sm max-w-xs leading-relaxed font-medium"
                        >
                            Secure access to your agricultural ecosystem. Manage trades, tracking, and growth in one unified place.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="pt-8 flex items-center gap-4 border-t border-slate-200/60"
                    >
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Trusted by 2.4M+ Partners</span>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Simple Form */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto">
                <nav className="w-full py-4 px-10 flex justify-between items-center z-50">
                    <div className="flex lg:hidden">
                        <Logo size="md" />
                    </div>
                    <div className="hidden lg:block">
                        <Badge variant="slate" size="xs">System v2.4</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting access?</span>
                        <Link to="/farmer-registration" className="px-5 py-2 rounded-full text-[11px] font-black transition-all bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60 transition-all active:scale-95 uppercase tracking-tightest">
                            Join Now
                        </Link>
                    </div>
                </nav>

                <main className="flex-1 flex flex-col items-center justify-center px-6 lg:px-20 py-4 relative">
                    <AnimatePresence mode="wait">
                        <Card 
                            key={forgotMode ? 'forgot' : 'login'}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full transition-all duration-500 !rounded-[20px] border border-slate-100 shadow-xl shadow-slate-200/40 max-w-[420px] overflow-hidden bg-white z-10" 
                            padding="p-0" 
                        >
                            <div className="flex w-full bg-slate-100 h-1.5 overflow-hidden">
                                <motion.div 
                                    className={`h-full ${colors.bg} transition-colors duration-500`} 
                                    initial={{ width: '0%' }}
                                    animate={{ width: isValidIdentifier ? '100%' : '20%' }}
                                />
                            </div>

                            <div className="px-8 py-6 sm:px-12 sm:py-8 text-left">
                                <AnimatePresence mode="wait">
                                    {forgotMode ? (
                                        <motion.div key="forgot-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <div className="mb-8 flex items-start justify-between">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Forgot Password</h2>
                                                    <p className="text-slate-500 text-[13px] mt-1 font-medium">Enter your ID to reset access.</p>
                                                </div>
                                                <button 
                                                    onClick={() => { setForgotMode(false); setForgotStep(1); setError(''); }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-black">close</span>
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {forgotStep === 1 ? (
                                                     <Input 
                                                        label="Mobile or Email"
                                                        name="identifier"
                                                        autoComplete="username"
                                                        type={isEmail ? 'email' : 'tel'}
                                                        value={identifier}
                                                        onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                                                        placeholder="Phone or Email"
                                                        icon={isEmail ? "mail" : identifier.length > 0 ? "phone_iphone" : "account_circle"}
                                                        success={isValidIdentifier}
                                                        colors={colors}
                                                    />
                                                ) : (
                                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                                        <div className="space-y-1">
                                                            <div className="flex flex-col mb-4">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verify Identity</p>
                                                                <p className="text-[12px] font-medium text-slate-500 mt-1">Code sent to <span className="text-slate-900 font-bold">{maskIdentifier(identifier)}</span></p>
                                                            </div>
                                                            <div className="flex justify-between items-center mb-1 pr-1">
                                                                <span></span>
                                                                {!canResendForgot && (
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Wait {forgotTimer}s</p>
                                                                )}
                                                            </div>
                                                            <OTPInput 
                                                                otp={otp}
                                                                onChange={handleForgotOtpChange}
                                                                onKeyDown={handleForgotOtpKeyDown}
                                                                onPaste={handleForgotOtpPaste}
                                                                otpRefs={forgotRefs}
                                                                colors={colors}
                                                            />
                                                            {canResendForgot && (
                                                                <button onClick={handleSendForgotOtp} className={`text-[10px] font-black ${colors.text} uppercase tracking-widest mt-2 hover:underline inline-flex items-center gap-1`}>
                                                                    <span className="material-symbols-outlined text-sm">refresh</span>
                                                                    Resend Code
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="space-y-4 pt-2 border-t border-slate-50">
                                                            <Input 
                                                                label="New Password"
                                                                name="newPassword"
                                                                autoComplete="new-password"
                                                                type="password"
                                                                value={newPassword}
                                                                onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                                                placeholder="Create strong secret"
                                                                icon="lock_reset"
                                                                success={isNewPasswordValid}
                                                                strength={calculateStrength(newPassword)}
                                                                colors={colors}
                                                            />
                                                            <Input 
                                                                label="Confirm New Password"
                                                                name="confirmPassword"
                                                                autoComplete="new-password"
                                                                type="password"
                                                                value={confirmPassword}
                                                                onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                                                placeholder="Repeat your secret"
                                                                icon="verified"
                                                                success={isConfirmValid}
                                                                colors={colors}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {error && (
                                                    <div className="text-rose-600 text-[11px] font-black text-center py-3 bg-rose-50 rounded-xl border border-rose-100 uppercase tracking-widest leading-none">
                                                        {error}
                                                    </div>
                                                )}

                                                <div className="pt-4">
                                                    <Button 
                                                        onClick={forgotStep === 1 ? handleSendForgotOtp : handleResetPassword}
                                                        disabled={loading || (forgotStep === 1 ? !isValidIdentifier : (!isOtpComplete || !isNewPasswordValid || !isConfirmValid))}
                                                        fullWidth
                                                        variant={(forgotStep === 1 ? isValidIdentifier : (isOtpComplete && isNewPasswordValid && isConfirmValid)) ? activeVariant : 'dark'}
                                                        icon={loading ? "autorenew" : (forgotStep === 1 ? "arrow_forward" : "task_alt")}
                                                        size="lg"
                                                    >
                                                        {loading ? (forgotStep === 1 ? "SENDING..." : "RESETTING...") : (forgotStep === 1 ? "GET SECURE OTP" : "RESET PASSWORD")}
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.form key="login-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4" onSubmit={handleLoginSubmit}>
                                            <div className="mb-4 flex flex-col items-start space-y-3">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Login</h2>
                                                    <p className="text-slate-500 text-[13px] font-medium leading-relaxed">Enter your details to manage your profile.</p>
                                                </div>
                                                
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setLoginMethod(prev => prev === 'password' ? 'otp' : 'password'); setOtpSent(false); setError(''); }}
                                                    className={`px-4 py-1.5 ${colors.lightBg} ${colors.text} rounded-full text-[10px] font-black uppercase tracking-[0.05em] hover:shadow-sm transition-all border ${themeRole ? `border-${colors.text.split('-')[1]}-200` : 'border-slate-100'} active:scale-95`}
                                                >
                                                    {loginMethod === 'password' ? "LOGIN VIA OTP" : "USE PASSWORD"}
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-0.5">
                                                <Input 
                                                    label="Mobile or Email"
                                                    name="identifier"
                                                    autoComplete="username"
                                                    type={isEmail ? 'email' : 'tel'}
                                                    value={identifier}
                                                    onChange={(e) => {
                                                        setIdentifier(e.target.value);
                                                        setError('');
                                                    }}
                                                    placeholder="Phone or Email"
                                                    icon={isEmail ? "mail" : identifier.length > 0 ? "phone_iphone" : "account_circle"}
                                                    success={isValidIdentifier}
                                                    colors={colors}
                                                    disabled={otpSent}
                                                />

                                                <AnimatePresence>
                                                    {showChips && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="flex flex-wrap gap-2 px-1 pt-2"
                                                        >
                                                            {domains.map(domain => (
                                                                <button
                                                                    key={domain}
                                                                    type="button"
                                                                    onClick={() => handleDomainClick(domain)}
                                                                    className={`px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 hover:border-${colors.text.split('-')[1]}-200 hover:${colors.text} transition-all active:scale-95 uppercase tracking-tight`}
                                                                >
                                                                    {domain}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                 {loginMethod === 'password' && (
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest text-right px-1 pt-1 ${identifier.length === 0 ? 'text-slate-300' : 'text-primary-500'}`}>
                                                        {identifier.length === 0 ? "CHECKING..." : "VERIFIED"}
                                                    </p>
                                                )}
                                            </div>

                                            <AnimatePresence mode="popLayout">
                                                {loginMethod === 'password' ? (
                                                    <motion.div key="pass-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                        <Input 
                                                            label="PASSWORD"
                                                            name="password"
                                                            autoComplete="current-password"
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                                            placeholder="••••••••"
                                                            icon="key"
                                                            success={isPasswordValid}
                                                            colors={colors}
                                                        />
                                                    </motion.div>
                                                ) : (
                                                    otpSent && (
                                                        <motion.div key="otp-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                            <Input 
                                                                label="Authentication Pin"
                                                                name="loginOtp"
                                                                autoComplete="one-time-code"
                                                                value={loginOtp}
                                                                onChange={(e) => { setLoginOtp(e.target.value); setError(''); }}
                                                                placeholder="6-Digits"
                                                                icon="pin"
                                                                maxLength={6}
                                                                inputMode="numeric"
                                                                success={loginOtp.length === 6}
                                                                colors={colors}
                                                            />
                                                        </motion.div>
                                                    )
                                                )}
                                            </AnimatePresence>

                                            <AnimatePresence>
                                                {error && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="text-rose-600 text-[10px] font-black text-center py-3 bg-rose-50 rounded-xl border border-rose-100 uppercase tracking-widest shadow-sm"
                                                    >
                                                        {error}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {loginMethod === 'password' && (
                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="flex items-center">
                                                        <input
                                                            id="remember-me"
                                                            type="checkbox"
                                                            checked={rememberMe}
                                                            onChange={(e) => setRememberMe(e.target.checked)}
                                                            className="h-4 w-4 rounded-md border-slate-300 text-primary-600 focus:ring-primary-100 cursor-pointer"
                                                        />
                                                        <label htmlFor="remember-me" className="ml-2 block text-[13px] font-semibold text-slate-500 cursor-pointer select-none">
                                                            Remember me
                                                        </label>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setForgotMode(true); setError(''); }}
                                                        className="font-bold text-primary-600 hover:text-primary-500 text-[11px] transition-colors uppercase tracking-tight"
                                                    >
                                                        Forgot password?
                                                    </button>
                                                </div>
                                            )}

                                            <div className="pt-4">
                                                <Button 
                                                    type="submit"
                                                    disabled={loading || !isValidIdentifier || (loginMethod === 'password' && !isPasswordValid) || (loginMethod === 'otp' && otpSent && loginOtp.length !== 6)}
                                                    fullWidth
                                                    variant={(isValidIdentifier && (isPasswordValid || loginMethod === 'otp')) ? activeVariant : 'dark'}
                                                    icon={loading ? "sync" : (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                    className={`${loading ? 'opacity-80' : ''} !py-4 !text-[12px] font-black tracking-widest shadow-lg active:scale-[0.98] transition-all`}
                                                >
                                                    {loading ? "LOADING..." : loginMethod === 'password' ? "LOGIN" : (!otpSent ? "SEND ACCESS OTP" : "VERIFY & LOGIN")}
                                                </Button>
                                            </div>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>
                    </AnimatePresence>

                    <footer className="mt-6 text-center space-y-3 z-10 lg:hidden">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                             &copy; 2026 AgriConnect Unified
                        </p>
                    </footer>
                </main>
                
                {/* Desktop Footer built-in to main */}
                <div className="hidden lg:flex w-full p-4 justify-center items-center gap-12 border-t border-slate-50 bg-white mt-auto">
                    {['Farmer', 'Vendor', 'Customer'].map((item, idx) => (
                        <Link key={item} to={`/${item.toLowerCase()}-registration`} className="group flex items-center gap-2">
                            <span className={`w-1 h-1 rounded-full ${idx === 0 ? 'bg-primary-500' : idx === 1 ? 'bg-accent-500' : 'bg-info-500'}`} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{item} Entry</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Login;
