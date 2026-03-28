import React from 'react';

const OTPInput = ({ 
    otp, 
    onChange, 
    onKeyDown, 
    otpRefs, 
    className = '',
    error = null,
    ...props 
}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            <div className="grid grid-cols-6 gap-2">
                {otp.map((digit, i) => (
                    <input 
                        key={i}
                        ref={el => { if (otpRefs?.current) otpRefs.current[i] = el; }}
                        type="tel"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => onChange(i, e.target.value)}
                        onKeyDown={(e) => onKeyDown(i, e)}
                        className={`
                            w-full aspect-square bg-slate-50 border-2 border-slate-100 rounded-xl 
                            text-center font-black text-xl text-slate-800 
                            focus:border-primary-500 focus:bg-white 
                            focus:shadow-[0_0_0_4px_rgba(22,163,74,0.06)] 
                            outline-none transition-all duration-300
                            ${error ? 'border-red-300 bg-red-50/30' : ''}
                        `}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        {...props}
                    />
                ))}
            </div>
            {error && <p className="text-red-500 text-[9px] font-bold px-1 uppercase tracking-widest text-center">{error}</p>}
        </div>
    );
};

export default OTPInput;
