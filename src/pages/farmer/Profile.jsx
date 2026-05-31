import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    state: '',
    district: '',
    village: '',
    accountName: '',
    accountNumber: '',
    ifscCode: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get('/api/farmers/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { user, profile } = res.data.data;
        
        // Format location if available
        let defaultLocation = user.location || '';
        if (!defaultLocation && profile && profile.location) {
          const { village, district, state } = profile.location;
          defaultLocation = [village, district, state].filter(Boolean).join(', ');
        }
        
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          location: defaultLocation,
          state: profile?.location?.state || '',
          district: profile?.location?.district || '',
          village: profile?.location?.village || '',
          accountName: user.bankDetails?.accountName || '',
          accountNumber: user.bankDetails?.accountNumber || '',
          ifscCode: user.bankDetails?.ifscCode || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      const payload = {
        name: formData.name,
        location: formData.location,
        bankDetails: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode
        },
        farmDetails: undefined // Not updating this right now
      };
      
      await axios.put('/api/farmers/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="mb-4">
        <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">Profile Settings</h1>
        <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">Manage your personal details, default location, and bank account for payments.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="global-card !p-4 md:!p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Basic Details */}
          <div>
            <h3 className="text-[12px] font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5 uppercase tracking-wide border-b border-[var(--color-border)] pb-2">
              <span className="material-symbols-outlined text-[16px] text-primary-500">person</span>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
              <Input 
                label="Phone Number"
                name="phone"
                value={formData.phone}
                disabled
                className="bg-gray-50 text-gray-500"
                helperText="Phone number cannot be changed"
              />
            </div>
          </div>

          {/* Location Setting */}
          <div>
            <h3 className="text-[12px] font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5 uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mt-4">
              <span className="material-symbols-outlined text-[16px] text-danger-500">location_on</span>
              Default Farm Location
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Input 
                label="Default Location (Auto-filled when adding crops)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Kolari, Nashik, Maharashtra"
                helperText="This location will be automatically filled when you add a new crop."
              />
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <h3 className="text-[12px] font-bold text-[var(--color-text-primary)] mb-3 flex items-center gap-1.5 uppercase tracking-wide border-b border-[var(--color-border)] pb-2 mt-4">
              <span className="material-symbols-outlined text-[16px] text-success-500">account_balance</span>
              Bank Details (For Payments)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Account Holder Name"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="Name as per bank record"
              />
              <Input 
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                type="password"
              />
              <Input 
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="e.g. SBIN0001234"
                className="uppercase"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="!px-8 shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
