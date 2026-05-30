import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ 
  label, 
  id, 
  error, 
  className = '', 
  wrapperClassName = '',
  labelClassName = '',
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
        <label htmlFor={id} className={`form-label ${labelClassName}`}>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B464] focus:outline-none transition-colors duration-200 flex items-center justify-center p-1.5 rounded-lg hover:bg-green-50"
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={2.5} />
            ) : (
              <Eye size={18} strokeWidth={2.5} />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;
