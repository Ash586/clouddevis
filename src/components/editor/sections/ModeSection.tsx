'use client';
import type { SectionProps } from './SectionProps';

export function ModeSection({ mode, setDoc, hiddenFields, te }: SectionProps) {
  return (
    <>
      {!hiddenFields.has('businessMode') && (
        <label className="flex items-center gap-2 bg-[var(--green-glow)] p-2 rounded-lg border border-blue-100 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 rounded text-[var(--green-3)]" checked={mode === 'entreprise'}
            onChange={(e) => setDoc(prev => ({
              ...prev,
              mode: e.target.checked ? 'entreprise' : 'artisan' as const,
              companyInfo: e.target.checked
                ? prev.companyInfo ?? { name: '', address: '', taxIds: { nif: '', rc: '', nis: '', ai: '' }, capital: '' }
                : undefined,
              artisanInfo: !e.target.checked
                ? prev.artisanInfo ?? { name: '', address: '', phone: '' }
                : undefined,
            }))} />
          <span className="text-[10px] font-bold text-blue-800">{te('mode.enableBusiness')}</span>
        </label>
      )}
    </>
  );
}
