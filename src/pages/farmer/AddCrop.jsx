import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CROP_CATEGORIES, CROP_UNITS } from '../../constants/cropConstants';
import { validateCropName, validateQuantity, validatePrice, validateHarvestDate } from '../../utils/validation';

const AddCrop = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'Kg',
    price: '',
    harvestDate: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      toast.error('You can only upload up to 3 images');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameErr = validateCropName(formData.name);
    if (nameErr) newErrors.name = nameErr;
    
    if (!formData.category) newErrors.category = 'Category is required';
    
    const qtyErr = validateQuantity(formData.quantity);
    if (qtyErr) newErrors.quantity = qtyErr;
    
    const priceErr = validatePrice(formData.price);
    if (priceErr) newErrors.price = priceErr;
    
    const dateErr = validateHarvestDate(formData.harvestDate);
    if (dateErr) newErrors.harvestDate = dateErr;

    setErrors(newErrors);
    
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post('http://localhost:5000/api/crops', {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        images
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Crop added successfully!');
      navigate('/farmer-dashboard/crops');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <button 
          type="button"
          onClick={() => navigate(-1)}
          className="w-7 h-7 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-[15px] font-black text-[var(--color-text-primary)] leading-none mb-0.5">Add New Crop</h1>
          <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">List your produce to connect with buyers.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="global-card !p-3 md:!p-5"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Basic Details */}
          <div>
            <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px] text-info-500">info</span>
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input 
                label={<span>Crop Name <span className="text-danger-500">*</span></span>}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Desi Tomato"
                error={errors.name}
                wrapperClassName="!mb-0"
                className={`!h-[34px] !text-[12px] ${errors.name ? 'border-danger-500' : ''}`}
                labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
              />
              <div className="flex flex-col justify-end">
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] mb-1">Category <span className="text-danger-500">*</span></label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`form-input !h-[34px] !text-[12px] w-full appearance-none bg-[var(--color-bg-body)] ${errors.category ? 'border-danger-500' : ''}`}
                >
                  <option value="" disabled>Select Category</option>
                  {CROP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-danger-500 text-[10px] mt-1">{errors.category}</p>}
              </div>
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Section 2: Pricing & Quantity */}
          <div>
            <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px] text-warning-500">payments</span>
              Pricing & Quantity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <Input 
                    label={<span>Quantity <span className="text-danger-500">*</span></span>}
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    min="0"
                    error={errors.quantity}
                    wrapperClassName="!mb-0"
                    className={`!h-[34px] !text-[12px] ${errors.quantity ? 'border-danger-500' : ''}`}
                    labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
                  />
                </div>
                <div className="w-[80px] flex flex-col justify-start">
                  <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] mb-1">Unit <span className="text-danger-500">*</span></label>
                  <select 
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="form-input !h-[34px] !text-[12px] w-full appearance-none bg-[var(--color-bg-body)] px-2"
                  >
                    {CROP_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col justify-start">
                <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] mb-1">Price (per {formData.unit}) <span className="text-danger-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-2.5 top-[17px] -translate-y-1/2 text-[var(--color-text-secondary)] font-bold text-[12px]">₹</span>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    className={`form-input !h-[34px] !text-[12px] w-full pl-6 ${errors.price ? 'border-danger-500' : ''}`}
                  />
                </div>
                {errors.price && <p className="text-danger-500 text-[10px] mt-1">{errors.price}</p>}
              </div>
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Section 3: Additional Info */}
          <div>
            <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px] text-success-500">calendar_month</span>
              Harvest & Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Input 
                label={<span>Harvest Date <span className="text-danger-500">*</span></span>}
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                error={errors.harvestDate}
                wrapperClassName="!mb-0"
                className={`!h-[34px] !text-[12px] bg-[var(--color-bg-body)] ${errors.harvestDate ? 'border-danger-500' : ''}`}
                labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] mb-1">Description (Optional)</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add details about quality, farming methods, etc."
                rows="2"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] p-2.5 text-[12px] outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none shadow-sm"
              ></textarea>
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Section 4: Images */}
          <div>
            <div className="flex justify-between items-end mb-2.5">
              <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
                <span className="material-symbols-outlined text-[14px] text-primary-500">image</span>
                Crop Images
              </h3>
              <span className="text-[9px] text-[var(--color-text-secondary)] font-medium">{images.length}/3 uploaded</span>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)] group shadow-sm">
                  <img src={img} alt={`crop-${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => removeImage(idx)}
                      className="w-6 h-6 rounded-full bg-danger-500 text-white flex items-center justify-center hover:bg-danger-600 transition-transform hover:scale-110"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {images.length < 3 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--color-border)] flex flex-col items-center justify-center text-[var(--color-text-secondary)] hover:text-primary-500 hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer bg-[var(--color-bg-subtle)]">
                  <span className="material-symbols-outlined text-[20px] mb-0.5">add_photo_alternate</span>
                  <span className="text-[9px] font-bold">Add Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row justify-end items-center border-t border-[var(--color-border)] mt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="!h-[36px] !text-[12px] shadow-sm !w-full sm:!w-auto sm:px-10 mt-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  List Crop for Sale
                </>
              )}
            </Button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default AddCrop;
