import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OtpInput from '../../components/ui/OtpInput';
import Logo from '../../components/common/Logo';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form States
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState(''); // Stores the email received from backend after step 1
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!identifier) {
      setGlobalError('Please enter your Email or Phone Number');
      return;
    }
    setGlobalError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/auth/forgot-password', { identifier });
      if (response.data.success) {
        setEmail(response.data.email);
        setStep(2);
        setTimer(60);
      }
    } catch (error) {
      setGlobalError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setGlobalError('Please enter a valid 6-digit OTP');
      return;
    }
    setGlobalError('');
    // We don't verify OTP in a separate API call here to save requests. 
    // We verify it directly in the reset-password API.
    // So we just move to Step 3.
    setStep(3);
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setGlobalError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setGlobalError('Passwords do not match');
      return;
    }

    setGlobalError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      if (response.data.success) {
        setSuccessMsg('Password reset successfully! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setGlobalError(error.response?.data?.error || 'Failed to reset password. OTP might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setGlobalError('');
    setIsLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { identifier });
      setTimer(60);
      setSuccessMsg('OTP resent successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setGlobalError(error.response?.data?.error || 'Failed to resend OTP.');
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
          
          {step === 1 && (
            <>
              <h1 className="text-[22px] font-black text-slate-800 mb-1 leading-tight">Reset Password</h1>
              <p className="text-[13px] font-medium text-slate-500">Enter your registered email or phone</p>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-[22px] font-black text-slate-800 mb-1 leading-tight">Check Email</h1>
              <p className="text-[13px] font-medium text-slate-500">We've sent an OTP to {email}</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-[22px] font-black text-slate-800 mb-1 leading-tight">New Password</h1>
              <p className="text-[13px] font-medium text-slate-500">Create a secure new password</p>
            </>
          )}
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

        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3 bg-green-50 border border-green-100 rounded-[var(--form-border-radius)] flex items-center gap-2 text-green-700"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <p className="text-[12px] font-bold">{successMsg}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form 
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleStep1} 
              className="mb-2"
            >
              <Input 
                label="Email or Phone Number"
                id="identifier"
                name="identifier"
                placeholder="e.g. 9876543210"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setGlobalError('');
                }}
              />
              <Button type="submit" isLoading={isLoading} className="mt-4">
                Send OTP
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form 
              key="step2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleStep2} 
              className="mb-2"
            >
              <div className="mb-6">
                <label className="block text-[13px] font-bold text-slate-800 mb-3 text-center">
                  Enter 6-digit OTP
                </label>
                <OtpInput 
                  length={6} 
                  value={otp} 
                  onChange={(val) => {
                    setOtp(val);
                    setGlobalError('');
                  }} 
                />
              </div>

              <div className="text-center mb-6 h-5">
                {timer > 0 ? (
                  <p className="text-[12px] font-medium text-slate-500">
                    Resend OTP in <span className="font-bold text-slate-800">00:{timer.toString().padStart(2, '0')}</span>
                  </p>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleResend} 
                    disabled={isLoading}
                    className={`text-[12px] font-bold ${isLoading ? 'text-slate-400 cursor-not-allowed' : 'text-primary-600 hover:underline'}`}
                  >
                    {isLoading ? "Sending..." : "Resend OTP Now"}
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Verify & Next
                </Button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.form 
              key="step3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleStep3} 
              className="mb-2"
            >
              <Input 
                label="New Password"
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setGlobalError('');
                }}
              />
              
              <Input 
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setGlobalError('');
                }}
              />

              <div className="flex gap-3 mt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/3">
                  Back
                </Button>
                <Button type="submit" isLoading={isLoading} className="flex-1">
                  Reset Password
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center border-t border-gray-100 pt-5">
          <Link to="/login" className="text-[12px] font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
