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
  const [useMyLocation, setUseMyLocation] = useState(true); // Default to vendor's state

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
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="global-card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3">
          <Input 
            icon="search" 
            placeholder="Search crops, farmers..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!mb-0"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-all ${
                category === cat 
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Location Toggle Bar */}
      <div className="flex items-center justify-between bg-primary-50 rounded-[16px] px-4 py-3 border border-primary-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-600">location_on</span>
          <span className="text-sm font-bold text-primary-800">
            Show crops near me {vendorProfile?.state ? `(${vendorProfile.state})` : ''}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={useMyLocation}
            onChange={() => setUseMyLocation(!useMyLocation)}
            disabled={!vendorProfile?.state}
          />
          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
        </label>
      </div>

      {/* Crops Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl mb-2 text-primary-500">autorenew</span>
          <p className="font-medium">Loading digital mandi...</p>
        </div>
      ) : crops.length === 0 ? (
        <div className="global-card text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-slate-400">production_quantity_limits</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No crops found</h3>
          <p className="text-slate-500 text-sm">Try changing your filters or location settings.</p>
          {useMyLocation && (
            <Button 
              variant="secondary" 
              className="mt-4 mx-auto w-auto"
              onClick={() => setUseMyLocation(false)}
            >
              Search Pan-India
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
