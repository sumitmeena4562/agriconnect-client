import React from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const Step3Farm = ({ data, updateData, submitForm, prevStep }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitForm();
  };

  const irrigationOptions = [
    { value: 'rainfed', label: 'Rainfed (Barish)' },
    { value: 'borewell', label: 'Borewell/Tubewell' },
    { value: 'canal', label: 'Canal (Nehar)' },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-black text-slate-800 mb-1">Farm Details</h2>
      <p className="text-[13px] font-medium text-slate-500 mb-6">Tell us about your agriculture.</p>

      <div className="flex gap-4">
        <Input 
          label="Land Size" 
          id="landSize" 
          name="landSize"
          type="number"
          placeholder="e.g. 5" 
          value={data.landSize || ''}
          onChange={handleChange}
          wrapperClassName="flex-1"
          required
        />
        <Select 
          label="Unit" 
          id="landUnit" 
          name="landUnit"
          options={[
            { value: 'acres', label: 'Acres' },
            { value: 'hectares', label: 'Hectares' },
            { value: 'bigha', label: 'Bigha' }
          ]}
          value={data.landUnit || 'acres'}
          onChange={handleChange}
          wrapperClassName="w-1/3"
        />
      </div>

      <Input 
        label="Primary Crops" 
        id="crops" 
        name="crops"
        type="text"
        placeholder="e.g. Wheat, Sugarcane" 
        value={data.crops || ''}
        onChange={handleChange}
        required
      />

      <Select 
        label="Irrigation Source" 
        id="irrigation" 
        name="irrigation"
        options={irrigationOptions}
        value={data.irrigation || ''}
        onChange={handleChange}
        required
      />

      <div className="flex gap-4 mt-8">
        <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>
        <Button type="submit">Complete Registration</Button>
      </div>
    </form>
  );
};

export default Step3Farm;
