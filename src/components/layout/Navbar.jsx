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
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
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
      <header className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
        ? 'py-2 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]'
        : 'py-4 bg-transparent'
        }`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[56px] items-center justify-between gap-4">

            {/* Left: Logo */}
            <div className="flex items-center gap-3 lg:gap-8 shrink-0">
              <Logo size="md" onClick={() => scrollToSection('home')} className="hover:opacity-80 transition-opacity" />
              
              <div className="hidden lg:block h-6 w-[1px] bg-slate-200" />
              
              {/* Desktop Categories Dropdown */}
              <div className="hidden lg:relative lg:block group">
                <button 
                  onMouseEnter={() => setIsCatOpen(true)}
                  className={`text-[13px] font-black transition-colors flex items-center gap-1.5 ${isCatOpen ? 'text-[#00B464]' : 'text-slate-600 hover:text-[#00B464]'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  Categories
                </button>
                <AnimatePresence>
                  {isCatOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      onMouseLeave={() => setIsCatOpen(false)}
                      className="absolute top-full left-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 py-4 z-50 overflow-hidden"
                    >
                      <div className="px-5 pb-3 mb-2 border-b border-slate-50">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Categories</h3>
                      </div>
                      {categories.map((cat, i) => (
                        <button key={i} className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-all group/item text-slate-600 hover:text-slate-900 border-l-4 border-transparent hover:border-[#00B464]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover/item:bg-[#00B464] transition-all group-hover/item:shadow-lg group-hover/item:shadow-green-200">
                              <span className="material-symbols-outlined text-[#00B464] text-[20px] group-hover/item:text-white transition-colors">{cat.icon}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-black uppercase tracking-tight">{cat.name.split(' ')[1]}</span>
                              <span className="text-[11px] font-medium text-slate-400 group-hover/item:text-[#00B464]">Browse all</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Center: Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md xl:max-w-lg items-center bg-slate-50 border border-slate-200/60 rounded-xl px-1 py-1 hover:border-[#00B464]/30 transition-all h-10">
              <div className="relative shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsLocationOpen(!isLocationOpen); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00B464]">location_on</span>
                  <span className="text-[12px] font-black hidden lg:block">{location}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <AnimatePresence>
                   {isLocationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 py-2"
                      >
                        {mandis.map((m) => (
                           <button key={m} onClick={() => { setLocation(m); setIsLocationOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-green-50 text-[12px] font-bold flex items-center justify-between">
                             <span className={location === m ? 'text-[#00B464]' : 'text-slate-600'}>{m}</span>
                             {location === m && <span className="material-symbols-outlined text-[#00B464] text-[16px]">check_circle</span>}
                           </button>
                        ))}
                      </motion.div>
                    </>
                   )}
                </AnimatePresence>
              </div>
              <div className="w-[1.5px] h-4 bg-slate-200 mx-1.5" />
              <div className="flex items-center flex-1 min-w-0 pr-3">
                <span className="material-symbols-outlined text-slate-400 text-[18px] ml-1">search</span>
                <input type="text" placeholder="Search tomato, potato..." className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-slate-700 ml-2 w-full" />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 lg:gap-5 shrink-0">
              <nav className="hidden xl:flex items-center gap-8">
                {navLinks.map(link => (
                  <button key={link.id} onClick={() => scrollToSection(link.id)}
                    className={`text-[13px] font-black transition-all relative py-2 group ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {activeSection === link.id && (
                      <motion.span layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00B464] rounded-full" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-5 py-2.5 text-[13px] font-black text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">Log in</Link>
                <Link to="/farmer-registration" className="px-5 py-2.5 text-[13px] font-black text-white bg-[#00B464] rounded-xl shadow-lg shadow-green-200/40 hover:bg-[#009c56] transition-all">Join Free</Link>
              </div>

              {/* Mobile Menu Button - THE ONLY BUTTON ON MOBILE RIGHT SIDE */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#0A2616] text-[#00B464] shadow-lg shadow-green-900/10 active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-[28px]">{isMenuOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[150] md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A2616]/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 w-[85%] h-full bg-white/95 backdrop-blur-2xl shadow-2xl overflow-y-auto p-6 flex flex-col pt-12"
            >
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                <Logo size="md" />
                <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Search in Menu for Mobile */}
              <div className="mb-8 p-1 bg-slate-100 rounded-2xl flex items-center px-4 h-14 border border-slate-200">
                  <span className="material-symbols-outlined text-[#00B464]">search</span>
                  <input type="text" placeholder="Search Mandi Rates..." className="bg-transparent border-none focus:outline-none text-[15px] font-bold ml-3 w-full" />
              </div>

              {/* Mandi Selection in Menu */}
              <div className="mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Market Selection</h3>
                <div className="flex flex-wrap gap-2">
                   {mandis.map(m => (
                     <button key={m} onClick={() => { setLocation(m); setIsMenuOpen(false); }} className={`px-4 py-2.5 rounded-xl text-[12px] font-black border transition-all ${location === m ? 'bg-[#00B464] text-white border-[#00B464]' : 'bg-white text-slate-600 border-slate-200'}`}>
                        {m}
                     </button>
                   ))}
                </div>
              </div>

              {/* Links */}
              <div className="flex-1 space-y-1 mb-8">
                {navLinks.map(link => (
                  <button key={link.id} onClick={() => scrollToSection(link.id)} className={`w-full text-left py-4 text-[20px] font-black border-b border-slate-50 flex items-center justify-between ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-800'}`}>
                    {link.label}
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                  </button>
                ))}
              </div>

              {/* Buttons */}
              <div className="space-y-4">
                 <Link to="/farmer-registration" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-5 bg-[#00B464] text-white font-black rounded-2xl shadow-xl shadow-green-100 text-[16px]">FARMER REGISTRATION</Link>
                 <div className="grid grid-cols-2 gap-4">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-4 bg-slate-900 text-white font-black rounded-xl text-[14px]">LOGIN</Link>
                    <a href="https://wa.me/91000000000" className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-black rounded-xl text-[14px]">
                       <span className="material-symbols-outlined text-[18px]">chat</span>
                       SUPPORT
                    </a>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;