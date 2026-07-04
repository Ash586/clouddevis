'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
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

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
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
      <div className="flex-1 min-w-0">
          <TrialGate>
            <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
              <button type="button" onClick={() => router.push('/dashboard/team')} className="text-xs text-blue-400 font-semibold hover:text-blue-300 mb-4 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                {t('backToTeams')}
              </button>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--sand)]">{team.name}</h1>
                  <p className="text-xs text-[var(--sand-muted)] mt-1">{t('teamInfo', { members: team.members.length, docs: team._count.documents })}</p>
                </div>
              </div>

              {/* Invite */}
              <Card className="p-4 mb-6">
                <h3 className="text-sm font-bold text-[var(--sand)] mb-3">{t('inviteMember')}</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder={t('inviteEmailPlaceholder')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)]" />
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-[rgba(15,39,71,0.1)] text-sm bg-[var(--navy-3)]">
                    <option value="MEMBER">{t('roleMember')}</option>
                    <option value="ADMIN">{t('roleAdmin')}</option>
                  </select>
                  <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>{t('sendInvite')}</Button>
                </div>
              </Card>

              {/* Members */}
              <Card className="p-4 mb-6">
                <h3 className="text-sm font-bold text-[var(--sand)] mb-4">{t('members')} ({team.members.length})</h3>
                <MobileTable columns={memberColumns} data={team.members} keyField="id" />
              </Card>

              {/* Invites */}
              {team.invites.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-bold text-[var(--sand)] mb-4">{t('pendingInvites')}</h3>
                  <div className="space-y-2">
                    {team.invites.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-[var(--navy-3)] rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-[var(--sand-2)]">{inv.email}</p>
                          <p className="text-xs text-[var(--sand-muted)]">{inv.role} • {new Date(inv.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">{t('pending')}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </main>
          </TrialGate>
      </div>
    </div>
  );
}
