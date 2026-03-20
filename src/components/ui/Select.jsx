import React from 'react';

const Select = ({ 
    label, 
    value, 
    onChange, 
    options = [], 
    name, 
    placeholder = 'Choose Option', 
    disabled = false, 
    className = '', 
    error = null,
    fullWidth = true,
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
            <div className="relative group/select">
                <select 
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`
                        w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 
                        font-black text-slate-800 text-sm 
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
                <span className="material-symbols-outlined text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within/select:rotate-180 transition-transform font-bold text-lg">
                    expand_more
                </span>
            </div>
            {error && <p className="text-red-500 text-[9px] font-bold px-1 uppercase tracking-widest">{error}</p>}
        </div>
    );
};

export default Select;
