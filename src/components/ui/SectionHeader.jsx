import React from 'react';
import { motion } from 'framer-motion';
import Badge from './Badge';

const SectionHeader = ({ 
    badge, 
    title, 
    description, 
    badgeVariant = 'primary',
    badgeIcon = null,
    badgeClassName = '',
    centered = true,
    className = ''
}) => {
    return (
        <div className={`${centered ? 'text-center mx-auto' : ''} max-w-xl mb-12 sm:mb-16 ${className}`}>
            {badge && (
                <Badge 
                    variant={badgeVariant} 
                    icon={badgeIcon}
                    className={`mb-4 ${badgeClassName}`}
                >
                    {badge}
                </Badge>
            )}
            
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2616] mb-4 font-heading tracking-tight leading-tight"
            >
                {title}
            </motion.h2>
            
            {description && (
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-slate-500 text-[14px] sm:text-[15px] leading-[1.6]"
                >
                    {description}
                </motion.p>
            )}
        </div>
    );
};

export default SectionHeader;
