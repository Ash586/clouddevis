'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, CheckCircle, ImagePlus, Building, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { notify } from '@/mobile/lib/toast';
import { updateCompanyProfile, fetchCompanyInfo } from '@/mobile/lib/api';
import { useCompanyStore } from '@/stores/companyStore';
import { generateId } from '@/lib/calculations';
import type { Company } from '@/mobile/types';

interface CompanyProfileScreenProps {
  onGoToClients?: () => void;
  onBack?: () => void;
}

export function CompanyProfileScreen({ onGoToClients, onBack }: CompanyProfileScreenProps) {
  const { t } = useMobileI18n();
  const [company, setCompany] = useState<Partial<Company>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Prefill from the local store first (already persisted)
        const stored = useCompanyStore.getState().company;
        if (stored) {
          if (!cancelled) setCompany(stored);
          return;
        }
        // Otherwise try to hydrate from the server profile
        const info = await fetchCompanyInfo();
        if (info && info.name && !cancelled) {
          setCompany(info);
          useCompanyStore.getState().setCompany({
            ...(info as Company),
            id: info.id || generateId(),
            name: info.name,
            tvaRate: info.tvaRate ?? 19,
          });
        }
      } catch {
        // ignore — user can still fill the form
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    if (!company.name) return;
    const full: Company = {
      ...(company as Company),
      id: company.id || generateId(),
      name: company.name,
      tvaRate: company.tvaRate ?? 19,
    };
    const result = useCompanyStore.getState().setCompany(full);
    if (result && !result.valid) {
      await notify(Object.values(result.errors)[0] || t('toast.saveError'));
      return;
    }
    setSaving(true);
    try {
      await updateCompanyProfile(full);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleLogoPick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      await notify(t('company.logoError'));
      return;
    }
    // localStorage (≈5MB) and the encrypted companyInfo column both store the
    // base64 as-is — cap oversized uploads so persistence keeps working.
    if (file.size > 2.5 * 1024 * 1024) {
      await notify(t('toast.saveError'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCompany((c) => ({ ...c, logo: typeof reader.result === 'string' ? reader.result : undefined }));
    reader.readAsDataURL(file);
  };

  const inputCls = 'w-full rounded-lg border border-[rgba(0,26,77,0.08)] bg-[#F0F4FF] px-3.5 py-2.5 text-sm text-[#001A4D] placeholder-[#718096] transition-all duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15';
  const labelCls = 'block text-xs font-bold text-[#4A5568] mb-1';

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F8FAFD]">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#0052CC]/30 border-t-[#0052CC]" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-dvh bg-[#F8FAFD] pb-24">
      <div className="sticky z-10 bg-white/95 backdrop-blur border-b border-[rgba(0,26,77,0.06)]" style={{ top: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#001A4D] via-[#0052CC] to-[#001A4D]" />
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            {onBack && (
              <button onClick={onBack} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#4A5568] hover:bg-[#F5F7FA] transition-colors duration-150">
                <ArrowLeft size={16} />
              </button>
            )}
            <h1 className="text-base font-extrabold text-[#001A4D]">{t('company.title')}</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-8 items-center gap-1 rounded-lg bg-[#0052CC] px-3 text-[11px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle size={12} /> : <Save size={12} />}
            {t('company.save')}
          </button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <div className={cn(
          'rounded-xl border p-2.5 text-center text-xs font-bold',
          company.nif ? 'border-[#001A4D]/20 bg-[#001A4D]/8 text-[#001A4D]' : 'border-[#DC3545]/20 bg-[#DC3545]/8 text-[#DC3545]',
        )}>
          {company.nif ? t('company.conforme') : t('company.nonConforme')}
        </div>

        {/* ── Logo ── */}
        <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3.5 space-y-2.5">
          <div className="flex items-center gap-3">
            {company.logo ? (
              <div className="relative">
                <img src={company.logo} alt="Logo" className="h-16 w-16 rounded-xl border border-[rgba(0,26,77,0.06)] object-contain bg-[#F5F7FA] p-1" />
                <button
                  onClick={() => setCompany((c) => ({ ...c, logo: undefined }))}
                  aria-label="Supprimer le logo"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#DC3545] text-white shadow-sm transition-all duration-150 hover:bg-[#B23030]"
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-[rgba(0,26,77,0.12)] bg-[#F5F7FA] text-[#718096]">
                <Building size={24} />
              </div>
            )}
            <div className="flex-1">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-[#0052CC] px-3.5 text-[11px] font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#0047B3] active:scale-[0.97]"
              >
                <ImagePlus size={14} />
                {company.logo ? t('company.logoChange') : t('company.logoAdd')}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { void handleLogoPick(e.target.files?.[0]); e.target.value = ''; }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[rgba(0,26,77,0.06)] bg-white p-3.5 space-y-3">
          <div>
            <label className={labelCls}>{t('company.title')} *</label>
            <input value={company.name || ''} onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))} placeholder="Company Name" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>NIF</label>
              <input value={company.nif || ''} onChange={(e) => setCompany((c) => ({ ...c, nif: e.target.value }))} placeholder="15 digits" dir="ltr" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>RC</label>
              <input value={company.rc || ''} onChange={(e) => setCompany((c) => ({ ...c, rc: e.target.value }))} placeholder="9-14 chars" dir="ltr" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>NIS</label>
            <input value={company.nis || ''} onChange={(e) => setCompany((c) => ({ ...c, nis: e.target.value }))} placeholder="10 digits" dir="ltr" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input value={company.address || ''} onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))} placeholder="Full address" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Phone</label>
              <input value={company.phone || ''} onChange={(e) => setCompany((c) => ({ ...c, phone: e.target.value }))} placeholder="0xx xx xx xx" dir="ltr" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>TVA</label>
              <select value={company.tvaRate || 19} onChange={(e) => setCompany((c) => ({ ...c, tvaRate: Number(e.target.value) as 9 | 19 }))} className={inputCls}>
                <option value={19}>19%</option>
                <option value={9}>9%</option>
              </select>
            </div>
          </div>
        </div>

        {onGoToClients && (
          <button
            onClick={onGoToClients}
            className="w-full rounded-xl border border-[rgba(0,26,77,0.06)] bg-white py-3 text-xs font-bold text-[#0052CC] transition-all duration-200 hover:bg-[#E6F0FF] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#0052CC]/30"
          >
            {t('company.manageClients')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
