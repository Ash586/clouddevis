'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
          className="w-full flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 transition dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-white text-sm font-semibold shrink-0 dark:bg-zinc-700">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0 text-start">
            <div className="text-sm font-semibold text-zinc-900 truncate dark:text-zinc-50">{userName}</div>
            <div className="text-xs text-zinc-400 font-medium dark:text-zinc-500">
              {user?.mode === 'ENTREPRISE' ? s('company') : s('artisan')}
            </div>
          </div>
          <ChevronDown size={16} strokeWidth={1.5} className={`text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${userDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {userDropdownOpen && (
          <>
            <div className="absolute top-full start-0 end-0 mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden z-20 animate-in dark:bg-zinc-900 dark:border-zinc-700">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                <User size={16} strokeWidth={1.5} />
                {s('profile')}
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
                <Bell size={16} strokeWidth={1.5} />
                {s('notifications')}
              </button>
              <div className="h-px bg-zinc-200 mx-3 dark:bg-zinc-700" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition dark:text-red-400 dark:hover:bg-red-900/20">
                <LogOut size={16} strokeWidth={1.5} />
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
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
            isActive('/dashboard') ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100'
          }`}>
          <LayoutDashboard size={16} strokeWidth={1.5} className="shrink-0" />
          {s('stats')}
        </button>

        {/* Documents & Factures */}
        <div>
          <button onClick={() => { setDocumentsOpen(!documentsOpen); setClientsOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              documentsOpen ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100'
            }`}>
            <FileText size={16} strokeWidth={1.5} className="shrink-0" />
            <span className="flex-1 text-start">{s('documents')}</span>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full dark:bg-zinc-800 dark:text-zinc-300">{docCount > 0 ? docCount : ''}</span>
            <ChevronDown size={14} strokeWidth={1.5} className={`text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${documentsOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${documentsOpen ? 'max-h-72' : 'max-h-0'}`}>
            <div className="ms-5 space-y-0.5 pt-0.5">
              {DOCUMENT_TYPES.map((dt) => {
                const count = typeBreakdown[TYPE_MAP[dt.id] ?? ''] ?? 0;
                return (
                  <button key={dt.id} onClick={() => navigateTo(dt.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm text-start transition border-s-2 ${
                      isDocType(dt.id)
                        ? 'bg-zinc-100 text-zinc-900 border-s-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 dark:border-s-zinc-50'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-s-transparent hover:border-s-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/50 dark:hover:border-s-zinc-600'
                    }`}>
                    <span className="flex-1">{s(dt.key)}</span>
                    {count > 0 && <span className="text-xs text-zinc-400 ms-1 dark:text-zinc-500">{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Clients */}
        <div>
          <button onClick={() => { setClientsOpen(!clientsOpen); setDocumentsOpen(false); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              clientsOpen ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-zinc-100'
            }`}>
            <Users size={16} strokeWidth={1.5} className="shrink-0" />
            <span className="flex-1 text-start">{s('clients')}</span>
            <span className="bg-zinc-100 text-zinc-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full dark:bg-zinc-800 dark:text-zinc-300">{clientCount > 0 ? clientCount : ''}</span>
            <ChevronDown size={14} strokeWidth={1.5} className={`text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${clientsOpen ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${clientsOpen ? 'max-h-20' : 'max-h-0'}`}>
            <div className="ms-5 space-y-0.5 pt-0.5">
              <button onClick={() => router.push('/dashboard/editor')}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition border-s-2 border-transparent hover:border-s-zinc-400 text-start dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/50 dark:hover:border-s-zinc-600">
                <Plus size={14} strokeWidth={1.5} />
                Nouveau document
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-[220px] flex-shrink-0 sticky top-0 h-screen p-4 bg-white border-r border-zinc-200 dark:bg-[#0a0a0a] dark:border-zinc-800">
        {sidebarContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[220px] flex flex-col p-4 bg-white shadow-2xl z-50 animate-in dark:bg-[#0a0a0a]">
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-6 left-4 z-40 md:hidden w-11 h-11 bg-zinc-900 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-zinc-800 transition active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
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
