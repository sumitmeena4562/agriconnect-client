import React from 'react';
import Logo from '../common/Logo';
import Button from '../ui/Button';

const Footer = () => {
    return (
        <footer className="bg-[#0B1527] text-white pt-12 pb-8 px-5 sm:px-6 lg:px-12 relative overflow-hidden border-t border-white/5 font-inter">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-8">
                    
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Logo variant="dark" size="md" />
                        
                        <p className="text-white/40 text-[12.5px] leading-relaxed max-w-[220px] italic">
                            Digital Infrastructure for India's Agricultural Future. Scaling direct-trade for a profitable, middleman-free ecosystem.
                        </p>

                        <div className="flex items-center gap-3">
                            {[
                                { 
                                    name: "Facebook",
                                    path: "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9a3 3 0 0 1 3-3h3v3h-3v3h3l-.5 3H13v6.8c4.56-.93 8-4.96 8-9.8z" 
                                },
                                { 
                                    name: "Twitter",
                                    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                                },
                                {
                                    name: "LinkedIn",
                                    path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.4a2.21 2.21 0 0 0-2.22-2.22c-.76 0-1.4.37-1.78.93V10h-2.2v8.5h2.2v-4.6c0-.6.48-1.07 1.07-1.07s1.07.47 1.07 1.07v4.6h2.2M8 18.5v-8.5H5.8v8.5H8M6.9 8.6c.7 0 1.25-.56 1.25-1.25S7.6 6.1 6.9 6.1s-1.25.56-1.25 1.25s.56 1.25 1.25 1.25z"
                                }
                            ].map((social, i) => (
                                <a key={i} href="#" aria-label={social.name} className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-primary-600 hover:border-primary-600 transition-all duration-300 group">
                                    <svg 
                                        viewBox="0 0 24 24" 
                                        className="w-3.5 h-3.5 fill-white/30 group-hover:fill-white transition-colors"
                                    >
                                        <path d={social.path} />
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {[
                        { title: "COMPANY", links: ["About Us", "Careers", "Press", "Impact"] },
                        { title: "RESOURCES", links: ["Market Rates", "Farming Tips", "Help Center", "Privacy Policy"] }
                    ].map(section => (
                        <div key={section.title}>
                            <h4 className="text-[12px] font-black mb-5 text-white uppercase tracking-[0.1em]">{section.title}</h4>
                            <ul className="space-y-3">
                                {section.links.map(link => (
                                    <li key={link}>
                                        <a href="#" className="text-white/40 hover:text-primary-600 transition-colors text-[13.5px] font-medium block">
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Section */}
                    <div>
                        <h4 className="text-[12px] font-black mb-5 text-white uppercase tracking-[0.1em]">CONTACT</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-white/40 cursor-default group">
                                <span className="material-symbols-outlined text-[18px] group-hover:text-primary-600 transition-colors font-normal">call</span>
                                <span className="text-[13.5px] font-medium">+91 6261 652446</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/40 cursor-default group">
                                <span className="material-symbols-outlined text-[18px] group-hover:text-primary-600 transition-colors font-normal">mail</span>
                                <span className="text-[13.5px] font-medium truncate">agriconnect.tech@gmail.com</span>
                            </div>
                            
                            <Button 
                                href="https://wa.me/916261652446" 
                                variant="dark"
                                size="sm"
                                icon="chat"
                                className="!bg-white/5 !border-white/10 !text-white/70 hover:!bg-white/10 hover:!text-white !py-2 !px-4"
                            >
                                WhatsApp Support
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-white/20 text-[11px] font-medium">
                        © 2026 AgriConnect Technologies Pvt Ltd. All rights reserved.
                    </p>
                    
                    <div className="flex items-center gap-8">
                        {['Terms', 'Privacy', 'Cookies'].map(legal => (
                            <a key={legal} href="#" className="text-white/20 hover:text-primary-600 text-[11px] font-medium transition-colors">
                                {legal}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
