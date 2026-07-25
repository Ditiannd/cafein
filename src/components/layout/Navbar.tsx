import React from 'react';
import Link from 'next/link';
import { Coffee, Menu, X } from 'lucide-react';

interface NavbarProps {
  isStoreOpen: boolean;
  onToggleStoreState: () => void;
}

export function Navbar({ isStoreOpen, onToggleStoreState }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-foreground/10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Coffee className="h-8 w-8 text-[var(--color-brand-accent)]" />
            <span className="font-heading font-semibold text-xl tracking-wider uppercase">
              Cafein Today
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-sm font-medium hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-widest">Experience</a>
            <Link href="/menu" className="text-sm font-medium hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-widest">Menu</Link>
            <a href="#" className="text-sm font-medium hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-widest">Gallery</a>
            
            {/* Temporary Toggle for Demo */}
            <button 
              onClick={onToggleStoreState}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                isStoreOpen 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {isStoreOpen ? 'Mode: Open' : 'Mode: Closed'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground hover:text-[var(--color-brand-accent)] transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-foreground/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-start">
            <a href="#" className="block px-3 py-2 text-base font-medium hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-wider">Experience</a>
            <Link href="/menu" className="block px-3 py-2 text-base font-medium hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-wider">Menu</Link>
            <a href="#" className="block px-3 py-2 text-base font-medium hover:text-[var(--color-brand-accent)] transition-colors uppercase tracking-wider">Gallery</a>
            
            <button 
              onClick={onToggleStoreState}
              className={`mt-4 ml-3 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ${
                isStoreOpen 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              {isStoreOpen ? 'Mode: Open' : 'Mode: Closed'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
