'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CustomSectionDef, CustomFieldDef, CustomFieldType } from '@/types';

export function SectionCreatorForm({ initialSection, onSave, onCancel, te }: {
  initialSection: CustomSectionDef | null; onSave: (s: CustomSectionDef) => void; onCancel: () => void; te: (k: string) => string;
}) {
  const [label, setLabel] = useState(initialSection?.label ?? '');
  const [fields, setFields] = useState<CustomFieldDef[]>(initialSection?.fields ?? []);
  const fieldTypes: CustomFieldType[] = ['text', 'number', 'date', 'textarea', 'select'];
  const addField = () => setFields(prev => [...prev, { id: `f_${Date.now()}`, label: '', type: 'text' }]);
  const removeField = (idx: number) => setFields(prev => prev.filter((_, i) => i !== idx));
  const updateField = (idx: number, upd: Partial<CustomFieldDef>) => setFields(prev => prev.map((f, i) => i === idx ? { ...f, ...upd } : f));
  const isValid = label.trim().length > 0 && fields.some(f => f.label.trim().length > 0);
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[10px] font-bold text-slate-400 mb-1">{te('sectionCreatorLabel')}</label>
        <input type="text" className="w-full border p-2 rounded-lg text-[12px] outline-none focus:ring-2 focus:ring-blue-500" value={label} onChange={e => setLabel(e.target.value)} placeholder={te('sectionCreatorLabel')} />
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {fields.map((field, idx) => (
          <div key={field.id} className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input type="text" className="flex-1 border p-1.5 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-blue-500" value={field.label} onChange={e => updateField(idx, { label: e.target.value })} placeholder={te('sectionCreatorFieldLabel')} />
              <select className="border p-1.5 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-blue-500" value={field.type} onChange={e => updateField(idx, { type: e.target.value as CustomFieldType })}>
                {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => removeField(idx)} className="text-red-400 hover:text-red-600 px-1">✕</button>
            </div>
            {field.type === 'select' && (
              <textarea className="w-full border p-1.5 rounded-lg text-[10px] h-12 resize-none outline-none focus:ring-2 focus:ring-blue-500" value={field.options?.join('\n') ?? ''} onChange={e => updateField(idx, { options: e.target.value.split('\n').filter(Boolean) })} placeholder={te('sectionCreatorOptions')} />
            )}
          </div>
        ))}
      </div>
      <button onClick={addField} className="w-full py-1.5 border border-dashed border-slate-300 rounded-lg text-slate-400 hover:bg-slate-50 transition text-[11px] font-medium">+ {te('sectionCreatorAddField')}</button>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-500 hover:bg-slate-50 transition">{te('sectionCreatorCancel')}</button>
        <button onClick={() => {
          if (!isValid) return;
          const id = initialSection?.id || `custom_${Date.now()}`;
          onSave({ id, label: label.trim(), fields });
        }} disabled={!isValid} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-semibold hover:bg-blue-700 transition disabled:opacity-40">{te('sectionCreatorSave')}</button>
      </div>
    </div>
  );
}
