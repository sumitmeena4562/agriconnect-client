import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await axios.get(`/api/crops/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCrop(res.data.data);
      } catch (error) {
        toast.error('Failed to load crop details');
        navigate('/farmer-dashboard/crops');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCropDetails();
  }, [id, navigate]);

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

  if (!crop) return null;

  return (
    <div className="space-y-3">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3 mb-1">
        <Link 
          to="/farmer-dashboard/crops" 
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]!">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-black text-[var(--color-text-primary)] leading-none">Crop Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
        {/* Left Column: Image Gallery */}
        <div className="md:col-span-5 space-y-2">
          <div className="global-card-flush aspect-[4/3] bg-[var(--color-bg-body)]">
            {crop.images && crop.images.length > 0 ? (
              <img 
                src={crop.images[mainImage]} 
                alt={crop.name} 
                className="w-full h-full object-cover transition-opacity duration-300" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-[36px]! mb-1">image</span>
                <span className="text-[11px] font-medium">No Image</span>
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {crop.images && crop.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {crop.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${mainImage === idx ? 'border-primary-500 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-7">
          <div className="global-card space-y-4 !p-4 sm:!p-5">
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {crop.availabilityStatus === 'Available' ? (
                <span className="badge badge-success">
                  <span className="material-symbols-outlined icon-sm">check_circle</span> In Stock
                </span>
              ) : (
                <span className="badge badge-warning">
                  <span className="material-symbols-outlined icon-sm">schedule</span> Coming Soon
                </span>
              )}
              {crop.farmingMethod === 'Organic' && (
                <span className="badge badge-success">
                  <span className="material-symbols-outlined icon-sm">eco</span> Organic
                </span>
              )}
              <span className="badge badge-outline">
                {crop.category}
              </span>
            </div>

            {/* Title & Price */}
            <div className="pb-3 border-b border-[var(--color-border)]">
              <h2 className="text-title text-[20px] mb-0.5">
                {crop.name} {crop.variety && <span className="text-[14px] text-[var(--color-text-secondary)]">({crop.variety})</span>}
              </h2>
              {crop.location && (
                <p className="text-subtitle text-[11px]">
                  <span className="material-symbols-outlined icon-md text-red-500">location_on</span>
                  {crop.location}
                </p>
              )}
              
              <div className="mt-2.5 flex items-end gap-1.5">
                <span className="text-price text-[24px]">₹{crop.price}</span>
                <span className="text-subtitle text-[12px] pb-0.5">/ {crop.unit}</span>
              </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--color-bg-body)] p-2 rounded-lg border border-[var(--color-border)] text-center">
                <p className="text-caption text-[9px]">Qty</p>
                <p className="text-title text-[13px]">{crop.quantity}</p>
              </div>
              <div className="bg-[var(--color-bg-body)] p-2 rounded-lg border border-[var(--color-border)] text-center">
                <p className="text-caption text-[9px]">Min</p>
                <p className="text-title text-[13px]">{crop.minOrderQuantity || 1}</p>
              </div>
              <div className="bg-[var(--color-bg-body)] p-2 rounded-lg border border-[var(--color-border)] text-center">
                <p className="text-caption text-[9px]">Grade</p>
                <p className="text-title text-[13px]">{crop.qualityGrade || '-'}</p>
              </div>
            </div>

            {/* Description */}
            {crop.description && (
              <div>
                <h3 className="text-title text-[12px] mb-1">Description</h3>
                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {crop.description}
                </p>
              </div>
            )}

            {/* Logistics & Payment */}
            <div className="space-y-2 pt-3 border-t border-[var(--color-border)]">
              {crop.logisticsOption && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined icon-lg text-blue-600 w-5 text-center">local_shipping</span>
                  <p className="text-subtitle text-[11px]"><span className="text-[var(--color-text-secondary)] mr-1">Logistics:</span>{crop.logisticsOption}</p>
                </div>
              )}
              
              {crop.paymentTerms && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined icon-lg text-green-600 w-5 text-center">payments</span>
                  <p className="text-subtitle text-[11px]"><span className="text-[var(--color-text-secondary)] mr-1">Payment:</span>{crop.paymentTerms}</p>
                </div>
              )}
              
              {crop.harvestDate && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined icon-lg text-orange-600 w-5 text-center">calendar_month</span>
                  <p className="text-subtitle text-[11px]"><span className="text-[var(--color-text-secondary)] mr-1">Harvested:</span>{new Date(crop.harvestDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CropDetails;
