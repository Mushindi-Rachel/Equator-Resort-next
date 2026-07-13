'use client'  
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, LayoutDashboard, LogOut, LogIn, Shield } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface NavigationProps {
  onBookNow: () => void;
  user: User | null;
  isAdmin: boolean;
  onAdminOpen: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Retreats', href: '#retreats' },
  { label: 'Rooms', href: '#rooms' },
  { label: 'Dining', href: '#dining' },
  { label: 'Conference', href: '#conference' },
  { label: 'Latitude Zero', href: '#latitude-zero' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation({ onBookNow, user, isAdmin, onAdminOpen, onSignOut, onSignIn }: NavigationProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);

      const sections = navLinks.map(l => l.href.slice(1));
      let current = '';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) current = id;
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 ${
        scrolled ? 'nav-solid py-3' : 'nav-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button
  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
  className="flex items-center gap-4 group transition-all duration-500"
>
  {/* Logo */}
  <div className="relative">
    <div className="absolute inset-0 rounded-full bg-gold-400/30 blur-xl scale-125 group-hover:bg-gold-400/50 transition-all duration-500"></div>

      <Image
        src="/logo-equator.png"
        alt="Equator Christian Retreat & Conference Centre"
        width={70}
        height={70}
        priority
        className="object-contain"
      />
    </div>


  {/* Text */}
  <div className="flex flex-col items-start">
    <h1
      className="font-serif text-[20px] text-white leading-none tracking-[0.25em] uppercase"
    >
      Equator
    </h1>

    <span className="mt-1 text-[10px] uppercase tracking-[0.4em] text-gold-300">
      Christian Retreat & Conference Centre
    </span>

    <div className="mt-2 h-[2px] w-0 bg-gradient-to-r from-gold-400 to-yellow-300 group-hover:w-full transition-all duration-500"></div>
  </div>
</button>

        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`cursor-none font-sans text-[12px] font-medium tracking-widest uppercase transition-colors duration-300 relative group ${
                activeSection === link.href.slice(1) ? 'text-gold-400' : 'text-cream-100 hover:text-gold-400'
              }`}
              style={{ letterSpacing: '0.15em' }}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 h-[1px] bg-gold-500 transition-all duration-300 ${activeSection === link.href.slice(1) ? 'w-full' : 'w-0 group-hover:w-full'}`} />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* {user && isAdmin ? (
            <>
              <button onClick={onAdminOpen} className="hidden md:flex items-center gap-1.5 border border-gold-400/40 text-gold-400 hover:bg-gold-500 hover:text-sanctuary-900 transition-all px-3 py-2 font-sans text-[11px] tracking-wider uppercase cursor-none">
                <LayoutDashboard size={12} /> Admin
              </button>
              <button onClick={onSignOut} className="hidden md:flex items-center gap-1 text-cream-200/50 hover:text-gold-400 transition-colors cursor-none" title="Sign out">
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <button onClick={onSignIn} className="hidden md:flex items-center gap-1.5 border border-cream-200/20 text-cream-200/70 hover:text-gold-400 hover:border-gold-400/40 transition-all px-3 py-2 font-sans text-[11px] tracking-wider uppercase cursor-none">
              <Shield size={12} /> Admin Login
            </button>
          )} */}
          <button onClick={() => document.querySelector('#rooms')?.scrollIntoView({ behavior: 'smooth' })} 
            className="btn-gold hidden md:inline-flex text-[11px] py-2.5 px-6">
            Book Stay
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-cream-50 p-2 cursor-none"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`lg:hidden glass-dark transition-all duration-500 overflow-hidden ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-left font-sans text-sm font-medium tracking-widest uppercase text-cream-100 hover:text-gold-400 transition-colors duration-300 cursor-none"
            >
              {link.label}
            </button>
          ))}
          <button onClick={() => document.querySelector('#rooms')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-gold w-full text-[11px] py-2.5 px-6 mt-4">
            Book Stay
          </button>
        </nav>
      </div>
    </header>
  );
}
       
