import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

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
      ['home', 'trending', 'features', 'how-it-works', 'testimonials', 'news', 'mobile-app', 'faq'].forEach(id => {
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
    { label: 'Home', id: 'home' },
    { label: 'Rates', id: 'trending' },
    { label: 'Features', id: 'features' },
    { label: 'Process', id: 'how-it-works' },
    { label: 'Reviews', id: 'testimonials' },
    { label: 'Updates', id: 'news' },
    { label: 'App', id: 'mobile-app' },
    { label: 'FAQ', id: 'faq' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isMenuOpen || scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[48px] items-center justify-between">

            {/* Logo */}
            <Logo 
              size="md" 
              onClick={() => scrollToSection('home')} 
            />

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-6 relative">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`text-[14px] font-medium transition-colors duration-200 relative ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-600 hover:text-[#00B464]'}`}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <span className="absolute -bottom-1 left-1/2 w-1 h-1 bg-[#00B464] rounded-full transform -translate-x-1/2" />
                  )}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login"
                className="px-5 py-2 text-[14px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
                Log in
              </Link>
              <Link to="/farmer-registration"
                className="px-5 py-2 text-[14px] font-bold text-white bg-[#00B464] hover:bg-[#009c56] rounded-xl shadow-lg shadow-green-200/50 transition-all active:scale-[0.97]">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors focus:outline-none"
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
          <div id="mobile-menu" className="absolute top-[48px] left-0 right-0 bg-white border-b border-gray-100 shadow-2xl"
            style={{ animation: 'slideDown 0.25s ease-out' }}>
            <div className="px-5 py-2 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`block w-full text-left py-3.5 text-[15px] font-semibold transition-colors ${activeSection === link.id ? 'text-[#00B464]' : 'text-slate-700 hover:text-[#00B464]'}`}
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
      <div className="h-[48px]" />

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