import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { validateLocationString, validateRequired } from '../../utils/validation';

const Step2Location = ({ data, updateData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errMsg = '';
    if (name === 'state') errMsg = validateRequired(value);
    if (name === 'district') errMsg = validateLocationString(value, 'District');
    if (name === 'village') errMsg = validateLocationString(value, 'Village');
    
    setErrors((prev) => ({ ...prev, [name]: errMsg }));
    return errMsg === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
    validateField(name, value);
  };

  const handleNext = (e) => {
    e.preventDefault();
    const isStateValid = validateField('state', data.state || '');
    const isDistrictValid = validateField('district', data.district || '');
    const isVillageValid = validateField('village', data.village || '');

    if (isStateValid && isDistrictValid && isVillageValid) {
      nextStep();
    }
  };

  // Mock data for states (would come from API normally)
  const stateOptions = [
    { value: 'up', label: 'Uttar Pradesh' },
    { value: 'mp', label: 'Madhya Pradesh' },
    { value: 'mh', label: 'Maharashtra' },
    { value: 'pb', label: 'Punjab' },
  ];

  return (
    <form onSubmit={handleNext}>
      <h2 className="text-xl font-black text-slate-800 mb-1">Location Details</h2>
      <p className="text-[13px] font-medium text-slate-500 mb-6">Where is your farm located?</p>

      <Select 
        label="State / Rajya" 
        id="state" 
        name="state"
        options={stateOptions}
        value={data.state || ''}
        onChange={handleChange}
        error={errors.state}
        required
      />

      <Input 
        label="District / Zila" 
        id="district" 
        name="district"
        type="text"
        placeholder="Enter your district" 
        value={data.district || ''}
        onChange={handleChange}
        error={errors.district}
        required
      />

      <Input 
        label="Village / Gaon" 
        id="village" 
        name="village"
        type="text"
        placeholder="Enter your village name" 
        value={data.village || ''}
        onChange={handleChange}
        error={errors.village}
        required
      />

      <div className="flex gap-4 mt-8">
        <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>
        <Button type="submit">Next Step</Button>
      </div>
    </form>
  );
};

export default Step2Location;
