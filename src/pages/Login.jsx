import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import Logo from '../components/common/Logo';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
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
    const [forgotStep, setForgotStep] = useState(1); 
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [themeRole, setThemeRole] = useState(null);

    const isEmail = identifier.includes('@');
    const isValidIdentifier = identifier.length > 0 && (isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) : /^[6-9]\d{9}$/.test(identifier));
    const isPasswordValid = password.length >= 6; 
    const isNewPasswordValid = newPassword.length >= 8;

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
                const response = await apiLoginUser({ identifier, password });
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
        if (!isValidIdentifier) {
            setError("Enter a valid registered mobile number or email");
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await sendForgotPasswordOtp({ identifier });
            if (res.data.success) {
                toast.success(res.data.message || "OTP sent if the account exists");
                setForgotStep(2);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send OTP";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async () => {
        if (otp.length !== 6 || !isNewPasswordValid) return;
        setLoading(true);
        setError('');
        try {
            const res = await resetPassword({ identifier, otp, newPassword });
            if (res.data.success) {
                toast.success("Password reset successfully! Please login.");
                setForgotMode(false);
                setForgotStep(1);
                setPassword('');
                setOtp('');
                setNewPassword('');
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to reset password. Check your OTP.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased overflow-y-auto pb-10">
            <nav className="w-full bg-white border-b border-slate-200 py-4 px-6 sm:px-12 flex justify-between items-center z-50 sticky top-0">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <div className="h-5 w-[1.5px] bg-slate-100 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-tight">Secure Login</span>
                        <Badge variant="slate" size="xs" animate={false}>Z+ Protected</Badge>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200 hover:bg-slate-200 transition-colors">
                    <Link to="/farmer-registration" className="px-4 py-1.5 rounded-full text-[10px] font-black transition-all text-slate-600 hover:text-primary-700 uppercase tracking-tighter">
                        Register Instead
                    </Link>
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    <Card 
                        key={forgotMode ? 'forgot' : 'login'}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="w-full transition-all duration-500 !rounded-[16px] border-none shadow-xl shadow-slate-200/50 max-w-[390px] overflow-hidden bg-white" 
                        padding="p-0" 
                    >
                        <div className="flex w-full bg-slate-100 h-1">
                            <div className={`flex-1 ${colors.bg} transition-colors duration-500`} />
                        </div>

                        <div className="px-6 py-8 sm:px-8 sm:py-10 text-left">
                            <AnimatePresence mode="wait">
                                {forgotMode ? (
                                    <motion.div key="forgot-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <div className="mb-6 flex items-start justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recovery.</h2>
                                                <p className="text-slate-500 text-xs mt-1">
                                                    {forgotStep === 1 ? "Enter your ID to receive an OTP." : "Verify OTP and set new password."}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => { setForgotMode(false); setForgotStep(1); setError(''); }}
                                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm font-bold">close</span>
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <Input 
                                                label="Registered ID"
                                                name="identifier"
                                                autoComplete="username"
                                                type={isEmail ? 'email' : 'tel'}
                                                value={identifier}
                                                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                                                placeholder="Mobile number or Email"
                                                icon={isEmail ? "mail" : identifier.length > 0 ? "phone_iphone" : "account_circle"}
                                                success={isValidIdentifier}
                                                colors={colors}
                                                disabled={forgotStep === 2}
                                            />

                                            {forgotStep === 2 && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                                                    <Input 
                                                        label="6-Digit OTP"
                                                        name="otp"
                                                        autoComplete="one-time-code"
                                                        value={otp}
                                                        onChange={(e) => { setOtp(e.target.value); setError(''); }}
                                                        placeholder="••••••"
                                                        icon="pin"
                                                        maxLength={6}
                                                        inputMode="numeric"
                                                        success={otp.length === 6}
                                                        colors={colors}
                                                    />
                                                    <Input 
                                                        label="New Password"
                                                        name="newPassword"
                                                        autoComplete="new-password"
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                                        placeholder="Min 8 chars"
                                                        icon="enhanced_encryption"
                                                        success={isNewPasswordValid}
                                                        colors={colors}
                                                    />
                                                </motion.div>
                                            )}

                                            {error && (
                                                <div className="text-red-500 text-[10px] font-black text-center py-2 bg-red-50/50 rounded-xl border border-red-100/50 uppercase tracking-widest">
                                                    {error}
                                                </div>
                                            )}

                                            <div className="pt-3">
                                                {forgotStep === 1 ? (
                                                    <Button 
                                                        onClick={handleSendForgotOtp}
                                                        disabled={loading || !isValidIdentifier}
                                                        fullWidth
                                                        variant={isValidIdentifier ? activeVariant : 'dark'}
                                                        icon={loading ? "autorenew" : "send"}
                                                    >
                                                        {loading ? "SENDING..." : "SEND OTP"}
                                                    </Button>
                                                ) : (
                                                    <Button 
                                                        onClick={handleResetPasswordSubmit}
                                                        disabled={loading || otp.length !== 6 || !isNewPasswordValid}
                                                        fullWidth
                                                        variant={(otp.length === 6 && isNewPasswordValid) ? activeVariant : 'dark'}
                                                        icon={loading ? "autorenew" : "check_circle"}
                                                    >
                                                        {loading ? "VERIFYING..." : "RESET PASSWORD"}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.form key="login-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4" onSubmit={handleLoginSubmit}>
                                        <div className="mb-6 flex flex-col items-center justify-center text-center space-y-3">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back.</h2>
                                                <p className="text-slate-500 text-xs mt-1">Access your AgriConnect dashboard.</p>
                                            </div>
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => { setLoginMethod(prev => prev === 'password' ? 'otp' : 'password'); setOtpSent(false); setError(''); }}
                                                className={`px-4 py-1.5 ${colors.lightBg} ${colors.text} rounded-full text-[10px] font-black uppercase tracking-[0.1em] hover:bg-slate-100 hover:shadow-sm transition-all border ${themeRole ? `border-${colors.text.split('-')[1]}-200` : 'border-primary-100'}`}
                                            >
                                                {loginMethod === 'password' ? "LOGIN VIA OTP" : "USE PASSWORD"}
                                            </button>
                                        </div>
                                        
                                        <div>
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
                                                placeholder="Enter mobile or email"
                                                icon={isEmail ? "mail" : identifier.length > 0 ? "phone_iphone" : "account_circle"}
                                                success={isValidIdentifier}
                                                colors={colors}
                                                disabled={otpSent}
                                            />
                                            {loginMethod === 'password' && (
                                                <p className={`mt-1 text-[9px] font-black uppercase tracking-widest text-right ${identifier.length === 0 ? 'text-slate-300' : 'text-primary-500'}`}>
                                                    {identifier.length === 0 ? "Awaiting format" : isEmail ? "Email Verified" : "Mobile Verified"}
                                                </p>
                                            )}
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            {loginMethod === 'password' ? (
                                                <motion.div key="pass-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                    <Input 
                                                        label="Password"
                                                        name="password"
                                                        autoComplete="current-password"
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                                        placeholder="••••••••"
                                                        icon="lock"
                                                        success={isPasswordValid}
                                                        colors={colors}
                                                    />
                                                </motion.div>
                                            ) : (
                                                otpSent && (
                                                    <motion.div key="otp-box" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                        <Input 
                                                            label="6-Digit OTP"
                                                            name="loginOtp"
                                                            autoComplete="one-time-code"
                                                            value={loginOtp}
                                                            onChange={(e) => { setLoginOtp(e.target.value); setError(''); }}
                                                            placeholder="••••••"
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
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-500 text-[10px] font-black text-center py-2 bg-red-50/50 rounded-xl border border-red-100/50 uppercase tracking-widest"
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
                                                        className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
                                                    />
                                                    <label htmlFor="remember-me" className="ml-2 block text-[11px] font-bold text-slate-500 cursor-pointer select-none">
                                                        Remember me
                                                    </label>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => { setForgotMode(true); setError(''); }}
                                                    className="font-black text-primary-600 hover:text-primary-500 text-[11px] transition-colors uppercase tracking-tight"
                                                >
                                                    Forgot Password?
                                                </button>
                                            </div>
                                        )}

                                        <div className="pt-3">
                                            <Button 
                                                type="submit"
                                                disabled={loading || !isValidIdentifier || (loginMethod === 'password' && !isPasswordValid) || (loginMethod === 'otp' && otpSent && loginOtp.length !== 6)}
                                                fullWidth
                                                variant={(isValidIdentifier && (isPasswordValid || loginMethod === 'otp')) ? activeVariant : 'dark'}
                                                icon={loading ? "autorenew" : (
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                                className={`${loading ? 'opacity-80' : ''} !py-3.5 !text-[12px] font-black tracking-widest`}
                                            >
                                                {loading ? "AUTHENTICATING..." : loginMethod === 'password' ? "SECURE LOGIN" : (!otpSent ? "SEND LOGIN OTP" : "VERIFY & LOGIN")}
                                            </Button>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </Card>
                </AnimatePresence>

                <div className="mt-8 text-center space-y-1.5 shrink-0 z-10">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        Need an account?
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        {['Farmer', 'Vendor', 'Customer'].map((item, idx) => (
                            <React.Fragment key={item}>
                                <Link to={`/${item.toLowerCase()}-registration`} className={`text-[12px] font-black transition-colors ${idx === 0 ? 'text-primary-600' : idx === 1 ? 'text-accent-600' : 'text-info-600'}`}>
                                    {item}
                                </Link>
                                {idx < 2 && <span className="w-1 h-1 rounded-full bg-slate-200" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
