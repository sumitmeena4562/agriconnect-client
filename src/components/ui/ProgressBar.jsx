import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center text-[12px] font-bold text-slate-400 mb-2.5">
        <span className="uppercase tracking-wider">Step {currentStep} of {totalSteps}</span>
        <span className="text-[#00B464]">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
