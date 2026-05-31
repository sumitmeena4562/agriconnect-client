import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../common/Logo';
import RoleSelectionModal from './RoleSelectionModal';

const Header = () => {
  // --- States ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
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
      <header className={`sticky top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled
        ? 'py-2 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm'
        : 'py-3 bg-white border-b-2 border-primary-50'
        }`}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-2.5">
          
          {/* Main Row */}
          <div className="flex h-[50px] items-center justify-between gap-2 lg:gap-5">

            {/* 1. LEFT: Logo & Categories */}
            <div className="flex items-center gap-2 lg:gap-6 shrink-0">
              <Logo size="md" onClick={() => scrollToSection('home')} className="cursor-pointer hover:opacity-80 transition-opacity" />
              
              <div className="hidden lg:block h-6 w-[1px] bg-gray-300/30" />
              
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
                      initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute top-full left-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-50 py-4 z-50 overflow-hidden"
                    >
                      {categories.map((cat, i) => (
                        <button key={i} className="w-full text-left px-5 py-2.5 hover:bg-slate-50 transition-all group border-l-4 border-transparent hover:border-[#00B464]">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary-600 transition-all">
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

            {/* 2. CENTER: Smart Search (DESKTOP) */}
            <div className="hidden md:flex flex-1 min-w-[280px] max-w-[420px] items-center bg-white border border-gray-200 rounded-2xl p-1 focus-within:border-[#00B464] focus-within:shadow-[0_15px_30px_-10px_rgba(0,180,100,0.1)] transition-all h-[42px] group relative">
              <div className="relative shrink-0 flex items-center">
                <button 
                  onClick={() => setIsLocationOpen(!isLocationOpen)}
                  className="flex items-center gap-1.5 px-2.5 h-10 hover:bg-gray-50 rounded-xl transition-colors text-slate-600 group-focus-within:text-slate-900"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#00B464]">location_on</span>
                  <span className="text-[13px] font-bold truncate max-w-[70px]">{location === 'Select Mandi' ? 'Select' : location.split(' ')[0]}</span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${isLocationOpen ? 'rotate-180' : ''}`}>expand_more</span>
                </button>
                <AnimatePresence>
                  {isLocationOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsLocationOpen(false)} />
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-slate-50 z-50 py-2.5 overflow-hidden"
                      >
                        {mandis.map((m) => (
                          <button key={m} onClick={() => handleLocationSelect(m)}
                            className="w-full text-left px-4 py-2.5 hover:bg-primary-50 text-[12px] font-bold flex items-center justify-between group/item"
                          >
                            <span className={location === m ? 'text-[#00B464]' : 'text-slate-600'}>{m}</span>
                            {location === m && <span className="material-symbols-outlined text-[#00B464] text-[15px]">check_circle</span>}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <div className="w-[1px] h-5 bg-gray-200 mx-1 lg:mx-1.5" />
              <div className="flex flex-1 items-center min-w-0 px-2 h-full">
                <span className="material-symbols-outlined text-gray-400 text-[20px] shrink-0">search</span>
                <input 
                    type="text" 
                    placeholder="Search Mandi Rates, Crops..." 
                    value={searchQuery}
                    onChange={handleSearch}
                    className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-slate-700 ml-2 w-full placeholder:text-slate-300 truncate" 
                />
              </div>
            </div>

            {/* 3. RIGHT: Nav & Actions */}
            <div className="flex items-center gap-2 lg:gap-6 shrink-0">
              <nav className="hidden xl:flex items-center gap-4 lg:gap-6">
                {navLinks.map(link => (
                  <button 
                    key={link.id} 
                    onClick={() => scrollToSection(link.id)}
                    className={`text-[13px] font-black transition-all relative py-2 group ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    <span>{link.label}</span>
                    {activeSection === link.id && (
                      <motion.span layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary-600 rounded-full" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="flex items-center bg-gray-100 border border-gray-200 rounded-[12px] p-0.5">
                    {['EN', 'हिं'].map((l) => (
                        <button key={l} onClick={() => setLang(l)} className={`px-2.5 lg:px-3 py-1.5 rounded-[10px] text-[11px] font-black transition-all ${lang === l ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-800'}`}>
                            {l === 'हिं' ? 'हिन्दी' : 'EN'}
                        </button>
                    ))}
                </div>

                <a href="https://wa.me/91000000000" className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 text-[#00B464] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                </a>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 lg:gap-2">
                <Link to="/login" className="px-3 lg:px-4 py-2.5 text-[13px] font-bold text-slate-700 hover:bg-white rounded-xl transition-all">Log in</Link>
                <button onClick={() => setIsJoinModalOpen(true)} className="px-5 py-2.5 text-[14px] font-black text-white bg-primary-600 rounded-xl shadow-lg shadow-primary-200/40 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap">Join Free</button>
              </div>

              <button onClick={() => setIsMenuOpen(true)} className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-xl">
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>
            </div>
          </div>

          {/* SECOND ROW: Mobile Search (Visible below logo) */}
          <div className="md:hidden flex items-center bg-white border border-gray-200 rounded-2xl p-1 h-[42px] w-full shadow-sm">
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="flex items-center gap-1.5 px-3 h-full border-r border-gray-100 text-slate-600 text-[12px] font-bold shrink-0"
            >
              <span className="material-symbols-outlined text-[18px] text-[#00B464]">location_on</span>
              {location === 'Select Mandi' ? 'Mandi' : location.split(' ')[0]}
            </button>
            <div className="flex flex-1 items-center px-3 h-full overflow-hidden">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">search</span>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={handleSearch}
                className="bg-transparent border-none focus:outline-none text-[13px] font-bold text-slate-700 ml-2 w-full truncate"
              />
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Menu (Premium Full-Screen but Compact) */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              transition={{ type: 'tween', duration: 0.2 }} 
              className="absolute inset-0 bg-[#0A2616] flex flex-col overflow-y-auto"
            >
              {/* Compact Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                  <div className="scale-90 origin-left">
                    <Logo size="md" variant="dark" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white/10 p-0.5 rounded-lg">
                      {['EN', 'हिं'].map((l) => (
                          <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 rounded-md text-[10px] font-black transition-all ${lang === l ? 'bg-primary-600 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}>
                              {l === 'हिं' ? 'HI' : 'EN'}
                          </button>
                      ))}
                    </div>
                    <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
              </div>
              
              <div className="flex-1 p-5 flex flex-col gap-6">
                
                {/* Search */}
                <div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-white/40 text-[18px]">search</span>
                    <input 
                      type="text" 
                      placeholder="Search crops, rates..." 
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full bg-white/5 border border-white/10 rounded-[var(--form-border-radius)] text-white text-[13px] font-bold py-2.5 pl-9 pr-3 focus:outline-none focus:border-[#00B464] placeholder:text-white/30 transition-colors"
                    />
                  </div>
                </div>

                {/* Mandis */}
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2.5">Top Mandis</p>
                  <div className="flex flex-wrap gap-2">
                    {mandis.slice(0, 4).map(m => (
                      <button 
                        key={m} 
                        onClick={() => handleLocationSelect(m)} 
                        className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all border ${location === m ? 'bg-[#00B464] border-[#00B464] text-white shadow-sm' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                      >
                        {m.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[1px] bg-white/10 w-full" />

                {/* Nav Links (Compact) */}
                <nav className="flex flex-col space-y-1">
                    {navLinks.map((link, i) => (
                        <motion.button 
                          key={link.id} 
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.1 }}
                          onClick={() => scrollToSection(link.id)} 
                          className="text-left px-3 py-3 text-[16px] font-black text-white/90 hover:bg-white/5 hover:text-[#00B464] rounded-lg transition-colors flex items-center justify-between group"
                        >
                            {link.label}
                            <span className="material-symbols-outlined text-[18px] text-white/20 group-hover:text-[#00B464]">chevron_right</span>
                        </motion.button>
                    ))}
                </nav>
              </div>

              {/* Bottom Actions (Compact) */}
              <div className="p-5 border-t border-white/10 bg-white/5 space-y-3 shrink-0">
                  <button onClick={() => { setIsJoinModalOpen(true); setIsMenuOpen(false); }} className="w-full bg-[#00B464] text-white py-3 text-[14px] font-black rounded-[var(--form-border-radius)] shadow-[0_4px_14px_rgba(0,180,100,0.3)] hover:scale-[1.02] transition-transform">
                    JOIN FREE
                  </button>
                  <div className="flex gap-3">
                      <Link to="/login" className="flex-1 py-3 bg-white text-[#0A2616] text-center font-black rounded-[var(--form-border-radius)] text-[13px] hover:bg-gray-100 transition-colors">
                        LOGIN
                      </Link>
                      <a href="https://wa.me/91000000000" className="w-[46px] flex items-center justify-center bg-[#25D366] text-white rounded-[var(--form-border-radius)] shadow-sm hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-[20px]">chat</span>
                      </a>
                  </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RoleSelectionModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </>
  );
};

export default Header;