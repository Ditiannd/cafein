import React from 'react';
import { Coffee, MapPin, Mail, Phone, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#141210] text-[#FFFFFF] pt-24 pb-12 border-t border-white/15 font-sans select-none relative overflow-hidden">
      
      {/* Subtle Background Radial Dots */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#2B231D_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#F0BA53] group-hover:bg-[#E5A93C]/35 group-hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(229,169,60,0.25)]">
                <Coffee className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg tracking-wide text-[#FFFFFF] group-hover:text-[#F0BA53] transition-colors flex items-center gap-1.5 drop-shadow-sm">
                  <span>Cafein Today</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#E5A93C] opacity-90" />
                </span>
                <span className="text-[10px] font-sans text-[#C6C0B4] tracking-resort-wide font-medium">Artisanal Coffee Sanctuary</span>
              </div>
            </Link>
            <p className="text-[#ECE6DD] text-xs leading-relaxed pr-4 font-normal drop-shadow-sm">
              A restorative coffee sanctuary blending timeless architectural tranquility with seamless spatial seating and artisanal craftsmanship.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-[#241E19]/80 border border-white/15 flex items-center justify-center text-[#C6C0B4] hover:text-[#F0BA53] hover:border-[#E5A93C] hover:bg-[#241E19] transition-all shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-xl bg-[#241E19]/80 border border-white/15 flex items-center justify-center text-[#C6C0B4] hover:text-[#F0BA53] hover:border-[#E5A93C] hover:bg-[#241E19] transition-all shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-xl bg-[#241E19]/80 border border-white/15 flex items-center justify-center text-[#C6C0B4] hover:text-[#F0BA53] hover:border-[#E5A93C] hover:bg-[#241E19] transition-all shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#FFFFFF] mb-5 tracking-widest uppercase drop-shadow-sm">Explore Sanctuary</h4>
            <ul className="space-y-3 font-sans text-xs text-[#C6C0B4] font-medium">
              <li><Link href="/menu" className="hover:text-[#F0BA53] transition-colors">Artisanal Online Menu</Link></li>
              <li><Link href="/reservation" className="hover:text-[#F0BA53] transition-colors">Seating Reservations</Link></li>
              <li><a href="#experience" className="hover:text-[#F0BA53] transition-colors">Our Spatial Sanctuary</a></li>
              <li><a href="#reviews" className="hover:text-[#F0BA53] transition-colors">Patron Reflections</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#FFFFFF] mb-5 tracking-widest uppercase drop-shadow-sm">Visit & Connect</h4>
            <ul className="space-y-3.5 font-sans text-xs text-[#C6C0B4] font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E5A93C] shrink-0 mt-0.5" />
                <span>123 Artisan Avenue, <br/>Coffee District, 10110</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E5A93C] shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E5A93C] shrink-0" />
                <span>hello@cafeintoday.com</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-heading font-bold text-sm text-[#FFFFFF] mb-5 tracking-widest uppercase drop-shadow-sm">Service Hours</h4>
            <ul className="space-y-3 font-sans text-xs text-[#C6C0B4] font-medium">
              <li className="flex justify-between border-b border-white/15 pb-2">
                <span>Mon - Fri</span>
                <span className="text-[#FFFFFF] font-bold">08:00 - 22:00</span>
              </li>
              <li className="flex justify-between border-b border-white/15 pb-2">
                <span>Saturday</span>
                <span className="text-[#FFFFFF] font-bold">08:00 - 23:00</span>
              </li>
              <li className="flex justify-between border-b border-white/15 pb-2">
                <span>Sunday</span>
                <span className="text-[#FFFFFF] font-bold">08:00 - 22:00</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-white/15 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-sans text-[#C6C0B4] font-medium">
          <p>
            © {new Date().getFullYear()} Cafein Today Sanctuary. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#FFFFFF] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#FFFFFF] transition-colors">Terms</a>
            <div className="h-3 w-[1px] bg-white/15" />
            <Link href="/auth/login" className="text-[#E5A93C] hover:text-[#F0BA53] transition-colors flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sanctuary Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
