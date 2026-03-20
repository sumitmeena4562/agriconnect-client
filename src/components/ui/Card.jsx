import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
    children, 
    className = '', 
    hover = true, 
    animate = true,
    padding = 'p-6',
    variant = 'white',
    ...props 
}) => {
    const variants = {
        white: "bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        slate: "bg-slate-50 border border-slate-200",
        dark: "bg-slate-900 border border-slate-800 text-white shadow-2xl",
        glass: "bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl"
    };

    const hoverStyle = hover ? "hover:shadow-[0_20px_40px_rgba(0,180,100,0.08)] hover:-translate-y-1.5 transition-all duration-300" : "";
    
    const Component = animate ? motion.div : 'div';
    const animationProps = animate ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    } : {};

    return (
        <Component
            className={`rounded-[24px] overflow-hidden ${variants[variant]} ${padding} ${hoverStyle} ${className}`}
            {...animationProps}
            {...props}
        >
            {children}
        </Component>
    );
};

export default Card;
