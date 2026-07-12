'use client';

// ============================================================
// Rakmana Mobile — Bottom Tab Navigation
// 4 tabs: Accueil | Documents | Société | Réglages
// No backdrop-filter blur — causes jank in Capacitor WebView
// on mid/low-end Android (Infinix, Tecno, Samsung A-series).
// ============================================================

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
      className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
      style={{
        background: 'var(--navy-2)',
        borderTop: '1px solid var(--border-2)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch justify-around h-16 px-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const label = t(tab.labelKey);

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[44px]',
                'transition-colors duration-150',
                'active:scale-95 transform',
              )}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator pill (top) */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                  style={{ background: 'var(--green-2)' }}
                />
              )}

              {/* Icon container */}
              <span
                className={cn(
                  'flex items-center justify-center w-10 h-7 rounded-lg transition-all duration-150',
                  isActive && 'bg-[var(--green-bg)]',
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  style={{ color: isActive ? 'var(--green-2)' : 'var(--sand-muted)' }}
                />
              </span>

              {/* Label */}
              <span
                className="text-[10.5px] font-semibold leading-tight truncate transition-colors duration-150"
                style={{ color: isActive ? 'var(--green-2)' : 'var(--sand-muted)' }}
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
