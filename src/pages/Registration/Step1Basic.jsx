import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OtpInput from '../../components/ui/OtpInput';
import axios from 'axios';
import { auth } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Step1Basic = ({ data, updateData, currentStep, nextStep, prevStep, setStep }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);

  // Handle countdown timer
  useEffect(() => {
    let interval;
    if (currentStep === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, timer]);

  const validateField = (name, value) => {
    let errMsg = '';
    if (name === 'email') {
      if (!value) errMsg = 'Email address is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errMsg = 'Enter a valid email address';
    }
    if (name === 'phone') {
      if (!value) errMsg = 'Mobile number is required';
      else if (!/^[0-9]{7,15}$/.test(value)) errMsg = 'Enter a valid mobile number';
    }
    if (name === 'name') {
      if (!value.trim()) errMsg = 'Full name is required';
      else if (value.trim().length < 3) errMsg = 'Name must be at least 3 characters';
      else if (!/^[a-zA-Z\s]+$/.test(value)) errMsg = 'Name can only contain alphabets';
    }
    if (name === 'password') {
      if (!value) errMsg = 'Password is required';
      else if (value.length < 6) errMsg = 'Password must be at least 6 characters long';
    }
    setErrors((prev) => ({ ...prev, [name]: errMsg }));
    return errMsg === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent typing non-numbers in phone field
    if (name === 'phone' && value && !/^[0-9]*$/.test(value)) return;
    
    updateData({ [name]: value });
    validateField(name, value);
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      updateData({
        name: user.displayName || '',
        email: user.email || '',
        authProvider: 'GOOGLE',
        googleId: user.uid
      });
      
      toast.success(`Google Account Linked: ${user.email}`);
      setStep(3); // Go directly to Step 3 to collect Phone Number
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      toast.error("Google Sign-In failed. Please try again.");
    }
  };

  const handleGetOTP = async (e) => {
    e.preventDefault();
    if (validateField('email', data.email)) {
      setIsSending(true);
      try {
        await axios.post('/api/auth/send-otp', { email: data.email });
        setStep(2);
        setTimer(60);
        toast.success("OTP sent to your email!");
      } catch (error) {
        console.error("Error sending OTP:", error);
        const errMsg = error.response?.data?.error || "Failed to send OTP. Check server.";
        setErrors((prev) => ({ ...prev, email: errMsg }));
        toast.error(errMsg);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length === 6) { 
      try {
        await axios.post('/api/auth/verify-otp', { email: data.email, otp });
        setErrors((prev) => ({ ...prev, otp: '' }));
        
        // OTP verified successfully, proceed to collect Name and Phone
        setStep(3);
      } catch (error) {
        setErrors((prev) => ({ ...prev, otp: error.response?.data?.error || 'Invalid OTP. Please try again.' }));
      }
    } else {
      setErrors((prev) => ({ ...prev, otp: 'Enter a valid 6-digit OTP' }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    const isNameValid = validateField('name', data.name);
    const isPasswordValid = data.authProvider === 'GOOGLE' ? true : validateField('password', data.password);
    const isPhoneValid = validateField('phone', data.phone || '');
    
    if (isNameValid && isPasswordValid && isPhoneValid) {
      nextStep();
    }
  };

  return (
    <div>
      {/* Dynamic Headings based on state */}
      <div className="mb-6">
        {currentStep === 1 && (
          <>
            <h2 className="text-xl font-black text-slate-800 mb-1">Create Account</h2>
            <p className="text-[13px] font-medium text-slate-500">Enter your Email Address to get started.</p>
          </>
        )}
        {currentStep === 2 && (
          <>
            <h2 className="text-xl font-black text-slate-800 mb-1">Verify OTP</h2>
            <p className="text-[13px] font-medium text-slate-500">We've sent a code to your email.</p>
          </>
        )}
        {currentStep === 3 && (
          <>
            <h2 className="text-xl font-black text-slate-800 mb-1">Basic Details</h2>
            <p className="text-[13px] font-medium text-slate-500">Let's start with your identity.</p>
          </>
        )}
      </div>

      {/* State 1: Enter Email */}
      {currentStep === 1 && (
        <form onSubmit={handleGetOTP} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {data.authProvider === 'GOOGLE' && (
            <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-3">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              <div className="flex-1">
                <p className="text-[12px] font-bold text-slate-800">Linked: {data.email}</p>
                <p className="text-[11px] text-slate-500">Please verify your email to finish.</p>
              </div>
            </div>
          )}

          <Input 
            label="Email Address" 
            id="email" 
            name="email"
            type="email"
            placeholder="e.g. farmer@example.com" 
            value={data.email || ''}
            onChange={handleChange}
            error={errors.email}
            required
          />
          
          <div className="mt-8 space-y-3">
            <Button type="submit" disabled={isSending}>
              {isSending ? "Sending OTP..." : "Get OTP"}
            </Button>
            
            {data.authProvider !== 'GOOGLE' && (
              <>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold uppercase tracking-wider">or</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>
                
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-[var(--form-border-radius)] hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </button>
              </>
            )}
          </div>
        </form>
      )}

      {/* State 2: Verify OTP */}
      {currentStep === 2 && (
        <form onSubmit={handleVerifyOTP} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-8 p-3 px-4 rounded-[var(--form-border-radius)] bg-green-50 border border-green-100 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Sending OTP to</p>
              <p className="text-[15px] font-black text-slate-800 leading-none truncate max-w-[200px]">{data.email}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="text-[12px] font-bold text-primary-600 hover:text-primary-700 underline"
            >
              Change
            </button>
          </div>

          <div className="mb-8">
            <label className="block text-[14px] font-bold text-slate-800 mb-3 text-center">
              Enter 6-digit OTP
            </label>
            <OtpInput 
              length={6} 
              value={otp} 
              onChange={(val) => {
                setOtp(val);
                if (errors.otp) setErrors((prev) => ({ ...prev, otp: '' }));
              }} 
              error={errors.otp} 
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
                onClick={handleGetOTP} 
                disabled={isSending}
                className={`text-[13px] font-bold ${isSending ? 'text-slate-400 cursor-not-allowed' : 'text-primary-600 hover:underline'}`}
              >
                {isSending ? "Sending OTP..." : "Resend OTP Now"}
              </button>
            )}
          </div>

          <div className="mt-2 flex gap-3">
            <Button type="button" variant="outline" onClick={() => prevStep()}>Back</Button>
            <Button type="submit" disabled={otp.length < 6}>Verify OTP</Button>
          </div>
        </form>
      )}

      {/* State 3: Enter Name and Phone */}
      {currentStep === 3 && (
        <form onSubmit={handleNext} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6 p-4 rounded-[var(--form-border-radius)] bg-green-50 border border-green-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00B464] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Verified Email</p>
              <p className="text-sm font-black text-slate-800 truncate">{data.email}</p>
            </div>
          </div>

          <Input 
            label="Full Name" 
            id="name" 
            name="name"
            type="text"
            placeholder="e.g. Ramesh Kumar" 
            value={data.name || ''}
            onChange={handleChange}
            error={errors.name}
            required
          />

          <Input 
            label="Mobile Number" 
            id="phone" 
            name="phone"
            type="tel"
            placeholder="e.g. 9876543210" 
            value={data.phone || ''}
            onChange={handleChange}
            error={errors.phone}
            required
          />

          {data.authProvider !== 'GOOGLE' && (
            <Input 
              label="Create Password" 
              id="password" 
              name="password"
              type="password"
              placeholder="Secure password (min 6 chars)" 
              value={data.password || ''}
              onChange={handleChange}
              error={errors.password}
              required
            />
          )}

          <div className="mt-8 flex gap-3">
            <Button type="button" variant="outline" onClick={() => prevStep()}>Back</Button>
            <Button type="submit">Next Step</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Step1Basic;
