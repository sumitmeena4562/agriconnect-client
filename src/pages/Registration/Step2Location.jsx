import React from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const Step2Location = ({ data, updateData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
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
