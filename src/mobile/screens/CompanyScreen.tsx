'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Camera, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface CompanyScreenProps {
  onBack: () => void;
}

interface CompanyForm {
  name: string; nif: string; rc: string; nis: string; ai: string;
  phone: string; address: string; email: string; activity: string;
  capital: string; tvaRate: 9 | 19; logo: string;
}

const EMPTY: CompanyForm = {
  name: '', nif: '', rc: '', nis: '', ai: '',
  phone: '', address: '', email: '', activity: '',
  capital: '', tvaRate: 19, logo: '',
};

export function CompanyScreen({ onBack }: CompanyScreenProps) {
  const { t, dir } = useMobileI18n();
  const [form, setForm] = useState<CompanyForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/company')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setForm({
            name: data.name || '', nif: data.nif || '', rc: data.rc || '',
            nis: data.nis || '', ai: data.ai || '', phone: data.phone || '',
            address: data.address || '', email: data.email || '',
            activity: data.activity || '', capital: data.capital || '',
            tvaRate: data.tvaRate || 19, logo: data.logo || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  const setField = (field: keyof CompanyForm, value: string | number) =>
    setForm((p) => ({ ...p, [field]: value }));

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!form.name.trim()) errs.push('company.name');
    if (form.nif && form.nif.length !== 15) errs.push('NIF (15 chiffres)');
    if (form.nis && form.nis.length !== 10) errs.push('NIS (10 chiffres)');
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSaving(true);
    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally { setSaving(false); }
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('logo', reader.result as string);
    reader.readAsDataURL(file);
  };

  const isConforme = form.nif.length === 15 && form.name.trim();

  return (
    <div dir={dir} className="min-h-dvh bg-[#F3F6FC]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(15,39,71,0.08)] px-5 py-3 flex items-center gap-3">
        <button type="button" onClick={onBack} className="p-2 -ms-2 rounded-xl hover:bg-[#EDF2FB] transition">
          <ArrowLeft size={20} className="text-[#0F2747]" />
        </button>
        <h1 className="flex-1 text-lg font-extrabold text-[#0F2747]">{t('company.title')}</h1>
        <button type="button" onClick={handleSave} disabled={saving} className="p-2 -me-2 rounded-xl hover:bg-[#EDF2FB] transition disabled:opacity-40">
          {saved ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Save size={20} className="text-[#2563EB]" />}
        </button>
      </div>

      <main className="px-5 pt-5 max-w-lg mx-auto space-y-4 pb-8">
        {/* Conformity badge */}
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border ${isConforme ? 'bg-emerald-500/5 border-emerald-400/20' : 'bg-amber-400/5 border-amber-400/20'}`}>
          {isConforme ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-amber-600" />}
          <span className={`text-xs font-bold ${isConforme ? 'text-emerald-600' : 'text-amber-600'}`}>
            {isConforme ? t('company.conforme') : t('company.nonConforme')}
          </span>
        </div>

        {/* Logo */}
        <div className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#EDF2FB] border border-dashed border-[rgba(15,39,71,0.15)] flex items-center justify-center overflow-hidden">
              {form.logo ? <img src={form.logo} alt="Logo" className="w-full h-full object-contain" /> : <Camera size={20} className="text-[#5A6B85]" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#0F2747]">{form.logo ? t('company.logoChange') : t('company.logoAdd')}</p>
              <p className="text-[11px] text-[#5A6B85] mt-0.5">PNG, JPG — max 2 Mo</p>
              <label className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-[#EDF2FB] text-[11px] font-bold text-[#2563EB] cursor-pointer hover:bg-[rgba(37,99,235,0.1)] transition">
                {form.logo ? t('company.logoChange') : t('company.logoAdd')}
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-xs font-bold text-red-600 mb-1">{t('company.validationErrors')}</p>
            <ul className="text-[11px] text-red-500 space-y-0.5">
              {errors.map((e) => <li key={e}>• {e}</li>)}
            </ul>
          </div>
        )}

        {/* Business info */}
        <div className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-5 space-y-4">
          <p className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider">{t('company.myActivity')}</p>
          <Field label="Nom de l'entreprise *" value={form.name} onChange={(v) => setField('name', v)} placeholder="Mon entreprise" />
          <Field label="Activité" value={form.activity} onChange={(v) => setField('activity', v)} placeholder="BTP · Importation · Vente" />
          <Field label="Adresse" value={form.address} onChange={(v) => setField('address', v)} placeholder="123 Rue Principale, Alger" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone" value={form.phone} onChange={(v) => setField('phone', v)} placeholder="0555 55 55 55" />
            <Field label="Email" value={form.email} onChange={(v) => setField('email', v)} placeholder="contact@entreprise.com" type="email" />
          </div>
        </div>

        {/* Fiscal info */}
        <div className="rounded-2xl bg-white border border-[rgba(15,39,71,0.06)] p-5 space-y-4">
          <p className="text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider">Informations fiscales</p>
          <Field label="NIF (15 chiffres)" value={form.nif} onChange={(v) => setField('nif', v)} placeholder="123456789012345" maxLength={15} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="RC" value={form.rc} onChange={(v) => setField('rc', v)} placeholder="12345678" maxLength={14} />
            <Field label="NIS (10 chiffres)" value={form.nis} onChange={(v) => setField('nis', v)} placeholder="1234567890" maxLength={10} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="AI" value={form.ai} onChange={(v) => setField('ai', v)} placeholder="1234567890" maxLength={10} />
            <Field label="Capital (DA)" value={form.capital} onChange={(v) => setField('capital', v)} placeholder="100000" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-1.5">TVA par défaut</label>
            <div className="flex gap-2">
              {[19, 9].map((rate) => (
                <button key={rate} type="button" onClick={() => setField('tvaRate', rate as 9 | 19)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${form.tvaRate === rate ? 'bg-[#2563EB] text-white border-[#2563EB]' : 'bg-white text-[#5A6B85] border-[rgba(15,39,71,0.1)] hover:bg-[#EDF2FB]'}`}>
                  {rate}%
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Saved toast */}
      {saved && (
        <div className="fixed top-16 inset-x-0 flex justify-center z-50 animate-in fade-in slide-in-from-top">
          <div className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Enregistré ✓
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, maxLength, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number; type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-[#5A6B85] uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}
        className="w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[#F3F6FC] px-4 py-3 text-sm text-[#0F2747] placeholder:text-[#5A6B85] focus:outline-none focus:ring-2 focus:ring-[rgba(37,99,235,0.28)] transition-all" />
    </div>
  );
}
