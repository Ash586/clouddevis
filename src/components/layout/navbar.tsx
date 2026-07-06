'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/hooks/useUser';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { SectionTabs } from '@/components/layout/SectionTabs';
import { ENABLED_DOC_TYPES } from '@/lib/config';
import {
  Menu, X, Home, LayoutDashboard, FileText, Users, ChevronDown, User, Bell, LogOut,
  FileStack, CreditCard, UsersRound, Plus, PenLine, Receipt, ClipboardList, Wrench,
  FilePen, ScrollText, Truck,
} from 'lucide-react';

const LANG_LABELS: Record<string, string> = { fr: 'FR', ar: 'AR', en: 'EN' };
const LANGS = ['fr', 'ar', 'en'] as const;

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

export function Navbar() {
  const t = useTranslations('navbar');
  const s = useTranslations('sidebar');
  const tc = useTranslations('common');
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { user, loading, refresh } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [clientCount, setClientCount] = useState(0);

  // Fetch nav badge data only once we know a user session exists.
  useEffect(() => {
    if (!user) return;
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : { stats: {} })
      .then(dashData => {
        setClientCount(dashData.stats?.totalClients ?? 0);
      })
      .catch(() => {});
  }, [user]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    refresh();
    router.push('/');
  }

  function navigateTo(type: string) {
    setMobileOpen(false);
    const upperType = TYPE_MAP[type] || type.toUpperCase();
    router.push(`/dashboard/editor?type=${upperType}`);
  }
  function filterDocumentsByType(type: string) {
    setMobileOpen(false);
    const upperType = TYPE_MAP[type] || type.toUpperCase();
    router.push(`/dashboard?tab=documents&type=${upperType}`);
  }

  const userName = user?.name || tc('user');
  const userInitial = userName.charAt(0);
  // Note: the JWT carries mode in lowercase while Prisma uses uppercase — compare case-insensitively.
  const isEntreprise = user?.mode?.toUpperCase() === 'ENTREPRISE';

  // ── User pill + dropdown (ported from the removed Sidebar) ──
  const userPill = user && (
    <div className="relative">
      <button type="button" onClick={() => setUserDropdownOpen(!userDropdownOpen)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-[rgba(15,39,71,0.06)] border border-[rgba(15,39,71,0.1)] hover:bg-[rgba(15,39,71,0.1)] transition-all min-h-[44px]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--teal)] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
          {userInitial}
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-[12px] font-bold text-[var(--sand)] leading-tight">{userName}</div>
          <div className="text-[9px] text-[var(--sand-muted)] font-semibold uppercase tracking-wider leading-tight">
            {isEntreprise ? s('company') : s('artisan')}
          </div>
        </div>
        <ChevronDown size={13} className={`text-[var(--sand-muted)] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {userDropdownOpen && (
        <>
          <div className="absolute top-full end-0 mt-2 w-56 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl overflow-hidden z-[110] animate-in">
            <button type="button" onClick={() => { router.push('/dashboard/profile'); setUserDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition min-h-[44px]">
              <User size={16} strokeWidth={1.5} />
              {s('profile')}
            </button>
            <button type="button" onClick={() => { router.push('/dashboard/subscription'); setUserDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition min-h-[44px]">
              <CreditCard size={16} strokeWidth={1.5} />
              {s('subscription')}
            </button>
            {isEntreprise && (
              <button type="button" onClick={() => { router.push('/dashboard/team'); setUserDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] hover:bg-[var(--navy-3)] hover:text-[var(--sand)] transition min-h-[44px]">
                <UsersRound size={16} strokeWidth={1.5} />
                {s('team')}
              </button>
            )}
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
  );

  // Primary section links now live in the persistent <SectionTabs> row below the
  // main navbar (Statistiques · Clients · Documents), matching the GitHub/Vercel pattern.
  // Document-type filtering moved to in-page chips on /dashboard/documents.

  // ── "+ Nouveau document" quick-create (ported from the removed Sidebar) ──
  const quickCreate = user && (
    <div className="relative">
      <button type="button" onClick={() => setQuickCreateOpen(!quickCreateOpen)}
        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--green)] text-white text-sm font-bold hover:bg-[var(--green-2)] transition-all active:scale-[0.98] shadow-sm min-h-[44px]">
        <Plus size={16} />
        <span className="hidden sm:inline">{s('newDocument')}</span>
      </button>
      {quickCreateOpen && (
        <>
          <div className="absolute top-full end-0 mt-2 w-60 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl overflow-hidden z-[110] animate-in">
            <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">
              {s('quickCreate')}
            </div>
            {QUICK_DOCS.map((qd) => (
              <button type="button" key={qd.type} onClick={() => { navigateTo(qd.type); setQuickCreateOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all duration-200 min-h-[44px] text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.08)]">
                <qd.icon size={16} />
                <span>{s(`docTypes.${qd.labelKey}`)}</span>
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
  );

  const guestLinks = !user && (
    <>
      <a href="/auth/login" onClick={() => setMobileOpen(false)} className="block md:inline text-[13px] text-[var(--sand-muted)] hover:text-[var(--sand)] font-medium text-center md:text-left transition-colors min-h-[44px] flex items-center justify-center md:min-h-0">{t('login')}</a>
      <Button size="sm" variant="primary" onClick={() => { router.push('/auth/register'); setMobileOpen(false); }}>{t('signup')}</Button>
    </>
  );

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-[var(--navy)]/85 backdrop-blur-xl border-b border-[rgba(15,39,71,0.08)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-2.5 no-underline shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--teal)] flex items-center justify-center font-sora font-extrabold text-white text-sm">C</div>
              <span className="text-lg sm:text-xl font-sora font-extrabold text-[var(--sand)] tracking-tight hidden sm:inline">CloudDevis</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!loading && !user && (
              <div className="hidden md:flex items-center gap-6">{guestLinks}</div>
            )}
            {!loading && user && <div className="hidden md:block">{quickCreate}</div>}

            <div className="flex items-center gap-1.5 sm:gap-2 sm:pl-3 sm:border-l border-[rgba(15,39,71,0.1)]">
              <button type="button" onClick={() => {
                  const next = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
                  setLang(next);
                }}
                className="text-[11px] font-bold uppercase tracking-wider leading-none px-2 py-1.5 rounded-lg transition-all bg-[var(--navy-3)] text-[var(--sand)] hover:bg-[var(--navy-4)] min-h-[36px]"
                title={lang === 'fr' ? t('langFr') : lang === 'ar' ? t('langAr') : t('langEn')}
              >
                {LANG_LABELS[lang]}
              </button>

              {user && <NotificationBell />}

              <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-[var(--sand-muted)] hover:text-[var(--sand)] rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

            {/* User account pill — far right (GitHub-style), was previously next to the logo */}
            {!loading && user && <div className="hidden md:block">{userPill}</div>}
          </div>
        </div>

        {/* Persistent section tabs (desktop) — primary dashboard navigation */}
        {!loading && user && <SectionTabs clientCount={clientCount} />}
      </nav>

      {/* Mobile Bottom Sheet — user pill, nav links, quick-create, all stacked */}
      {mobileOpen && (
        <div className="md:hidden mobile-bottom-sheet" onClick={() => setMobileOpen(false)}>
          <div className="sheet-overlay" />
          <div className="sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {!loading && user ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--navy-3)] border border-[rgba(15,39,71,0.1)]">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--green)] to-[var(--teal)] flex items-center justify-center text-white text-sm font-black shrink-0 shadow-lg">
                      {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[var(--sand)] truncate">{userName}</div>
                      <div className="text-[10px] text-[var(--sand-muted)] font-semibold uppercase tracking-wider">
                        {isEntreprise ? s('company') : s('artisan')}
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={() => setQuickCreateOpen(!quickCreateOpen)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--green)] text-white text-sm font-bold min-h-[44px]">
                    <Plus size={16} /> {s('newDocument')}
                  </button>
                  {quickCreateOpen && (
                    <div className="rounded-xl bg-[var(--navy-3)] overflow-hidden">
                      {QUICK_DOCS.map((qd) => (
                        <button type="button" key={qd.type} onClick={() => { navigateTo(qd.type); setQuickCreateOpen(false); setMobileOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[var(--sand-muted)] min-h-[44px]">
                          <qd.icon size={16} />
                          {s(`docTypes.${qd.labelKey}`)}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <button type="button" onClick={() => { router.push('/dashboard'); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--sand-muted)] min-h-[44px]">
                      <LayoutDashboard size={16} /> {s('stats')}
                    </button>
                    <button type="button" onClick={() => { router.push('/dashboard?tab=clients'); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--sand-muted)] min-h-[44px]">
                      <Users size={16} /> {s('clients')}
                      {clientCount > 0 && <span className="text-[10px] bg-[var(--navy-4)] px-1.5 py-0.5 rounded-full">{clientCount}</span>}
                    </button>
                    <button type="button" onClick={() => setDocumentsOpen(!documentsOpen)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-[var(--sand-muted)] min-h-[44px]">
                      <FileText size={16} /> {s('documents')}
                      <ChevronDown size={13} className={`ms-auto transition-transform ${documentsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {documentsOpen && (
                      <div className="ms-4 space-y-0.5 border-l border-[rgba(15,39,71,0.1)] pl-2">
                        {DOCUMENT_TYPES.map((dt) => (
                          <button type="button" key={dt.id} onClick={() => filterDocumentsByType(dt.id)}
                            className="w-full flex items-center px-3 py-2 rounded-lg text-[13px] font-semibold text-[var(--sand-muted)] min-h-[44px]">
                            {s(`docTypes.${dt.key}`)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-[rgba(15,39,71,0.08)]" />
                  <div className="space-y-0.5">
                    <button type="button" onClick={() => { router.push('/dashboard/profile'); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[var(--sand-muted)] min-h-[44px]">
                      <User size={16} /> {s('profile')}
                    </button>
                    <button type="button" onClick={() => { router.push('/dashboard/subscription'); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[var(--sand-muted)] min-h-[44px]">
                      <CreditCard size={16} /> {s('subscription')}
                    </button>
                    {isEntreprise && (
                      <button type="button" onClick={() => { router.push('/dashboard/team'); setMobileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[var(--sand-muted)] min-h-[44px]">
                        <UsersRound size={16} /> {s('team')}
                      </button>
                    )}
                    <button type="button" onClick={() => { router.push('/dashboard'); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-[var(--sand-muted)] min-h-[44px]">
                      <Home size={16} /> {t('dashboard')}
                    </button>
                    <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-400 min-h-[44px]">
                      <LogOut size={16} /> {t('logout')}
                    </button>
                  </div>
                </>
              ) : (
                guestLinks
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
