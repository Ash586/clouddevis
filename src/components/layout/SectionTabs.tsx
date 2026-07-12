'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, FileText, Landmark, type LucideIcon } from 'lucide-react';

interface Props {
  clientCount?: number;
}

interface SectionTab {
  labelKey: string;
  tabKey: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  pathPrefix?: string;
}

export function SectionTabs({ clientCount = 0 }: Props) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (!pathname?.startsWith('/dashboard')) return null;

  const activeTab = searchParams?.get('tab') || '';

  const tabs: SectionTab[] = [
    { labelKey: 'stats',     tabKey: '',          href: '/dashboard',                icon: LayoutDashboard },
    { labelKey: 'clients',   tabKey: 'clients',   href: '/dashboard?tab=clients',   icon: Users,    badge: clientCount, pathPrefix: '/dashboard/clients' },
    { labelKey: 'documents', tabKey: 'documents', href: '/dashboard?tab=documents', icon: FileText, pathPrefix: '/dashboard/documents' },
    { labelKey: 'fiscal',    tabKey: 'fiscal',    href: '/dashboard?tab=fiscal',    icon: Landmark },
  ];

  const isActive = (tab: SectionTab) => {
    if (tab.tabKey !== '') {
      return activeTab === tab.tabKey ||
        (tab.pathPrefix ? pathname !== '/dashboard' && pathname?.startsWith(tab.pathPrefix) : false);
    }
    // Overview tab: only active on /dashboard with no tab param
    return pathname === '/dashboard' && !activeTab;
  };

  return (
    <div data-tour="section-tabs" className="border-t border-[rgba(15,39,71,0.06)] bg-[var(--navy)]/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar" aria-label="Sections">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <button
                key={tab.tabKey}
                type="button"
                onClick={() => router.push(tab.href)}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 border-b-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all min-h-[44px] ${
                  active
                    ? 'border-[var(--green-3)] text-[var(--green-3)]'
                    : 'border-transparent text-[var(--sand-muted)] hover:text-[var(--sand)] hover:border-[rgba(15,39,71,0.2)]'
                }`}
              >
                <tab.icon size={16} className="shrink-0" />
                <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                {tab.badge != null && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-[var(--green-glow)] text-[var(--green-3)]' : 'bg-[var(--navy-4)] text-[var(--sand-muted)]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
