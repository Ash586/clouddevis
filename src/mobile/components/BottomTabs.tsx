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
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1">
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 rounded-[22px] border border-[#E8E1CE]/80 bg-white/85 p-1.5 shadow-[0_8px_30px_rgba(28,37,65,0.12)] backdrop-blur-xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const label = t(tab.labelKey);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="group relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={cn(
                  'flex h-9 w-full items-center justify-center rounded-xl transition-all duration-300',
                  isActive
                    ? 'bg-[#2A6B52] text-white shadow-sm shadow-[#2A6B52]/30'
                    : 'text-[#9AA1B4] group-active:bg-[#2A6B52]/5',
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
              </span>
              <span
                className={cn(
                  'max-w-full truncate px-0.5 text-[10px] leading-none transition-colors',
                  isActive ? 'font-bold text-[#2A6B52]' : 'font-medium text-[#9AA1B4]',
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
