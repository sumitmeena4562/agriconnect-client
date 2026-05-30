import React from 'react';

const StatCard = ({ title, value, icon, trend, trendLabel, color = 'primary' }) => {
  // Define color variations based on the global theme
  const colorStyles = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-orange-50 text-orange-500',
    info: 'bg-blue-50 text-blue-500',
    danger: 'bg-red-50 text-red-500',
  };

  const currentStyle = colorStyles[color] || colorStyles.primary;

  return (
    <div className="global-card flex flex-col justify-between group glass-shine cursor-pointer !p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-[11px] font-bold text-slate-500 mb-0.5">{title}</p>
          <h3 className="text-[18px] sm:text-xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentStyle} transition-transform duration-300 group-hover:scale-110 shrink-0`}>
          <span className="material-symbols-outlined text-[18px] icon-pop">{icon}</span>
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`flex items-center text-[10px] font-bold ${trend > 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'} px-1.5 py-0.5 rounded-sm`}>
            <span className="material-symbols-outlined text-[12px]">{trend > 0 ? 'trending_up' : 'trending_down'}</span>
            {Math.abs(trend)}%
          </span>
          <span className="text-[10px] font-medium text-slate-400 leading-none pt-0.5">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
