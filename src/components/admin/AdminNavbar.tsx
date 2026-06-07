'use client';

import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMobileMenu } from '@/hooks/useMobileMenu';
import { Menu, X } from 'lucide-react';

interface AdminNavbarProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

export function AdminNavbar({ onMenuToggle, menuOpen }: AdminNavbarProps) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const isMobile = useIsMobile();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button onClick={onMenuToggle} className="p-2 rounded-xl hover:bg-slate-100 transition">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <h1 className="text-lg font-black text-slate-900">{t('title')}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-slate-600">A</span>
        </div>
      </div>
    </header>
  );
}
