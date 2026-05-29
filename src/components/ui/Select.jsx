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
      <select 
        id={id}
        className={`form-input ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${className}`}
        {...props}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Select;
