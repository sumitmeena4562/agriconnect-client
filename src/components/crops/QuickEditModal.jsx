import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const QuickEditModal = ({ isOpen, onClose, crop, onSuccess }) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (crop) {
      setQuantity(crop.quantity || '');
      setPrice(crop.price || '');
    }
  }, [crop]);

  if (!isOpen || !crop) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quantity || quantity < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }
    if (!price || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.put(`/crops/${crop._id}`, {
        quantity: Number(quantity),
        price: Number(price)
      });
      toast.success(res.data.message || 'Stock & Price updated!');
      if (onSuccess) onSuccess(res.data.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
            <div>
              <h3 className="text-[14px] font-black text-slate-900 leading-tight">Quick Update Stock & Price</h3>
              <p className="text-[10.5px] font-medium text-slate-500 truncate max-w-[200px]">{crop.name}</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              Available Stock ({crop.unit || 'Kg'})
            </label>
            <div className="relative">
              <input 
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-800 focus:bg-white focus:border-primary-500 focus:outline-none transition-all"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-slate-400">{crop.unit || 'Kg'}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              Price per {crop.unit || 'Kg'} (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-400">₹</span>
              <input 
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 45"
                className="w-full h-9 pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-800 focus:bg-white focus:border-primary-500 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-xl border border-slate-200 text-slate-600 font-bold text-[11px] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-9 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-black text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Updating...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default QuickEditModal;
