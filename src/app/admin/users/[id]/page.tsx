'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft, Mail, Globe, UserCheck, FileText, Users, Layout,
  Ban, CheckCircle, CreditCard, Calendar, Clock,
} from 'lucide-react';

interface UserDetail {
  id: string; name: string; email: string; country: string; mode: string;
  sector: string | null; subscriptionStatus: string;
  trialStartAt: string | null; subscriptionEndAt: string | null;
  suspended: boolean; suspendedAt: string | null;
  createdAt: string;
  _count: { documents: number; clients: number; templates: number };
}

export default function AdminUserDetailPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const userId = params.id as string;

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {}
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleSuspendToggle = async () => {
    if (!user) return;
    setActionLoading(true);
    setMessage('');
    try {
      const endpoint = user.suspended ? 'unsuspend' : 'suspend';
      const res = await fetch(`/api/admin/users/${userId}/${endpoint}`, { method: 'POST' });
      if (res.ok) {
        await fetchUser();
        setMessage(user.suspended ? t('users.unsuspendSuccess') : t('users.suspendSuccess'));
      } else {
        const data = await res.json();
        setMessage(data.error || t('error'));
      }
    } catch {
      setMessage(t('error'));
    }
    setActionLoading(false);
  };

  const handleSubscriptionChange = async (newStatus: string) => {
    if (!user) return;
    setActionLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionStatus: newStatus }),
      });
      if (res.ok) {
        await fetchUser();
        setMessage(t('subscriptions.planChanged'));
      } else {
        setMessage(t('error'));
      }
    } catch {
      setMessage(t('error'));
    }
    setActionLoading(false);
  };

  const statusColors: Record<string, string> = {
    TRIAL: 'bg-amber-50 text-amber-600',
    STANDARD: 'bg-blue-50 text-blue-600',
    PRO: 'bg-emerald-50 text-emerald-600',
    MAX: 'bg-purple-50 text-purple-600',
    ENTERPRISE: 'bg-red-50 text-red-600',
    EXPIRED: 'bg-slate-50 text-slate-400',
    FREE: 'bg-slate-50 text-slate-600',
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-slate-400">{t('error')}</p>
      <button onClick={() => router.push('/admin/users')} className="mt-4 text-blue-600 font-bold text-sm hover:underline">
        {t('nav.users')}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/users')} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">{t('nav.userDetail')}</h1>
          <p className="text-sm text-slate-400">{user.name} — {user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={handleSuspendToggle} disabled={actionLoading}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition disabled:opacity-50 ${user.suspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {actionLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : user.suspended ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Ban className="w-4 h-4" />
            )}
            {user.suspended ? t('users.unsuspend') : t('users.suspend')}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-xl text-sm font-semibold ${message.includes('succès') || message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* User Info */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('users.detail')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400 font-semibold">{t('table.email')}</p>
                <p className="text-sm font-semibold text-slate-800">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <Globe className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400 font-semibold">{t('table.country')}</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{user.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400 font-semibold">{t('users.role')}</p>
                <p className="text-sm font-semibold text-slate-800 capitalize">{user.mode}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className={`w-4 h-4 rounded-full ${user.suspended ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <div>
                <p className="text-xs text-slate-400 font-semibold">{t('table.status')}</p>
                <p className="text-sm font-semibold text-slate-800">
                  {user.suspended ? t('users.suspended') : t('users.active')}
                  {user.suspendedAt && ` — ${new Date(user.suspendedAt).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>

          {/* Sector & Dates */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1">Secteur</p>
              <p className="text-sm font-semibold text-slate-800">{user.sector || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1">{t('table.date')}</p>
              <p className="text-sm font-semibold text-slate-800">{user.createdAt}</p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card className="p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">{t('table.docs')}</h2>
          <div className="space-y-4">
            {[
              { label: t('users.docs'), value: user._count.documents, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: t('users.clients'), value: user._count.clients, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: t('users.templates'), value: user._count.templates, icon: Layout, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-semibold">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Subscription Management */}
      <Card className="p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-4">{t('subscriptions.detail')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-400 font-semibold mb-1">{t('subscriptions.status')}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[user.subscriptionStatus] || 'bg-slate-50 text-slate-600'}`}>
              {user.subscriptionStatus}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-400 font-semibold mb-1">{t('subscriptions.trialEnd')}</p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {user.trialStartAt ? new Date(user.trialStartAt).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-400 font-semibold mb-1">{t('subscriptions.endDate')}</p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {user.subscriptionEndAt ? new Date(user.subscriptionEndAt).toLocaleDateString() : '—'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <p className="text-xs text-slate-400 font-semibold mb-1">{t('subscriptions.changePlan')}</p>
            <select
              value={user.subscriptionStatus}
              onChange={e => handleSubscriptionChange(e.target.value)}
              disabled={actionLoading}
              className="mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="TRIAL">TRIAL</option>
              <option value="STANDARD">STANDARD</option>
              <option value="PRO">PRO</option>
              <option value="MAX">MAX</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
              <option value="FREE">FREE</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>
        </div>
      </Card>
    </div>
  );
}
