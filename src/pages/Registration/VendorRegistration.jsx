import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProgressBar from '../../components/ui/ProgressBar';
import Step1Basic from './Step1Basic';
import VendorStep2Business from './VendorStep2Business';
import VendorStep3Logistics from './VendorStep3Logistics';
import axios from 'axios';

const VendorRegistration = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5; // Reusing progress bar logic, Step1 covers steps 1-3. Total visual steps = 5
  const navigate = useNavigate();

  // Apply Vendor Theme dynamically
  useEffect(() => {
    document.body.classList.add('theme-vendor');
    return () => {
      document.body.classList.remove('theme-vendor');
    };
  }, []);

  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    authProvider: 'LOCAL',
    googleId: '',
    
    // Vendor specific
    businessName: '',
    gstNumber: '',
    interestedCategories: [],
    godownAddress: '',
    city: '',
    state: ''
  });

  const updateData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitForm = async () => {
    const toastId = toast.loading('Creating Vendor Account...');
    try {
      const response = await axios.post('/api/auth/register-vendor', formData);
      const { token, user } = response.data.data;
      
      // Save auth data to localStorage
      localStorage.setItem('agriconnect_token', token);
      localStorage.setItem('agriconnect_user', JSON.stringify(user));

      toast.success("Welcome " + user.name + "!", { id: toastId });
      
      // Redirect to Vendor Dashboard / Marketplace
      navigate('/vendor-dashboard');
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(error.response?.data?.error || "Server error during registration", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-12 sm:justify-center sm:pt-4 p-4 bg-[var(--color-bg-body)]">
      <div className="w-full max-w-[400px] mt-4 sm:mt-0">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-black text-primary-800">AgriConnect</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Vendor Procurement Portal</p>
        </div>

        <div className="global-card">
          <ProgressBar currentStep={step} totalSteps={totalSteps} />

          <div className="mt-5">
            {step >= 1 && step <= 3 && (
              <Step1Basic 
                data={formData} 
                updateData={updateData} 
                currentStep={step} 
                nextStep={nextStep} 
                prevStep={prevStep} 
                setStep={setStep} 
              />
            )}
            {step === 4 && (
              <VendorStep2Business 
                data={formData} 
                updateData={updateData} 
                nextStep={nextStep} 
                prevStep={prevStep} 
              />
            )}
            {step === 5 && (
              <VendorStep3Logistics 
                data={formData} 
                updateData={updateData} 
                submitForm={submitForm} 
                prevStep={prevStep} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistration;
