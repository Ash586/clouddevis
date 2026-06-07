'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  FileText,
  ScrollText,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'users', href: '/admin/users', icon: Users },
  { key: 'analytics', href: '/admin/analytics', icon: BarChart3 },
  { key: 'subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { key: 'reports', href: '/admin/reports', icon: FileText },
  { key: 'logs', href: '/admin/logs', icon: ScrollText },
  { key: 'system', href: '/admin/system', icon: Activity },
];

export function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">CD</span>
          </div>
          <div>
            <span className="text-lg font-black tracking-tight">CloudDevis</span>
            <p className="text-[10px] text-slate-400 font-semibold">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {t(`nav.${item.key}`)}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-red-400 transition"
        >
          <LogOut className="w-4.5 h-4.5" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}
