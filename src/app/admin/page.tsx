'use client';

import { useEffect, useState } from 'react';

/* ── Types ── */
interface DashboardData {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    usersToday: number;
    totalDocs: number;
    docsThisMonth: number;
    totalClients: number;
    activeTrialUsers: number;
    activeBasicUsers: number;
    activeProUsers: number;
  };
  recentUsers: { id: string; name: string; email: string; country: string; subscription: string; mode: string; createdAt: string }[];
}

interface AnalyticsData {
  countryBreakdown: { country: string; count: number }[];
  visitorStats: { totalPageViews: number; uniqueSessions: number };
}

interface LogsData {
  logs: { action: string; entity: string; details: string; adminName: string; userName: string; createdAt: string; ipAddress: string }[];
}

interface SystemData {
  counts: { users: number; documents: number; clients: number; admins: number };
  activity: { errorCount: number; loginCount: number };
}

/* ── Tabs ── */
type TabId = 'overview' | 'screens' | 'api' | 'schema' | 'roles';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Vue d\'ensemble' },
  { id: 'screens', label: 'Écrans' },
  { id: 'api', label: 'API Routes' },
  { id: 'schema', label: 'Schéma DB' },
  { id: 'roles', label: 'Rôles & Sécurité' },
];

/* ══════════════════════════════════════════════ */
/* MAIN PAGE */
/* ══════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [logsData, setLogsData] = useState<LogsData | null>(null);
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/dashboard').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/analytics').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/logs?limit=5').then(r => r.ok ? r.json() : null),
      fetch('/api/admin/system').then(r => r.ok ? r.json() : null),
    ]).then(([dash, analytics, logs, system]) => {
      setDashData(dash);
      setAnalyticsData(analytics);
      setLogsData(logs);
      setSystemData(system);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = dashData?.stats;
  const recentUsers = dashData?.recentUsers || [];
  const countryData = analyticsData?.countryBreakdown || [];
  const totalActive = (stats?.activeBasicUsers || 0) + (stats?.activeProUsers || 0);
  const totalSubs = totalActive + (stats?.activeTrialUsers || 0);
  const conversionRate = totalSubs > 0 ? Math.round((totalActive / totalSubs) * 100) : 0;
  const errorCount = systemData?.activity?.errorCount ?? 0;
  const totalCountryViews = countryData.reduce((sum, c) => sum + c.count, 0) || 1;

  const countryColors: Record<string, string> = {
    algerie: '#185FA5', algeria: '#185FA5',
    tunisie: '#1D9E75', tunisia: '#1D9E75',
    maroc: '#EF9F27', morocco: '#EF9F27',
    france: '#888780',
  };

  const logDotColors: Record<string, string> = {
    CREATE: '#1D9E75', LOGIN: '#1D9E75',
    UPDATE: '#185FA5',
    DELETE: '#E24B4A', ERROR: '#E24B4A',
  };

  const avatarColors = ['bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600', 'bg-red-100 text-red-600'];
  const subPills: Record<string, { bg: string; label: string }> = {
    PRO: { bg: 'bg-emerald-50 text-emerald-600', label: 'Pro' },
    BASIC: { bg: 'bg-blue-50 text-blue-600', label: 'Essai' },
    TRIAL: { bg: 'bg-blue-50 text-blue-600', label: 'Essai' },
    EXPIRED: { bg: 'bg-amber-50 text-amber-600', label: 'Expiré' },
    FREE: { bg: 'bg-slate-100 text-slate-500', label: 'Free' },
  };

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'à l\'instant';
    if (mins < 60) return `il y a ${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `il y a ${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return 'hier';
    return `il y a ${days}j`;
  }

  function getLogDescription(log: LogsData['logs'][0]) {
    const actor = log.adminName || log.userName || 'Système';
    switch (log.action) {
      case 'CREATE': return `Nouveau compte — ${actor}`;
      case 'UPDATE': return `Modification — ${log.entity} par ${actor}`;
      case 'DELETE': return `Suppression — ${log.entity} par ${actor}`;
      case 'LOGIN': return `Connexion — ${actor}`;
      case 'ERROR': return `Erreur ${log.entity} — ${log.details || actor}`;
      default: return `${log.action} sur ${log.entity} — ${actor}`;
    }
  }

  return (
    <div className="max-w-5xl">
      {/* ── Topbar ── */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">CD</span>
          </div>
          <span className="text-sm font-bold text-slate-900">CloudDevis — Admin Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">Next.js 16 + PostgreSQL</span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">Prêt</span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">Juin 2026</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-4 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════ TAB: VUE D'ENSEMBLE ═══════════════ */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
            <MetricCard label="Utilisateurs" value={stats?.totalUsers?.toLocaleString() ?? '—'} sub={`+${stats?.newUsersThisMonth ?? 0} ce mois`} subColor="text-emerald-500" />
            <MetricCard label="Documents" value={stats?.totalDocs?.toLocaleString() ?? '—'} sub={`+${stats?.docsThisMonth ?? 0} ce mois`} subColor="text-emerald-500" />
            <MetricCard label="Revenus" value={`${((stats?.activeProUsers ?? 0) * 2000 + (stats?.activeBasicUsers ?? 0) * 1000).toLocaleString()} DA`} sub="MRR estimé" subColor="text-emerald-500" />
            <MetricCard label="Visiteurs" value={(analyticsData?.visitorStats?.totalPageViews ?? 0).toLocaleString()} sub={`${analyticsData?.visitorStats?.uniqueSessions ?? 0} sessions`} subColor="text-amber-500" />
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-3">
            <MetricCard label="Abonnements actifs" value={totalActive.toLocaleString()} sub={`${conversionRate}% taux conv.`} subColor="text-emerald-500" />
            <MetricCard label="En période d'essai" value={(stats?.activeTrialUsers ?? 0).toLocaleString()} sub="14 jours restants moy." subColor="text-emerald-500" />
            <MetricCard label="Erreurs système" value={String(errorCount)} sub={errorCount > 0 ? 'À investiguer' : 'Aucune erreur'} subColor={errorCount > 0 ? 'text-amber-500' : 'text-emerald-500'} />
          </div>

          <SectionLabel>🌍 Pays d&apos;origine</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-2.5">
            {countryData.length > 0 ? (
              <div className="flex flex-col gap-2">
                {countryData.slice(0, 6).map(c => {
                  const pct = Math.round((c.count / totalCountryViews) * 100);
                  const color = countryColors[c.country.toLowerCase()] || '#6366f1';
                  return (
                    <div key={c.country} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-20 text-right flex-shrink-0">{c.country}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-xs font-medium w-10 text-right" style={{ color }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Aucune donnée</p>
            )}
          </div>

          <SectionLabel>👥 Utilisateurs récents</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-2.5">
            <div>
              {recentUsers.slice(0, 5).map(u => {
                const pill = subPills[u.subscription] || subPills.FREE;
                return (
                  <div key={u.id} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[u.name.charCodeAt(0) % avatarColors.length]}`}>
                      {getInitials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-400">{u.country} · {u.mode}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pill.bg}`}>{pill.label}</span>
                    <span className="text-[11px] text-slate-400 flex-shrink-0 ml-2">{u.createdAt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <SectionLabel>📋 Activité système récente</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            {logsData && logsData.logs.length > 0 ? (
              <div>
                {logsData.logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: logDotColors[log.action] || '#888780' }} />
                    <p className="text-xs text-slate-500 flex-1">{getLogDescription(log)}</p>
                    <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Aucune activité récente</p>
            )}
          </div>
        </>
      )}

      {/* ═══════════════ TAB: ÉCRANS ═══════════════ */}
      {activeTab === 'screens' && (
        <>
          <SectionLabel>Écran 1 — Dashboard principal</SectionLabel>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-xs text-slate-400 ml-2">admin.clouddevis.app/dashboard</span>
            </div>
            <div className="flex gap-4">
              <div className="w-28 flex-shrink-0 flex flex-col gap-1">
                {['Dashboard', 'Utilisateurs', 'Analytics', 'Abonnements', 'Rapports', 'Logs', 'Paramètres'].map((item, i) => (
                  <div key={item} className={`text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${i === 0 ? 'bg-white border border-slate-200 text-slate-900 font-semibold' : 'text-slate-400'}`}>
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <MiniMetric val="1 234" label="Utilisateurs" />
                  <MiniMetric val="45 678" label="Documents" />
                  <MiniMetric val="567" label="Abonnements" />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 mb-2">Croissance utilisateurs (30 jours)</p>
                  <SparklineChart />
                </div>
              </div>
            </div>
          </div>

          <SectionLabel>Écran 2 — Gestion des utilisateurs</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
            <p className="text-xs font-bold text-slate-900 mb-3">Champs du tableau utilisateurs</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['Email', 'Nom', 'Pays', 'Secteur', 'Type abonnement', 'Expiration', 'Nb documents', 'Dernière activité', 'Statut compte', 'Actions ⋯'].map(f => (
                <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{f}</span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">Actions disponibles : Activer / Suspendre · Changer abonnement · Envoyer message · Voir détail · Supprimer</p>
          </div>

          <SectionLabel>Écran 3 — Analytics visiteurs</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4">
            <p className="text-xs font-bold text-slate-900 mb-3">KPIs analytics à afficher</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 mb-2">Comportement</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">Sessions journalières<br/>Durée moyenne session<br/>Taux de rebond<br/>Pages les plus visitées<br/>Entonnoir de conversion CTA</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 mb-2">Croissance</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">Nouveaux inscrits/jour<br/>Taux essai → Pro<br/>Churn mensuel<br/>MRR (revenu récurrent)<br/>LTV estimé par cohorte</p>
              </div>
            </div>
          </div>

          <SectionLabel>Écran 4 — Logs & surveillance système</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-slate-900 mb-3">Types de journaux à implémenter</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Activity Log</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Error Log</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Login Log</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Change Log</span>
            </div>
            <p className="text-[11px] text-slate-400">Chaque log : timestamp · acteur (admin/user/system) · entité · action · IP · user agent · payload JSON diff</p>
          </div>
        </>
      )}

      {/* ═══════════════ TAB: API ROUTES ═══════════════ */}
      {activeTab === 'api' && (
        <>
          <ApiSection label="Auth admin">
            <ApiRow method="POST" path="/api/admin/auth/login" desc="Connexion admin JWT" />
            <ApiRow method="POST" path="/api/admin/auth/logout" desc="Déconnexion + invalidation token" />
            <ApiRow method="GET" path="/api/admin/auth/me" desc="Profil admin courant" />
          </ApiSection>
          <ApiSection label="Dashboard">
            <ApiRow method="GET" path="/api/admin/dashboard" desc="Métriques globales" />
            <ApiRow method="GET" path="/api/admin/analytics" desc="Stats analytics" />
            <ApiRow method="GET" path="/api/admin/system" desc="Santé du système" />
          </ApiSection>
          <ApiSection label="Gestion utilisateurs">
            <ApiRow method="GET" path="/api/admin/users" desc="Liste paginée + filtres" />
            <ApiRow method="GET" path="/api/admin/users/[id]" desc="Détail utilisateur" />
            <ApiRow method="PATCH" path="/api/admin/users/[id]" desc="Modifier profil/abonnement" />
            <ApiRow method="POST" path="/api/admin/users/[id]/suspend" desc="Suspendre compte" />
            <ApiRow method="POST" path="/api/admin/users/[id]/unsuspend" desc="Réactiver compte" />
          </ApiSection>
          <ApiSection label="Partenaires">
            <ApiRow method="GET" path="/api/admin/partners" desc="Liste des partenaires" />
            <ApiRow method="PATCH" path="/api/admin/partners/[id]/approve" desc="Approuver partenaire" />
            <ApiRow method="PATCH" path="/api/admin/partners/[id]/tier" desc="Changer le tier" />
          </ApiSection>
          <ApiSection label="Abonnements & facturation">
            <ApiRow method="GET" path="/api/admin/subscriptions" desc="Tous les abonnements" />
            <ApiRow method="PATCH" path="/api/admin/subscriptions/[id]" desc="Modifier abonnement" />
          </ApiSection>
          <ApiSection label="Rapports & exports">
            <ApiRow method="GET" path="/api/admin/reports" desc="Rapports globaux" />
            <ApiRow method="POST" path="/api/admin/reports/export" desc="Export CSV/PDF/Excel" />
          </ApiSection>
          <ApiSection label="Logs & système">
            <ApiRow method="GET" path="/api/admin/logs" desc="Journal activités" />
            <ApiRow method="GET" path="/api/admin/logs/errors" desc="Journal erreurs" />
            <ApiRow method="GET" path="/api/admin/commissions/overview" desc="Aperçu commissions" />
            <ApiRow method="POST" path="/api/admin/system/backup" desc="Déclench. backup manuel" />
          </ApiSection>
        </>
      )}

      {/* ═══════════════ TAB: SCHÉMA DB ═══════════════ */}
      {activeTab === 'schema' && (
        <>
          <SectionLabel>Modèles Prisma — Admin Panel</SectionLabel>
          <SchemaModel title="Admin" fields={[
            ['id', 'String', '@id @default(cuid())'],
            ['email', 'String', '@unique'],
            ['password', 'String', '// bcrypt hash'],
            ['role', 'AdminRole', '@default(VIEWER)'],
            ['permissions', 'String[]', '// granular perms'],
            ['lastLogin', 'DateTime?', ''],
            ['createdAt', 'DateTime', '@default(now())'],
          ]} />
          <SchemaModel title="Analytics" fields={[
            ['id', 'String', '@id @default(cuid())'],
            ['date', 'DateTime', '@default(now())'],
            ['country', 'String', ''],
            ['visitors', 'Int', '@default(0)'],
            ['sessions', 'Int', '@default(0)'],
            ['pageViews', 'Int', '@default(0)'],
            ['bounceRate', 'Float', '@default(0)'],
            ['avgSessionTime', 'Int', '@default(0)'],
          ]} />
          <SchemaModel title="ActivityLog" fields={[
            ['id', 'String', '@id @default(cuid())'],
            ['adminId', 'String?', ''],
            ['userId', 'String?', ''],
            ['action', 'String', '// CREATE | UPDATE | DELETE | LOGIN'],
            ['entity', 'String', '// USER | DOCUMENT | SUBSCRIPTION'],
            ['entityId', 'String', ''],
            ['changes', 'Json?', '// diff avant/après'],
            ['ipAddress', 'String?', ''],
            ['createdAt', 'DateTime', '@default(now())'],
          ]} />
          <SchemaModel title="SystemMetrics" fields={[
            ['id', 'String', '@id @default(cuid())'],
            ['timestamp', 'DateTime', '@default(now())'],
            ['cpuUsage', 'Float', ''],
            ['memoryUsage', 'Float', ''],
            ['dbConnections', 'Int', ''],
            ['errorRate', 'Float', ''],
            ['avgResponseTime', 'Int', '// ms'],
          ]} />
          <SchemaModel title="Partner" fields={[
            ['id', 'String', '@id @default(cuid())'],
            ['userId', 'String', '@unique'],
            ['code', 'String', '@unique'],
            ['tier', 'PartnerTier', '@default(BRONZE)'],
            ['status', 'PartnerStatus', '@default(PENDING)'],
            ['earnings', 'Float', '@default(0)'],
            ['totalReferrals', 'Int', '@default(0)'],
          ]} />

          <SectionLabel>Modifications modèles existants</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">User</span>
              <span className="text-[11px] text-slate-500">Ajouter : <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">suspended Boolean</code> · <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">suspendedAt DateTime?</code></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">Document</span>
              <span className="text-[11px] text-slate-500">Ajouter : <code className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">BR</code> comme 5ème type (Bon de Réception)</span>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════ TAB: RÔLES & SÉCURITÉ ═══════════════ */}
      {activeTab === 'roles' && (
        <>
          <SectionLabel>Système de rôles admin</SectionLabel>
          <RoleCard
            icon="👁"
            bg="bg-slate-100"
            name="VIEWER — Lecture seule"
            desc="Accès en lecture à toutes les données, aucune action possible"
            perms={['voir dashboard', 'voir utilisateurs', 'voir analytics', 'voir logs', 'exporter rapports']}
          />
          <RoleCard
            icon="✏️"
            bg="bg-blue-50"
            name="EDITOR — Gestion opérationnelle"
            desc="Toutes les permissions VIEWER + actions sur utilisateurs et abonnements"
            perms={['+ modifier utilisateurs', '+ suspendre comptes', '+ gérer abonnements', '+ envoyer messages', '+ modifier contenu']}
          />
          <RoleCard
            icon="🛡"
            bg="bg-amber-50"
            name="ADMIN — Accès complet"
            desc="Toutes les permissions EDITOR + administration système"
            perms={['+ gérer admins', '+ config système', '+ backups manuels', '+ supprimer données', '+ accès DB direct']}
          />

          <SectionLabel>Couches de sécurité à implémenter</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-3">
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['Authentification', 'JWT signé (secret env) + expiration 8h'],
                  ['2FA (optionnel)', 'TOTP via otplib (Google Authenticator compatible)'],
                  ['Route protection', 'Middleware Next.js — vérifie JWT + rôle sur chaque route /admin/*'],
                  ['Rate limiting', 'Login : 5 tentatives / 15 min · API : 100 req/min'],
                  ['IP allowlist', 'Optionnel — restrictor par IP pour l\'interface admin'],
                  ['Audit trail', 'Chaque action admin logguée en DB (acteur, action, diff, timestamp, IP)'],
                  ['Alertes', 'Email sur connexion depuis nouvelle IP ou action destructrice'],
                  ['Chiffrement', 'Passwords admin via bcryptjs (salt 12)'],
                ].map(([label, value], i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 text-slate-500 w-2/5">{label}</td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionLabel>Fichiers à créer / modifier</SectionLabel>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['src/lib/admin/auth.ts', '✅ Créé', 'helpers JWT admin'],
                  ['src/lib/admin/permissions.ts', '✅ Créé', 'vérification rôles'],
                  ['src/middleware.ts', '⏳ À modifier', 'protection /admin/*'],
                  ['prisma/schema.prisma', '✅ Modifié', '+5 nouveaux modèles'],
                  ['src/app/admin/', '✅ Créé', '9 pages admin'],
                  ['src/components/admin/', '✅ Créé', 'sidebar, navbar, layout'],
                ].map(([file, status, desc], i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-slate-700">{file}</td>
                    <td className={`px-4 py-2.5 font-semibold ${status.startsWith('✅') ? 'text-emerald-600' : 'text-amber-600'}`}>{status}</td>
                    <td className="px-4 py-2.5 text-slate-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/* REUSABLE COMPONENTS */
/* ══════════════════════════════════════════════ */

function MetricCard({ label, value, sub, subColor = 'text-emerald-500' }: {
  label: string; value: string; sub: string; subColor?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className={`text-[11px] font-medium mt-1 ${subColor}`}>{sub}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-3">{children}</p>;
}

function MiniMetric({ val, label }: { val: string; label: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-2.5">
      <p className="text-base font-bold text-slate-900">{val}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

function SparklineChart() {
  const heights = [30, 40, 35, 55, 50, 65, 60, 70, 75, 80, 90, 95, 85, 100];
  return (
    <div className="flex items-end gap-1 h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${h}%`,
            background: i === heights.length - 1 ? '#1D9E75' : '#c5d5e8',
          }}
        />
      ))}
    </div>
  );
}

function ApiRow({ method, path, desc }: { method: string; path: string; desc: string }) {
  const methodColors: Record<string, string> = {
    GET: 'bg-emerald-50 text-emerald-600',
    POST: 'bg-blue-50 text-blue-600',
    PATCH: 'bg-amber-50 text-amber-600',
    DELETE: 'bg-red-50 text-red-600',
  };
  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-slate-100 last:border-0">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md min-w-[44px] text-center ${methodColors[method] || 'bg-slate-100 text-slate-500'}`}>{method}</span>
      <code className="text-xs text-slate-900 font-mono">{path}</code>
      <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">{desc}</span>
    </div>
  );
}

function ApiSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <SectionLabel>{label}</SectionLabel>
      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-1">
        {children}
      </div>
    </div>
  );
}

function SchemaModel({ title, fields }: { title: string; fields: [string, string, string][] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-3">
      <p className="text-xs font-bold text-slate-900 mb-3">📦 Modèle {title}</p>
      <div className="bg-slate-50 rounded-xl p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
        <span className="text-blue-600 font-bold">model</span>{' '}
        <span className="text-slate-900 font-bold">{title}</span> {'{\n'}
        {fields.map(([name, type, note], i) => (
          <div key={i} className="pl-4">
            <span className="text-slate-900">{name}</span>{' '}
            <span className="text-emerald-600">{type}</span>
            {note && <span className="text-slate-400"> {note}</span>}
          </div>
        ))}
        <span>{'}'}</span>
      </div>
    </div>
  );
}

function RoleCard({ icon, bg, name, desc, perms }: {
  icon: string; bg: string; name: string; desc: string; perms: string[];
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl mb-3">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>{icon}</div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-900">{name}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {perms.map(p => (
            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{p}</span>
          ))}
        </div>
      </div>
    </div>
  );
}