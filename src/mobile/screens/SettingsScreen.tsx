'use client';

// ============================================================
// CloudDevis Mobile — Settings Screen
// App settings: language, TVA rate, theme, data management
// ============================================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IconLanguage,
  IconReceipt,
  IconMoon,
  IconCloudOff,
  IconTrash,
  IconChevronRight,
  IconRefresh,
  IconInfoCircle,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import {
  getSettings,
  setSettings,
  clearAllOfflineData,
  type AppSettings,
} from '@/lib/offline';
import { useDocumentStore } from '@/stores/documentStore';
import { useClientStore } from '@/stores/clientStore';
import { useCompanyStore } from '@/stores/companyStore';

export function SettingsScreen() {
  const [settings, setLocalSettings] = useState<AppSettings>({
    language: 'FR',
    defaultTvaRate: 19,
    currency: 'DA',
    autoSync: true,
    theme: 'light',
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const savedDocuments = useDocumentStore((s) => s.savedDocuments);
  const clients = useClientStore((s) => s.clients);
  const company = useCompanyStore((s) => s.company);

  // ── Load settings on mount ──
  useEffect(() => {
    getSettings().then(setLocalSettings);
  }, []);

  const handleSettingChange = async (key: keyof AppSettings, value: unknown) => {
    const updated = { ...settings, [key]: value };
    setLocalSettings(updated);
    await setSettings({ [key]: value });
  };

  const handleClearAllData = async () => {
    await clearAllOfflineData();
    useDocumentStore.getState().resetDocument();
    useClientStore.getState().clearAll();
    useCompanyStore.getState().clearCompany();
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-5 pt-4 pb-3">
        <h1 className="text-xl font-bold text-[var(--sand)]">Réglages</h1>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4">

        {/* ── Language ──────────────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <IconLanguage size={18} className="text-[var(--sand-muted)]" />
            <span className="text-sm font-semibold text-[var(--sand)]">Langue</span>
          </div>
          <div className="px-4 pb-3 flex gap-2">
            {(['FR', 'AR', 'EN'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => handleSettingChange('language', lang)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all border',
                  settings.language === lang
                    ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                    : 'bg-[var(--navy-3)] text-[var(--sand-muted)] border-[rgba(245,237,214,0.06)]',
                )}
              >
                {lang === 'FR' ? 'Français' : lang === 'AR' ? 'العربية' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Default TVA Rate ─────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <IconReceipt size={18} className="text-[var(--sand-muted)]" />
            <span className="text-sm font-semibold text-[var(--sand)]">TVA par défaut</span>
          </div>
          <div className="px-4 pb-3 flex gap-2">
            {[0, 9, 19].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSettingChange('defaultTvaRate', rate)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-semibold transition-all border',
                  settings.defaultTvaRate === rate
                    ? 'bg-[#0B3D2E] text-white border-[#0B3D2E]'
                    : 'bg-[var(--navy-3)] text-[var(--sand-muted)] border-[rgba(245,237,214,0.06)]',
                )}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* ── Auto Sync ────────────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)]">
          <button
            onClick={() => handleSettingChange('autoSync', !settings.autoSync)}
            className="w-full px-4 py-3 flex items-center gap-3"
          >
            <IconCloudOff size={18} className="text-[var(--sand-muted)]" />
            <span className="text-sm font-semibold text-[var(--sand)] flex-1 text-left">
              Synchronisation automatique
            </span>
            <div
              className={cn(
                'w-12 h-7 rounded-full transition-colors relative',
                settings.autoSync ? 'bg-[#0B3D2E]' : 'bg-[var(--navy-3)]',
              )}
            >
              <div
                className={cn(
                  'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
                  settings.autoSync ? 'left-6' : 'left-1',
                )}
              />
            </div>
          </button>
        </div>

        {/* ── Data Summary ─────────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <IconInfoCircle size={16} className="text-[var(--sand-muted)]" />
            <span className="text-xs font-semibold text-[var(--sand-muted)]">Données locales</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--sand)]">{savedDocuments.length}</p>
              <p className="text-[10px] text-[var(--sand-muted)]">Documents</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--sand)]">{clients.length}</p>
              <p className="text-[10px] text-[var(--sand-muted)]">Clients</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--sand)]">{company ? '1' : '0'}</p>
              <p className="text-[10px] text-[var(--sand-muted)]">Société</p>
            </div>
          </div>
        </div>

        {/* ── Clear All Data ───────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--navy-2)] border border-[rgba(245,237,214,0.06)] overflow-hidden">
          {showClearConfirm ? (
            <div className="p-4">
              <p className="text-sm font-semibold text-red-400 mb-2">
                Supprimer toutes les données ?
              </p>
              <p className="text-xs text-[var(--sand-muted)] mb-4">
                Cette action est irréversible. Tous les documents, clients et paramètres seront supprimés.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[var(--navy-3)] text-[var(--sand-muted)]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleClearAllData}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-red-500 text-white"
                >
                  Supprimer tout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full px-4 py-3 flex items-center gap-3 active:bg-[var(--navy-3)] transition-colors"
            >
              <IconTrash size={18} className="text-red-400" />
              <span className="text-sm font-semibold text-red-400 flex-1 text-left">
                Effacer toutes les données
              </span>
              <IconChevronRight size={16} className="text-red-400/50" />
            </button>
          )}
        </div>

        {/* ── App Version ──────────────────────────────────── */}
        <div className="text-center py-4">
          <p className="text-[11px] text-[var(--sand-muted)]">
            CloudDevis v1.0.0
          </p>
          <p className="text-[10px] text-[var(--sand-muted)]/50 mt-1">
            Conformes DGI Algérie
          </p>
        </div>
      </div>
    </div>
  );
}
