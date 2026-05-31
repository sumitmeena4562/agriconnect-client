import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const VendorCropDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCropDetails = async () => {
      try {
        const res = await axios.get(`/api/crops/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('agriconnect_token')}` }
        });
        // We need the crop to be populated with farmer details. Wait, GET /api/crops/:id doesn't populate farmer details currently!
        // For now, let's fetch it from marketplace endpoint trick, or we update backend.
        // Wait, the API returns what the controller provides. Let's see if we can get farmer info.
        setCrop(res.data.data);
      } catch (error) {
        console.error("Error fetching crop details:", error);
        toast.error('Crop not found');
        navigate('/vendor-dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCropDetails();
  }, [id, navigate]);

  const handleOrderRequest = async (e) => {
    e.preventDefault();
    if (!orderQuantity || Number(orderQuantity) < (crop.minOrderQuantity || 1)) {
        toast.error(`Minimum order quantity is ${crop.minOrderQuantity || 1} ${crop.unit}`);
        return;
    }
    if (Number(orderQuantity) > crop.quantity) {
        toast.error(`Cannot order more than available (${crop.quantity} ${crop.unit})`);
        return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending Order Request...');
    
    try {
        await axios.post('/api/orders', {
            cropId: crop._id,
            requestedQuantity: Number(orderQuantity),
            offeredPrice: crop.price, // We can add negotiation later
            message: orderMessage
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('agriconnect_token')}` }
        });

        toast.success('Order request sent successfully! The farmer will be notified.', { id: toastId });
        setIsOrderModalOpen(false);
        setOrderQuantity('');
        setOrderMessage('');
    } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to send request', { id: toastId });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary-500">autorenew</span>
      </div>
    );
  }

  if (!crop) return null;

  return (
    <div className="space-y-3">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3 mb-1">
        <button 
          onClick={() => navigate('/vendor-dashboard')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] hover:bg-[var(--color-bg-subtle)] transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]!">arrow_back</span>
        </button>
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
                src={crop.images[0]} 
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
          
          {/* Thumbnails (Placeholder for multiple images, Vendor currently just sees one if we didn't add the thumbnail state, but let's keep the layout ready) */}
          {crop.images && crop.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {crop.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 border-transparent opacity-70 hover:opacity-100`}
                >
                  <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details */}
        <div className="md:col-span-7">
          <div className="global-card space-y-4 !p-4 sm:!p-5">
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {crop.status === 'Available' ? (
                <span className="badge badge-success">
                  <span className="material-symbols-outlined icon-sm">check_circle</span> Available
                </span>
              ) : (
                <span className="badge badge-error">
                  <span className="material-symbols-outlined icon-sm">cancel</span> Sold Out
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
                <p className="text-caption text-[9px]">Available</p>
                <p className="text-title text-[13px]">{crop.quantity}</p>
              </div>
              <div className="bg-[var(--color-bg-body)] p-2 rounded-lg border border-[var(--color-border)] text-center">
                <p className="text-caption text-[9px]">Min Order</p>
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
              
              {crop.harvestDate && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined icon-lg text-orange-600 w-5 text-center">calendar_month</span>
                  <p className="text-subtitle text-[11px]"><span className="text-[var(--color-text-secondary)] mr-1">Harvested:</span>{new Date(crop.harvestDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Action Bar for Vendor */}
            <div className="pt-4 border-t border-[var(--color-border)] mt-4">
               <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-500 shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[20px]">agriculture</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Sold By</p>
                      <p className="font-bold text-[13px] text-slate-800 truncate max-w-[150px]" title={typeof crop.farmerId === 'object' ? crop.farmerId.name : 'Verified Farmer'}>
                        {typeof crop.farmerId === 'object' ? crop.farmerId.name : 'Verified Farmer'}
                      </p>
                    </div>
                 </div>

                 <Button 
                   variant="primary" 
                   className="w-full sm:w-auto shadow-lg shadow-primary-500/30 whitespace-nowrap"
                   onClick={() => setIsOrderModalOpen(true)}
                   disabled={crop.status !== 'Available'}
                 >
                   <span className="material-symbols-outlined text-[16px]">send</span>
                   Send Order
                 </Button>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Order Request Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-600">shopping_cart</span>
                Request Order
              </h3>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleOrderRequest} className="p-5">
              <div className="mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100 flex justify-between items-center">
                 <div>
                    <p className="text-[11px] font-bold text-primary-600 uppercase">Total Available</p>
                    <p className="text-lg font-black text-primary-800">{crop.quantity} {crop.unit}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-bold text-primary-600 uppercase">Min Order</p>
                    <p className="text-lg font-black text-primary-800">{crop.minOrderQuantity || 1} {crop.unit}</p>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    I want to buy (in {crop.unit})
                  </label>
                  <Input 
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    placeholder={`e.g. ${crop.minOrderQuantity || 1}`}
                    required
                    min={crop.minOrderQuantity || 1}
                    max={crop.quantity}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">
                    Message to Farmer (Optional)
                  </label>
                  <textarea
                    value={orderMessage}
                    onChange={(e) => setOrderMessage(e.target.value)}
                    placeholder="E.g., I can pick this up tomorrow if the quality is good."
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--form-border-radius)] p-3 text-[var(--form-text-size)] focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none h-24"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsOrderModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Confirm Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorCropDetails;
