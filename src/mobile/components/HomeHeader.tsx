'use client';

import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface HomeHeaderProps {
  userName: string;
  userInitials: string;
  hasNotifications?: boolean;
  onNotificationTap?: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 17) return 'Bon apr\u00e8s-midi';
  return 'Bonsoir';
}

export function HomeHeader({ userName, userInitials, hasNotifications, onNotificationTap }: HomeHeaderProps) {
  return (
    <div className="px-4 pt-1">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl bg-[#0052CC] p-5 shadow-lg shadow-[#0052CC]/20"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#001A4D] via-[#0052CC] to-[#001A4D]" />

        <div className="relative flex items-start justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D4A843]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#D4A843]">
              Pro
            </span>
            <h1 className="mt-2 text-xl font-extrabold text-white leading-tight">
              {getGreeting()},<br />{userName || '...'}
            </h1>
            <p className="mt-0.5 text-xs text-white/55">Devis & Factures \u00b7 DGI Algeria</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNotificationTap}
              aria-label="Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80 transition-all duration-200 hover:bg-white/20 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Bell size={17} />
              {hasNotifications && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#DC3545] border-[1.5px] border-[#0052CC]" />
              )}
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D4A843] text-xs font-bold text-[#001A4D]">
              {userInitials}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
