import React from 'react';
import { motion } from 'framer-motion';

const TrustLogos = () => {
    const logos = [
        { name: 'Startup India', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f0/Startup_India_logo.png/320px-Startup_India_logo.png' },
        { name: 'Digital India', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Digital_India_logo.svg/320px-Digital_India_logo.svg.png' },
        { name: 'ICAR', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Indian_Council_of_Agricultural_Research_Logo.svg/180px-Indian_Council_of_Agricultural_Research_Logo.svg.png' },
        { name: 'Zee News', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Zee_News_Logo.svg/200px-Zee_News_Logo.svg.png' },
        { name: 'NDTV', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/NDTV_logo.svg/200px-NDTV_logo.svg.png' }
    ];

    return (
        <section className="py-12 bg-white border-y border-slate-50">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
                <p className="text-center text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">
                    Empowering Indian Agriculture — As Recognized By
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity duration-500 grayscale hover:grayscale-0">
                    {logos.map((logo, i) => (
                        <motion.div
                            key={logo.name}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="h-8 sm:h-10 md:h-12 flex items-center"
                        >
                            <img 
                                src={logo.url} 
                                alt={logo.name} 
                                className="h-full w-auto object-contain cursor-help"
                                title={logo.name}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustLogos;
