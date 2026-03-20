import React from 'react';

const Input = ({ 
    label, 
    value, 
    onChange, 
    type = 'text', 
    placeholder = '', 
    name, 
    maxLength, 
    className = '', 
    icon = null,
    prefix = null,
    error = null,
    fullWidth = true,
    autoFocus = false,
    ...props 
}) => {
    const widthStyle = fullWidth ? "w-full" : "";
    
    return (
        <div className={`space-y-1.5 ${widthStyle} ${className}`}>
            {label && (
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 opacity-70">
                    {label}
                </label>
            )}
            <div className={`
                group flex items-center bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 
                focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] 
                transition-all duration-400
                ${error ? 'border-red-300 bg-red-50/30' : ''}
            `}>
                {icon && (
                    <span className="material-symbols-outlined text-slate-300 mr-3 text-lg font-bold">
                        {icon}
                    </span>
                )}
                {prefix && (
                    <span className="font-black text-slate-400 mr-2 border-r-[1.5px] border-slate-200 pr-4 text-[13px] tracking-tighter opacity-60">
                        {prefix}
                    </span>
                )}
                <input 
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="w-full bg-transparent border-none outline-none font-black text-slate-800 text-sm placeholder:text-slate-200 pl-1"
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-[9px] font-bold px-1 uppercase tracking-widest">{error}</p>}
        </div>
    );
};

export default Input;
