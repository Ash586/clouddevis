'use client';

// ============================================================
// CloudDevis Mobile — Home Header
// Logo left, user avatar right
// ============================================================

import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeHeaderProps {
  userName: string;
  userInitials: string;
  hasNotifications?: boolean;
  onNotificationTap?: () => void;
}

export function HomeHeader({
  userName,
  userInitials,
  hasNotifications = false,
  onNotificationTap,
}: HomeHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 pt-2 pb-3"
      style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 8px))' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-[var(--green)] to-[var(--teal)]">
          CD
        </div>
        <span className="text-lg font-bold text-[var(--sand)]" style={{ fontFamily: 'Sora, sans-serif' }}>
          CloudDevis
        </span>
      </div>

      {/* Right side: notification bell + avatar */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button type="button"           onClick={onNotificationTap}
          className={cn(
            'relative w-10 h-10 rounded-full flex items-center justify-center',
            'bg-[var(--navy-3)] text-[var(--sand-muted)]',
            'active:scale-95 transition-transform',
          )}
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={1.8} />
          {hasNotifications && (
            <span
              className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2"
              style={{
                background: '#EF4444',
                borderColor: 'var(--navy-3)',
              }}
            />
          )}
        </button>

        {/* User avatar (initials) */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            'text-sm font-bold text-white',
            'bg-gradient-to-br from-[var(--green-2)] to-[#0EA5E9]',
          )}
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
