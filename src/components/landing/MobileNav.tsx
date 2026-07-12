'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[rgba(15,39,71,0.06)] transition-colors"
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-down menu */}
      <div
        className={`fixed top-[65px] left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-[var(--border)] shadow-lg transition-all duration-300 lg:hidden ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <nav className="container py-4 flex flex-col gap-1">
          <a href="#features" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg text-sm font-medium text-[var(--sand)] hover:bg-[rgba(15,39,71,0.06)] transition-colors">
            Fonctionnalités
          </a>
          <a href="#pricing" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg text-sm font-medium text-[var(--sand)] hover:bg-[rgba(15,39,71,0.06)] transition-colors">
            Tarifs
          </a>
          <a href="#download" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg text-sm font-medium text-[var(--sand)] hover:bg-[rgba(15,39,71,0.06)] transition-colors">
            Application
          </a>
          <a href="#faq" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg text-sm font-medium text-[var(--sand)] hover:bg-[rgba(15,39,71,0.06)] transition-colors">
            FAQ
          </a>
          <div className="border-t border-[var(--border)] my-2" />
          <Link href="/auth/login" onClick={() => setOpen(false)} className="py-3 px-4 rounded-lg text-sm font-medium text-[var(--sand)] hover:bg-[rgba(15,39,71,0.06)] transition-colors">
            Se connecter
          </Link>
          <Link
            href="/auth/register"
            onClick={() => setOpen(false)}
            className="py-3 px-4 rounded-lg text-sm font-bold text-white bg-[var(--green-2)] text-center mt-1"
          >
            Créer un compte gratuit
          </Link>
        </nav>
      </div>
    </>
  );
}
