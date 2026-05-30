import React from 'react';

const Select = ({ 
  label, 
  id, 
  options = [], 
  error, 
  className = '',
  wrapperClassName = '',
  placeholder = "Select an option",
  ...props 
}) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        <select 
          id={id}
          className={`form-input appearance-none pr-10 ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${className}`}
          {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <span className="material-symbols-outlined text-[20px]">expand_more</span>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Select;
