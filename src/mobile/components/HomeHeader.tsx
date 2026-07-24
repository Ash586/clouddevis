'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, ChevronLeft } from 'lucide-react';

interface HomeHeaderProps {
  userName: string;
  userInitials: string;
  hasNotifications?: boolean;
  onNotificationTap?: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function HomeHeader({ userName, userInitials, hasNotifications, onNotificationTap }: HomeHeaderProps) {
  return (
    <div className="px-5 pt-2">
      {/* Hero card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#2A6B52] p-6 shadow-lg">
        {/* Dot pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* Gold accent line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-[#D6B462] via-[#B5402C] to-[#D6B462]" />

        <div className="relative flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D6B462]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#D6B462]">
              Pro
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-white">
              {getGreeting()}, {userName || '...'}
            </h1>
            <p className="mt-1 text-sm text-white/60">Devis & Factures · DGI Compliant</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={onNotificationTap}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-colors hover:bg-white/15"
            >
              <Bell size={18} />
              {hasNotifications && (
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#B5402C] border-2 border-[#2A6B52]" />
              )}
            </button>
            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#D6B462] text-sm font-bold text-[#2A6B52]">
              {userInitials}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
