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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/vendor-dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-sm transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Marketplace
      </button>

      <div className="bg-white rounded-[20px] shadow-sm border border-slate-200 overflow-hidden">
        {/* Main Header / Image Section */}
        <div className="relative h-[250px] sm:h-[300px] w-full bg-slate-100">
          {crop.images && crop.images.length > 0 ? (
            <img src={crop.images[0]} alt={crop.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <span className="material-symbols-outlined text-6xl mb-2">image</span>
              <p className="font-medium">No Image Provided</p>
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md border ${
              crop.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {crop.status}
            </span>
            {crop.farmingMethod === 'Organic' && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold shadow-md backdrop-blur-md border bg-white/90 text-green-700 border-green-200 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">eco</span>
                Organic
              </span>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  {crop.category}
                </span>
                <span className="text-slate-400 text-sm font-medium">• Added {new Date(crop.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-2">
                {crop.name}
                {crop.variety && <span className="text-lg font-bold text-slate-400">({crop.variety})</span>}
              </h1>
            </div>
            
            <div className="text-left sm:text-right">
              <p className="text-3xl sm:text-4xl font-black text-primary-600">
                ₹{crop.price}<span className="text-lg text-slate-400 font-bold">/{crop.unit}</span>
              </p>
              <p className="text-sm font-bold text-slate-500 mt-1">
                Total Available: {crop.quantity} {crop.unit}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">
                  {crop.description || "No description provided by the farmer."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">Minimum Order</p>
                  <p className="font-bold text-slate-800">{crop.minOrderQuantity || 1} {crop.unit}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">Quality Grade</p>
                  <p className="font-bold text-slate-800">{crop.qualityGrade || 'Not Specified'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">Harvest Date</p>
                  <p className="font-bold text-slate-800">{crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 mb-1">Logistics</p>
                  <p className="font-bold text-slate-800">{crop.logisticsOption}</p>
                </div>
              </div>
            </div>

            {/* Farmer/Action Sidebar */}
            <div className="space-y-4">
              <div className="bg-primary-50 rounded-xl p-5 border border-primary-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary-500 shadow-sm">
                    <span className="material-symbols-outlined text-2xl">agriculture</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wider">Sold By</p>
                    <p className="font-bold text-slate-800 truncate" title={typeof crop.farmerId === 'object' ? crop.farmerId.name : 'Farmer'}>
                      {typeof crop.farmerId === 'object' ? crop.farmerId.name : 'Verified Farmer'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-[16px] mt-0.5 text-primary-500">location_on</span>
                    <span>{crop.location}</span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full shadow-lg shadow-primary-500/30"
                  onClick={() => setIsOrderModalOpen(true)}
                  disabled={crop.status !== 'Available'}
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  Send Order Request
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
