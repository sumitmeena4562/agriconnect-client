import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            title: "Secure Access",
            description: "Register your verified profile in 2 minutes as a Farmer, Vendor, or Customer.",
            icon: "person_add",
            color: "bg-blue-50 text-blue-600",
            borderColor: "border-blue-100",
            iconColor: "text-blue-500"
        },
        {
            number: "02",
            title: "Market Discovery",
            description: "Post your harvest or discover premium bulk inventory with real-time pricing.",
            icon: "inventory_2",
            color: "bg-amber-50 text-amber-600",
            borderColor: "border-amber-100",
            iconColor: "text-amber-500"
        },
        {
            number: "03",
            title: "Zero-Fee Trading",
            description: "Connect directly. Negotiate, chat, and close high-profit deals without middlemen.",
            icon: "handshake",
            color: "bg-green-50 text-[#00B464]",
            borderColor: "border-green-100",
            iconColor: "text-[#00B464]"
        },
        {
            number: "04",
            title: "Smart Fulfillment",
            description: "From farm-gate to doorstep. Integrated logistics handle every detail for you.",
            icon: "local_shipping",
            color: "bg-purple-50 text-purple-600",
            borderColor: "border-purple-100",
            iconColor: "text-purple-500"
        }
    ];

    return (
        <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-[100px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px] -ml-64 -mb-64" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-xl mx-auto mb-12 sm:mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EEFDF3] rounded-md mb-4"
                    >
                        <span className="material-symbols-outlined text-[#00B464] text-[13px]">route</span>
                        <span className="text-[#00B464] font-bold text-[9px] tracking-[0.1em] uppercase">
                            Simple Process
                        </span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0A2616] mb-4 font-heading tracking-tight"
                    >
                        How <span className="text-[#00B464]">AgriConnect</span> Works
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-500 text-[14px] sm:text-[15px] leading-[1.6]"
                    >
                        We’ve removed the complexity to bring you closer to fresh produce. 
                        Follow these simple steps and start trading today.
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className="group relative"
                        >
                            {/* Connector line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-[44px] left-full w-full h-[2px] border-t-2 border-dashed border-gray-200 z-0 transform -translate-x-4" />
                            )}

                            <div className="relative z-10 global-card group-hover:-translate-y-1.5 h-full flex flex-col glass-shine">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${step.color} flex items-center justify-center mb-5 relative overflow-hidden transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                                    <span className="material-symbols-outlined text-[24px] sm:text-[28px] z-10 icon-pop">{step.icon}</span>
                                </div>

                                {/* Floating Number */}
                                <div className="absolute top-5 right-5 text-[32px] sm:text-[36px] font-black text-gray-100/60 select-none group-hover:text-gray-100 transition-colors">
                                    {step.number}
                                </div>

                                <h3 className="text-[16px] sm:text-[17px] font-black text-[#0A2616] mb-2 group-hover:text-[#00B464] transition-colors duration-300 relative z-10 tracking-tight">
                                    {step.title}
                                </h3>
                                
                                <p className="text-slate-500 text-[12px] sm:text-[13px] leading-[1.5] relative z-10">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-12 sm:mt-16 lg:mt-20 p-6 sm:p-8 lg:p-10 rounded-[28px] sm:rounded-[36px] bg-[#0A2616] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 shadow-[var(--shadow-premium)]"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B464]/20 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2" />
                    
                    <div className="relative z-10 text-center lg:text-left max-w-xl">
                        <h4 className="text-xl sm:text-2xl lg:text-[28px] font-black text-white mb-3 tracking-tight">Scale Your Agricultural Business Today</h4>
                        <p className="text-green-50/80 text-[13px] sm:text-[15px] leading-relaxed">Over 25,000 users are driving the digital revolution in Indian farming. Secure your direct market link and eliminate middlemen forever.</p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                        <Link to="/farmer-registration" className="px-6 py-3.5 bg-[#00B464] hover:bg-[#009c56] text-white font-bold text-[13px] sm:text-[14px] rounded-xl shadow-lg shadow-[#00B464]/20 transition-all hover:-translate-y-1 text-center whitespace-nowrap glass-shine">
                            Join the Network
                        </Link>
                        <Link to="/about" className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-bold text-[13px] sm:text-[14px] rounded-xl backdrop-blur-md transition-all hover:-translate-y-1 text-center border border-white/10 whitespace-nowrap">
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;
