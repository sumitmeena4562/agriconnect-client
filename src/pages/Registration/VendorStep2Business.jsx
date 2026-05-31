import React from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Others'];

const VendorStep2Business = ({ data, updateData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ [name]: value });
  };

  const handleCategoryToggle = (category) => {
    const currentCategories = data.interestedCategories || [];
    let newCategories;
    
    if (currentCategories.includes(category)) {
      newCategories = currentCategories.filter(c => c !== category);
    } else {
      newCategories = [...currentCategories, category];
    }
    
    updateData({ interestedCategories: newCategories });
  };

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleNext} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-800 mb-1">Business Profile</h2>
        <p className="text-[13px] font-medium text-slate-500">Tell us about your business.</p>
      </div>

      <div className="space-y-4">
        <Input 
          label="Shop / Business Name (Optional)" 
          id="businessName" 
          name="businessName"
          type="text"
          placeholder="e.g. Sharma Trading Co." 
          value={data.businessName || ''}
          onChange={handleChange}
        />

        <Input 
          label="GST / PAN Number (Optional)" 
          id="gstNumber" 
          name="gstNumber"
          type="text"
          placeholder="e.g. 22AAAAA0000A1Z5" 
          value={data.gstNumber || ''}
          onChange={handleChange}
        />

        <div className="mt-6">
          <label className="block text-[13px] font-bold text-slate-700 mb-2">
            Interested Categories (Select multiple)
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => {
              const isSelected = (data.interestedCategories || []).includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                    isSelected 
                      ? 'bg-primary-50 border-primary-500 text-primary-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
        <Button type="submit">Next Step</Button>
      </div>
    </form>
  );
};

export default VendorStep2Business;
