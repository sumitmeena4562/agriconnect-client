import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            number: "01",
            title: "Join the Network",
            description: "Register as a Farmer, Vendor, or Customer in just 2 minutes.",
            icon: "person_add",
            color: "bg-blue-50 text-blue-600",
            borderColor: "border-blue-100",
            iconColor: "text-blue-500"
        },
        {
            number: "02",
            title: "List / Browse",
            description: "Farmers list produce, while Vendors & Customers browse fresh stock.",
            icon: "inventory_2",
            color: "bg-amber-50 text-amber-600",
            borderColor: "border-amber-100",
            iconColor: "text-amber-500"
        },
        {
            number: "03",
            title: "Direct Connect",
            description: "No middlemen. Chat directly with buyers or sellers and finalize deals.",
            icon: "handshake",
            color: "bg-green-50 text-[#00B464]",
            borderColor: "border-green-100",
            iconColor: "text-[#00B464]"
        },
        {
            number: "04",
            title: "Fast Delivery",
            description: "Enjoy fast, reliable logistics right from the farm to your doorstep.",
            icon: "local_shipping",
            color: "bg-purple-50 text-purple-600",
            borderColor: "border-purple-100",
            iconColor: "text-purple-500"
        }
    ];

    return (
        <section id="how-it-works" className="py-20 lg:py-32 bg-white relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50/50 rounded-full blur-[100px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-[100px] -ml-64 -mb-64" />

            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full mb-4"
                    >
                        <span className="w-1.5 h-1.5 bg-[#00B464] rounded-full" />
                        <span className="text-[#00B464] font-bold text-[10px] tracking-widest uppercase">Simple Process</span>
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl sm:text-4xl lg:text-[42px] font-black text-slate-900 mb-6 font-heading tracking-tight leading-tight"
                    >
                        How <span className="text-[#00B464]">AgriConnect</span> Works
                    </motion.h2>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-slate-600 text-lg sm:text-[19px] leading-relaxed"
                    >
                        We’ve removed the complexity to bring you closer to fresh produce. 
                        Follow these simple steps and start trading today.
                    </motion.p>
                </div>

                {/* Steps Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="group relative"
                        >
                            {/* Connector line for desktop */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-12 left-full w-full h-[2px] bg-dashed border-t-2 border-dashed border-slate-100 z-0 transform -translate-x-6" />
                            )}

                            <div className="relative z-10 bg-white p-2 rounded-[32px] transition-all duration-500 group-hover:transform group-hover:-translate-y-2">
                                <div className={`aspect-square w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ${step.color} flex items-center justify-center mb-8 relative shadow-lg shadow-black/[0.02] overflow-hidden`}>
                                    {/* Glass reflection effect */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    
                                    <span className="material-symbols-outlined text-[32px] sm:text-[40px] z-10">{step.icon}</span>
                                    
                                    {/* Floating Number */}
                                    <div className="absolute -top-2 -right-2 bg-white w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black text-slate-900 shadow-md border border-slate-50">
                                        {step.number}
                                    </div>
                                </div>

                                <h3 className="text-xl sm:text-[22px] font-black text-slate-900 mb-3 group-hover:text-[#00B464] transition-colors duration-300">
                                    {step.title}
                                </h3>
                                
                                <p className="text-slate-500 text-[15px] leading-[1.6]">
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
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mt-20 lg:mt-32 p-8 lg:p-12 rounded-[40px] bg-[#0A2616] relative overflow-hidden text-center lg:text-left lg:flex items-center justify-between gap-8"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B464]/20 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2" />
                    
                    <div className="relative z-10">
                        <h4 className="text-2xl sm:text-3xl font-black text-white mb-4">Ready to Grow Your Agriculture Business?</h4>
                        <p className="text-green-100/70 text-lg max-w-xl">Join 15,000+ users already transforming the face of Indian Agriculture.</p>
                    </div>

                    <div className="relative z-10 mt-8 lg:mt-0 flex flex-wrap justify-center lg:justify-end gap-4">
                        <Link to="/farmer-registration" className="px-8 py-4 bg-[#00B464] hover:bg-[#009c56] text-white font-bold rounded-2xl shadow-xl shadow-green-900/20 transition-all hover:scale-[1.03] active:scale-95">
                            Get Started Now
                        </Link>
                        <Link to="/about" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md transition-all">
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default HowItWorks;
