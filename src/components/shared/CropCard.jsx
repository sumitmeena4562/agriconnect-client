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
    <div className="bg-white rounded-xl overflow-hidden flex flex-col border border-slate-200/80 shadow-xs relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-md h-full">
      
      {/* ── 1. Top Image Section ── */}
      <Link to={destinationUrl} className="relative h-36 w-full bg-slate-100 overflow-hidden block">
        {crop.images && crop.images.length > 0 ? (
          <img 
            src={crop.images[0]} 
            alt={crop.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <span className="material-symbols-outlined text-slate-300 text-3xl">grass</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Status Badge (Top-Left) */}
        {actionType === 'farmer' ? (
          <button
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              if(onToggleStatus) onToggleStatus(crop._id); 
            }}
            className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm backdrop-blur-md border flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer ${
              crop.status === 'Available' 
                ? 'bg-white/95 text-emerald-700 border-emerald-200/80 hover:bg-emerald-50' 
                : 'bg-white/95 text-rose-700 border-rose-200/80 hover:bg-rose-50'
            }`}
            title="Click to toggle status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${crop.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{crop.status === 'Available' ? 'Available' : 'Sold Out'}</span>
          </button>
        ) : (
          <span
            className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm backdrop-blur-md border flex items-center gap-1.5 ${
              crop.status === 'Available' 
                ? 'bg-white/95 text-emerald-700 border-emerald-200/80' 
                : 'bg-white/95 text-rose-700 border-rose-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${crop.status === 'Available' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{crop.status === 'Available' ? 'Available' : 'Sold Out'}</span>
          </span>
        )}

        {/* Top-Right Delete Action Button */}
        {actionType === 'farmer' && onDelete && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(crop._id);
            }}
            title="Delete Crop"
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-rose-50 backdrop-blur-md shadow-sm transition-all flex items-center justify-center cursor-pointer border border-slate-200/50"
          >
            <span className="material-symbols-outlined text-[15px]">delete</span>
          </button>
        )}

        {/* Micro Views Count Badge (Bottom-Right of Image) */}
        {actionType === 'farmer' && (
          <div className="absolute bottom-2 right-2 z-10 px-2 py-0.5 rounded-md bg-black/50 text-white/90 backdrop-blur-md text-[9.5px] font-extrabold flex items-center gap-1 border border-white/10 shadow-xs" title="Total Views">
            <span className="material-symbols-outlined text-[12px]">visibility</span>
            <span>{crop.views || 0}</span>
          </div>
        )}
      </Link>
      
      {/* ── 2. Card Content Body ── */}
      <div className="p-3 flex flex-col flex-1">
        
        {/* Badges / Tags Bar */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <span className="inline-flex items-center h-5.5 px-2 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-md border border-slate-200/60 leading-none">
            {crop.quantity} {crop.unit}
          </span>
          {crop.qualityGrade && (
            <span className="inline-flex items-center h-5.5 px-2 bg-amber-50 text-amber-700 font-extrabold text-[10px] rounded-md border border-amber-200/60 leading-none">
              {crop.qualityGrade}
            </span>
          )}
          {crop.farmingMethod === 'Organic' && (
            <span className="inline-flex items-center gap-1 h-5.5 px-2 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-md border border-emerald-200/60 leading-none">
              <span className="material-symbols-outlined text-[12px] leading-none">eco</span>
              <span>Organic</span>
            </span>
          )}
        </div>
        
        {/* Title & Location */}
        <div className="mb-2 min-w-0">
          <Link to={destinationUrl} className="block group-hover:text-primary-600 transition-colors">
            <h3 className="font-black text-slate-900 text-[14px] leading-tight truncate">
              {crop.name} 
              {crop.variety && (
                <span className="text-[10.5px] font-bold text-slate-400 ml-1 font-normal">
                  ({crop.variety})
                </span>
              )}
            </h3>
          </Link>
          
          {crop.location && (
            <p className="text-[10.5px] font-semibold text-slate-500 truncate mt-0.5 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px] text-rose-500 shrink-0">location_on</span>
              <span className="truncate">{crop.location}</span>
            </p>
          )}
        </div>
        
        {/* Subtitle Info: Min Order & Stock Status */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2.5 text-[10.5px] font-bold text-slate-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-slate-400">local_shipping</span>
            <span>Min: {crop.minOrderQuantity || 1} {crop.unit}</span>
          </div>
          
          <div className={`flex items-center gap-1 ${crop.availabilityStatus === 'Ready to Dispatch' ? 'text-emerald-700' : 'text-amber-600'}`}>
            <span className="material-symbols-outlined text-[13px]">
              {crop.availabilityStatus === 'Ready to Dispatch' ? 'check_circle' : 'schedule'}
            </span>
            <span>{crop.availabilityStatus === 'Ready to Dispatch' ? 'In Stock' : 'Pre-Booking'}</span>
          </div>
        </div>
        
        {/* ── 3. Footer Bar: Price & Actions ── */}
        <div className="mt-auto flex justify-between items-center border-t border-slate-100 pt-2.5">
          
          {/* Price */}
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[17px] font-black text-slate-900 leading-none">₹{crop.price}</span>
              <span className="text-[10px] font-bold text-slate-400">/{crop.unit || 'Kg'}</span>
            </div>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-1.5">

            {actionType === 'farmer' && (
              <>
                {/* WhatsApp Share Button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = `${window.location.origin}/crops/${crop._id}`;
                    const text = `Check out my fresh ${crop.name} on AgriConnect! ${url}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  title="Share on WhatsApp"
                  className="w-7.5 h-7.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-105 border border-emerald-200/50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                  </svg>
                </button>
                
                {/* Edit Button */}
                {onEdit && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(crop._id);
                    }}
                    title="Edit Crop"
                    className="w-7.5 h-7.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 hover:scale-105 border border-primary-200/50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                  </button>
                )}
              </>
            )}
            
            {actionType === 'buyer' && (
              <button 
                title="View & Request"
                className="w-7.5 h-7.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            )}
          </div>

        </div>

      </div>
      
    </div>
  );
};

export default CropCard;
