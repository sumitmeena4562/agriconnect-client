import React, { useState } from 'react';
import toast from 'react-hot-toast';
import ProgressBar from '../../components/ui/ProgressBar';
import Step1Basic from './Step1Basic';
import Step2Location from './Step2Location';
import Step3Farm from './Step3Farm';
import axios from 'axios';

const FarmerRegistration = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    name: '',
    authProvider: 'LOCAL',
    googleId: '',
    state: '',
    district: '',
    village: '',
    landSize: '',
    landUnit: 'acres',
    crops: '',
    irrigation: ''
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
    const toastId = toast.loading('Registering account...');
    try {
      const response = await axios.post('/api/farmers/register', formData);
      toast.success("Welcome " + response.data.data.user.name + "!", { id: toastId });
      // Optionally reset form or redirect here
      setStep(1);
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
          <p className="text-sm font-medium text-slate-500 mt-1">Join the farmer network</p>
        </div>

        <div className="global-card">
          <ProgressBar currentStep={step} totalSteps={totalSteps} />

          <div className="mt-5">
            {step >= 1 && step <= 3 && (
              <Step1Basic data={formData} updateData={updateData} currentStep={step} nextStep={nextStep} prevStep={prevStep} setStep={setStep} />
            )}
            {step === 4 && (
              <Step2Location data={formData} updateData={updateData} nextStep={nextStep} prevStep={prevStep} />
            )}
            {step === 5 && (
              <Step3Farm data={formData} updateData={updateData} submitForm={submitForm} prevStep={prevStep} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerRegistration;
