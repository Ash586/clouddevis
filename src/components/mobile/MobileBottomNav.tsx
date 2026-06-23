'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Plus, Users, User } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Accueil', href: '/dashboard', icon: <Home size={22} /> },
  { label: 'Documents', href: '/dashboard/documents', icon: <FileText size={22} /> },
  { label: 'Nouveau', href: '__new__', icon: <Plus size={22} /> },
  { label: 'Clients', href: '/dashboard/clients', icon: <Users size={22} /> },
  { label: 'Profil', href: '/dashboard/profile', icon: <User size={22} /> },
];

interface MobileBottomNavProps {
  onNewDoc?: () => void;
}

export function MobileBottomNav({ onNewDoc }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav className="mobile-bottom-nav md:hidden">
      <div className="flex items-stretch justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          if (item.href === '__new__') {
            return (
              <button
                key="new"
                onClick={onNewDoc}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
                aria-label="Nouveau document"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--green)] flex items-center justify-center text-white shadow-lg shadow-[rgba(37,99,235,0.3)] active:scale-95 transition-transform">
                  <Plus size={22} strokeWidth={2.5} />
                </div>
              </button>
            );
          }

          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
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
