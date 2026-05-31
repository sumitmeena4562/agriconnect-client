import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const VendorStep3Logistics = ({ data, updateData, submitForm, prevStep }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!data.state || data.state.trim().length < 2) newErrors.state = "State is required";
    if (!data.city || data.city.trim().length < 2) newErrors.city = "City is required";
    if (!data.godownAddress || data.godownAddress.trim().length < 5) newErrors.godownAddress = "Please enter a complete address";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      submitForm();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800 mb-1">Logistics & Location</h2>
        <p className="text-[13px] font-medium text-slate-500">Where should farmers deliver the crops?</p>
      </div>

      <div className="space-y-4">
        <Input 
          label="State" 
          id="state" 
          name="state"
          type="text"
          placeholder="e.g. Maharashtra" 
          value={data.state || ''}
          onChange={handleChange}
          error={errors.state}
          required
        />

        <Input 
          label="City / District" 
          id="city" 
          name="city"
          type="text"
          placeholder="e.g. Nashik" 
          value={data.city || ''}
          onChange={handleChange}
          error={errors.city}
          required
        />

        <div className="space-y-1">
          <label htmlFor="godownAddress" className="block text-[13px] font-bold text-slate-700">
            Godown / Delivery Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="godownAddress"
            name="godownAddress"
            value={data.godownAddress || ''}
            onChange={handleChange}
            placeholder="Complete address of your shop or godown for delivery"
            className={`w-full px-4 py-3 bg-white border ${errors.godownAddress ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-200'} rounded-[var(--form-border-radius)] text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all duration-200`}
            rows="3"
            required
          />
          {errors.godownAddress && (
            <p className="text-[11px] font-bold text-red-500 mt-1">{errors.godownAddress}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
        <Button type="submit">Complete Registration</Button>
      </div>
    </form>
  );
};

export default VendorStep3Logistics;
