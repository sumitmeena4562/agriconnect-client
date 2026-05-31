import React from 'react';
import { Link } from 'react-router-dom';

const CropCard = ({ 
  crop, 
  onEdit, 
  onDelete, 
  actionType = 'farmer' // 'farmer' (shows edit/delete) or 'buyer' (shows add to cart)
}) => {
  return (
    <Link 
      to={`/farmer-dashboard/crops/${crop._id}`}
      className="bg-white rounded-[16px] overflow-hidden flex flex-col shadow-sm border border-[var(--color-border)] relative group transition-transform duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer h-full"
    >
      
      {/* Top Image Section (Full Bleed) */}
      <div className="relative h-36 w-full bg-gray-50">
        {crop.images && crop.images.length > 0 ? (
          <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-gray-300 text-3xl">image</span>
          </div>
        )}
        
        {/* Top Right Action (e.g., Delete for Farmer, Heart for Buyer) */}
        {actionType === 'farmer' && onDelete && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(crop._id);
            }}
            title="Delete Crop"
            className="absolute top-2 right-2 z-10 btn-icon !bg-white/90 !text-gray-400 hover:!text-red-500 hover:!bg-red-50 backdrop-blur-md"
          >
            <span className="material-symbols-outlined icon-lg">delete</span>
          </button>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-3 pt-2.5 flex flex-col flex-1">
        
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="badge badge-info">
            {crop.quantity} {crop.unit}
          </span>
          {crop.qualityGrade && (
            <span className="badge badge-warning">
              {crop.qualityGrade}
            </span>
          )}
          {crop.farmingMethod === 'Organic' && (
            <span className="badge badge-success">
              <span className="material-symbols-outlined icon-sm leading-none">eco</span> Organic
            </span>
          )}
        </div>
        
        {/* Crop Name & Location */}
        <div className="mb-2.5">
          <h3 className="text-title text-[15px] truncate flex items-baseline gap-1">
            {crop.name}
            {crop.variety && <span className="text-[11px] font-bold text-gray-400 truncate">({crop.variety})</span>}
          </h3>
          {crop.location && (
            <p className="text-subtitle text-[10px] truncate mt-0.5">
              <span className="material-symbols-outlined icon-md text-red-500">location_on</span>
              {crop.location}
            </p>
          )}
        </div>
        
        {/* Subtitle Info (Min Order & Status) */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-3">
          <p className="text-subtitle text-[10.5px] font-bold">
            <span className="material-symbols-outlined icon-md text-gray-400">local_shipping</span>
            <span>Min: {crop.minOrderQuantity || 1} {crop.unit}</span>
          </p>
          
          <p className={`text-subtitle text-[10.5px] font-bold ${crop.availabilityStatus === 'Available' ? 'text-green-600' : 'text-orange-500'}`}>
            <span className={`material-symbols-outlined icon-md ${crop.availabilityStatus === 'Available' ? 'text-green-500' : 'text-orange-500'}`}>
              {crop.availabilityStatus === 'Available' ? 'check_circle' : 'schedule'}
            </span>
            <span>{crop.availabilityStatus === 'Available' ? 'In Stock' : 'Coming Soon'}</span>
          </p>
        </div>
        
        {/* Footer: Price & Action */}
        <div className="mt-auto flex flex-wrap justify-between items-end gap-2 border-t border-[var(--color-border)] pt-2.5">
          <div className="flex items-end gap-1.5">
            <p className="text-price text-[18px]">
              ₹{crop.price}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-bold line-through decoration-gray-300 mb-[1.5px]">
              MRP ₹{Math.round(crop.price * 1.2)}
            </p>
          </div>

          {/* Action Button */}
          {actionType === 'farmer' && onEdit && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(crop._id);
              }}
              title="Edit Crop"
              className="btn-icon ml-auto"
            >
              <span className="material-symbols-outlined icon-lg">edit</span>
            </button>
          )}
          
          {actionType === 'buyer' && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to cart logic
              }}
              title="Add to Cart"
              className="btn-icon ml-auto"
            >
              <span className="material-symbols-outlined icon-lg">add</span>
            </button>
          )}
        </div>
      </div>
      
    </Link>
  );
};

export default CropCard;
