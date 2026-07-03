'use client';

import { useState, useEffect, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { ENABLED_DOC_TYPES } from '@/lib/config';
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
  Plus,
  PenLine,
  Receipt,
  ClipboardList,
  Wrench,
  FilePen,
  ScrollText,
  Truck,
  X,
} from 'lucide-react';

const ALL_QUICK_DOCS = [
  { type: 'devis', labelKey: 'devis', icon: FileText },
  { type: 'facture', labelKey: 'facture', icon: Receipt },
  { type: 'proforma', labelKey: 'proforma', icon: ClipboardList },
  { type: 'bon_commande', labelKey: 'bonCommande', icon: FileStack },
  { type: 'bon_reception', labelKey: 'bonReception', icon: ScrollText },
  { type: 'bon_livraison', labelKey: 'bonLivraison', icon: Truck },
  { type: 'intervention', labelKey: 'intervention', icon: Wrench },
  { type: 'attachement', labelKey: 'attachement', icon: FilePen },
] as const;
const QUICK_DOCS = ALL_QUICK_DOCS.filter(d => ENABLED_DOC_TYPES.includes(d.type as never));

const ALL_DOCUMENT_TYPES = [
  { id: 'devis', key: 'devis' },
  { id: 'facture', key: 'facture' },
  { id: 'proforma', key: 'proforma' },
  { id: 'bon_commande', key: 'bonCommande' },
  { id: 'bon_reception', key: 'bonReception' },
  { id: 'bon_livraison', key: 'bonLivraison' },
  { id: 'intervention', key: 'intervention' },
  { id: 'attachement', key: 'attachement' },
] as const;
const DOCUMENT_TYPES = ALL_DOCUMENT_TYPES.filter(d => ENABLED_DOC_TYPES.includes(d.id as never));

const TYPE_MAP: Record<string, string> = {
  devis: 'DEVIS', facture: 'FACTURE', proforma: 'PROFORMA',
  bon_commande: 'BC', bon_reception: 'BR', bon_livraison: 'BL', intervention: 'INTERVENTION', attachement: 'ATTACHEMENT',
};

