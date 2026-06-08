'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TrialGate } from '@/components/layout/TrialGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { useUser } from '@/hooks/useUser';
import { validateNIF, validateRC, validateNIS, validateAI } from '@/lib/validation';

const LANGS = [
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'English' },
];

const COUNTRIES = [
  { value: 'algeria', label: '🇩🇿 Algérie' },
  { value: 'tunisia', label: '🇹🇳 Tunisie' },
  { value: 'morocco', label: '🇲🇦 Maroc' },
  { value: 'france', label: '🇫🇷 France' },
];

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  country: string;
  sector: string | null;
  mode: string;
  language: string;
  companyInfo: {
    name?: string;
    address?: string;
    capital?: string;
    taxIds?: { nif?: string; nis?: string; rc?: string; ai?: string };
    logo?: string;
    signature?: string;
  } | null;
  subscriptionStatus: string;
  createdAt: string;
}

function SkeletonForm() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <div className="h-10 w-full bg-slate-200 rounded-lg" />
      <div className="h-10 w-full bg-slate-200 rounded-lg" />
      <div className="h-10 w-32 bg-slate-200 rounded-lg" />
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tc = useTranslations('common');
  const tt = useTranslations('sidebar');
  const { user: sessionUser } = useUser();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'info' | 'preferences' | 'security' | 'subscription'>('info');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('algeria');
  const [language, setLanguage] = useState('fr');
  const [mode, setMode] = useState<'ARTISAN' | 'ENTREPRISE'>('ARTISAN');
  const [sector, setSector] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyCapital, setCompanyCapital] = useState('');
  const [nif, setNif] = useState('');
  const [rc, setRc] = useState('');
  const [nis, setNis] = useState('');
  const [ai, setAi] = useState('');

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [docNotif, setDocNotif] = useState(true);
  const [paymentNotif, setPaymentNotif] = useState(true);

  // Security
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProfile(data.user);
      setName(data.user.name || '');
      setPhone(data.user.phone || '');
      setCountry(data.user.country || 'algeria');
      setLanguage(data.user.language || 'fr');
      setMode(data.user.mode || 'ARTISAN');
      setSector(data.user.sector || '');
      const ci = data.user.companyInfo || {};
      setCompanyName(ci.name || '');
      setCompanyAddress(ci.address || '');
      setCompanyCapital(ci.capital || '');
      const tax = ci.taxIds || {};
      setNif(tax.nif || '');
      setRc(tax.rc || '');
      setNis(tax.nis || '');
      setAi(tax.ai || '');
    } catch {
      showToast('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { name, phone, country, language, mode, sector };
      if (mode === 'ENTREPRISE') {
        body.companyInfo = {
          name: companyName,
          address: companyAddress,
          capital: companyCapital,
          taxIds: { nif, rc, nis, ai },
        };
      }
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast(tc('saved') as string || 'Profil mis à jour ✓', 'success');
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Minimum 6 caractères', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast('Mot de passe changé ✓', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Erreur: mot de passe actuel incorrect', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })
    : '';

  const SEC_OPTIONS = [
    { value: '', label: 'Sélectionnez un secteur' },
    { value: 'btp', label: 'Bâtiment & Travaux Publics' },
    { value: 'peinture', label: 'Peinture & Décoration' },
    { value: 'nettoyage', label: 'Nettoyage & Entretien' },
    { value: 'electricite', label: 'Électricité' },
    { value: 'plomberie', label: 'Plomberie & Chauffage' },
    { value: 'informatique', label: 'Informatique' },
    { value: 'transport', label: 'Transport & Logistique' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'artisanat', label: 'Artisanat' },
    { value: 'professions_liberales', label: 'Professions Libérales' },
    { value: 'hotellerie', label: 'Hôtellerie & Restauration' },
    { value: 'formation', label: 'Formation & Éducation' },
    { value: 'sante', label: 'Santé' },
    { value: 'immobilier', label: 'Immobilier' },
    { value: 'autre', label: 'Autre' },
  ];

  const TabButton = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <TrialGate>
            {loading ? (
              <div className="max-w-4xl mx-auto p-6">
                <SkeletonForm />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto p-4 sm:p-6">
                {/* ─── Header ─── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-black shrink-0">
                      {(profile?.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-slate-900 tracking-tight">{profile?.name || ''}</h1>
                      <p className="text-sm text-slate-500">{profile?.email || ''} • {mode === 'ENTREPRISE' ? tt('company') : tt('artisan')}</p>
                    </div>
                  </div>
                  <Badge variant={profile?.subscriptionStatus === 'PRO' ? 'success' : profile?.subscriptionStatus === 'BASIC' ? 'info' : 'default'}>
                    {profile?.subscriptionStatus || 'FREE'}
                  </Badge>
                </div>

                {/* ─── Tabs ─── */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                  <TabButton id="info" label={t('infoTab') || 'Informations'} />
                  <TabButton id="preferences" label={t('prefsTab') || 'Préférences'} />
                  <TabButton id="security" label={t('securityTab') || 'Sécurité'} />
                  <TabButton id="subscription" label={t('subTab') || 'Abonnement'} />
                </div>

                {/* ─── TAB: INFO ─── */}
                {activeTab === 'info' && (
                  <div className="space-y-6">
                    <Card className="p-4 sm:p-6">
                      <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{t('personalInfo') || 'Informations personnelles'}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input label={t('name') || 'Nom'} value={name} onChange={(e) => setName(e.target.value)} />
                        <Input label="Email" value={profile?.email || ''} disabled />
                        <Input label={t('phone') || 'Téléphone'} value={phone} onChange={(e) => setPhone(e.target.value)} />
                        <Select label={t('country') || 'Pays'} value={country} onChange={(e) => setCountry(e.target.value)} options={COUNTRIES} />
                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">{t('language') || 'Langue'}</label>
                          <div className="flex gap-1.5">
                            {LANGS.map(l => (
                              <button key={l.value}
                                onClick={() => setLanguage(l.value)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                                  language === l.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:text-slate-700'
                                }`}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Select label={t('sector') || 'Secteur'} value={sector} onChange={(e) => setSector(e.target.value)} options={SEC_OPTIONS} />
                      </div>
                    </Card>

                    <Card className="p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{t('businessMode') || 'Mode professionnel'}</h2>
                        <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button onClick={() => setMode('ARTISAN')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${mode === 'ARTISAN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            🔨 {t('artisan') || 'Artisan'}
                          </button>
                          <button onClick={() => setMode('ENTREPRISE')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${mode === 'ENTREPRISE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            🏢 {t('company') || 'Entreprise'}
                          </button>
                        </div>
                      </div>

                      {mode === 'ENTREPRISE' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label={t('companyName') || 'Raison sociale'} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                            <Input label={t('companyCapital') || 'Capital (DA)'} value={companyCapital} onChange={(e) => setCompanyCapital(e.target.value)} />
                          </div>
                          <Input label={t('companyAddress') || 'Adresse'} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">{t('taxIds') || 'Identifiants fiscaux'}</label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <input type="text" placeholder="NIF (11 chiffres)"
                                  className={`w-full border p-2 rounded-lg text-xs outline-none focus:ring-2 ${nif && !validateNIF(nif) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                                  value={nif} onChange={(e) => setNif(e.target.value)} />
                                {nif && !validateNIF(nif) && <span className="text-[9px] text-red-500">11 chiffres requis</span>}
                              </div>
                              <div>
                                <input type="text" placeholder="RC"
                                  className={`w-full border p-2 rounded-lg text-xs outline-none focus:ring-2 ${rc && !validateRC(rc) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                                  value={rc} onChange={(e) => setRc(e.target.value)} />
                                {rc && !validateRC(rc) && <span className="text-[9px] text-red-500">Format RC invalide</span>}
                              </div>
                              <div>
                                <input type="text" placeholder="NIS (10 chiffres)"
                                  className={`w-full border p-2 rounded-lg text-xs outline-none focus:ring-2 ${nis && !validateNIS(nis) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                                  value={nis} onChange={(e) => setNis(e.target.value)} />
                                {nis && !validateNIS(nis) && <span className="text-[9px] text-red-500">10 chiffres requis</span>}
                              </div>
                              <div>
                                <input type="text" placeholder="AI (10 chiffres)"
                                  className={`w-full border p-2 rounded-lg text-xs outline-none focus:ring-2 ${ai && !validateAI(ai) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-blue-500'}`}
                                  value={ai} onChange={(e) => setAi(e.target.value)} />
                                {ai && !validateAI(ai) && <span className="text-[9px] text-red-500">10 chiffres requis</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>

                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={saving} className="min-h-[44px]">
                        {saving ? (tc('saving') || 'Enregistrement...') : (tc('save') || 'Enregistrer')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* ─── TAB: PREFERENCES ─── */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <Card className="p-4 sm:p-6">
                      <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{t('docPrefs') || 'Préférences de documents'}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select label={t('defaultDocType') || 'Type par défaut'}
                          value="devis"
                          onChange={() => {}}
                          options={[
                            { value: 'devis', label: 'Devis' },
                            { value: 'facture', label: 'Facture' },
                            { value: 'proforma', label: 'Proforma' },
                            { value: 'bc', label: 'Bon de commande' },
                          ]}
                        />
                        <Select label={t('defaultTva') || 'TVA par défaut'}
                          value="19"
                          onChange={() => {}}
                          options={[
                            { value: '19', label: '19%' },
                            { value: '9', label: '9%' },
                            { value: '0', label: '0%' },
                          ]}
                        />
                        <Select label={t('defaultPayment') || 'Paiement par défaut'}
                          value="cheque"
                          onChange={() => {}}
                          options={[
                            { value: 'cheque', label: 'Chèque' },
                            { value: 'virement', label: 'Virement' },
                            { value: 'especes', label: 'Espèces' },
                            { value: 'cb', label: 'Carte' },
                          ]}
                        />
                        <Input label={t('defaultTerms') || 'Conditions par défaut'} value="100% à la réception" onChange={() => {}} />
                      </div>
                    </Card>

                    <Card className="p-4 sm:p-6">
                      <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{t('notifPrefs') || 'Notifications'}</h2>
                      <div className="space-y-3">
                        <Toggle label={t('notifEmail') || 'Notifications par email'} checked={emailNotif} onChange={setEmailNotif} />
                        <Toggle label={t('notifDoc') || 'Nouveau document créé'} checked={docNotif} onChange={setDocNotif} />
                        <Toggle label={t('notifPayment') || 'Paiement reçu'} checked={paymentNotif} onChange={setPaymentNotif} />
                      </div>
                    </Card>
                  </div>
                )}

                {/* ─── TAB: SECURITY ─── */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <Card className="p-4 sm:p-6">
                      <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{t('changePassword') || 'Changer le mot de passe'}</h2>
                      <div className="space-y-4 max-w-md">
                        <Input label={t('currentPassword') || 'Mot de passe actuel'} type="password" showPasswordToggle
                          value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                        <Input label={t('newPassword') || 'Nouveau mot de passe'} type="password" showPasswordToggle
                          value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <Input label={t('confirmPassword') || 'Confirmer le mot de passe'} type="password" showPasswordToggle
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        <Button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword} className="min-h-[44px]">
                          {changingPassword ? (tc('saving') || '...') : (t('changeBtn') || 'Changer le mot de passe')}
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4 sm:p-6">
                      <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{t('sessions') || 'Sessions actives'}</h2>
                      <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs">🌐</div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{t('currentSession') || 'Session actuelle'}</p>
                            <p className="text-xs text-slate-400">{t('thisDevice') || "Cet appareil"}</p>
                          </div>
                        </div>
                        <Badge variant="success">{t('active') || 'Actif'}</Badge>
                      </div>
                    </Card>
                  </div>
                )}

                {/* ─── TAB: SUBSCRIPTION ─── */}
                {activeTab === 'subscription' && (
                  <div className="space-y-6">
                    <Card className="p-4 sm:p-6">
                      <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{t('currentPlan') || 'Plan actuel'}</h2>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-lg font-black text-slate-900">
                            {profile?.subscriptionStatus === 'PRO' ? 'Pro' :
                             profile?.subscriptionStatus === 'BASIC' ? 'Basic' :
                             profile?.subscriptionStatus === 'TRIAL' ? 'Essai' : 'Gratuit'}
                          </p>
                          <p className="text-sm text-slate-500">{memberSince && `${t('memberSince') || 'Membre depuis'} ${memberSince}`}</p>
                        </div>
                        <Badge variant={profile?.subscriptionStatus === 'PRO' ? 'success' : profile?.subscriptionStatus === 'BASIC' ? 'info' : 'default'}>
                          {profile?.subscriptionStatus || 'FREE'}
                        </Badge>
                      </div>
                      {profile?.subscriptionStatus !== 'PRO' && (
                        <Button onClick={() => window.open('/pricing', '_blank')} className="w-full sm:w-auto min-h-[44px]">
                          {t('upgrade') || 'Voir les offres →'}
                        </Button>
                      )}
                    </Card>

                    <Card className="p-4 sm:p-6">
                      <h2 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-wider">{t('stats') || 'Statistiques du compte'}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                          { label: t('statDocs') || 'Documents', value: '-' },
                          { label: t('statClients') || 'Clients', value: '-' },
                          { label: t('statSince') || 'Membre depuis', value: memberSince },
                        ].map(s => (
                          <div key={s.label} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-lg font-black text-slate-900">{s.value}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TrialGate>
        </div>
      </div>
    </div>
  );
}
