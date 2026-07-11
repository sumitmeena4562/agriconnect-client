import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DriverCard = ({ driver, onDelete }) => {
  // Get vehicle-specific styles
  const getVehicleConfig = (type) => {
    switch (type) {
      case 'Bike':
        return {
          bgGradient: 'from-amber-400 to-amber-500',
          badgeText: '🏍️ Bike'
        };
      case 'Tractor':
        return {
          bgGradient: 'from-emerald-400 to-emerald-500',
          badgeText: '🚜 Tractor'
        };
      case 'Mini Truck':
        return {
          bgGradient: 'from-blue-400 to-blue-500',
          badgeText: '🚚 Mini Truck'
        };
      case 'Large Truck':
        return {
          bgGradient: 'from-purple-400 to-purple-500',
          badgeText: '🚛 Large Truck'
        };
      case 'Pickup':
        return {
          bgGradient: 'from-sky-400 to-sky-500',
          badgeText: '🛻 Pickup Vehicle'
        };
      default:
        return {
          bgGradient: 'from-slate-400 to-slate-500',
          badgeText: '🚚 Vehicle'
        };
    }
  };

  const config = getVehicleConfig(driver.vehicleType);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]/65 p-3 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between w-full min-w-0"
    >
      {/* Top Section: Profile & Status & Delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center font-bold text-[12px] text-white shrink-0 select-none shadow-sm`}>
            {driver.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-[12.5px] font-bold text-[var(--color-text-primary)] leading-tight truncate">{driver.name}</h3>
            {/* Clickable Phone Number */}
            <a 
              href={`tel:${driver.phone}`} 
              className="text-[10.5px] font-semibold text-[var(--color-primary-600)] hover:underline flex items-center gap-0.5 mt-0.5"
              onClick={e => e.stopPropagation()}
            >
              <span className="material-symbols-outlined text-[12px] font-semibold">call</span>
              <span>{driver.phone}</span>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Compact Status Badge */}
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 select-none ${
            driver.status === 'Available' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-amber-50 text-amber-700 border border-amber-100'
          }`}>
            <span className={`w-1 h-1 rounded-full ${driver.status === 'Available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>{driver.status}</span>
          </span>

          {/* Delete Action button next to Status */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(driver._id);
              }}
              disabled={driver.status === 'On Delivery'}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50/50 p-1 rounded transition-colors disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center shrink-0 cursor-pointer"
              title={driver.status === 'On Delivery' ? 'Cannot remove busy driver' : 'Remove driver'}
            >
              <span className="material-symbols-outlined text-[15px]">delete</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Compact Details Grid */}
      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10.5px] text-[var(--color-text-secondary)] select-none border-t border-[var(--color-border)]/50 pt-2.5">
        {/* Vehicle Type */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">local_shipping</span>
          <span className="truncate font-semibold text-[var(--color-text-primary)]">{config.badgeText}</span>
        </div>
        
        {/* License Plate */}
        <div className="flex items-center gap-1 min-w-0 justify-end">
          <span className="font-mono text-[8.5px] font-bold text-[var(--color-text-primary)] bg-[var(--color-bg-subtle)] px-1.5 py-0.2 rounded border border-[var(--color-border)]/60 uppercase tracking-wide shrink-0">
            {driver.vehicleNumber}
          </span>
        </div>

        {/* Payload Capacity */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">weight</span>
          <span className="truncate">Cap: <span className="font-semibold text-[var(--color-text-primary)]">{(driver.payloadCapacity || 0).toLocaleString()} kg</span></span>
        </div>

        {/* DL Number */}
        <div className="flex items-center gap-1 min-w-0 justify-end text-right">
          <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">id_card</span>
          <span className="truncate">DL: <span className="font-semibold text-[var(--color-text-primary)] uppercase">{driver.licenseNumber || 'None'}</span></span>
        </div>

        {/* RC Number */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">description</span>
          <span className="truncate">RC: <span className="font-semibold text-[var(--color-text-primary)] uppercase">{driver.rcNumber || 'None'}</span></span>
        </div>

        {/* Insurance Doc Link */}
        {driver.insuranceDoc ? (
          <div className="flex items-center gap-1 min-w-0 justify-end text-right">
            <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">verified_user</span>
            <a 
              href={driver.insuranceDoc.startsWith('http') ? driver.insuranceDoc : `${import.meta.env.VITE_API_URL || ''}${driver.insuranceDoc}`} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[var(--color-primary-600)] hover:underline font-bold text-[9px] truncate"
            >
              View Ins. 📄
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-1 min-w-0 justify-end text-right">
            <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)]/50 shrink-0">verified_user</span>
            <span className="text-[var(--color-text-muted)] text-[9px] italic">No Ins.</span>
          </div>
        )}
      </div>

      {/* Track Active Trip Link (Only if On Delivery) */}
      {driver.status === 'On Delivery' && (
        <Link 
          to={`/farmer-dashboard/tracking?driverId=${driver._id}`}
          onClick={e => e.stopPropagation()}
          className="mt-2.5 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 py-1.5 rounded-lg transition-all animate-pulse shadow-sm"
        >
          <span className="material-symbols-outlined text-[13px] font-bold">navigation</span>
          <span>Track Active Trip 🚚</span>
        </Link>
      )}

      {/* Address (Full Width if present) */}
      {driver.address && (
        <div className="mt-2.5 flex items-center gap-1 text-[9.5px] text-[var(--color-text-secondary)] border-t border-[var(--color-border)]/30 pt-2">
          <span className="material-symbols-outlined text-[13px] text-[var(--color-text-muted)] shrink-0">location_on</span>
          <span className="leading-tight truncate w-full" title={driver.address}>{driver.address}</span>
        </div>
      )}
    </motion.div>
  );
};

export default DriverCard;
