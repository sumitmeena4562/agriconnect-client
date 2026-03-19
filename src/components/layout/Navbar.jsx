import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../common/Logo';

const Header = () => {
  // --- States ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [lang, setLang] = useState('EN');
  const [location, setLocation] = useState('Select Mandi');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Mock Data ---
  const mandis = ['Nashik Mandi', 'Pune Mandi', 'Mumbai (Vashi)', 'Nagpur Mandi', 'Indore Mandi'];
  const categories = [
    { name: 'Fresh Vegetables', icon: 'podcasts', desc: 'Direct from farm' },
    { name: 'Organic Fruits', icon: 'eco', desc: 'Pesticide free' },
    { name: 'Grains & Pulses', icon: 'grass', desc: 'Bulk available' },
    { name: 'Dairy & Poultry', icon: 'egg', desc: 'Farm fresh' }
  ];

  // --- Handlers ---
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLocationSelect = (mandi) => {
    setLocation(mandi);
    setIsLocationOpen(false);
  };

  // --- Effects ---
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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

    ['home', 'features', 'how-it-works', 'testimonials', 'news', 'mobile-app', 'faq'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
        const offset = 70;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = el.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
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
      <header className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
        ? 'py-1 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm'
        : 'py-1.5 bg-[#f0fcf7]'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-1.5">
          
          {/* Main Row */}
          <div className="flex h-[44px] items-center justify-between gap-2 lg:gap-8">

            {/* 1. LEFT: Logo & Categories */}
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
              <Logo size="sm" onClick={() => scrollToSection('home')} className="cursor-pointer hover:opacity-80 transition-opacity" />
              
              <div className="hidden lg:block h-5 w-[1px] bg-gray-300/30" />
              
              <div className="hidden lg:relative lg:block" onMouseLeave={() => setIsCatOpen(false)}>
                <button 
                  onMouseEnter={() => setIsCatOpen(true)}
                  className={`flex items-center gap-1.5 text-[12px] font-black transition-all ${isCatOpen ? 'text-[#00B464]' : 'text-slate-600 hover:text-[#00B464]'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                  Categories
                </button>
                <AnimatePresence>
                  {isCatOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-50 py-3 z-50 overflow-hidden"
                    >
                      {categories.map((cat, i) => (
                        <button key={i} className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-[#00B464]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-[#00B464] transition-all">
                              <span className="material-symbols-outlined text-[#00B464] text-[18px] group-hover:text-white">{cat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[12px] font-black uppercase tracking-tight text-slate-800">{cat.name.split(' ')[1]}</p>
                                <p className="text-[10px] font-medium text-slate-400">{cat.desc}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 2. CENTER: Smart Search (DESKTOP ONLY) */}
            <div className="hidden md:flex flex-1 min-w-[280px] max-w-[400px] items-center bg-white border border-gray-200 rounded-xl p-0.5 focus-within:border-[#00B464] transition-all h-[36px] group">
              <div className="relative shrink-0 flex items-center">
                <button 
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="flex items-center gap-1 px-2.5 h-7.5 hover:bg-gray-50 rounded-lg transition-colors text-slate-600 group-focus-within:text-slate-900"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#00B464]">location_on</span>
                  <span className="text-[11px] font-bold truncate max-w-[75px]">{location === 'Select Mandi' ? 'Select' : location.split(' ')[0]}</span>
                  <span className={`material-symbols-outlined text-[14px] transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <AnimatePresence>
                  {isLocationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-slate-50 z-50 py-2 overflow-hidden"
                      >
                        {mandis.map((m) => (
                          <button key={m} onClick={() => handleLocationSelect(m)}
                            className="w-full text-left px-4 py-2 hover:bg-green-50 text-[11px] font-bold flex items-center justify-between group/item"
                          >
                            <span className={location === m ? 'text-[#00B464]' : 'text-slate-600'}>{m}</span>
                            {location === m && <span className="material-symbols-outlined text-[#00B464] text-[14px]">check_circle</span>}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-[1px] h-4 bg-gray-200 mx-1" />
              <div className="flex flex-1 items-center min-w-0 px-2 h-full">
                <span className="material-symbols-outlined text-gray-400 text-[18px] shrink-0">search</span>
                <input 
                    type="text" 
                    placeholder="Search Mandi Rates, Crops..." 
                    value={searchQuery}
                    onChange={handleSearch}
                    className="bg-transparent border-none focus:outline-none text-[12px] font-bold text-slate-700 ml-2 w-full placeholder:text-slate-300" 
                />
              </div>
            </div>

            {/* 3. RIGHT: Nav & Actions */}
            <div className="flex items-center gap-2 lg:gap-4 shrink-0">
              <nav className="hidden xl:flex items-center gap-5">
                {navLinks.map(link => (
                  <button 
                    key={link.id} 
                    onClick={() => scrollToSection(link.id)}
                    className={`text-[12px] font-black transition-all relative py-1 group ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <span>{link.label}</span>
                    {activeSection === link.id && (
                      <motion.span layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#00B464] rounded-full" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-gray-100 border border-gray-200 rounded-[10px] p-0.5">
                    {['EN', 'हिं'].map((l) => (
                        <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded-[8px] text-[10px] font-black transition-all ${lang === l ? 'bg-[#00B464] text-white' : 'text-slate-400 hover:text-slate-800'}`}>
                            {l === 'हिं' ? 'हिन्दी' : 'EN'}
                        </button>
                    ))}
                </div>

                <a href="https://wa.me/91000000000" className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-[#00B464] rounded-lg hover:bg-[#25D366] hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                </a>
              </div>

              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/login" className="px-3 py-1.5 text-[12px] font-bold text-slate-700 hover:bg-white rounded-lg transition-all">Log in</Link>
                <Link to="/farmer-registration" className="px-4 py-1.5 text-[12px] font-black text-white bg-[#00B464] rounded-lg shadow-md shadow-green-200/40 hover:scale-[1.02] active:scale-[0.98] transition-all">Join Free</Link>
              </div>

              <button onClick={() => setIsMenuOpen(true)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-900 text-white shadow-lg">
                <span className="material-symbols-outlined text-[18px]">menu</span>
              </button>
            </div>
          </div>

          {/* SECOND ROW: Mobile Search (Visiable below logo) */}
          <div className="md:hidden flex items-center bg-white border border-gray-200 rounded-xl p-0.5 h-[36px] w-full">
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="flex items-center gap-1 px-3 h-full border-r border-gray-100 text-slate-600 text-[11px] font-bold shrink-0"
            >
              <span className="material-symbols-outlined text-[16px] text-[#00B464]">location_on</span>
              {location === 'Select Mandi' ? 'Mandi' : location.split(' ')[0]}
            </button>
            <div className="flex flex-1 items-center px-3 h-full">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Search rates..." 
                value={searchQuery}
                onChange={handleSearch}
                className="bg-transparent border-none focus:outline-none text-[12px] font-bold text-slate-700 ml-2 w-full"
              />
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[150] md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A2616]/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute top-0 right-0 w-[80%] h-full bg-white shadow-2xl p-6 flex flex-col pt-10 overflow-y-auto">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                  <Logo size="sm" />
                  <button onClick={() => setIsMenuOpen(false)} className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined text-[20px]">close</span></button>
              </div>

              <div className="mb-8 space-y-4">
                  <div className="p-1.5 bg-gray-50 rounded-xl flex items-center px-4 h-12 border border-gray-200 shadow-sm">
                      <span className="material-symbols-outlined text-[#00B464] text-[20px]">search</span>
                      <input type="text" placeholder="Search Mandi Rates..." className="bg-transparent border-none focus:outline-none text-[14px] font-black ml-3 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                      {mandis.slice(0, 4).map(m => (
                          <button key={m} onClick={() => handleLocationSelect(m)} className={`p-3 rounded-xl border text-[11px] font-black transition-all ${location === m ? 'bg-[#00B464] text-white border-transparent' : 'bg-gray-50 w-full'}`}>{m.split(' ')[0]}</button>
                      ))}
                  </div>
              </div>

              <nav className="flex-1 space-y-0.5 mb-8">
                  {navLinks.map(link => (
                      <button key={link.id} onClick={() => scrollToSection(link.id)} className="w-full text-left py-3.5 text-[16px] font-black border-b border-gray-50 flex items-center justify-between">
                          {link.label} <span className="material-symbols-outlined text-gray-300 text-[18px]">chevron_right</span>
                      </button>
                  ))}
              </nav>

              <div className="space-y-3 pt-6 border-t border-gray-50">
                  <Link to="/farmer-registration" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-4 bg-[#00B464] text-white font-black rounded-xl shadow-lg shadow-green-100 text-[14px]">JOIN FREE</Link>
                  <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" className="flex items-center justify-center py-3 bg-slate-900 text-white font-black rounded-xl text-[12px]">LOGIN</Link>
                      <a href="https://wa.me/91000000000" className="flex items-center justify-center py-3 bg-[#25D366] text-white font-black rounded-xl text-[12px]">SUPPORT</a>
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