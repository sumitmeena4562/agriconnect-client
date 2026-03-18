import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'How it Works', id: 'how-it-works' },
    { label: 'Market Rates', id: 'market-rates' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isMenuOpen || scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[55px] items-center justify-between">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-[38px] h-[38px] bg-[#00B464] rounded-[12px] flex items-center justify-center shadow-lg shadow-green-200/50 group-hover:shadow-green-300/60 transition-shadow">
                <span className="material-symbols-outlined text-white text-[24px]">eco</span>
              </div>
              <span className="text-[22px] font-black tracking-tight text-slate-800 leading-none mt-0.5">
                Agri<span className="text-[#00B464]">Connect</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-[15px] font-medium text-slate-600 hover:text-[#00B464] transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login"
                className="px-6 py-2.5 text-[15px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                Log in
              </Link>
              <Link to="/farmer-registration"
                className="px-6 py-2.5 text-[15px] font-bold text-white bg-[#00B464] hover:bg-[#009c56] rounded-xl shadow-lg shadow-green-200/50 transition-all active:scale-[0.97]">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-700">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute top-[55px] left-0 right-0 bg-white border-b border-gray-100 shadow-2xl"
            style={{ animation: 'slideDown 0.25s ease-out' }}>
            <div className="px-5 py-2 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="block w-full text-left py-3.5 text-[15px] font-semibold text-slate-700 hover:text-[#00B464] transition-colors"
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-5 pb-5 border-t border-gray-100 mt-2 flex gap-3">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-3.5 text-[15px] font-bold text-[#334155] bg-[#F1F5F9] hover:bg-slate-200 rounded-xl transition-colors">
                  Log in
                </Link>
                <Link to="/farmer-registration" onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-3.5 text-[15px] font-bold text-white bg-[#00B464] hover:bg-[#009c56] rounded-xl transition-colors">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-[55px]" />

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Header;