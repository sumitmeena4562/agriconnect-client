import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../common/Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [lang, setLang] = useState('EN');
  const [location, setLocation] = useState('Select Mandi');

  const mandis = ['Nashik Mandi', 'Pune Mandi', 'Mumbai (Vashi)', 'Nagpur Mandi', 'Indore Mandi'];
  const categories = [
    { name: 'Fresh Vegetables', icon: 'podcasts' },
    { name: 'Organic Fruits', icon: 'eco' },
    { name: 'Grains & Pulses', icon: 'grass' },
    { name: 'Dairy & Poultry', icon: 'egg' }
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.3, rootMargin: '-60px 0px -60px 0px' });

    setTimeout(() => {
      ['home', 'features', 'how-it-works', 'testimonials', 'news', 'mobile-app', 'faq'].forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
    }, 500);

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'Process', id: 'how-it-works' },
    { label: 'Reviews', id: 'testimonials' },
    { label: 'Updates', id: 'news' },
  ];

  return (
    <>
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${isMenuOpen || scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm'
        : 'bg-white/90'
        }`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex h-[56px] items-center justify-between gap-4">

            {/* Left: Logo & Categories */}
            <div className="flex items-center gap-4 shrink-0">
              <Logo size="md" onClick={() => scrollToSection('home')} />
              
              <div className="hidden lg:block h-6 w-[1px] bg-slate-200" />
              
              <div className="hidden lg:relative lg:block group">
                <button 
                  onMouseEnter={() => setIsCatOpen(true)}
                  className={`text-[13px] font-bold transition-colors flex items-center gap-1.5 ${isCatOpen ? 'text-[#00B464]' : 'text-slate-600 hover:text-[#00B464]'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  Categories
                </button>
                <AnimatePresence>
                  {isCatOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      onMouseLeave={() => setIsCatOpen(false)}
                      className="absolute top-full left-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 py-4 z-50 overflow-hidden"
                    >
                      <div className="px-5 pb-3 mb-2 border-b border-slate-50">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Categories</h3>
                      </div>
                      {categories.map((cat, i) => (
                        <button key={i} className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-all group/item">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:bg-[#00B464] transition-all group-hover/item:shadow-lg group-hover/item:shadow-green-200">
                              <span className="material-symbols-outlined text-[#00B464] text-[20px] group-hover/item:text-white transition-colors">{cat.icon}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-bold text-slate-700 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">{cat.name.split(' ')[1]}</span>
                              <span className="text-[11px] font-medium text-slate-400 group-hover/item:text-[#00B464] transition-colors">Browse all {cat.name.split(' ')[1]}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center: Smart Search (Location + Search) */}
            <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md xl:max-w-lg items-center bg-slate-50 border border-slate-200/60 rounded-xl px-1 py-1 hover:border-[#00B464]/30 focus-within:border-[#00B464]/30 focus-within:bg-white focus-within:shadow-md focus-within:shadow-green-100/50 transition-all h-10 group/search">
              {/* Location Part */}
              <div className="relative shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsLocationOpen(!isLocationOpen); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200/50 rounded-lg transition-colors text-slate-500 hover:text-slate-900 group-focus-within/search:text-slate-900"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00B464]">location_on</span>
                  <span className="text-[12px] font-extrabold truncate max-w-[70px] xl:max-w-[110px]">{location}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <AnimatePresence>
                  {isLocationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 5, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2.5 overflow-hidden"
                      >
                        <div className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Market</div>
                        {mandis.map((m) => (
                          <button key={m} onClick={() => { setLocation(m); setIsLocationOpen(false); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-[12px] font-bold transition-colors flex items-center justify-between group/item"
                          >
                            <span className={location === m ? 'text-[#00B464]' : 'text-slate-600 transition-colors group-hover/item:text-slate-900'}>{m}</span>
                            {location === m && <span className="material-symbols-outlined text-[#00B464] text-[16px]">check_circle</span>}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-[1.5px] h-4 bg-slate-300 mx-1.5" />

              {/* Search Part */}
              <div className="flex flex-1 items-center min-w-0 pr-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px] ml-1 group-focus-within/search:text-[#00B464]">search</span>
                <input type="text" placeholder="Search tomatoes, potatoes, mandis..." 
                  className="bg-transparent border-none focus:outline-none text-[13px] font-semibold text-slate-700 ml-2 w-full placeholder:text-slate-400 placeholder:font-medium"
                />
              </div>
            </div>

            {/* Right: Nav Links | Utils | Actions */}
            <div className="flex items-center gap-3 xl:gap-5 shrink-0">
              <nav className="hidden xl:flex items-center gap-4 xl:gap-5">
                {navLinks.map(link => (
                  <button key={link.id} onClick={() => scrollToSection(link.id)}
                    className={`text-[13px] font-bold transition-colors relative ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-600 hover:text-[#00B464]'}`}
                  >
                    {link.label}
                    {activeSection === link.id && <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-[#00B464] rounded-full transform -translate-x-1/2" />}
                  </button>
                ))}
              </nav>

              <div className="hidden xl:block h-6 w-[1.5px] bg-slate-200" />

              {/* Language Switcher */}
              <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200/60 rounded-lg p-0.5">
                {['EN', 'हिं'].map((l) => (
                  <button key={l} onClick={() => setLang(l)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-black transition-all ${lang === l ? 'bg-white text-[#00B464] shadow-sm' : 'text-slate-400 hover:text-slate-800'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {/* WhatsApp Support */}
              <a href="https://wa.me/91000000000" target="_blank" rel="noreferrer"
                className="hidden lg:flex w-10 h-10 items-center justify-center bg-green-50 text-[#00B464] border border-green-100 rounded-xl hover:bg-[#25D366] hover:text-white transition-all group"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">chat</span>
              </a>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block px-5 py-2.5 text-[13px] font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-white hover:border-slate-300 rounded-xl transition-all">
                  Log in
                </Link>
                <Link to="/farmer-registration" className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#00B464] hover:bg-[#009c56] rounded-xl shadow-lg shadow-green-200/40 transition-all active:scale-[0.97] flex items-center gap-1.5">
                  Join Free
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                <span className="material-symbols-outlined text-slate-700">{isMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[85%] h-full bg-white shadow-2xl overflow-y-auto p-6 pt-10"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size="md" />
                <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100">
                  <span className="material-symbols-outlined text-slate-700">close</span>
                </button>
              </div>

              {/* Mobile Search */}
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3 border border-transparent focus-within:border-[#00B464]/30 focus-within:bg-white transition-all">
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">search</span>
                  <input type="text" placeholder="Search tomatoes, potatoes..." className="bg-transparent border-none focus:outline-none text-[14px] font-medium text-slate-700 ml-3 w-full" />
                </div>
                <div className="flex items-center bg-slate-100 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-[#00B464] text-[20px]">location_on</span>
                  <span className="text-[14px] font-bold text-slate-700 ml-3">{location}</span>
                  <span className="material-symbols-outlined text-slate-400 text-[18px] ml-auto font-light">expand_more</span>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Categories</h3>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat, i) => (
                    <button key={i} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-green-50 transition-colors border border-transparent">
                      <span className="material-symbols-outlined text-[#00B464] mb-2">{cat.icon}</span>
                      <span className="text-[11px] font-bold text-slate-800 text-center">{cat.name.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-1 mb-10">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Explore</h3>
                {navLinks.map(link => (
                  <button key={link.id} onClick={() => scrollToSection(link.id)} className={`block w-full text-left py-3 text-[16px] font-bold ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-700'}`}>
                    {link.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-6 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#00B464]">language</span>
                    <span className="text-[14px] font-bold text-slate-700">Language</span>
                  </div>
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    {['EN', 'हिं'].map(l => (
                      <button key={l} onClick={() => setLang(l)} className={`px-4 py-1 rounded-md text-[11px] font-black ${lang === l ? 'bg-white shadow-sm' : 'text-slate-500'}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 bg-slate-100 text-slate-700 font-bold rounded-xl text-[15px]">Log in</Link>
                <Link to="/farmer-registration" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 bg-[#00B464] text-white font-bold rounded-xl text-[15px]">Get Started</Link>
                <a href="https://wa.me/91000000000" className="flex items-center justify-center gap-2 w-full py-4 bg-[#EAF6ED] text-[#28A745] font-bold rounded-xl text-[15px]">
                  <span className="material-symbols-outlined">chat</span> WhatsApp Support
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;