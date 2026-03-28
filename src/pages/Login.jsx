import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import Logo from '../components/common/Logo';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { loginUser as apiLoginUser } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [identifier, setIdentifier] = useState(''); // Mobile or Email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const isEmail = identifier.includes('@');
    const isValidIdentifier = identifier.length > 0 && (isEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) : /^[6-9]\d{9}$/.test(identifier));
    const isPasswordValid = password.length >= 6; // Relaxed for login

    // Using primary colors to match the default theme
    const colors = { text: 'text-primary-600', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isValidIdentifier) {
            toast.error("Please enter a valid Mobile Number or Email ID");
            return;
        }

        if (!isPasswordValid) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            const response = await apiLoginUser({ identifier, password });
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success(`Welcome back, ${response.data.user.name.split(' ')[0]}!`);
                
                // Redirection Logic (Role-Based)
                setTimeout(() => {
                    const role = response.data.user.role;
                    if (role === 'admin') navigate('/admin/dashboard');
                    else if (role === 'farmer') navigate('/farmer/dashboard');
                    else if (role === 'vendor') navigate('/vendor/dashboard');
                    else navigate('/customer/dashboard');
                }, 1000);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-slate-50 flex flex-col font-sans antialiased overflow-hidden">
            {/* Unified Navigation Bar matching Registration - More Compact */}
            <nav className="w-full bg-white border-b border-slate-200 py-3 px-6 sm:px-12 flex justify-between items-center z-50 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Logo size="sm" />
                    <div className="h-4 w-[1px] bg-slate-100 mx-1 hidden sm:block" />
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-tight">Secure Login</span>
                        <Badge variant="slate" size="xs" animate={false}>Z+ Protected</Badge>
                    </div>
                </div>
                
                <div className="flex bg-slate-100 p-0.5 rounded-full border border-slate-200">
                    <Link to="/farmer-registration" className="px-3 py-1 rounded-full text-[9px] font-black transition-all text-slate-500 hover:text-primary-600 uppercase tracking-tighter">
                        Register
                    </Link>
                </div>
            </nav>
            
            <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
                <Card 
                    className="w-full transition-all duration-500 !rounded-[24px] border-none shadow-2xl shadow-slate-200/60 max-w-[380px] overflow-hidden" 
                    padding="p-0" 
                    animate={false}
                >
                    {/* Top Accent Line */}
                    <div className={`flex w-full ${colors.bg} h-1.5`} />

                    <div className="px-6 py-7 sm:px-8 sm:py-9 text-left">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back.</h2>
                            <p className="text-slate-500 text-xs mt-1">Access your AgriConnect dashboard.</p>
                        </div>
                        
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <Input 
                                    label="Mobile or Email"
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
                                />
                                <p className={`mt-1 text-[9px] font-black uppercase tracking-widest text-right ${identifier.length === 0 ? 'text-slate-300' : 'text-primary-500'}`}>
                                    {identifier.length === 0 ? "Awaiting format" : isEmail ? "Email Verified" : "Mobile Verified"}
                                </p>
                            </div>

                            <div>
                                <Input 
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="••••••••"
                                    icon="lock"
                                    success={isPasswordValid}
                                    colors={colors}
                                />
                            </div>

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

                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        type="checkbox"
                                        className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-600 cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-[11px] font-bold text-slate-500 cursor-pointer select-none">
                                        Remember me
                                    </label>
                                </div>
                                <a href="#" className="font-black text-primary-600 hover:text-primary-500 text-[11px] transition-colors uppercase tracking-tight">
                                    Forgot Password?
                                </a>
                            </div>

                            <div className="pt-3">
                                <Button 
                                    type="submit"
                                    disabled={loading || !isValidIdentifier || !isPasswordValid}
                                    fullWidth
                                    variant={(isValidIdentifier && isPasswordValid) ? 'primary' : 'dark'}
                                    icon={loading ? "autorenew" : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                    className={`${loading ? 'opacity-80' : ''} !py-3.5 !text-[12px] font-black tracking-widest`}
                                >
                                    {loading ? "AUTHENTICATING..." : "SECURE LOGIN"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Footer Links - More Compact to fit viewport */}
                <div className="mt-6 text-center space-y-1.5 shrink-0">
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
