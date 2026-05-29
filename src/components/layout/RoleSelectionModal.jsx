import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const RoleSelectionModal = ({ isOpen, onClose }) => {
  const roles = [
    {
      id: 'farmer',
      title: 'Farmer',
      desc: 'Sell crops directly at top rates',
      icon: 'agriculture',
      path: '/farmer-registration',
      color: 'text-[#00B464]',
      bg: 'bg-[#ECFDF5]',
      borderHover: 'hover:border-[#00B464]'
    },
    {
      id: 'vendor',
      title: 'Bulk Vendor',
      desc: 'Buy in bulk directly from farms',
      icon: 'storefront',
      path: '/vendor-registration', // You can create this route later
      color: 'text-[#2F80ED]',
      bg: 'bg-[#EFF6FF]',
      borderHover: 'hover:border-[#2F80ED]'
    },
    {
      id: 'customer',
      title: 'Customer',
      desc: 'Buy fresh produce with zero fees',
      icon: 'shopping_basket',
      path: '/customer-registration', // You can create this route later
      color: 'text-[#F59E0B]',
      bg: 'bg-[#FFFBEB]',
      borderHover: 'hover:border-[#F59E0B]'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0A2616]/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-2xl p-5 md:p-6 overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-gray-600">close</span>
            </button>

            <div className="text-center mb-5 mt-1">
              <h2 className="text-xl font-black text-slate-800 mb-1">Join AgriConnect</h2>
              <p className="text-[12px] text-slate-500 font-medium">Choose your role to continue</p>
            </div>

            <div className="space-y-2.5">
              {roles.map((role) => (
                <Link
                  key={role.id}
                  to={role.path}
                  onClick={onClose}
                  className={`group flex items-center p-3 rounded-xl border border-gray-100 transition-all duration-300 ${role.borderHover} hover:shadow-md cursor-pointer bg-white`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${role.bg} ${role.color} transition-transform duration-300 group-hover:scale-110`}>
                    <span className="material-symbols-outlined text-[20px]">{role.icon}</span>
                  </div>
                  <div className="ml-3 flex-1 text-left">
                    <h3 className="text-[14px] font-bold text-slate-800 leading-tight">{role.title}</h3>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-tight">{role.desc}</p>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-gray-300 group-hover:text-slate-800 transition-colors">chevron_right</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-5 text-center text-[10px] text-gray-400 font-medium">
              By joining, you agree to our Terms & Conditions
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RoleSelectionModal;
