'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LogOut, Bell, Menu, X, Sun, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminNavbarProps {
  onMenuToggle?: () => void;
  menuOpen?: boolean;
}

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Utilisateurs',
  '/admin/analytics': 'Analytics',
  '/admin/subscriptions': 'Abonnements',
  '/admin/partners': 'Partenaires',
  '/admin/reports': 'Rapports',
  '/admin/logs': 'Logs',
  '/admin/settings': 'Paramètres',
  '/admin/login': 'Connexion',
};

export function AdminNavbar({ onMenuToggle, menuOpen }: AdminNavbarProps) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  const pageTitle = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname === path || (path !== '/admin' && pathname.startsWith(path))
  )?.[1] || t('title');

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '14px 28px',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
        background: 'rgba(11,13,18,0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isMobile && (
          <button
            onClick={onMenuToggle}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#a1a5ad',
              padding: 4,
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}
        <h1 style={{ fontSize: 16, fontWeight: 500, color: '#e8ebf0', margin: 0 }}>
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text2)',
            padding: 4,
            position: 'relative',
          }}
        >
          <Bell size={16} />
        </button>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text2)',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '0.5px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            color: '#a1a5ad',
            padding: '6px 12px',
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(248,113,113,0.1)';
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#a1a5ad';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          }}
        >
          <LogOut size={13} />
          {t('nav.logout')}
        </button>
      </div>
    </header>
  );
}
