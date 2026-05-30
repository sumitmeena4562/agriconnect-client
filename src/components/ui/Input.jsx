import React, { useState } from 'react';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  wrapperClassName = '',
  type = 'text',
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`mb-4 relative ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        <input 
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`form-input pr-10 ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePassword}
            onMouseDown={(e) => e.preventDefault()} // Prevents the input from losing focus when clicking the eye
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 focus:outline-none transition-colors duration-200 flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;
