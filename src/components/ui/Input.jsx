import React from 'react';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  wrapperClassName = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <input 
        id={id}
        className={`form-input ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;
