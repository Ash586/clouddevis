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
  User,
  Bell,
  LogOut,
  Menu,
  BarChart3,
  FileStack,
  CreditCard,
  UsersRound,
  Share2,
  RefreshCw,
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

  function isActive(path: string) { return pathname === path; }
  function isDocType(type: string) { return searchParams?.get('type') === type; }

  function navigateTo(type: string) {
    setDocumentsOpen(true);
    setMobileOpen(false);
    router.push(`/dashboard/editor?type=${type}`);
  }

  const userName = user?.name || tc('user');
  const userInitial = userName.charAt(0);

  const sidebarContent = () => (
    <>
      {/* User Pill */}
      <div className="relative mb-6">
        <button onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--navy-3)] border border-[rgba(245,237,214,0.1)] hover:bg-[var(--navy-4)] transition-all">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--teal)] flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0 text-start">
            <div className="text-[13px] font-bold text-[var(--sand)] truncate">{userName}</div>
            <div className="text-[10px] text-[var(--sand-muted)] font-semibold uppercase tracking-wider">
              {user?.mode === 'ENTREPRISE' ? s('company') : s('artisan')}
            </div>
          </div>
          <ChevronDown size={14} className={`text-[var(--sand-muted)] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {userDropdownOpen && (
          <>
            <div className="absolute top-full start-0 end-0 mt-2 bg-[var(--navy-2)] border border-[rgba(245,237,214,0.1)] rounded-xl shadow-2xl overflow-hidden z-[110] animate-in">
              <button onClick={() => { router.push('/dashboard/profile'); setUserDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition">
                <User size={16} strokeWidth={1.5} />
                {s('profile')}
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition">
                <Bell size={16} strokeWidth={1.5} />
                {s('notifications')}
              </button>
              <div className="h-px bg-[rgba(245,237,214,0.08)] mx-4" />
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-400/10 transition">
                <LogOut size={16} strokeWidth={1.5} />
                {t('logout')}
              </button>
            </div>
            <div className="fixed inset-0 z-[105]" onClick={() => setUserDropdownOpen(false)} />
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
        <NavItem icon={<LayoutDashboard size={18} />} label={s('stats')} active={isActive('/dashboard')} onClick={() => router.push('/dashboard')} />
        
        <div>
          <button onClick={() => setDocumentsOpen(!documentsOpen)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              documentsOpen ? 'bg-[rgba(0,149,77,0.08)] text-[var(--green-3)]' : 'text-[var(--sand-muted)] hover:bg-[rgba(245,237,214,0.04)] hover:text-[var(--sand)]'
            }`}>
            <FileText size={18} />
            <span className="flex-1 text-start">{s('documents')}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${documentsOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {documentsOpen && (
            <div className="mt-1 ml-4 space-y-1 border-l border-[rgba(245,237,214,0.1)] pl-2 animate-in">
              <button onClick={() => router.push('/dashboard/documents')}
                className={`w-full flex items-center px-4 py-2 rounded-lg text-[13px] font-semibold transition ${
                  isActive('/dashboard/documents') ? 'text-[var(--sand)] bg-[var(--navy-3)]' : 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-3)]'
                }`}>
                {s('allDocuments')}
              </button>
              {DOCUMENT_TYPES.map((dt) => (
                <button key={dt.id} onClick={() => navigateTo(dt.id)}
                  className={`w-full flex items-center px-4 py-2 rounded-lg text-[13px] font-semibold transition ${
                    isDocType(dt.id) ? 'text-[var(--sand)] bg-[var(--navy-3)]' : 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-3)]'
                  }`}>
                  <span className="flex-1 text-start">{s(dt.key)}</span>
                  {typeBreakdown[TYPE_MAP[dt.id] ?? ''] > 0 && (
                    <span className="text-[10px] bg-[var(--navy-4)] text-[var(--sand-muted)] px-1.5 py-0.5 rounded-md">{typeBreakdown[TYPE_MAP[dt.id] ?? '']}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <NavItem icon={<Users size={18} />} label={s('clients')} active={isActive('/dashboard/clients')} onClick={() => router.push('/dashboard/clients')} badge={clientCount} />
        <NavItem icon={<FileStack size={18} />} label={s('templates')} active={isActive('/dashboard/templates')} onClick={() => router.push('/dashboard/templates')} />
        <NavItem icon={<BarChart3 size={18} />} label={s('reports')} active={isActive('/dashboard/reports')} onClick={() => router.push('/dashboard/reports')} />
        <NavItem icon={<UsersRound size={18} />} label={s('team')} active={isActive('/dashboard/team')} onClick={() => router.push('/dashboard/team')} />
        <NavItem icon={<CreditCard size={18} />} label={s('subscription')} active={isActive('/dashboard/subscription')} onClick={() => router.push('/dashboard/subscription')} />
        <NavItem icon={<Share2 size={18} />} label={s('shared')} active={isActive('/dashboard/shared')} onClick={() => router.push('/dashboard/shared')} />
        <NavItem icon={<RefreshCw size={18} />} label={s('recurring')} active={isActive('/dashboard/recurring')} onClick={() => router.push('/dashboard/recurring')} />
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-[260px] flex-shrink-0 sticky top-0 h-screen p-6 bg-[var(--navy)] border-r border-[rgba(245,237,214,0.08)]">
        {sidebarContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[280px] flex flex-col p-6 bg-[var(--navy)] shadow-2xl z-[160] animate-in border-r border-[rgba(245,237,214,0.1)]">
            {sidebarContent()}
          </aside>
        </div>
      )}

      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed bottom-6 right-6 z-[140] md:hidden w-14 h-14 bg-[var(--green-2)] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[var(--green-3)] transition active:scale-95">
        <Menu size={24} />
      </button>
    </>
  );
}

function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, badge?: number }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active ? 'bg-[rgba(0,149,77,0.12)] text-[var(--green-3)] shadow-[inset_0_0_0_1px_rgba(0,149,77,0.2)]' : 'text-[var(--sand-muted)] hover:bg-[rgba(245,237,214,0.04)] hover:text-[var(--sand)]'
      }`}>
      <span className={active ? 'text-[var(--green-3)]' : 'text-[var(--sand-muted)]'}>{icon}</span>
      <span className="flex-1 text-start">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-[var(--navy-4)] text-[var(--sand-muted)] text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </button>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarInner />
    </Suspense>
  );
}
