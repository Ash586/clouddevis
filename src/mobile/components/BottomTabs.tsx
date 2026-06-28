'use client';

// ============================================================
// CloudDevis Mobile — Bottom Tab Navigation
// 4 tabs: Accueil | Documents | Société | Réglages
// ============================================================

import { Home, Files, Building, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'documents' | 'company' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'documents', label: 'Documents', icon: Files },
  { id: 'company', label: 'Société', icon: Building },
  { id: 'settings', label: 'Réglages', icon: Settings },
];

interface BottomTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomTabs({ activeTab, onTabChange }: BottomTabsProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-stretch justify-around h-16 px-2 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[44px]',
                'transition-colors duration-200',
                'active:scale-95 transform',
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator bar (top) */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-[var(--green-2)]" />
              )}
              <span
                className={cn(
                  'flex items-center justify-center w-9 h-7 rounded-lg transition-all duration-200',
                  isActive && 'bg-[var(--blue-bg)]',
                )}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-[var(--green-2)]' : 'text-[var(--sand-muted)]',
                  )}
                />
              </span>
              <span
                className={cn(
                  'text-[11px] font-semibold leading-tight truncate',
                  'transition-colors duration-200',
                  isActive ? 'text-[var(--green-2)]' : 'text-[var(--sand-muted)]',
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
