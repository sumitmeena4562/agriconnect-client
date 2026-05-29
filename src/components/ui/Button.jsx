import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  type = 'button',
  disabled = false,
  ...props 
}) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <button 
      type={type} 
      className={`${baseClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
