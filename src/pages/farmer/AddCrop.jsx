import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { 
  CROP_CATEGORIES, CROP_UNITS, FARMING_METHODS, 
  QUALITY_GRADES, LOGISTICS_OPTIONS, AVAILABILITY_STATUS, PAYMENT_TERMS 
} from '../../constants/cropConstants';
import { 
  validateCropName, validateQuantity, validatePrice, validateHarvestDate,
  validateCropLocation, validateMinOrderQuantity
} from '../../utils/validation';

const AddCrop = ({ isEditMode = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    variety: '',
    quantity: '',
    unit: 'Kg',
    price: '',
    minOrderQuantity: '',
    location: '',
    farmingMethod: '',
    qualityGrade: '',
    availabilityStatus: '',
    paymentTerms: '',
    logisticsOption: '',
    harvestDate: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchCrop = async () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          const res = await axios.get(`/api/crops/${id}`, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          const crop = res.data.data;
          
          // Format date for the input field (YYYY-MM-DD)
          const formattedDate = crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : '';
          
          setFormData({
            name: crop.name || '',
            category: crop.category || '',
            variety: crop.variety || '',
            quantity: crop.quantity || '',
            unit: crop.unit || 'Kg',
            price: crop.price || '',
            minOrderQuantity: crop.minOrderQuantity || '',
            location: crop.location || '',
            farmingMethod: crop.farmingMethod || '',
            qualityGrade: crop.qualityGrade || '',
            availabilityStatus: crop.availabilityStatus || '',
            paymentTerms: crop.paymentTerms || '',
            logisticsOption: crop.logisticsOption || '',
            harvestDate: formattedDate,
            description: crop.description || ''
          });
          setImages(crop.images ? crop.images.map(img => ({ file: null, url: img })) : []);
        } catch (error) {
          toast.error('Failed to load crop details');
          navigate('/farmer-dashboard/crops');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCrop();
    } else {
      // Fetch default location for new crop
      const fetchDefaultLocation = async () => {
        try {
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          const res = await axios.get('/api/farmers/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const { user, profile } = res.data.data;
          
          let defaultLocation = user.location || '';
          if (!defaultLocation && profile && profile.location) {
            const { village, district, state } = profile.location;
            defaultLocation = [village, district, state].filter(Boolean).join(', ');
          }
          
          if (defaultLocation) {
            setFormData(prev => ({ ...prev, location: defaultLocation }));
          }
        } catch (error) {
          console.error("Could not fetch default location");
        } finally {
          setIsLoading(false);
        }
      };
      fetchDefaultLocation();
    }
  }, [isEditMode, id, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name': return validateCropName(value);
      case 'category': return !value ? 'Please select a category' : '';
      case 'quantity': return validateQuantity(value);
      case 'price': return validatePrice(value);
      case 'minOrderQuantity': return validateMinOrderQuantity(value);
      case 'location': return validateCropLocation(value, 'Location');
      case 'farmingMethod': return !value ? 'Please select a farming method' : '';
      case 'qualityGrade': return !value ? 'Please select a quality grade' : '';
      case 'availabilityStatus': return !value ? 'Please select availability status' : '';
      case 'paymentTerms': return !value ? 'Please select payment terms' : '';
      case 'logisticsOption': return !value ? 'Please select transport option' : '';
      case 'harvestDate': return validateHarvestDate(value);
      default: return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const errorMsg = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      toast.error('You can only upload up to 4 photos');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, { file, url: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) newErrors[key] = errorMsg;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in red before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Upload new files first
      let finalImageUrls = [];
      const newFiles = images.filter(img => img.file).map(img => img.file);
      const existingUrls = images.filter(img => !img.file).map(img => img.url);

      if (newFiles.length > 0) {
        const uploadFormData = new FormData();
        newFiles.forEach(file => uploadFormData.append('images', file));
        
        const uploadRes = await axios.post('/api/upload', uploadFormData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        finalImageUrls = [...existingUrls, ...uploadRes.data.urls];
      } else {
        finalImageUrls = existingUrls;
      }

      const payload = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        minOrderQuantity: Number(formData.minOrderQuantity),
        images: finalImageUrls
      };

      if (isEditMode) {
        await axios.put(`/api/crops/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Crop updated successfully!');
      } else {
        await axios.post('/api/crops', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Crop added successfully!');
      }
      
      navigate('/farmer-dashboard/crops');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper component for standard selects
  const SelectField = ({ label, name, options, required = true }) => {
    const isSuccess = formData[name] && !errors[name];
    return (
      <div className="flex flex-col justify-start">
        <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] mb-1">
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
        <select 
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`form-input !h-[34px] !text-[12px] w-full appearance-none bg-[var(--color-bg-body)] 
            ${errors[name] ? 'border-danger-500' : isSuccess ? 'border-success-500' : ''}`}
        >
          <option value="" disabled>Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {errors[name] && <p className="text-danger-500 text-[10px] mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const getInputStatusClass = (name) => {
    if (errors[name]) return 'border-danger-500';
    if (formData[name] && !errors[name]) return 'border-success-500';
    return '';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <button 
          type="button"
          onClick={() => navigate(-1)}
          className="w-7 h-7 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        </button>
        <div>
          <h1 className="text-[15px] font-black text-[var(--color-text-primary)] leading-none mb-0.5">
            {isEditMode ? 'Edit Your Crop' : 'Sell Your Crop'}
          </h1>
          <p className="text-[10px] text-[var(--color-text-secondary)] font-medium">
            {isEditMode ? 'Update the details below to keep buyers informed.' : 'Fill these simple details to get buyers quickly.'}
          </p>
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
              Crop Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input 
                label={<span>Crop Name <span className="text-danger-500">*</span></span>}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Tomato"
                error={errors.name}
                wrapperClassName="!mb-0"
                className={`!h-[34px] !text-[12px] ${getInputStatusClass('name')}`}
                labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
              />
              <SelectField label="Category" name="category" options={CROP_CATEGORIES} />
              <Input 
                label="Variety / Breed (Optional)"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g. Desi, Hybrid"
                wrapperClassName="!mb-0"
                className={`!h-[34px] !text-[12px] ${formData.variety ? 'border-success-500' : ''}`}
                labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
              />
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Section 2: Volume & Pricing */}
          <div>
            <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px] text-warning-500">payments</span>
              Quantity & Price
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex gap-2.5">
                <div className="flex-1">
                  <Input 
                    label={<span>Total Quantity <span className="text-danger-500">*</span></span>}
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 50"
                    min="0"
                    error={errors.quantity}
                    wrapperClassName="!mb-0"
                    className={`!h-[34px] !text-[12px] ${getInputStatusClass('quantity')}`}
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
                    className={`form-input !h-[34px] !text-[12px] w-full pl-6 ${getInputStatusClass('price')}`}
                  />
                </div>
                {errors.price && <p className="text-danger-500 text-[10px] mt-1">{errors.price}</p>}
              </div>

              <Input 
                label={<span>Minimum Sell Quantity <span className="text-danger-500">*</span></span>}
                type="number"
                name="minOrderQuantity"
                value={formData.minOrderQuantity}
                onChange={handleChange}
                placeholder={`Minimum to sell (e.g. 50)`}
                min="1"
                error={errors.minOrderQuantity}
                wrapperClassName="!mb-0"
                className={`!h-[34px] !text-[12px] ${getInputStatusClass('minOrderQuantity')}`}
                labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
              />
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Section 3: Origin & Quality */}
          <div>
            <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px] text-success-500">verified</span>
              Location & Quality
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input 
                label={<span>Farm City & State <span className="text-danger-500">*</span></span>}
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Nashik, Maharashtra"
                error={errors.location}
                wrapperClassName="!mb-0"
                className={`!h-[34px] !text-[12px] ${getInputStatusClass('location')}`}
                labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
              />
              <SelectField label="Farming Method" name="farmingMethod" options={FARMING_METHODS} />
              <SelectField label="Quality Grade" name="qualityGrade" options={QUALITY_GRADES} />
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Section 4: Terms & Delivery */}
          <div>
            <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] mb-2.5 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="material-symbols-outlined text-[14px] text-primary-500">local_shipping</span>
              Transport & Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <SelectField label="Who will Transport?" name="logisticsOption" options={LOGISTICS_OPTIONS} />
              <SelectField label="Is the Crop Ready?" name="availabilityStatus" options={AVAILABILITY_STATUS} />
              <SelectField label="Payment Preference" name="paymentTerms" options={PAYMENT_TERMS} />
              
              <Input 
                label={<span>Available Date <span className="text-danger-500">*</span></span>}
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                error={errors.harvestDate}
                wrapperClassName="!mb-0 md:col-span-1"
                className={`!h-[34px] !text-[12px] bg-[var(--color-bg-body)] ${getInputStatusClass('harvestDate')}`}
                labelClassName="!text-[10px] !mb-1 text-[var(--color-text-secondary)]"
              />
            </div>
            
            <div className="mt-3">
              <label className="block text-[10px] font-bold text-[var(--color-text-secondary)] mb-1">More Details (Optional)</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write any extra information..."
                rows="2"
                className={`w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] p-2.5 text-[12px] outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none shadow-sm ${formData.description ? 'border-success-500' : ''}`}
              ></textarea>
            </div>
          </div>

          <hr className="border-[var(--color-border)]" />

          {/* Section 5: Images */}
          <div>
            <div className="flex justify-between items-end mb-2.5">
              <h3 className="text-[11px] font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
                <span className="material-symbols-outlined text-[14px] text-primary-500">image</span>
                Add Photos
              </h3>
              <span className="text-[9px] text-[var(--color-text-secondary)] font-medium">{images.length}/4 uploaded</span>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)] group shadow-sm">
                  <img src={img.url.startsWith('http') || img.url.startsWith('data:') ? img.url : `http://localhost:5000${img.url}`} alt={`crop-${idx}`} className="w-full h-full object-cover" />
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

              {images.length < 4 && (
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
                  <span className="material-symbols-outlined text-[16px]">{isEditMode ? 'save' : 'add_circle'}</span>
                  {isEditMode ? 'Update Crop' : 'Submit Crop'}
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
