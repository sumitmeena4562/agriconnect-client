import React from 'react';
import { Link } from 'react-router-dom';

const CropCard = ({ 
  crop, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  actionType = 'farmer', // 'farmer' (shows edit/delete) or 'buyer' (shows add to cart)
  linkTo
}) => {
  const destinationUrl = linkTo || `/farmer-dashboard/crops/${crop._id}`;

  return (
    <Link 
      to={destinationUrl}
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
        
        {/* Status Badge on Top Left of Image */}
        {actionType === 'farmer' ? (
          <button
             onClick={(e) => { 
               e.preventDefault(); 
               e.stopPropagation(); 
               if(onToggleStatus) onToggleStatus(crop._id); 
             }}
             className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md border flex items-center gap-1.5 transition-transform hover:scale-105 ${
               crop.status === 'Available' 
                ? 'bg-white/95 text-green-700 border-green-200 hover:bg-green-50' 
                : 'bg-white/95 text-red-700 border-red-200 hover:bg-red-50'
             }`}
             title="Click to toggle status"
          >
             <div className={`w-2 h-2 rounded-full shadow-sm ${crop.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
             {crop.status === 'Available' ? 'Available' : 'Sold Out'}
          </button>
        ) : (
          <span
             className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md border flex items-center gap-1.5 ${
               crop.status === 'Available' 
                ? 'bg-white/95 text-green-700 border-green-200' 
                : 'bg-white/95 text-red-700 border-red-200'
             }`}
          >
             <div className={`w-2 h-2 rounded-full shadow-sm ${crop.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
             {crop.status === 'Available' ? 'Available' : 'Sold Out'}
          </span>
        )}

        {/* Top Right Action (Delete) */}
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
      <div className="p-3 pt-3 flex flex-col flex-1">
        
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
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
        <div className="mb-2.5 min-w-0">
          <h3 className="text-title text-[15px] flex items-baseline gap-1 min-w-0">
            <span className="truncate">{crop.name}</span>
            {crop.variety && <span className="text-[11px] font-bold text-gray-400 shrink-0">({crop.variety})</span>}
          </h3>
          {crop.location && (
            <p className="text-subtitle text-[10px] truncate mt-0.5 flex items-center">
              <span className="material-symbols-outlined icon-md text-red-500 shrink-0 mr-0.5">location_on</span>
              <span className="truncate">{crop.location}</span>
            </p>
          )}
        </div>
        
        {/* Subtitle Info (Min Order & Availability) */}
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
        
        {/* Footer: Price & Actions */}
        <div className="mt-auto flex justify-between items-end gap-1 border-t border-[var(--color-border)] pt-2.5">
          {/* Price Block Stacked */}
          <div className="flex flex-col justify-end shrink-0">
            <p className="text-price text-[16px] sm:text-[18px] leading-none mb-0.5">
              ₹{crop.price}
            </p>
            <p className="text-[9px] sm:text-[10px] text-[var(--color-text-secondary)] font-bold line-through decoration-gray-400 leading-none">
              MRP ₹{Math.round(crop.price * 1.2)}
            </p>
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-1.5 shrink-0">
            
            {/* Views Indicator */}
            {actionType === 'farmer' && (
              <div className="flex items-center gap-1 text-gray-400 font-bold text-[10px] sm:text-[11px] mr-0.5 sm:mr-1 px-1" title="Total Views">
                <span className="material-symbols-outlined text-[13px] sm:text-[15px]">visibility</span>
                {crop.views || 0}
              </div>
            )}

            {actionType === 'farmer' && (
              <>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `${window.location.origin}/crops/${crop._id}`;
                    const text = `Check out my fresh ${crop.name} on AgriConnect! ${url}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  title="Share on WhatsApp"
                  className="btn-icon w-7 h-7 sm:w-8 sm:h-8 !bg-green-50 !text-green-600 hover:!bg-green-100 border border-transparent hover:border-green-200 transition-all flex items-center justify-center shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16" className="sm:w-[14px] sm:h-[14px]">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                </button>
                {onEdit && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(crop._id);
                    }}
                    title="Edit Crop"
                    className="btn-icon w-7 h-7 sm:w-8 sm:h-8 bg-primary-50 text-primary-600 hover:bg-primary-100 border border-transparent hover:border-primary-200 flex items-center justify-center shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">edit</span>
                  </button>
                )}
              </>
            )}
            
            {actionType === 'buyer' && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // No specific logic here yet, it will just let the Link handle the click if we want, or we can use it later.
                }}
                title="View & Request"
                className="btn-icon w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 text-white hover:bg-primary-700 shrink-0 flex items-center justify-center pointer-events-none"
              >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
    </Link>
  );
};

export default CropCard;