function SidebarInner() {
  const t = useTranslations('navbar');
  const s = useTranslations('sidebar');
  const tc = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [clientCount, setClientCount] = useState(0);
  const [typeBreakdown, setTypeBreakdown] = useState<Record<string, number>>({});
  const [documentsOpen, setDocumentsOpen] = useState(true);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : { stats: {} })
      .then(dashData => {
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
  function isDocumentsActive(type?: string) {
    const upperType = type ? TYPE_MAP[type] || type.toUpperCase() : type;
    return pathname === '/dashboard/documents' && searchParams?.get('type') === upperType;
  }

  function navigateTo(type: string) {
    setDocumentsOpen(true);
    setMobileOpen(false);
    const upperType = TYPE_MAP[type] || type.toUpperCase();
    router.push(`/dashboard/editor?type=${upperType}`);
  }

  function filterDocumentsByType(type: string) {
    setDocumentsOpen(true);
    setMobileOpen(false);
    const upperType = TYPE_MAP[type] || type.toUpperCase();
    router.push(`/dashboard/documents?type=${upperType}`);
  }

  const userName = user?.name || tc('user');
  const userInitial = userName.charAt(0);
  // Soft persona gating: artisans get a simplified nav (Team is company-only);
  // switching mode from the profile restores everything instantly.
  // Note: the JWT carries mode in lowercase while Prisma uses uppercase — compare case-insensitively.
  const isEntreprise = user?.mode?.toUpperCase() === 'ENTREPRISE';

  const sidebarContent = () => (
    <>
      {/* User Pill */}
      <div className="relative mb-4">
        <button type="button" onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-[var(--navy-3)] border border-[rgba(15,39,71,0.1)] hover:bg-[var(--navy-4)] transition-all min-h-[44px]">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--teal)] flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg">
            {userInitial}
          </div>
          <div className="flex-1 min-w-0 text-start">
            <div className="text-[13px] font-bold text-[var(--sand)] truncate">{userName}</div>
            <div className="text-[10px] text-[var(--sand-muted)] font-semibold uppercase tracking-wider">
              {isEntreprise ? s('company') : s('artisan')}
            </div>
          </div>
          <ChevronDown size={14} className={`text-[var(--sand-muted)] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {userDropdownOpen && (
          <>
            <div className="absolute top-full start-0 end-0 mt-2 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl overflow-hidden z-[110] animate-in">
              <button type="button" onClick={() => { router.push('/dashboard/profile'); setUserDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition min-h-[44px]">
                <User size={16} strokeWidth={1.5} />
                {s('profile')}
              </button>
              <button type="button" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition min-h-[44px]">
                <Bell size={16} strokeWidth={1.5} />
                {s('notifications')}
              </button>
              <div className="h-px bg-[rgba(15,39,71,0.08)] mx-4" />
              <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-400/10 transition min-h-[44px]">
                <LogOut size={16} strokeWidth={1.5} />
                {t('logout')}
              </button>
            </div>
            <div className="fixed inset-0 z-[105]" onClick={() => setUserDropdownOpen(false)} />
          </>
        )}
      </div>

      {/* New Document Button */}
      <div className="relative mb-4">
        <button type="button" onClick={() => setQuickCreateOpen(!quickCreateOpen)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--green)] text-white text-sm font-bold hover:bg-[var(--green-2)] transition-all active:scale-[0.98] shadow-lg shadow-[rgba(37,99,235,0.2)] min-h-[44px]">
          <Plus size={16} />
          {s('newDocument')}
        </button>

        {quickCreateOpen && (
          <>
            <div className="absolute left-0 right-0 top-full mt-2 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl overflow-hidden z-[110] animate-in">
              <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">
                {s('quickCreate')}
              </div>
              {QUICK_DOCS.map((qd) => (
                <button type="button" key={qd.type} onClick={() => { navigateTo(qd.type); setQuickCreateOpen(false); }}
                  className="group relative w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all duration-200 min-h-[44px] text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.08)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--green-glow)]/0 to-[var(--green-glow)]/0 group-hover:from-[var(--green-glow)]/60 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                  <qd.icon size={16} className="relative text-[var(--sand-muted)] group-hover:text-[var(--green-3)] group-hover:scale-110 transition-all duration-200" />
                  <span className="relative">{s(`docTypes.${qd.labelKey}`)}</span>
                </button>
              ))}
              <div className="h-px bg-[rgba(15,39,71,0.08)] mx-3" />
              <button type="button" onClick={() => { navigateTo('devis'); setQuickCreateOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition min-h-[44px]">
                <PenLine size={16} />
                {s('customDocument')}
              </button>
            </div>
            <div className="fixed inset-0 z-[105]" onClick={() => setQuickCreateOpen(false)} />
          </>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {/* Principal */}
        <NavGroup label={s('groups.principal')}>
          <NavItem icon={<LayoutDashboard size={18} />} label={s('stats')} active={isActive('/dashboard')} onClick={() => { router.push('/dashboard'); setMobileOpen(false); }} />
          <NavItem icon={<Users size={18} />} label={s('clients')} active={isActive('/dashboard/clients')} onClick={() => { router.push('/dashboard/clients'); setMobileOpen(false); }} badge={clientCount} />
        </NavGroup>

        {/* Documents */}
        <NavGroup label={s('groups.documents')}>
          <div>
            <button type="button" onClick={() => setDocumentsOpen(!documentsOpen)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                documentsOpen ? 'bg-[rgba(37,99,235,0.08)] text-[var(--green-3)]' : 'text-[var(--sand-muted)] hover:bg-[rgba(15,39,71,0.04)] hover:text-[var(--sand)]'
              }`}>
              <FileText size={18} />
              <span className="flex-1 text-start">{s('documents')}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${documentsOpen ? 'rotate-180' : ''}`} />
            </button>

            {documentsOpen && (
              <div className="mt-1 ms-4 space-y-0.5 border-l border-[rgba(15,39,71,0.1)] pl-2 animate-in">
                {DOCUMENT_TYPES.map((dt) => (
                  <button type="button" key={dt.id} onClick={() => filterDocumentsByType(dt.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-[13px] font-semibold transition min-h-[44px] ${
                      isDocumentsActive(dt.id) 
                        ? 'text-[var(--sand)] bg-[var(--navy-3)]' 
                        : 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-3)]'
                    }`}>
                    <span className="flex-1 text-start">{s(`docTypes.${dt.key}`)}</span>
                    {typeBreakdown[TYPE_MAP[dt.id]] > 0 && (
                      <span className="text-[10px] bg-[var(--navy-4)] text-[var(--sand-muted)] px-1.5 py-0.5 rounded-md">{typeBreakdown[TYPE_MAP[dt.id]]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </NavGroup>

        {/* Gestion */}
        <NavGroup label={s('groups.gestion')}>
          <NavItem icon={<FileStack size={18} />} label={s('templates')} active={isActive('/dashboard/templates')} onClick={() => { router.push('/dashboard/templates'); setMobileOpen(false); }} />
          <NavItem icon={<BarChart3 size={18} />} label={s('reports')} active={isActive('/dashboard/reports')} onClick={() => { router.push('/dashboard/reports'); setMobileOpen(false); }} />
          {isEntreprise && (
            <NavItem icon={<UsersRound size={18} />} label={s('team')} active={isActive('/dashboard/team')} onClick={() => { router.push('/dashboard/team'); setMobileOpen(false); }} />
          )}
        </NavGroup>

        {/* Compte */}
        <NavGroup label={s('groups.compte')}>
          <NavItem icon={<CreditCard size={18} />} label={s('subscription')} active={isActive('/dashboard/subscription')} onClick={() => { router.push('/dashboard/subscription'); setMobileOpen(false); }} />
          <NavItem icon={<Share2 size={18} />} label={s('shared')} active={isActive('/dashboard/shared')} onClick={() => { router.push('/dashboard/shared'); setMobileOpen(false); }} />
          <NavItem icon={<RefreshCw size={18} />} label={s('recurring')} active={isActive('/dashboard/recurring')} onClick={() => { router.push('/dashboard/recurring'); setMobileOpen(false); }} />
        </NavGroup>

        {/* Soft-gating affordance: artisan can discover the full company mode */}
        {user && !isEntreprise && (
          <button
            type="button"
            onClick={() => { router.push('/dashboard/profile'); setMobileOpen(false); }}
            className="w-full text-start px-4 py-2 text-[11px] font-semibold text-[var(--sand-muted)] hover:text-[var(--green-3)] transition-colors underline decoration-dotted underline-offset-2"
          >
            {s('switchToCompany')}
          </button>
        )}
      </nav>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-[260px] flex-shrink-0 sticky top-0 h-screen p-4 bg-[var(--navy)] border-r border-[rgba(15,39,71,0.08)]">
        {sidebarContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-[280px] flex flex-col p-4 bg-[var(--navy)] shadow-2xl z-[160] animate-in border-r border-[rgba(15,39,71,0.1)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <button type="button" onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[var(--navy-3)] rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={s('close') || 'Fermer le menu'}>
              <X size={18} />
            </button>
            <div className="pt-12 flex-1 flex flex-col overflow-hidden">
              {sidebarContent()}
            </div>
          </aside>
        </div>
      )}

      {!mobileOpen && (
        <button type="button" onClick={() => setMobileOpen(true)}
          className="flex md:hidden fixed bottom-6 left-5 z-[140] w-12 h-12 bg-[var(--navy-2)] text-[var(--sand)] border border-[rgba(15,39,71,0.14)] rounded-full shadow-xl items-center justify-center hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition active:scale-95"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
          aria-label="Menu">

          <Menu size={22} />
        </button>
      )}
    </>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 mb-1 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{label}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
        active ? 'bg-[rgba(37,99,235,0.12)] text-[var(--green-3)] shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]' : 'text-[var(--sand-muted)] hover:bg-[rgba(15,39,71,0.04)] hover:text-[var(--sand)]'
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
