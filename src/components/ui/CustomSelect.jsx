import React, { useState, useEffect, useRef } from 'react';

const CustomSelect = ({ value, onChange, options, icon, minWidth = '145px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} style={{ minWidth }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-1.5 px-2.5 h-8 bg-slate-50 border rounded-md transition-all cursor-pointer select-none ${
          isOpen ? 'border-primary-500 bg-white ring-1 ring-primary-100 shadow-xs' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="material-symbols-outlined text-[15px] leading-none text-slate-400 shrink-0">{icon}</span>
          <span className="text-[11px] font-bold text-slate-700 truncate leading-none">{selectedOption.label}</span>
        </div>
        <span className={`material-symbols-outlined text-[14px] leading-none text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-full min-w-[155px] bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-[11px] font-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-primary-50 text-primary-700 font-black' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px] text-primary-600 font-bold">check</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
