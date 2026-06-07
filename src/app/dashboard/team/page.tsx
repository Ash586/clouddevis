'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Team {
  id: string; name: string; slug: string;
  _count: { members: number; documents: number };
  owner: { name: string; email: string };
  createdAt: string;
}

export default function TeamsPage() {
  const t = useTranslations('teams');
  const tc = useTranslations('common');
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/teams');
      if (res.ok) setTeams((await res.json()).teams);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) {
      setNewName('');
      setShowCreate(false);
      fetchTeams();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            <main className="flex-1 max-w-5xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900">{t('title')}</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('subtitle')}</p>
                </div>
                <Button size="sm" onClick={() => setShowCreate(true)}>{t('createTeam')}</Button>
              </div>

              {showCreate && (
                <Card className="p-4 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">{t('createNew')}</h3>
                  <div className="flex gap-2">
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                      placeholder={t('teamNamePlaceholder')}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                    <Button onClick={handleCreate} disabled={!newName.trim()}>{tc('save')}</Button>
                    <Button variant="outline" onClick={() => setShowCreate(false)}>{tc('cancel')}</Button>
                  </div>
                </Card>
              )}

              {loading ? (
                <div className="py-12 text-center"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
              ) : teams.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="text-sm text-slate-400">{t('noTeams')}</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {teams.map(team => (
                    <Card key={team.id} className="p-4 cursor-pointer hover:shadow-md transition"
                      onClick={() => router.push(`/dashboard/team/${team.id}`)}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-slate-900">{team.name}</h3>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {team._count.members} {t('members')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {t('createdBy')} {team.owner.name} • {team._count.documents} {t('documents').toLowerCase()}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </TrialGate>
        </div>
      </div>
    </div>
  );
}
