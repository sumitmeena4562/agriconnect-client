import React, { forwardRef } from 'react';

const Select = forwardRef(({ 
    label, 
    value, 
    onChange, 
    options = [], 
    name, 
    id,
    placeholder = 'Choose Option', 
    disabled = false, 
    className = '', 
    error = null,
    fullWidth = true,
    ...props 
}, ref) => {
    const widthStyle = fullWidth ? "w-full" : "";
    const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
        <div className={`space-y-1 ${widthStyle} ${className}`}>
            {label && (
                <label htmlFor={selectId} className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 opacity-70">
                    {label}
                </label>
            )}
            <div className="relative group/select">
                <select 
                    ref={ref}
                    id={selectId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-1.5 
                        font-black text-slate-800 text-[13px] 
                        appearance-none focus:border-primary-500 
                        transition-all outline-none 
                        disabled:opacity-30
                        ${error ? 'border-red-300 bg-red-50/30' : ''}
                    `}
                    {...props}
                >
                    <option value="">{placeholder}</option>
                    {options.map((opt, i) => (
                        <option key={i} value={typeof opt === 'string' ? opt : opt.value}>
                            {typeof opt === 'string' ? opt : opt.label}
                        </option>
                    ))}
                </select>
                <span className="material-symbols-outlined text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within/select:rotate-180 transition-transform font-bold text-base">
                    expand_more
                </span>
            </div>
            {error && <p className="text-red-500 text-[9px] font-bold px-1 uppercase tracking-widest">{error}</p>}
        </div>
    );
});

export default Select;
