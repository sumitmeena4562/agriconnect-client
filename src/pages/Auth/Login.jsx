import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Logo from '../../components/common/Logo';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = 'Email or Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setGlobalError('');
  };

  const handleSuccessfulLogin = (data) => {
    const { token, user } = data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'FARMER') navigate('/farmer-dashboard');
    else if (user.role === 'VENDOR') navigate('/vendor-dashboard');
    else if (user.role === 'CUSTOMER') navigate('/customer-dashboard');
    else navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, formData);
      if (response.data.success) {
        handleSuccessfulLogin(response.data);
      }
    } catch (error) {
      setGlobalError(error.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post(`${backendUrl}/api/auth/google-login`, {
        email: user.email,
        googleId: user.uid
      });

      if (response.data.success) {
        handleSuccessfulLogin(response.data);
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        setGlobalError(error.response?.data?.error || 'Google login failed. Are you registered?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background aesthetics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-green-400/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] global-card relative z-10"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-5">
            <Logo size="lg" />
          </div>
          <h1 className="text-[22px] font-black text-slate-800 mb-1 leading-tight">Welcome Back</h1>
          <p className="text-[13px] font-medium text-slate-500">Sign in to your account</p>
        </div>

        {globalError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3 bg-red-50 border border-red-100 rounded-[var(--form-border-radius)] flex items-center gap-2 text-red-600"
          >
            <span className="material-symbols-outlined text-[18px]">error</span>
            <p className="text-[12px] font-bold">{globalError}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mb-2">
          <Input 
            label="Email or Phone Number"
            id="identifier"
            name="identifier"
            placeholder="e.g. 9876543210"
            value={formData.identifier}
            onChange={handleChange}
            error={errors.identifier}
          />
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="form-label !mb-0">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] font-bold text-primary-600 hover:text-primary-700">
                Forgot Password?
              </Link>
            </div>
            <Input 
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              wrapperClassName="!mb-0"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="mt-1">
            Sign In
          </Button>
        </form>

        <div className="my-5 flex items-center gap-4">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          disabled={isLoading}
          className="btn-secondary w-full gap-2"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-[18px] h-[18px]" />
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-[12px] font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/farmer-registration" className="text-primary-600 font-bold hover:underline">
              Join us
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
