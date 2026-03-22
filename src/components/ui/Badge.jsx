import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    className = '',
    icon = null,
    animate = true,
    ...props 
}) => {
    const baseStyles = "inline-flex items-center gap-1.5 font-black uppercase tracking-widest rounded-full border transition-all duration-300";
    
    const variants = {
        primary: "bg-primary-50 text-primary-700 border-primary-100",
        accent: "bg-accent-50 text-accent-700 border-accent-100",
        dark: "bg-slate-900 text-white border-transparent",
        slate: "bg-slate-50 text-slate-500 border-slate-100 opacity-60",
        success: "bg-emerald-50 text-emerald-700 border-emerald-100"
    };

    const sizes = {
        xs: "px-1.5 py-0.5 text-[6px]",
        sm: "px-2 py-0.5 text-[7px]",
        md: "px-3 py-1.5 text-[9px]",
        lg: "px-4 py-2 text-[10px]"
    };

    const content = (
        <div className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {variant === 'primary' && animate && (
                <span className="w-1.5 h-1.5 bg-primary-600 rounded-full animate-pulse" />
            )}
            {icon && (
                <span className="material-symbols-outlined text-[1.2em] font-bold">
                    {icon}
                </span>
            )}
            <span>{children}</span>
        </div>
    );

    if (animate && variant !== 'primary') {
        return (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                {content}
            </motion.div>
        );
    }

    return content;
};

export default Badge;
