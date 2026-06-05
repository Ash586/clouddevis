'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DEFAULT_SECTION_ORDER, SECTION_FIELDS } from '@/types';
import type { CustomSectionDef } from '@/types';
import { SectionCreatorForm } from './SectionCreatorForm';

interface FieldSelectorProps {
  sections: string[];
  fieldPrefs: Record<string, string[]>;
  setFieldPrefs: (p: Record<string, string[]>) => void;
  te: (k: string) => string;
  SECTION_FIELDS: Record<string, string[]>;
  customSections: CustomSectionDef[];
  onEditSection?: (cs: CustomSectionDef) => void;
  onDeleteSection?: (id: string) => void;
}

export function FieldSelector({ sections, fieldPrefs, setFieldPrefs, te, SECTION_FIELDS: sf, customSections, onEditSection, onDeleteSection }: FieldSelectorProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggleSection = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const getFields = (id: string): string[] => {
    if (sf[id]) return sf[id];
    const cs = customSections.find(c => c.id === id);
    if (cs) return cs.fields.map(f => f.id);
    return [];
  };
  const toggleAllInSection = (id: string) => {
    const selected = fieldPrefs[id] ?? [];
    const all = getFields(id);
    const allChecked = all.every(f => selected.includes(f));
    setFieldPrefs({ ...fieldPrefs, [id]: allChecked ? [] : [...all] });
  };
  const toggleField = (sectionId: string, fieldId: string) => {
    const selected = fieldPrefs[sectionId] ?? [];
    setFieldPrefs({ ...fieldPrefs, [sectionId]: selected.includes(fieldId) ? selected.filter(f => f !== fieldId) : [...selected, fieldId] });
  };
  const isBuiltinSection = (id: string) => DEFAULT_SECTION_ORDER.includes(id as any);
  const isBuiltinField = (fieldId: string) => Object.values(sf).some(arr => arr.includes(fieldId));

  return (
    <div className="space-y-1">
      {sections.map(sectionId => {
        const fields = getFields(sectionId);
        const selected = fieldPrefs[sectionId] ?? [];
        const allChecked = fields.length > 0 && fields.every(f => selected.includes(f));
        const isExpanded = expanded.includes(sectionId);
        const cs = customSections.find(c => c.id === sectionId);
        const label = te(`sections.${sectionId}`) || cs?.label || sectionId;

        return (
          <div key={sectionId} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50">
              <button onClick={() => toggleAllInSection(sectionId)}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${allChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                {allChecked && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </button>
              <button onClick={() => toggleSection(sectionId)} className="flex-1 text-left text-[11px] font-bold text-slate-700">
                {label}
              </button>
              {!isBuiltinSection(sectionId) && (
                <div className="flex gap-1">
                  {onEditSection && cs && <button onClick={() => onEditSection(cs)} className="text-[10px] text-blue-500 hover:text-blue-700">✎</button>}
                  {onDeleteSection && <button onClick={() => onDeleteSection(sectionId)} className="text-[10px] text-red-400 hover:text-red-600">✕</button>}
                </div>
              )}
            </div>
            {isExpanded && (
              <div className="px-3 py-2 space-y-1 border-t border-slate-100">
                {fields.map(fieldId => {
                  const isActive = selected.includes(fieldId);
                  return (
                    <label key={fieldId} className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer py-0.5">
                      <input type="checkbox" checked={isActive} onChange={() => toggleField(sectionId, fieldId)}
                        className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      {fieldId}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
