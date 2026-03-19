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

  // --- Handlers (UI Only, Logic hooks for USER) ---
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // USER: Add search filter logic here
  };

  const handleLocationSelect = (mandi) => {
    setLocation(mandi);
    setIsLocationOpen(false);
    // USER: Add location-based pricing logic here
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
    }, { threshold: 0.3, rootMargin: '-80px 0px -60px 0px' });

    ['home', 'features', 'how-it-works', 'testimonials', 'news', 'mobile-app', 'faq'].forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
        const offset = 80;
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
      <header className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled
        ? 'py-2 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)]'
        : 'py-4 bg-[#e9faf4]'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[56px] items-center justify-between gap-4 lg:gap-8">

            {/* 1. LEFT: Logo & Categories */}
            <div className="flex items-center gap-4 shrink-0">
              <Logo size="md" onClick={() => scrollToSection('home')} className="cursor-pointer hover:opacity-80 transition-opacity" />
              
              <div className="hidden lg:block h-6 w-[1px] bg-gray-200" />
              
              <div className="hidden lg:relative lg:block" onMouseLeave={() => setIsCatOpen(false)}>
                <button 
                  onMouseEnter={() => setIsCatOpen(true)}
                  className={`flex items-center gap-2 text-[13px] font-black transition-all ${isCatOpen ? 'text-[#00B464]' : 'text-slate-600 hover:text-[#00B464]'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">grid_view</span>
                  Categories
                </button>
                <AnimatePresence>
                  {isCatOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-3 w-72 bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 py-4 z-50 overflow-hidden"
                    >
                      {categories.map((cat, i) => (
                        <button key={i} className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-[#00B464]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#00B464] transition-all">
                              <span className="material-symbols-outlined text-[#00B464] text-[20px] group-hover:text-white">{cat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[13px] font-black uppercase tracking-tight text-slate-800">{cat.name.split(' ')[1]}</p>
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

            {/* 2. CENTER: Smart Search */}
            <div className="hidden md:flex flex-1 max-w-[280px] lg:max-w-[320px] items-center bg-white border border-gray-200 rounded-xl px-1 py-1 focus-within:border-[#00B464] focus-within:shadow-lg focus-within:shadow-green-100/50 transition-all h-10 group">
              <div className="relative shrink-0">
                <button 
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors text-slate-500 group-focus-within:text-slate-900"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00B464]">location_on</span>
                  <span className="text-[12px] font-black truncate max-w-[80px]">{location.split(' ')[0]}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <AnimatePresence>
                  {isLocationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2.5"
                      >
                        {mandis.map((m) => (
                          <button key={m} onClick={() => handleLocationSelect(m)}
                            className="w-full text-left px-4 py-2 hover:bg-green-50 text-[12px] font-bold flex items-center justify-between group/item"
                          >
                            <span className={location === m ? 'text-[#00B464]' : 'text-slate-600'}>{m}</span>
                            {location === m && <span className="material-symbols-outlined text-[#00B464] text-[16px]">check_circle</span>}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-[1px] h-4 bg-gray-200 mx-1" />
              <div className="flex flex-1 items-center min-w-0 pr-3">
                <span className="material-symbols-outlined text-gray-400 text-[18px] ml-1">search</span>
                <input 
                    type="text" 
                    placeholder="Search market..." 
                    value={searchQuery}
                    onChange={handleSearch}
                    className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-slate-700 ml-2 w-full placeholder:text-slate-400" 
                />
              </div>
            </div>

            {/* 3. RIGHT: Nav & Actions */}
            <div className="flex items-center gap-4 lg:gap-6 shrink-0">
              <nav className="hidden xl:flex items-center gap-6">
                {navLinks.map(link => (
                  <button 
                    key={link.id} 
                    onClick={() => scrollToSection(link.id)}
                    className={`text-[13px] font-black transition-all relative py-2 group ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <span>{link.label}</span>
                    {activeSection === link.id && (
                      <motion.span layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00B464] rounded-full" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                {/* Language (UI Toggle) */}
                <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl p-0.5">
                    {['EN', 'हिं'].map((l) => (
                        <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-[10px] text-[11px] font-black transition-all ${lang === l ? 'bg-[#00B464] text-white shadow-sm' : 'text-slate-400 hover:text-slate-800'}`}>
                            {l === 'हिं' ? 'हिन्दी' : 'EN'}
                        </button>
                    ))}
                </div>

                <a href="https://wa.me/91000000000" className="w-10 h-10 flex items-center justify-center bg-green-50 text-[#00B464] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                </a>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="px-5 py-2.5 text-[13px] font-black text-slate-700 hover:bg-gray-100 rounded-xl transition-all">Log in</Link>
                <Link to="/farmer-registration" className="px-5 py-2.5 text-[13px] font-black text-white bg-[#00B464] rounded-xl shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-[0.98] transition-all">Join Free</Link>
              </div>

              <button onClick={() => setIsMenuOpen(true)} className="md:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl">
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[150] md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0A2616]/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute top-0 right-0 w-[85%] h-full bg-white shadow-2xl p-6 flex flex-col pt-12 overflow-y-auto">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <Logo size="md" />
                  <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined">close</span></button>
              </div>

              <div className="mb-8 space-y-4">
                  <div className="p-1 bg-gray-50 rounded-2xl flex items-center px-4 h-14 border border-gray-200">
                      <span className="material-symbols-outlined text-[#00B464]">search</span>
                      <input type="text" placeholder="Search Mandi Rates..." className="bg-transparent border-none focus:outline-none text-[15px] font-black ml-3 w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                      {mandis.slice(0, 4).map(m => (
                          <button key={m} onClick={() => handleLocationSelect(m)} className={`p-4 rounded-xl border text-[12px] font-black ${location === m ? 'bg-[#00B464] text-white' : 'bg-gray-50'}`}>{m.split(' ')[0]}</button>
                      ))}
                  </div>
              </div>

              <nav className="flex-1 space-y-1 mb-8">
                  {navLinks.map(link => (
                      <button key={link.id} onClick={() => scrollToSection(link.id)} className="w-full text-left py-4 text-[18px] font-black border-b border-gray-50 flex items-center justify-between">
                          {link.label} <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                      </button>
                  ))}
              </nav>

              <div className="space-y-4">
                  <Link to="/farmer-registration" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-5 bg-[#00B464] text-white font-black rounded-2xl shadow-xl shadow-green-100 text-[16px]">FARMER REGISTRATION</Link>
                  <div className="grid grid-cols-2 gap-4">
                      <Link to="/login" className="flex items-center justify-center py-4 bg-slate-900 text-white font-black rounded-xl">LOGIN</Link>
                      <a href="https://wa.me/91000000000" className="flex items-center justify-center py-4 bg-[#25D366] text-white font-black rounded-xl">SUPPORT</a>
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