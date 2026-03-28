import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DateInput = ({ label, value, onChange, error, success, colors }) => {
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    
    // Internal display state (DD / MM / YYYY)
    const [displayValue, setDisplayValue] = useState('');

    // Sync internal state with parent value (YYYY-MM-DD)
    useEffect(() => {
        if (value && value.length === 10) {
            const [y, m, d] = value.split('-');
            setDisplayValue(`${d} / ${m} / ${y}`);
        } else if (!value) {
            setDisplayValue('');
        }
    }, [value]);

    const handleInput = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 8) val = val.slice(0, 8);
        
        let formatted = '';
        if (val.length > 4) {
            formatted = `${val.slice(0, 2)} / ${val.slice(2, 4)} / ${val.slice(4)}`;
        } else if (val.length > 2) {
            formatted = `${val.slice(0, 2)} / ${val.slice(2)}`;
        } else {
            formatted = val;
        }
        
        setDisplayValue(formatted);

        // Emit to parent only if complete or empty
        if (val.length === 8) {
            const d = val.slice(0, 2);
            const m = val.slice(2, 4);
            const y = val.slice(4);
            onChange({ target: { name: 'dob', value: `${y}-${m}-${d}` } });
        } else if (val.length === 0) {
            onChange({ target: { name: 'dob', value: '' } });
        }
    };

    return (
        <div className="space-y-1.5 w-full">
            <div className="flex items-center justify-between px-1">
                {label && (
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-60">
                        {label}
                    </label>
                )}
                {success && !error && (
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className={`w-4 h-4 ${activeColors.bg} text-white rounded-full flex items-center justify-center border border-white shadow-sm`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </motion.div>
                )}
            </div>

            <div className={`
                flex items-center bg-white border rounded-xl px-4 py-1.5 
                transition-all duration-500 min-h-[50px]
                ${error ? 'border-red-200 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]' : 'focus-within:border-primary-400 focus-within:shadow-[0_0_15px_-3px_rgba(0,210,120,0.12)] border-slate-200'}
            `}>
                <span className={`material-symbols-outlined mr-3 text-base text-slate-300`}>
                    event
                </span>

                <input 
                    type="text"
                    inputMode="numeric"
                    placeholder="DD / MM / YYYY"
                    value={displayValue}
                    onChange={handleInput}
                    className="flex-1 bg-transparent border-none outline-none font-bold text-slate-800 text-[14px] placeholder:text-slate-300 tracking-wider"
                />
            </div>
            {error && <p className="text-red-500 text-[10px] font-black px-1 uppercase tracking-tight">{error}</p>}
        </div>
    );
};

export default DateInput;
