import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const DateInput = ({ label, value, onChange, error, success, colors, id }) => {
    const activeColors = colors || { text: 'text-primary-500', bg: 'bg-primary-500', lightBg: 'bg-primary-50' };
    
    // Split value (YYYY-MM-DD) into segments
    const dateParts = value ? value.split('-') : ['', '', '']; 
    const year = dateParts[0] || '';
    const month = dateParts[1] || '';
    const day = dateParts[2] || '';

    const dayRef = useRef();
    const monthRef = useRef();
    const yearRef = useRef();

    const handleSegmentChange = (e, segment) => {
        let val = e.target.value.replace(/\D/g, '');
        
        let newDay = day;
        let newMonth = month;
        let newYear = year;

        if (segment === 'day') {
            if (val.length <= 2) {
                newDay = val;
                if (val.length === 2) monthRef.current.focus();
            }
        } else if (segment === 'month') {
            if (val.length <= 2) {
                newMonth = val;
                if (val.length === 2) yearRef.current.focus();
            }
        } else if (segment === 'year') {
            if (val.length <= 4) {
                newYear = val;
            }
        }

        // Format back to YYYY-MM-DD
        const formattedDate = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
        onChange({ target: { name: 'dob', value: formattedDate } });
    };

    const handleKeyDown = (e, segment) => {
        if (e.key === 'Backspace' && !e.target.value) {
            if (segment === 'month') dayRef.current.focus();
            if (segment === 'year') monthRef.current.focus();
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
                    <motion.span 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className={`material-symbols-outlined ${activeColors.text} text-sm font-black`}
                    >
                        check_circle
                    </motion.span>
                )}
            </div>

            <div className={`
                flex items-center bg-white border rounded-xl px-4 py-1.5 
                transition-all duration-300 min-h-[50px]
                ${error ? 'border-red-200 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]' : 'border-slate-200 focus-within:border-primary-500 focus-within:shadow-[0_0_15px_-3px_rgba(0,210,120,0.12)]'}
            `}>
                <span className={`material-symbols-outlined mr-3 text-base font-bold text-slate-300`}>
                    calendar_today
                </span>

                <div className="flex items-center flex-1 gap-1">
                    <input 
                        ref={dayRef}
                        type="text"
                        placeholder="DD"
                        value={day}
                        onChange={(e) => handleSegmentChange(e, 'day')}
                        onKeyDown={(e) => handleKeyDown(e, 'day')}
                        className="w-8 bg-transparent border-none outline-none font-bold text-slate-800 text-[14px] text-center placeholder:text-slate-300"
                    />
                    <span className="text-slate-300 font-bold">/</span>
                    <input 
                        ref={monthRef}
                        type="text"
                        placeholder="MM"
                        value={month}
                        onChange={(e) => handleSegmentChange(e, 'month')}
                        onKeyDown={(e) => handleKeyDown(e, 'month')}
                        className="w-8 bg-transparent border-none outline-none font-bold text-slate-800 text-[14px] text-center placeholder:text-slate-300"
                    />
                    <span className="text-slate-300 font-bold">/</span>
                    <input 
                        ref={yearRef}
                        type="text"
                        placeholder="YYYY"
                        value={year}
                        onChange={(e) => handleSegmentChange(e, 'year')}
                        onKeyDown={(e) => handleKeyDown(e, 'year')}
                        className="w-12 bg-transparent border-none outline-none font-bold text-slate-800 text-[14px] text-center placeholder:text-slate-300"
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-[10px] font-bold px-1 uppercase">{error}</p>}
        </div>
    );
};

export default DateInput;
