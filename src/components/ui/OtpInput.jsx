import React, { useState, useRef, useEffect } from 'react';

const OtpInput = ({ length = 4, value, onChange, error }) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    // If value prop changes externally (e.g., reset)
    if (value === "") {
      setOtp(new Array(length).fill(""));
    }
  }, [value, length]);

  const handleChange = (element, index) => {
    const val = element.value;
    if (isNaN(val)) return;

    const newOtp = [...otp];
    // Take only the last character in case they paste multiple digits into one box (though onPaste handles real pastes)
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus next input
    if (val && index < length - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedDataRaw = e.clipboardData.getData("text/plain");
    
    // Remove any spaces, newlines, or non-digits that might have been accidentally copied from email
    const digitsOnly = pastedDataRaw.replace(/\D/g, "");
    
    if (!digitsOnly) return;
    
    const pastedData = digitsOnly.slice(0, length);

    const pastedArray = pastedData.split("");
    const newOtp = [...otp];
    pastedArray.forEach((char, i) => {
      newOtp[i] = char;
      if (inputRefs.current[i]) {
        inputRefs.current[i].value = char;
      }
    });
    
    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus on the last filled input
    const focusIndex = Math.min(pastedArray.length, length - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between gap-1.5 sm:gap-3 w-full max-w-sm mx-auto">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`flex-1 w-full min-w-0 max-w-[3.5rem] h-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-[var(--form-border-radius)] border ${error ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : 'border-[#cbd5e1] focus:border-primary-500 focus:ring-2 focus:ring-primary-500 bg-white'} outline-none shadow-sm transition-all text-slate-800`}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-3 text-center font-bold">{error}</p>}
    </div>
  );
};

export default OtpInput;
