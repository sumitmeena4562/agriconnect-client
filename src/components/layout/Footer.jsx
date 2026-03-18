import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: "Platform",
            links: [
                { name: "How it Works", to: "#how-it-works" },
                { name: "Market Prices", to: "#trending" },
                { name: "Features", to: "#features" },
                { name: "For Farmers", to: "/farmer-registration" },
                { name: "For Vendors", to: "/vendor-registration" }
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", to: "/about" },
                { name: "Contact", to: "/contact" },
                { name: "Privacy Policy", to: "/privacy" },
                { name: "Terms of Service", to: "/terms" }
            ]
        },
        {
            title: "Support",
            links: [
                { name: "Help Center", to: "/help" },
                { name: "Safety Tips", to: "/safety" },
                { name: "Traceability", to: "/trace" },
                { name: "Logistics", to: "/logistics" }
            ]
        }
    ];

    return (
        <footer className="bg-[#0A2616] text-white pt-16 pb-8 px-5 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background pattern/glow */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#00B464]/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6 group">
                            <div className="w-10 h-10 bg-[#00B464] rounded-xl flex items-center justify-center shadow-lg shadow-[#00B464]/20 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-white text-[24px]">agriculture</span>
                            </div>
                            <span className="text-2xl font-black tracking-tight font-heading">
                                Agri<span className="text-[#00B464]">Connect</span>
                            </span>
                        </Link>
                        
                        <p className="text-green-50/60 text-[15px] leading-relaxed max-w-sm mb-8">
                            India's first unified platform connecting farmers directly with vendors and customers. Empowering the agriculture ecosystem with technology and transparency.
                        </p>

                        <div className="flex items-center gap-4">
                            {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#00B464] hover:border-[#00B464] transition-all duration-300 group">
                                    <span className={`material-symbols-outlined text-white/50 group-hover:text-white text-[20px] transition-colors`}>
                                        {social === 'twitter' ? 'X' : social}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {sections.map(section => (
                        <div key={section.title}>
                            <h4 className="text-[16px] font-bold mb-6 text-white uppercase tracking-wider">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map(link => (
                                    <li key={link.name}>
                                        <Link to={link.to} className="text-green-50/50 hover:text-[#00B464] transition-colors text-[14px] flex items-center gap-1.5 group">
                                            <span className="w-1.5 h-[1.5px] bg-[#00B464] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-green-50/30 text-[13px]">
                        © {currentYear} AgriConnect. All rights reserved.
                    </p>
                    
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-green-50/30 hover:text-white text-[13px] transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="text-green-50/30 hover:text-white text-[13px] transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
