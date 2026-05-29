import React, { useState } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const Step3Farm = ({ data, updateData, submitForm, prevStep }) => {
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    let errMsg = '';
    
    if (!value || (typeof value === 'string' && !value.trim())) {
      errMsg = 'This field is required';
    } else if (name === 'landSize') {
      if (isNaN(value)) errMsg = 'Must be a valid number';
      else if (parseFloat(value) <= 0) errMsg = 'Must be greater than 0';
      else if (parseFloat(value) > 1000) errMsg = 'Value seems suspiciously high';
    } else if (name === 'crops' && value.trim().length < 3) {
      errMsg = 'Please list at least one valid crop';
    }

    setErrors((prev) => ({ ...prev, [name]: errMsg }));
    return errMsg === '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent typing negative numbers in landSize
    if (name === 'landSize' && value && parseFloat(value) < 0) return;
    
    updateData({ [name]: value });
    validateField(name, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isLandSizeValid = validateField('landSize', data.landSize || '');
    const isLandUnitValid = validateField('landUnit', data.landUnit || 'acres');
    const isCropsValid = validateField('crops', data.crops || '');
    const isIrrigationValid = validateField('irrigation', data.irrigation || '');

    if (isLandSizeValid && isLandUnitValid && isCropsValid && isIrrigationValid) {
      submitForm();
    }
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

      <div className="flex gap-4 items-start">
        <Input 
          label="Land Size" 
          id="landSize" 
          name="landSize"
          type="number"
          placeholder="e.g. 5" 
          value={data.landSize || ''}
          onChange={handleChange}
          error={errors.landSize}
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
          error={errors.landUnit}
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
        error={errors.crops}
        required
      />

      <Select 
        label="Irrigation Source" 
        id="irrigation" 
        name="irrigation"
        options={irrigationOptions}
        value={data.irrigation || ''}
        onChange={handleChange}
        error={errors.irrigation}
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
