'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileTable } from '@/components/mobile/MobileTable';

interface TeamData {
  id: string; name: string; slug: string;
  owner: { id: string; name: string; email: string };
  members: { id: string; role: string; user: { id: string; name: string; email: string } }[];
  invites: { id: string; email: string; role: string; status: string; createdAt: string }[];
  _count: { documents: number };
}

export default function TeamDetailPage() {
  const t = useTranslations('teams');
  const tc = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  const fetchTeam = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teams/${params.id}`);
      if (res.ok) setTeam((await res.json()).team);
      else router.push('/dashboard/team');
    } catch { router.push('/dashboard/team'); }
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, [params.id]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await fetch(`/api/teams/${params.id}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    setInviteEmail('');
    fetchTeam();
  };

  const handleRemoveMember = async (userId: string) => {
    await fetch(`/api/teams/${params.id}/members/${userId}`, { method: 'DELETE' });
    fetchTeam();
  };

  const handleChangeRole = async (userId: string, role: string) => {
    await fetch(`/api/teams/${params.id}/members/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    fetchTeam();
  };

  const isOwner = team?.owner?.id === 'current'; // Will be checked server-side

  const memberColumns = [
    { key: 'user.name', label: t('memberName') },
    { key: 'user.email', label: t('memberEmail') },
    { key: 'role', label: t('memberRole') },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!team) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
              <button onClick={() => router.push('/dashboard/team')} className="text-xs text-blue-600 font-semibold hover:text-blue-700 mb-4 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {t('backToTeams')}
              </button>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{team.name}</h1>
                  <p className="text-xs text-slate-400 mt-1">{t('teamInfo', { members: team.members.length, docs: team._count.documents })}</p>
                </div>
              </div>

              {/* Invite */}
              <Card className="p-4 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-3">{t('inviteMember')}</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder={t('inviteEmailPlaceholder')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white">
                    <option value="MEMBER">{t('roleMember')}</option>
                    <option value="ADMIN">{t('roleAdmin')}</option>
                  </select>
                  <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>{t('sendInvite')}</Button>
                </div>
              </Card>

              {/* Members */}
              <Card className="p-4 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">{t('members')} ({team.members.length})</h3>
                <MobileTable columns={memberColumns} data={team.members} keyField="id" />
              </Card>

              {/* Invites */}
              {team.invites.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">{t('pendingInvites')}</h3>
                  <div className="space-y-2">
                    {team.invites.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{inv.email}</p>
                          <p className="text-xs text-slate-400">{inv.role} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">{t('pending')}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </main>
          </TrialGate>
        </div>
      </div>
    </div>
  );
}
