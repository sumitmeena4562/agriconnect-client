import React from 'react';

const PhoneInput = ({ 
  label, 
  id, 
  error, 
  className = '', 
  wrapperClassName = '',
  countryCode,
  onCountryChange,
  ...props 
}) => {
  const countries = [
    { code: '+91', label: 'IN (+91)' },
    { code: '+1', label: 'US (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+971', label: 'UAE (+971)' },
    { code: '+61', label: 'AU (+61)' },
  ];

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="flex relative">
        <select
          value={countryCode}
          onChange={onCountryChange}
          className={`absolute left-0 top-0 bottom-0 z-10 w-[95px] bg-slate-50 border-y border-l ${error ? 'border-red-500' : 'border-[#cbd5e1]'} rounded-l-xl text-slate-800 text-[13px] font-bold px-2 outline-none cursor-pointer focus:ring-2 focus:ring-[#00B464] focus:border-[#00B464] appearance-none text-center`}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.25rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
        >
          {countries.map(c => (
            <option key={c.code} value={c.code}>{c.label}</option>
          ))}
        </select>
        <input 
          id={id}
          className={`form-input pl-[110px] ${error ? 'border-red-500 ring-1 ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
    </div>
  );
};

export default PhoneInput;
