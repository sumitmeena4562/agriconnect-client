import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{percentage}%</span>
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
