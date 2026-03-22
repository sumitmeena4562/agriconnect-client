import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Logo component for AgriConnect
 * @param {Object} props
 * @param {'light'|'dark'} props.variant - Theme variant ('light' for white backgrounds, 'dark' for dark backgrounds)
 * @param {'sm'|'md'|'lg'} props.size - Size variant
 * @param {string} props.className - Additional classes for the container
 * @param {function} props.onClick - Optional click handler (renders as button instead of Link)
 */
const Logo = ({
  variant = 'light',
  size = 'md',
  className = '',
  onClick
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: { box: 'w-6 h-6', icon: 'text-[14px]', border: 'rounded-md' },
    md: { box: 'w-8 h-8', icon: 'text-[18px]', border: 'rounded-lg' },
    lg: { box: 'w-[38px] h-[38px]', icon: 'text-[24px]', border: 'rounded-[12px]' }
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-xl font-black',
    lg: 'text-[22px] font-black'
  };

  const currentIcon = iconSizes[size] || iconSizes.md;
  const currentText = textSizes[size] || textSizes.md;

  const content = (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div className={`${currentIcon.box} bg-[#00B464] ${currentIcon.border} flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105 shrink-0`}>
        <span className={`material-symbols-outlined text-white ${currentIcon.icon}`}>eco</span>
      </div>
      <span className={`${currentText} tracking-tight font-heading leading-none ${isDark ? 'text-white font-black' : 'text-slate-800 font-black'}`}>
        Agri<span className="text-[#00B464]">Connect</span>
      </span>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="focus:outline-none cursor-pointer">
        {content}
      </button>
    );
  }

  return (
    <Link to="/" className="inline-block">
      {content}
    </Link>
  );
};

export default Logo;
