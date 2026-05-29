import React, { useState, useEffect } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import OtpInput from '../../components/ui/OtpInput';

const Step1Basic = ({ data, updateData, nextStep }) => {
  const [step, setStep] = useState(0); // 0: Phone, 1: OTP, 2: Name
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');

  // Handle countdown timer
  useEffect(() => {
    let interval;
    if (step === 1 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleGetOTP = (e) => {
    e.preventDefault();
    if (!data.phone || data.phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    // Simulate API call
    setError('');
    setStep(1);
    setTimer(30);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp === '1234') { // Mock verification
      setError('');
      setStep(2); // Move to Name input
    } else {
      setError('Invalid OTP. Please try 1234');
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (data.name) {
      nextStep();
    } else {
      setError('Please enter your full name');
    }
  };

  return (
    <div>
      {/* Dynamic Headings based on state */}
      <div className="mb-6">
        {step === 0 && (
          <>
            <h2 className="text-xl font-black text-slate-800 mb-1">Create Account</h2>
            <p className="text-[13px] font-medium text-slate-500">Enter your mobile number to get started.</p>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-xl font-black text-slate-800 mb-1">Verify OTP</h2>
            <p className="text-[13px] font-medium text-slate-500">We've sent a code to your number.</p>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-xl font-black text-slate-800 mb-1">Basic Details</h2>
            <p className="text-[13px] font-medium text-slate-500">Let's start with your identity.</p>
          </>
        )}
      </div>

      {/* State 0: Enter Mobile */}
      {step === 0 && (
        <form onSubmit={handleGetOTP}>
          <Input 
            label="Mobile Number" 
            id="phone" 
            name="phone"
            type="tel"
            placeholder="10-digit mobile number" 
            value={data.phone || ''}
            onChange={handleChange}
            error={error}
            maxLength={10}
            required
          />
          <div className="mt-8">
            <Button type="submit">Get OTP</Button>
          </div>
        </form>
      )}

      {/* State 1: Verify OTP */}
      {step === 1 && (
        <form onSubmit={handleVerifyOTP} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-8 p-3 px-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Sending OTP to</p>
              <p className="text-[15px] font-black text-slate-800 leading-none">+91 {data.phone}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setStep(0)} 
              className="text-[12px] font-bold text-primary-600 hover:text-primary-700 underline"
            >
              Change
            </button>
          </div>

          <div className="mb-8">
            <label className="block text-[14px] font-bold text-slate-800 mb-3 text-center">
              Enter 4-digit OTP
            </label>
            <OtpInput length={4} value={otp} onChange={setOtp} error={error} />
          </div>

          <div className="text-center mb-6">
            {timer > 0 ? (
              <p className="text-[12px] font-medium text-slate-500">
                Resend OTP in <span className="font-bold text-slate-800">00:{timer.toString().padStart(2, '0')}</span>
              </p>
            ) : (
              <button type="button" onClick={() => setTimer(30)} className="text-[13px] font-bold text-primary-600 hover:underline">
                Resend OTP Now
              </button>
            )}
          </div>

          <div className="mt-2">
            <Button type="submit" disabled={otp.length < 4}>Verify OTP</Button>
          </div>
        </form>
      )}

      {/* State 2: Enter Name */}
      {step === 2 && (
        <form onSubmit={handleNext} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00B464] flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">Verified Number</p>
              <p className="text-sm font-black text-slate-800">+91 {data.phone}</p>
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
            error={error}
            required
          />

          <div className="mt-8">
            <Button type="submit">Next Step</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Step1Basic;
