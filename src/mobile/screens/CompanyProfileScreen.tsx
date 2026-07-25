'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { fetchCurrentUser, updateCompanyProfile } from '@/mobile/lib/api';
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

  useEffect(() => {
    fetchCurrentUser()
      .then(() => { setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!company.name) return;
    setSaving(true);
    try {
      await updateCompanyProfile(company as Company);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
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
