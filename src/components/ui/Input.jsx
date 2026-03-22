import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
    label, 
    value, 
    onChange, 
    type = 'text', 
    placeholder = '', 
    name, 
    id,
    maxLength, 
    className = '', 
    icon = null,
    prefix = null,
    error = null,
    fullWidth = true,
    autoFocus = false,
    ...props 
}, ref) => {
    const widthStyle = fullWidth ? "w-full" : "";
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    return (
        <div className={`space-y-1 ${widthStyle} ${className}`}>
            {label && (
                <label htmlFor={inputId} className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 opacity-70">
                    {label}
                </label>
            )}
            <div className={`
                group flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-1.5 
                focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] 
                transition-all duration-300
                ${error ? 'border-red-300 bg-red-50/30' : ''}
            `}>
                {icon && (
                    <span className="material-symbols-outlined text-slate-300 mr-2.5 text-base font-bold">
                        {icon}
                    </span>
                 )}
                {prefix && (
                    <span className="font-black text-slate-400 mr-2 border-r-[1.5px] border-slate-200 pr-3 text-[12px] tracking-tighter opacity-60">
                        {prefix}
                    </span>
                )}
                <input 
                    ref={ref}
                    type={type}
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full bg-transparent border-none outline-none font-black text-slate-800 text-[13px] placeholder:text-slate-200 pl-1"
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-[9px] font-bold px-1 uppercase tracking-widest">{error}</p>}
        </div>
    );
});

export default Input;
