import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

const dict = {
  en: {
    welcome: 'Welcome Back',
    subtitle: 'Sign in to your account',
    emailPhone: 'Email or Phone Number',
    password: 'Password',
    forgot: 'Forgot Password?',
    signIn: 'Sign In',
    or: 'Or',
    google: 'Continue with Google',
    noAccount: "Don't have an account?",
    joinUs: 'Join us',
    capsLock: 'Caps Lock ON',
    whatsapp: 'Support',
    rememberMe: 'Remember Me',
    otpMode: 'OTP Login',
    pwdMode: 'Password',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify & Login',
    otpLabel: 'Enter 6-digit OTP',
    reqEmail: 'Email/Phone required',
    reqPwd: 'Password required',
    reqOtp: 'OTP required',
    networkErr: 'No internet connection.',
    credErr: 'Incorrect credentials.',
    techErr: 'Technical error occurred.'
  },
  hi: {
    welcome: 'वापसी पर स्वागत है',
    subtitle: 'खाते में प्रवेश करें',
    emailPhone: 'ईमेल या मोबाइल',
    password: 'पासवर्ड',
    forgot: 'पासवर्ड भूल गए?',
    signIn: 'लॉग इन करें',
    or: 'या',
    google: 'Google के साथ',
    noAccount: "खाता नहीं है?",
    joinUs: 'अभी जुड़ें',
    capsLock: 'Caps Lock चालू है',
    whatsapp: 'मदद',
    rememberMe: 'मुझे याद रखें',
    otpMode: 'OTP से लॉगिन',
    pwdMode: 'पासवर्ड',
    sendOtp: 'OTP भेजें',
    verifyOtp: 'Verify करें',
    otpLabel: '6 अंकों का OTP डालें',
    reqEmail: 'ईमेल/फोन जरूरी है',
    reqPwd: 'पासवर्ड जरूरी है',
    reqOtp: 'OTP जरूरी है',
    networkErr: 'इंटरनेट नहीं है।',
    credErr: 'गलत ईमेल/पासवर्ड।',
    techErr: 'तकनीकी खराबी आई है।'
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const t = dict[lang];

  const [loginMode, setLoginMode] = useState('PASSWORD');
  const [formData, setFormData] = useState({ identifier: '', password: '', otp: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  
  const [rememberMe, setRememberMe] = useState(true);
  const [isCapsOn, setIsCapsOn] = useState(false);
  
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = t.reqEmail;
    if (loginMode === 'PASSWORD') {
      if (!formData.password) newErrors.password = t.reqPwd;
    } else {
      if (otpSent && !formData.otp) newErrors.otp = t.reqOtp;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const handleKeyUp = (e) => {
    setIsCapsOn(e.getModifierState && e.getModifierState('CapsLock'));
  };

  const handleSuccessfulLogin = (data) => {
    const { token, user } = data;
    if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
    }
    toast.success(`${t.welcome}, ${user.name}! 🌾`);
    if (user.role === 'FARMER') navigate('/farmer-dashboard');
    else if (user.role === 'VENDOR') navigate('/vendor-dashboard');
    else if (user.role === 'CUSTOMER') navigate('/customer-dashboard');
    else navigate('/');
  };

  const handlePasswordLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { identifier: formData.identifier, password: formData.password });
      if (response.data.success) handleSuccessfulLogin(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/login-otp/send', { identifier: formData.identifier });
      setOtpSent(true);
      setTimer(60);
      toast.success('OTP sent!');
      setGlobalError('');
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/auth/login-otp/verify', { identifier: formData.identifier, otp: formData.otp });
      if (response.data.success) handleSuccessfulLogin(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (loginMode === 'PASSWORD') handlePasswordLogin();
    else {
        if (!otpSent) handleSendOtp();
        else handleVerifyOtp();
    }
  };

  const handleError = (error) => {
    if (!error.response) setGlobalError(t.networkErr);
    else if (error.response.status === 401 || error.response.status === 404) setGlobalError(error.response.data?.error || t.credErr);
    else setGlobalError(error.response.data?.error || t.techErr);
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const response = await axios.post('/api/auth/google-login', { email: result.user.email, googleId: result.user.uid });
      if (response.data.success) handleSuccessfulLogin(response.data);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') setGlobalError(error.response?.data?.error || 'Google login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-400/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating Language Switcher outside card */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex bg-white rounded-full p-1 border border-slate-200 shadow-sm z-20">
          <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${lang === 'en' ? 'bg-[#00B464] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>EN</button>
          <button onClick={() => setLang('hi')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${lang === 'hi' ? 'bg-[#00B464] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>HI</button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] global-card relative z-10 !p-5 sm:!p-6"
      >
        <div className="text-center mb-4">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <h1 className="text-[22px] font-black text-slate-800 mb-1 leading-tight">{t.welcome}</h1>
          <p className="text-[13px] font-medium text-slate-500">{t.subtitle}</p>
        </div>

        {/* Login Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-4 shadow-inner">
            <button onClick={() => { setLoginMode('PASSWORD'); setGlobalError(''); }} className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all ${loginMode === 'PASSWORD' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>{t.pwdMode}</button>
            <button onClick={() => { setLoginMode('OTP'); setGlobalError(''); }} className={`flex-1 py-1.5 text-[12px] font-bold rounded-md transition-all ${loginMode === 'OTP' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>{t.otpMode}</button>
        </div>

        {globalError && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-2.5 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 text-red-600">
            <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">error</span>
            <p className="text-[12px] font-bold">{globalError}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input 
            label={t.emailPhone} id="identifier" name="identifier" placeholder="e.g. 9876543210"
            value={formData.identifier} onChange={handleChange} error={errors.identifier} disabled={loginMode === 'OTP' && otpSent}
            wrapperClassName="!mb-0" className="!h-[40px] !text-[13px]" labelClassName="!text-[12px] !mb-1.5"
          />
          
          <AnimatePresence mode="wait">
            {loginMode === 'PASSWORD' ? (
                <motion.div key="password" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                    <div className="flex items-center justify-between mb-1">
                        <label className="form-label !mb-0 !text-[12px]">{t.password}</label>
                        {isCapsOn && <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">warning</span>{t.capsLock}</span>}
                    </div>
                    <Input 
                        id="password" name="password" type="password" placeholder="••••••••"
                        value={formData.password} onChange={handleChange} onKeyUp={handleKeyUp} error={errors.password}
                        wrapperClassName="!mb-0" className="!h-[40px] !text-[13px]"
                    />
                </motion.div>
            ) : (
                <motion.div key="otp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    {otpSent && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="form-label !mb-0 !text-[12px]">{t.otpLabel}</label>
                                {timer > 0 ? <span className="text-[12px] font-bold text-slate-400">{timer}s</span> : <button type="button" onClick={handleSendOtp} className="text-[12px] font-bold text-primary-600 hover:underline">Resend</button>}
                            </div>
                            <Input id="otp" name="otp" type="text" maxLength={6} placeholder="123456" value={formData.otp} onChange={handleChange} error={errors.otp} className="tracking-[0.75em] font-mono text-center !h-[40px] text-[16px]" wrapperClassName="!mb-0" />
                        </div>
                    )}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Action Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mt-0.5">
            <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-[14px] h-[14px]">
                    <input 
                        type="checkbox" id="remember" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} 
                        className="absolute w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className={`w-full h-full rounded-[3px] border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#00B464] border-[#00B464]' : 'bg-white border-slate-300'}`}>
                        {rememberMe && (
                            <svg className="w-[10px] h-[10px] text-white" viewBox="0 0 14 14" fill="none">
                                <path d="M3 7.5L6 10.5L11 3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </div>
                </div>
                <label htmlFor="remember" className="text-[12px] font-semibold text-slate-600 cursor-pointer select-none leading-none pt-0.5">{t.rememberMe}</label>
            </div>
            {loginMode === 'PASSWORD' && (
                <Link to="/forgot-password" className="text-[12px] font-bold text-primary-600 hover:text-primary-700 leading-none pt-0.5">{t.forgot}</Link>
            )}
          </div>

          <Button type="submit" isLoading={isLoading} className="!h-[42px] !text-[14px] mt-1">
            {loginMode === 'PASSWORD' ? t.signIn : (otpSent ? t.verifyOtp : t.sendOtp)}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.or}</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <button type="button" onClick={loginWithGoogle} disabled={isLoading} className="btn-secondary w-full gap-2 !h-[42px] !text-[13px] border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[16px] h-[16px]" />
          {t.google}
        </button>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-[12px] font-medium text-slate-500">
            {t.noAccount} <Link to="/farmer-registration" className="text-primary-600 font-bold hover:underline ml-1">{t.joinUs}</Link>
          </p>
          <a href="https://wa.me/91000000000" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-full hover:bg-[#25D366]/20 transition-colors whitespace-nowrap">
            <span className="material-symbols-outlined text-[14px]">chat</span>
            {t.whatsapp}
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
