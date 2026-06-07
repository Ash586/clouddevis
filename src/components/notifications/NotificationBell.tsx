'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS = {
  INFO: { icon: Info, bg: 'bg-blue-50', text: 'text-blue-600' },
  WARNING: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600' },
  SUCCESS: { icon: CheckCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  ERROR: { icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-600' },
};

export function NotificationBell() {
  const t = useTranslations('notifications');
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  // Poll for new notifications every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => fetch(`/api/notifications/${n.id}`, { method: 'PATCH' })));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (!notifications.find(n => n.id === id)?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        aria-label={t('bell')}
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[480px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">{t('title')}</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition">
                {t('markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">{t('empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(n => {
                  const typeStyle = TYPE_ICONS[n.type] || TYPE_ICONS.INFO;
                  const Icon = typeStyle.icon;
                  return (
                    <div key={n.id} className={`p-3 transition ${n.read ? 'opacity-60' : 'bg-blue-50/20'}`}>
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 ${typeStyle.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon className={`w-3.5 h-3.5 ${typeStyle.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-[11px] font-bold ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>{n.title}</p>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {!n.read && (
                                <button onClick={() => markAsRead(n.id)} className="p-1 text-slate-400 hover:text-blue-600 rounded" title={t('markRead')}>
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button onClick={() => deleteNotification(n.id)} className="p-1 text-slate-400 hover:text-red-500 rounded" title={t('delete')}>
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[9px] text-slate-400 mt-1">{formatTimeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString();
}
