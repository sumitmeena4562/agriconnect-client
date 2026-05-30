import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  icon = "warning",
  isDanger = false,
  isLoading = false
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          ></motion.div>
          
          {/* Modal Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden p-6"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${isDanger ? 'bg-red-50' : 'bg-primary-50'}`}>
              <span className={`material-symbols-outlined text-[24px] ${isDanger ? 'text-red-500' : 'text-primary-600'}`}>
                {icon}
              </span>
            </div>
            
            <h3 className="text-[18px] font-black text-slate-800 text-center mb-2">{title}</h3>
            
            {description && (
              <p className="text-[13px] text-slate-500 text-center mb-6 leading-relaxed">
                {description}
              </p>
            )}
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isDanger 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                    : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/20'
                } disabled:opacity-70 disabled:cursor-wait`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
