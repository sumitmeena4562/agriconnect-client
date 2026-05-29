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
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

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
    <div>
      <div className="flex gap-4 justify-center">
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
            className={`w-[52px] h-[52px] text-center text-2xl font-black rounded-xl border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-[#00B464] focus:ring-2 focus:ring-[#00B464]'} outline-none shadow-sm transition-all bg-white text-slate-800`}
          />
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-3 text-center font-bold">{error}</p>}
    </div>
  );
};

export default OtpInput;
