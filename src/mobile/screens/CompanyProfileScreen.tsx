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
      .then((u) => {
        // Load company data from profile
        setLoading(false);
      })
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

  const inputCls = 'w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] px-4 py-2.5 text-sm text-[#2563EB] placeholder-[#5A6B85] transition-colors focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/15';
  const labelCls = 'block text-sm font-medium text-[#33425C] mb-1.5';

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F3F6FC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB]/30 border-t-[#2563EB]" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-dvh bg-[#F3F6FC] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[rgba(15,39,71,0.09)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-[#2563EB] via-[#1E40AF] to-[#2563EB]" />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#33425C] hover:bg-[#F3F6FC]">
                <ArrowLeft size={18} />
              </button>
            )}
            <h1 className="text-lg font-extrabold text-[#2563EB]">{t('company.title')}</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {t('company.save')}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status badge */}
        <div className={cn(
          'rounded-xl border p-3 text-center text-sm font-bold',
          company.nif ? 'border-[#1E40AF]/30 bg-[#1E40AF]/10 text-[#1E40AF]' : 'border-[#E8542E]/30 bg-[#E8542E]/10 text-[#E8542E]',
        )}>
          {company.nif ? t('company.conforme') : t('company.nonConforme')}
        </div>

        {/* Form */}
        <div className="rounded-xl border border-[rgba(15,39,71,0.09)] bg-white p-4 space-y-4">
          <div>
            <label className={labelCls}>{t('company.title')} *</label>
            <input
              value={company.name || ''}
              onChange={(e) => setCompany((c) => ({ ...c, name: e.target.value }))}
              placeholder="Company Name"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>NIF</label>
              <input
                value={company.nif || ''}
                onChange={(e) => setCompany((c) => ({ ...c, nif: e.target.value }))}
                placeholder="15 digits"
                dir="ltr"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>RC</label>
              <input
                value={company.rc || ''}
                onChange={(e) => setCompany((c) => ({ ...c, rc: e.target.value }))}
                placeholder="9-14 chars"
                dir="ltr"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>NIS</label>
            <input
              value={company.nis || ''}
              onChange={(e) => setCompany((c) => ({ ...c, nis: e.target.value }))}
              placeholder="10 digits"
              dir="ltr"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input
              value={company.address || ''}
              onChange={(e) => setCompany((c) => ({ ...c, address: e.target.value }))}
              placeholder="Full address"
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Phone</label>
              <input
                value={company.phone || ''}
                onChange={(e) => setCompany((c) => ({ ...c, phone: e.target.value }))}
                placeholder="0xx xx xx xx"
                dir="ltr"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>TVA</label>
              <select
                value={company.tvaRate || 19}
                onChange={(e) => setCompany((c) => ({ ...c, tvaRate: Number(e.target.value) as 9 | 19 }))}
                className={inputCls}
              >
                <option value={19}>19%</option>
                <option value={9}>9%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Manage clients */}
        {onGoToClients && (
          <button
            onClick={onGoToClients}
            className="w-full rounded-xl border border-[rgba(15,39,71,0.09)] bg-white py-3.5 text-sm font-bold text-[#2563EB] transition-all hover:bg-[#EDF2FB] active:scale-[0.99]"
          >
            {t('company.manageClients')}
          </button>
        )}
      </div>
    </motion.div>
  );
}
