import React from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Step1Basic = ({ data, updateData, nextStep }) => {
  const handleChange = (e) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    // Here we can add simple validation later
    if(data.phone && data.name) {
      nextStep();
    } else {
      alert("Please fill both Phone and Name");
    }
  };

  return (
    <form onSubmit={handleNext}>
      <h2 className="text-xl font-black text-slate-800 mb-1">Basic Details</h2>
      <p className="text-[13px] font-medium text-slate-500 mb-6">Let's start with your identity.</p>

      <Input 
        label="Mobile Number" 
        id="phone" 
        name="phone"
        type="tel"
        placeholder="+91 XXXXXXXXXX" 
        value={data.phone || ''}
        onChange={handleChange}
        required
      />

      <Input 
        label="Full Name" 
        id="name" 
        name="name"
        type="text"
        placeholder="e.g. Ramesh Kumar" 
        value={data.name || ''}
        onChange={handleChange}
        required
      />

      <div className="mt-8">
        <Button type="submit">Next Step</Button>
      </div>
    </form>
  );
};

export default Step1Basic;
