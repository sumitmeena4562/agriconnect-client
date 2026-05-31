import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Logo component for AgriConnect
 * @param {Object} props
 * @param {'light'|'dark'} props.variant - Theme variant ('light' for white backgrounds, 'dark' for dark backgrounds)
 * @param {'sm'|'md'|'lg'} props.size - Size variant
 * @param {string} props.className - Additional classes for the container
 * @param {function} props.onClick - Optional click handler (renders as button instead of Link)
 * @param {string} props.color - Brand color override (default: '#00B464' green)
 */
const Logo = ({
  variant = 'light',
  size = 'md',
  className = '',
  onClick,
  color = '#00B464'
}) => {
  const isDark = variant === 'dark';

  const iconSizes = {
    sm: { box: 'w-7 h-7', icon: 'text-[18px]', border: 'rounded-[8px]' },
    md: { box: 'w-9 h-9', icon: 'text-[22px]', border: 'rounded-[10px]' },
    lg: { box: 'w-11 h-11', icon: 'text-[28px]', border: 'rounded-[12px]' }
  };

  const textSizes = {
    sm: 'text-[16px] font-black',
    md: 'text-[22px] font-black',
    lg: 'text-[28px] font-black'
  };

  const currentIcon = iconSizes[size] || iconSizes.md;
  const currentText = textSizes[size] || textSizes.md;

  const content = (
    <div className={`flex items-center gap-2 group ${className}`}>
      <div className={`${currentIcon.box} ${currentIcon.border} flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105 shrink-0`} style={{ backgroundColor: color }}>
        <span className={`material-symbols-outlined text-white leading-none ${currentIcon.icon}`}>eco</span>
      </div>
      <span className={`${currentText} tracking-tight font-heading leading-none relative top-[1px] ${isDark ? 'text-white' : 'text-slate-800'}`}>
        Agri<span style={{ color: color }}>Connect</span>
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
