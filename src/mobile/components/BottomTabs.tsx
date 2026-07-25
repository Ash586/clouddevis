'use client';

import { Home, Files, Building, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';

export type TabId = 'home' | 'documents' | 'company' | 'settings';

interface Tab {
  id: TabId;
  labelKey: 'nav.home' | 'nav.documents' | 'nav.company' | 'nav.settings';
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: 'home',      labelKey: 'nav.home',      icon: Home     },
  { id: 'documents', labelKey: 'nav.documents', icon: Files    },
  { id: 'company',   labelKey: 'nav.company',   icon: Building },
  { id: 'settings',  labelKey: 'nav.settings',  icon: Settings },
];

interface BottomTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  const { t } = useMobileI18n();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,var(--sab,env(safe-area-inset-bottom)))] pt-1"
      role="tablist"
      aria-label="Navigation"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-[18px] border border-[rgba(0,26,77,0.06)] bg-white/90 p-1 shadow-[0_4px_20px_rgba(0,26,77,0.08)] backdrop-blur-xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const label = t(tab.labelKey);

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onTabChange(tab.id)}
              className="group relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
            >
              <span
                className={cn(
                  'flex h-8 w-full items-center justify-center rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-[#0052CC] text-white shadow-sm shadow-[#0052CC]/25'
                    : 'text-[#718096] group-hover:bg-[#0052CC]/5 group-active:bg-[#0052CC]/10',
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              </span>
              <span
                className={cn(
                  'max-w-full truncate px-0.5 text-[9px] leading-none transition-colors duration-200',
                  isActive ? 'font-bold text-[#0052CC]' : 'font-medium text-[#718096]',
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
