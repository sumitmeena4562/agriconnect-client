import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CropCard from '../../components/shared/CropCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Marketplace = () => {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState(() => {
    const user = JSON.parse(localStorage.getItem('agriconnect_user') || '{}');
    return user.vendorProfile || null;
  });
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [useMyLocation, setUseMyLocation] = useState(false); // Default OFF

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Spices', 'Others'];

  const fetchMarketplaceCrops = useCallback(async () => {
    setIsLoading(true);
    try {
      let url = `/api/crops/marketplace?category=${category}&keyword=${keyword}`;
      
      // Apply location filter if toggle is on and vendor has a state
      if (useMyLocation && vendorProfile?.state) {
        url += `&state=${vendorProfile.state}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('agriconnect_token')}`
        }
      });
      setCrops(res.data.data);
    } catch (error) {
      console.error("Error fetching marketplace:", error);
      toast.error('Failed to load marketplace crops');
    } finally {
      setIsLoading(false);
    }
  }, [category, keyword, useMyLocation, vendorProfile]);

  useEffect(() => {
    // Only fetch if vendorProfile is loaded (or we know it doesn't exist)
    // To prevent a double fetch, we can just run it when vendorProfile is resolved
    if (vendorProfile !== undefined) {
      // Debounce the fetch slightly if keyword changes
      const timeoutId = setTimeout(() => {
        fetchMarketplaceCrops();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [fetchMarketplaceCrops, vendorProfile]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">Marketplace</h1>
          <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">Discover and procure fresh produce directly from farmers.</p>
        </div>
      </div>

      {/* Advanced Filters Section */}
      <div className="global-card !p-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Search crops, farmers..." 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="form-input w-full pl-9 !h-[36px] !text-[12px] bg-[var(--color-bg-body)]"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">category</span>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-input w-full pl-9 !h-[36px] !text-[12px] bg-[var(--color-bg-body)] appearance-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Location Toggle (Takes the 3rd slot on desktop) */}
          <div className="flex items-center justify-between form-input w-full px-3 !h-[36px] !text-[12px] bg-[var(--color-bg-body)] border border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary-500">location_on</span>
              <span className="font-bold text-slate-600 truncate">
                Near me {vendorProfile?.state ? `(${vendorProfile.state})` : ''}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={useMyLocation}
                onChange={() => setUseMyLocation(!useMyLocation)}
                disabled={!vendorProfile?.state}
              />
              <div className="w-7 h-3.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <svg className="animate-spin h-6 w-6 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : crops.length === 0 ? (
        <div className="global-card text-center py-10 px-4">
          <div className="w-12 h-12 bg-[var(--color-bg-subtle)] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)]">production_quantity_limits</span>
          </div>
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1.5">No crops found</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-4 max-w-xs mx-auto">
            Try changing your filters or location settings.
          </p>
          {useMyLocation && (
            <button 
              className="inline-block bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg font-bold text-[11px] transition-colors"
              onClick={() => setUseMyLocation(false)}
            >
              Search Pan-India
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {crops.map((crop) => (
            <CropCard 
              key={crop._id} 
              crop={crop} 
              actionType="buyer" 
              linkTo={`/vendor-dashboard/crops/${crop._id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;
