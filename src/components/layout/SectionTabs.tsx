'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LayoutDashboard, Users, FileText, type LucideIcon } from 'lucide-react';

interface Props {
  clientCount?: number;
}

interface SectionTab {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  /** exact match (true) or prefix match (false) for active state */
  exact?: boolean;
  badge?: number;
}

/**
 * Persistent horizontal tab bar for the primary dashboard sections.
 * Rendered as a second row under the main navbar (GitHub/Vercel pattern).
 * Extensible up to ~7 sections — just add entries to `tabs`.
 */
export function SectionTabs({ clientCount = 0 }: Props) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const router = useRouter();

  // Only show on the authenticated dashboard, never on landing/pricing/etc.
  if (!pathname?.startsWith('/dashboard')) return null;

  const tabs: SectionTab[] = [
    { labelKey: 'stats',     href: '/dashboard',           icon: LayoutDashboard, exact: true },
    { labelKey: 'clients',   href: '/dashboard/clients',   icon: Users, badge: clientCount },
    { labelKey: 'documents', href: '/dashboard/documents', icon: FileText },
  ];

  const isActive = (tab: SectionTab) =>
    tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);

  return (
    <div className="hidden md:block border-t border-[rgba(15,39,71,0.06)] bg-[var(--navy)]/60">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-1 -mb-px overflow-x-auto no-scrollbar" aria-label="Sections">
          {tabs.map((tab) => {
            const active = isActive(tab);
            return (
              <button
                key={tab.href}
                type="button"
                onClick={() => router.push(tab.href)}
                aria-current={active ? 'page' : undefined}
                className={`group flex items-center gap-2 px-3 py-2.5 border-b-2 text-sm font-bold whitespace-nowrap transition-all min-h-[44px] ${
                  active
                    ? 'border-[var(--green-3)] text-[var(--green-3)]'
                    : 'border-transparent text-[var(--sand-muted)] hover:text-[var(--sand)] hover:border-[rgba(15,39,71,0.2)]'
                }`}
              >
                <tab.icon size={16} className="shrink-0" />
                <span>{t(tab.labelKey)}</span>
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
