import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/crops', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCrops(res.data.data);
      } catch (error) {
        toast.error('Failed to load crops');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCrops();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] tracking-tight leading-none mb-0.5">My Crops</h1>
          <p className="text-[10px] sm:text-[11px] text-[var(--color-text-secondary)] font-medium">Manage your listed produce.</p>
        </div>
        <Link 
          to="/farmer-dashboard/crops/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg font-bold text-[11px] shadow-sm shadow-primary-500/20 transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">add</span>
          <span className="hidden sm:inline">Add New Crop</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

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
            <span className="material-symbols-outlined text-[24px] text-[var(--color-text-secondary)]">yard</span>
          </div>
          <h3 className="text-[14px] font-bold text-[var(--color-text-primary)] mb-1.5">No crops listed yet</h3>
          <p className="text-[10px] text-[var(--color-text-secondary)] mb-4 max-w-xs mx-auto">
            You haven't listed any crops for sale. Add your first crop to connect with buyers.
          </p>
          <Link 
            to="/farmer-dashboard/crops/new"
            className="inline-block bg-primary-50 text-primary-600 hover:bg-primary-100 px-4 py-2 rounded-lg font-bold text-[11px] transition-colors"
          >
            Add First Crop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {crops.map((crop) => (
            <div key={crop._id} className="global-card group overflow-hidden flex flex-col">
              {crop.images && crop.images.length > 0 ? (
                <div className="h-24 w-full overflow-hidden bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]">
                  <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-24 w-full bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
                  <span className="material-symbols-outlined text-[24px] mb-1 opacity-50">image</span>
                  <span className="text-[9px] font-bold opacity-50">No Image</span>
                </div>
              )}
              
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] text-[8px] font-bold uppercase tracking-wider rounded border border-[var(--color-border)] mb-1">{crop.category}</span>
                    <h3 className="text-[14px] font-black text-[var(--color-text-primary)] leading-none">{crop.name}</h3>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${crop.status === 'Available' ? 'bg-success-50 text-success-600 border border-success-100' : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'}`}>
                    {crop.status}
                  </span>
                </div>
                
                <div className="mt-auto pt-2 flex justify-between items-end border-t border-dashed border-[var(--color-border)]">
                  <div>
                    <p className="text-[9px] text-[var(--color-text-secondary)] font-medium mb-0.5">Price</p>
                    <p className="text-[13px] font-bold text-primary-600">₹{crop.price} <span className="text-[9px] text-[var(--color-text-secondary)] font-medium">/{crop.unit}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[var(--color-text-secondary)] font-medium mb-0.5">Stock</p>
                    <p className="text-[11px] font-bold text-[var(--color-text-primary)]">{crop.quantity} {crop.unit}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCrops;
