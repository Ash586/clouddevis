'use client';

import React from 'react';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { useIsMobile } from '@/hooks/useIsMobile';

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
}

interface MobileMenuProps {
  items: MenuItem[];
  title?: string;
}

export function MobileMenu({ items, title = 'CloudDevis' }: MobileMenuProps) {
  const { isOpen, toggle, close } = useMobileMenu();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <button
        onClick={toggle}
        className="fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm active:bg-slate-50"
        aria-label="Toggle menu"
      >
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={close} />
      )}

      <nav
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-100">
          <span className="text-lg font-black text-blue-600">{title}</span>
        </div>
        <div className="p-3 space-y-1">
          {items.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                item.active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
