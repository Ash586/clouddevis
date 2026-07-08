'use client';

import React from 'react';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Menu, X } from 'lucide-react';

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

export function MobileMenu({ items, title = 'Rakmana' }: MobileMenuProps) {
  const { isOpen, toggle, close } = useMobileMenu();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <>
      <button type="button"         onClick={toggle}
        className="fixed top-3 right-3 z-50 p-2.5 rounded-xl bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] shadow-sm active:bg-[var(--navy-3)] mobile-touch"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} className="text-[var(--sand)]" /> : <Menu size={20} className="text-[var(--sand)]" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={close} />
      )}

      <nav
        className={`fixed inset-y-0 right-0 w-72 bg-[var(--navy)] shadow-2xl transform transition-transform duration-300 z-50 border-l border-[rgba(15,39,71,0.08)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="p-5 border-b border-[rgba(15,39,71,0.08)]">
          <span className="text-lg font-black text-[var(--green-3)]">{title}</span>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto">
          {items.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={close}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition mobile-touch ${
                item.active
                  ? 'bg-[rgba(37,99,235,0.08)] text-[var(--green-3)]'
                  : 'text-[var(--sand-muted)] hover:bg-[rgba(15,39,71,0.04)] active:bg-[rgba(15,39,71,0.06)]'
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
