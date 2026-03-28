import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Button = ({ 
    children, 
    onClick, 
    to,
    href,
    type = 'button', 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    className = '',
    icon = null,
    iconPosition = 'right',
    fullWidth = false,
    ...props 
}) => {
    const baseStyles = "relative font-black transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none group overflow-hidden cursor-pointer";
    
    const variants = {
        primary: "bg-primary-600 text-white shadow-lg shadow-green-200/40 hover:bg-primary-700 hover:shadow-xl hover:shadow-green-200/60",
        accent: "bg-accent-500 text-white shadow-lg shadow-amber-200/40 hover:bg-accent-600",
        outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50/30",
        dark: "bg-slate-900 text-white shadow-xl hover:bg-slate-800",
        glass: "bg-white/50 backdrop-blur-md border border-white/60 text-slate-700 hover:bg-white/80 shadow-sm"
    };

    const sizes = {
        sm: "px-4 py-2 text-[10px] rounded-lg tracking-widest uppercase",
        md: "px-6 py-3.5 text-[11px] rounded-xl tracking-[0.15em] uppercase",
        lg: "px-8 py-4 text-[13px] rounded-2xl tracking-[0.2em] uppercase"
    };

    const widthStyle = fullWidth ? "w-full" : "";
    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`;

    const renderIcon = () => {
        if (!icon) return null;
        if (typeof icon === 'string') {
            return (
                <span className={`material-symbols-outlined text-[1.25em] transition-transform ${iconPosition === 'right' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`}>
                    {icon}
                </span>
            );
        }
        return <span className="flex items-center justify-center shrink-0">{icon}</span>;
    };

    const content = (
        <>
            {icon && iconPosition === 'left' && renderIcon()}
            
            <span className="leading-none select-none">{children}</span>

            {icon && iconPosition === 'right' && renderIcon()}
            
            {/* Subtle Shine Effect for Premium Feel */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        </>
    );

    if (to) {
        return (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <Link to={to} className={combinedClassName} {...props}>
                    {content}
                </Link>
            </motion.div>
        );
    }

    if (href) {
        return (
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                <a href={href} className={combinedClassName} {...props}>
                    {content}
                </a>
            </motion.div>
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={combinedClassName}
            {...props}
        >
            {content}
        </motion.button>
    );
};

export default Button;
