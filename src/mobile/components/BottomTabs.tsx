'use client';

import { Home, FileText, Users, Settings } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';

export type TabKey = 'home' | 'documents' | 'clients' | 'settings';

interface BottomTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; icon: typeof Home; labelKey: string }[] = [
  { key: 'home', icon: Home, labelKey: 'nav.home' },
  { key: 'documents', icon: FileText, labelKey: 'nav.documents' },
  { key: 'clients', icon: Users, labelKey: 'nav.clients' },
  { key: 'settings', icon: Settings, labelKey: 'nav.settings' },
];

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  const { t } = useMobileI18n();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[rgba(15,39,71,0.08)] px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {TABS.map(({ key, icon: Icon, labelKey }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#2563EB]'
                  : 'text-[#5A6B85] hover:text-[#0F2747]'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold leading-none">{t(labelKey as any)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
