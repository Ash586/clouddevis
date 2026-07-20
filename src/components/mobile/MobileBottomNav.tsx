'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Home, FileText, Plus, Users, User } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { ImpactStyle } from '@capacitor/haptics';

interface NavItem {
  label: string;
  tabKey: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', tabKey: '', href: '/dashboard', icon: <Home size={22} /> },
  { label: 'Documents', tabKey: 'documents', href: '/dashboard?tab=documents', icon: <FileText size={22} /> },
  { label: 'Nouveau', tabKey: '__new__', href: '__new__', icon: <Plus size={22} /> },
  { label: 'Clients', tabKey: 'clients', href: '/dashboard?tab=clients', icon: <Users size={22} /> },
  { label: 'Profil', tabKey: 'profile', href: '/dashboard/profile', icon: <User size={22} /> },
];

interface MobileBottomNavProps {
  onNewDoc?: () => void;
}

export function MobileBottomNav({ onNewDoc }: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { impact } = useHaptics();

  const activeTab = searchParams?.get('tab') || '';

  const isActive = (item: NavItem) => {
    if (item.tabKey === '__new__') return false;
    if (item.tabKey === '') return pathname === '/dashboard' && !activeTab;
    if (item.tabKey === 'profile') return pathname === '/dashboard/profile';
    return activeTab === item.tabKey;
  };

  const handleTabClick = (item: NavItem) => {
    impact(ImpactStyle.Light);
    if (item.tabKey === '__new__') {
      if (onNewDoc) onNewDoc();
      else router.push('/dashboard/editor?type=DEVIS');
    } else {
      router.push(item.href);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-[rgba(15,39,71,0.08)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-stretch justify-around h-16 px-1">
        {NAV_ITEMS.map((item) => {
          if (item.tabKey === '__new__') {
            return (
              <button
                type="button"
                key="new"
                onClick={() => handleTabClick(item)}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
                aria-label="Nouveau document"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--green)] flex items-center justify-center text-white shadow-lg shadow-[rgba(37,99,235,0.3)] active:scale-95 transition-transform">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          const active = isActive(item);
          return (
            <button
              type="button"
              key={item.tabKey}
              onClick={() => handleTabClick(item)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0"
              aria-label={item.label}
            >
              <span className={`transition-colors ${active ? 'text-[var(--green-3)]' : 'text-[var(--sand-muted)]'}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-semibold leading-tight truncate ${active ? 'text-[var(--green-3)]' : 'text-[var(--sand-muted)]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
