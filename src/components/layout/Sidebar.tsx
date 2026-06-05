'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const DOCUMENT_TYPES = [
  { id: 'facture', key: 'facture' },
  { id: 'devis', key: 'devis' },
  { id: 'proforma', key: 'proforma' },
  { id: 'bon_commande', key: 'bonCommande' },
  { id: 'intervention', key: 'intervention' },
  { id: 'attachement', key: 'attachement' },
] as const;

function SidebarInner() {
  const t = useTranslations('navbar');
  const s = useTranslations('sidebar');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [docCount, setDocCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, number>>({});
  const [documentsOpen, setDocumentsOpen] = useState(true);
  const [clientsOpen, setClientsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const TYPE_MAP: Record<string, string> = {
    facture: 'FACTURE', devis: 'DEVIS', proforma: 'PROFORMA',
    bon_commande: 'BC', attachement: 'BR',
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.ok ? r.json() : null),
      fetch('/api/dashboard').then(r => r.ok ? r.json() : { stats: {} }),
    ])
      .then(([userData, dashData]) => {
        setUser(userData?.user ?? null);
        setDocCount(dashData.stats?.totalDocs ?? 0);
        setClientCount(dashData.stats?.totalClients ?? 0);
        setTypeBreakdown(dashData.stats?.typeBreakdown ?? {});
      })
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  }

  function isActive(path: string) {
    return pathname === path;
  }

  function isDocType(type: string) {
    return searchParams?.get('type') === type;
  }

  function navigateTo(type: string) {
    setClientsOpen(false);
    setDocumentsOpen(true);
    setMobileOpen(false);
    router.push(`/dashboard/editor?type=${type}`);
  }

  const userName = user?.name || 'مستخدم';
  const userInitial = userName.charAt(0);

  const sidebarContent = (inDrawer = false) => (
    <>
      {/* User Pill */}
      <div className="relative mb-4">
        <button onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/60 hover:bg-blue-50 transition">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-black shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0 text-start">
            <div className="text-xs font-bold text-slate-900 truncate">{userName}</div>
            <div className="text-[10px] text-slate-400 font-semibold">
              {user?.mode === 'ENTREPRISE' ? s('company') : s('artisan')}
            </div>
          </div>
          <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {userDropdownOpen && (
          <>
            <div className="absolute top-full start-0 end-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/90 rounded-xl shadow-xl overflow-hidden z-20 animate-in">
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {s('profile')}
              </button>
              <button className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {s('notifications')}
              </button>
              <div className="h-px bg-slate-200/60 mx-3" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {t('logout')}
              </button>
            </div>
            <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-0.5">
        {/* Stats */}
        <button onClick={() => { setDocumentsOpen(false); setClientsOpen(false); router.push('/dashboard'); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
            isActive('/dashboard') ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}>
          <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {s('stats')}
        </button>

        {/* Documents & Factures */}
        <div>
          <button onClick={() => { setDocumentsOpen(!documentsOpen); setClientsOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              documentsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}>
            <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <span className="flex-1 text-start">{s('documents')}</span>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{docCount > 0 ? docCount : ''}</span>
            <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${documentsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${documentsOpen ? 'max-h-72' : 'max-h-0'}`}>
            <div className="ms-5 space-y-0.5 pt-0.5">
              {DOCUMENT_TYPES.map((dt) => {
                const count = typeBreakdown[TYPE_MAP[dt.id] ?? ''] ?? 0;
                return (
                  <button key={dt.id} onClick={() => navigateTo(dt.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-[11px] font-semibold text-start transition border-s-2 ${
                      isDocType(dt.id)
                        ? 'bg-blue-50 text-blue-600 border-s-blue-600'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-blue-50/50 border-s-transparent hover:border-s-blue-200'
                    }`}>
                    <span className="flex-1">{s(dt.key)}</span>
                    {count > 0 && <span className="text-[10px] font-bold text-slate-400 ms-1">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clients */}
        <div>
          <button onClick={() => { setClientsOpen(!clientsOpen); setDocumentsOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              clientsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}>
            <svg className="w-4.5 h-4.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="flex-1 text-start">{s('clients')}</span>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{clientCount > 0 ? clientCount : ''}</span>
            <svg className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${clientsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${clientsOpen ? 'max-h-28' : 'max-h-0'}`}>
            <div className="ms-5 space-y-0.5 pt-0.5">
              <button onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-blue-50/50 transition border-s-2 border-transparent hover:border-s-blue-200 text-start">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                {s('clientsMy')}
              </button>
              <button onClick={() => router.push('/dashboard/editor')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-blue-50/50 transition border-s-2 border-transparent hover:border-s-blue-200 text-start">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                {s('clientsAdd')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer - Settings */}
      <div className="pt-3 mt-auto border-t border-slate-200/20">
        <button onClick={() => router.push('/dashboard')}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition relative">
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          {s('settings')}
          <span className="absolute top-1.5 start-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm" />
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-[220px] flex-shrink-0 sticky top-0 h-screen p-4 bg-white/60 backdrop-blur-xl border-s border-white/80 shadow-sm z-10">
        {sidebarContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[220px] flex flex-col p-4 bg-white shadow-2xl z-50 animate-in">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-6 left-4 z-40 md:hidden w-11 h-11 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition active:scale-95">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarInner />
    </Suspense>
  );
}
