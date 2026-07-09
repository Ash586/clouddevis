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
  BookOpen,
  MessageSquare,
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
  { key: 'feedback', href: '/admin/feedback', icon: MessageSquare },
  { key: 'reports', href: '/admin/reports', icon: FileText },
  { key: 'logs', href: '/admin/logs', icon: Activity },
  { key: 'docs', href: '/admin/docs', icon: BookOpen },
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
    <button type="button"       onClick={() => router.push(item.href)}
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
        background: isActive ? '#eef1f5' : 'transparent',
        color: '#111827',
        borderWidth: isActive ? 0.5 : 0,
        borderStyle: 'solid',
        borderColor: isActive ? 'rgba(15,23,42,0.08)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(15,23,42,0.05)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
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
        borderRight: '0.5px solid rgba(15,23,42,0.07)',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '18px 16px', borderBottom: '0.5px solid rgba(15,23,42,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>
            ☁️ Rakmana
          </span>
          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
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
