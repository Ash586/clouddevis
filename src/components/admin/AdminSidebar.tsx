'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  Handshake,
  FileText,
  Activity,
  Settings,
} from 'lucide-react';

interface NavItemConfig {
  key: string;
  href: string;
  icon: React.ElementType;
  badge?: 'pending' | number;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'users', href: '/admin/users', icon: Users },
  { key: 'analytics', href: '/admin/analytics', icon: BarChart3 },
  { key: 'subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { key: 'partners', href: '/admin/partners', icon: Handshake },
  { key: 'reports', href: '/admin/reports', icon: FileText },
  { key: 'logs', href: '/admin/logs', icon: Activity },
  { key: 'settings', href: '/admin/settings', icon: Settings },
];

function NavItem({ item, pathname, router, t }: {
  item: NavItemConfig;
  pathname: string;
  router: ReturnType<typeof useRouter>;
  t: (key: string) => string;
}) {
  const Icon = item.icon;
  const isActive = item.href === '/admin'
    ? pathname === '/admin'
    : pathname.startsWith(item.href);

  return (
    <button
      onClick={() => router.push(item.href)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s',
        background: isActive ? '#222220' : 'transparent',
        color: isActive ? '#e8e6de' : '#9c9a90',
        borderWidth: isActive ? 0.5 : 0,
        borderStyle: 'solid',
        borderColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          e.currentTarget.style.color = '#e8e6de';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#9c9a90';
        }
      }}
    >
      <Icon size={15} />
      <span style={{ flex: 1, textAlign: 'left' }}>{t(`nav.${item.key}`)}</span>
    </button>
  );
}

export function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      style={{
        width: 200,
        flexShrink: 0,
        borderRight: '0.5px solid rgba(255,255,255,0.06)',
        background: '#181816',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '18px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#e8e6de', letterSpacing: '-0.3px' }}>
            ☁️ CloudDevis
          </span>
          <span style={{ fontSize: 10, color: '#5c5a54', fontWeight: 500 }}>
            Admin
          </span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.href} item={item} pathname={pathname} router={router} t={t} />
        ))}
      </nav>
    </aside>
  );
}
