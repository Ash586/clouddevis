'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import {
  LayoutDashboard,
  FileText,
  Users,
  ChevronDown,
  Plus,
  User,
  Bell,
  LogOut,
  Menu,
  BarChart3,
  FileStack,
  CreditCard,
} from 'lucide-react';

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
  const tc = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
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
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : { stats: {} })
      .then(dashData => {
        setDocCount(dashData.stats?.totalDocs ?? 0);
        setClientCount(dashData.stats?.totalClients ?? 0);
        setTypeBreakdown(dashData.stats?.typeBreakdown ?? {});
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
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

  const userName = user?.name || tc('user');
  const userInitial = userName.charAt(0);

  const sidebarContent = (inDrawer = false) => (
    <>
      {/* User Pill */}
      <div className="relative mb-4">
        <button onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          aria-expanded={userDropdownOpen}
          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100/60 hover:bg-blue-50 transition">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-black shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0 text-start">
            <div className="text-sm font-bold text-slate-900 truncate">{userName}</div>
            <div className="text-xs text-slate-400 font-semibold">
              {user?.mode === 'ENTREPRISE' ? s('company') : s('artisan')}
            </div>
          </div>
          <ChevronDown size={16} strokeWidth={1.5} className={`text-slate-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {userDropdownOpen && (
          <>
            <div className="absolute top-full start-0 end-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/90 rounded-lg shadow-xl overflow-hidden z-20 animate-in">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                <User size={16} strokeWidth={1.5} />
                {s('profile')}
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition">
                <Bell size={16} strokeWidth={1.5} />
                {s('notifications')}
              </button>
              <div className="h-px bg-slate-200/60 mx-3" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 transition">
                <LogOut size={16} strokeWidth={1.5} />
                {t('logout')}
              </button>
            </div>
            <div className="fixed inset-0 z-10" onClick={() => setUserDropdownOpen(false)} />
          </>
        )}
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto space-y-0.5">
        {/* Dashboard */}
        <button onClick={() => { setDocumentsOpen(false); setClientsOpen(false); router.push('/dashboard'); }}
          aria-current={isActive('/dashboard') ? 'page' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition border-l-2 ${
            isActive('/dashboard') ? 'bg-blue-50 text-blue-600 border-l-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-l-transparent'
          }`}>
          <LayoutDashboard size={16} strokeWidth={1.5} className="shrink-0" />
          {s('stats')}
        </button>

        {/* Documents */}
        <div>
          <button onClick={() => { setDocumentsOpen(!documentsOpen); setClientsOpen(false); }}
            aria-expanded={documentsOpen}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition border-l-2 ${
              documentsOpen ? 'bg-blue-50 text-blue-600 border-l-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-l-transparent'
            }`}>
            <FileText size={16} strokeWidth={1.5} className="shrink-0" />
            <span className="flex-1 text-start">{s('documents')}</span>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{docCount > 0 ? docCount : ''}</span>
            <ChevronDown size={14} strokeWidth={1.5} className={`text-slate-400 transition-transform duration-200 ${documentsOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${documentsOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="ms-5 space-y-0.5 pt-0.5">
              <button onClick={() => { router.push('/dashboard/documents'); setMobileOpen(false); }}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition border-s-2 ${
                  isActive('/dashboard/documents') ? 'bg-blue-50 text-blue-600 border-s-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-blue-50/50 border-s-transparent hover:border-s-blue-200'
                }`}>
                <span className="flex-1 text-start">{s('allDocuments') || 'Tous les documents'}</span>
              </button>
              {DOCUMENT_TYPES.map((dt) => {
                const count = typeBreakdown[TYPE_MAP[dt.id] ?? ''] ?? 0;
                return (
                  <button key={dt.id} onClick={() => navigateTo(dt.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-semibold text-start transition border-s-2 ${
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
          <button onClick={() => { setClientsOpen(!clientsOpen); setDocumentsOpen(false); router.push('/dashboard/clients'); setMobileOpen(false); }}
            aria-expanded={clientsOpen}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition border-l-2 ${
              isActive('/dashboard/clients') ? 'bg-blue-50 text-blue-600 border-l-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-l-transparent'
            }`}>
            <Users size={16} strokeWidth={1.5} className="shrink-0" />
            <span className="flex-1 text-start">{s('clients')}</span>
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">{clientCount > 0 ? clientCount : ''}</span>
          </button>
        </div>

        {/* Templates */}
        <button onClick={() => { setDocumentsOpen(false); setClientsOpen(false); router.push('/dashboard/templates'); setMobileOpen(false); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition border-l-2 ${
            isActive('/dashboard/templates') ? 'bg-blue-50 text-blue-600 border-l-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-l-transparent'
          }`}>
          <FileStack size={16} strokeWidth={1.5} className="shrink-0" />
          {s('templates') || 'Modèles'}
        </button>

        {/* Reports */}
        <button onClick={() => { setDocumentsOpen(false); setClientsOpen(false); router.push('/dashboard/reports'); setMobileOpen(false); }}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition border-l-2 ${
            isActive('/dashboard/reports') ? 'bg-blue-50 text-blue-600 border-l-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-l-transparent'
          }`}>
          <BarChart3 size={16} strokeWidth={1.5} className="shrink-0" />
          {s('reports') || 'Rapports'}
        </button>

        {/* Pricing */}
        <button onClick={() => { window.open('/pricing', '_blank'); setMobileOpen(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition border-l-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-l-transparent">
          <CreditCard size={16} strokeWidth={1.5} className="shrink-0" />
          {s('pricing') || 'Tarifs'}
        </button>
      </nav>
    </>
  );

  return (
    <>
      <aside aria-label="Navigation" className="hidden md:flex md:flex-col w-[220px] flex-shrink-0 sticky top-0 h-screen p-4 bg-white/60 backdrop-blur-xl border-r border-slate-200 shadow-sm">
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
        aria-label="Open menu"
        aria-expanded={mobileOpen}
        className="fixed bottom-6 left-4 z-40 md:hidden w-11 h-11 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition active:scale-95">
        <Menu size={20} strokeWidth={1.5} />
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
