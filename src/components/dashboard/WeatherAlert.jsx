import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

/**
 * WeatherAlert Component
 * A clean, integrated alert system for critical weather updates.
 * Designed for simplicity and theme alignment.
 */
const WeatherAlert = ({ 
    type = 'rain', 
    title = 'Weather Update', 
    location = 'Your Area', 
    message = 'Please check conditions.', 
    intensity = 'Moderate',
    className = '' 
}) => {
    // Icon Mapping
    const icons = {
        rain: { name: 'rainy', color: 'text-info-500', bg: 'bg-info-50' },
        heat: { name: 'sunny', color: 'text-amber-500', bg: 'bg-amber-50' },
        wind: { name: 'air', color: 'text-slate-500', bg: 'bg-slate-50' },
        storm: { name: 'thunderstorm', color: 'text-rose-500', bg: 'bg-rose-50' }
    };

    const currentIcon = icons[type] || icons.rain;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-2 ${className}`}
        >
            <Card 
                className="!rounded-[32px] border border-primary-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
                padding="p-4 sm:p-6 lg:p-7"
            >
                {/* Subtle Theme Accent */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500" />
                
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="flex-1 flex items-center gap-5 sm:gap-7">
                        {/* Clean Weather Icon Circle */}
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[24px] ${currentIcon.bg} flex items-center justify-center ${currentIcon.color} shrink-0 shadow-inner`}>
                            <span className="material-symbols-outlined text-[32px] sm:text-[36px]">{currentIcon.name}</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <Badge variant="primary" size="xs" className="!bg-primary-50 !text-primary-600 !border-primary-100 !px-2.5 !py-0.5 !font-black !tracking-widest">ALERT</Badge>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{location}</span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
                                {title} <span className="text-primary-500 mx-1">•</span> <span className="text-slate-500 font-medium normal-case">{intensity}</span>
                            </h2>
                            <p className="text-[11px] sm:text-xs font-medium text-slate-500 leading-relaxed max-w-2xl">{message}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:border-slate-100 lg:pl-8">
                        <Button variant="primary" size="sm" className="flex-1 lg:flex-none !rounded-xl !py-2.5 !px-6 !text-[11px] font-black tracking-widest shadow-sm">VIEW DETAILS</Button>
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none !rounded-xl !bg-slate-50 !border-transparent !text-slate-500 !py-2.5 !px-6 !text-[11px] font-black tracking-widest hover:!bg-slate-100">DISMISS</Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default WeatherAlert;
