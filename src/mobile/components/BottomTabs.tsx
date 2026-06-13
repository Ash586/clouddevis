'use client';

// ============================================================
// CloudDevis Mobile — Bottom Tab Navigation
// 4 tabs: Accueil | Documents | Société | Réglages
// ============================================================

import { IconHome, IconFiles, IconBuilding, IconSettings } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'documents' | 'company' | 'settings';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof IconHome;
}

const TABS: Tab[] = [
  { id: 'home', label: 'Accueil', icon: IconHome },
  { id: 'documents', label: 'Documents', icon: IconFiles },
  { id: 'company', label: 'Société', icon: IconBuilding },
  { id: 'settings', label: 'Réglages', icon: IconSettings },
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
        background: 'rgba(17, 24, 39, 0.95)',
        borderTop: '1px solid rgba(245, 237, 214, 0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-stretch justify-around h-16 px-2 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px]',
                'transition-colors duration-200',
                'active:scale-95 transform',
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                stroke={isActive ? 2.2 : 1.8}
                className={cn(
                  'transition-colors duration-200',
                  isActive ? 'text-[#0B3D2E]' : 'text-[var(--sand-muted)]',
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold leading-tight truncate',
                  'transition-colors duration-200',
                  isActive ? 'text-[#0B3D2E]' : 'text-[var(--sand-muted)]',
                )}
              >
                {tab.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute top-1 w-1 h-1 rounded-full"
                  style={{ background: '#0B3D2E' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
