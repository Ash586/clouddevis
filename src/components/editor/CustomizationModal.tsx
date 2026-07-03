'use client';

import { useState } from 'react';
import { ChevronDown, FileText, Building2, User, MapPin, Package, ClipboardList, Percent, BadgeCheck, Receipt, CircleDollarSign, ScrollText, Pen, Briefcase, Plus } from 'lucide-react';
import { SectionCreatorForm } from '@/components/editor/SectionCreatorForm';
import type { DocumentState, CustomSectionDef, DocumentType } from '@/types';
import { SECTION_FIELDS, DOC_TYPE_SECTIONS, DEFAULT_SECTION_ORDER } from '@/types';
import { DOC_TYPE_EDITOR_LABELS } from './EditorConstants';

interface CustomizationModalProps {
  open: boolean;
  onClose: () => void;
  doc: DocumentState;
  setDoc: React.Dispatch<React.SetStateAction<DocumentState>>;
  hiddenFields: Set<string>;
  fieldPrefs: Record<string, Record<string, string[]>> | null;
  setFieldPrefs: React.Dispatch<React.SetStateAction<Record<string, Record<string, string[]>> | null>>;
  customSections: CustomSectionDef[];
  setCustomSections: React.Dispatch<React.SetStateAction<CustomSectionDef[]>>;
  showSectionNav: boolean;
  setShowSectionNav: React.Dispatch<React.SetStateAction<boolean>>;
  te: (key: string) => string;
}

const CUSTOMIZER_GROUPS: Array<{
  id: string; icon: React.ReactNode; labelKey: string; color: string;
  fields: string[]; section: string; onlyFor?: DocumentType[];
}> = [
  {
    id: 'docInfo', icon: <FileText size={16} />, labelKey: 'customizer.docInfo',
    color: 'bg-[var(--navy-3)] text-[var(--sand)] border-[rgba(245,237,214,0.08)]',
    fields: ['docNumber', 'issueDate', 'validUntil', 'orderRef'], section: 'general',
  },
  {
    id: 'company', icon: <Building2 size={16} />, labelKey: 'customizer.company',
    color: 'bg-[var(--navy-3)] text-blue-400 border-blue-400/20',
    fields: ['businessMode', 'logo', 'logoPosition'], section: 'mode',
  },
  {
    id: 'clientSection', icon: <User size={16} />, labelKey: 'sections.client',
    color: 'bg-[var(--navy-3)] text-[var(--green-3)] border-[var(--green-3)]/20',
    fields: ['clientName', 'clientAddress', 'clientNif', 'clientNis', 'clientRc', 'clientAi', 'clientPhone', 'clientEmail', 'clientForme'],
    section: 'client',
  },
  {
    id: 'devisInfo', icon: <FileText size={16} />, labelKey: 'customizer.devisInfo',
    color: 'bg-[var(--navy-3)] text-cyan-400 border-cyan-400/20',
    fields: ['companyTagline', 'companyCapital', 'rcNumber', 'nisNumber', 'aiNumber', 'reference', 'rib', 'bankName', 'bankAgency', 'ccpNumber', 'validityDays', 'showWatermark'],
    section: 'devis', onlyFor: ['devis'] as DocumentType[],
  },
  {
    id: 'chantier', icon: <MapPin size={16} />, labelKey: 'sections.chantier',
    color: 'bg-[var(--navy-3)] text-amber-400 border-amber-400/20',
    fields: ['chantierAddress', 'chantierType', 'chantierCondition', 'chantierSurface', 'chantierProtection', 'chantierResponsable'],
    section: 'chantier',
  },
  {
    id: 'materiaux', icon: <Package size={16} />, labelKey: 'sections.materiaux',
    color: 'bg-[var(--navy-3)] text-orange-400 border-orange-400/20',
    fields: ['materiauxBrand', 'materiauxType', 'materiauxColor', 'materiauxQty', 'materiauxUnite'],
    section: 'materiaux',
  },
  {
    id: 'prestations', icon: <ClipboardList size={16} />, labelKey: 'sections.prestations',
    color: 'bg-[var(--navy-3)] text-cyan-400 border-cyan-400/20',
    fields: ['itemsTable', 'itemDescription', 'itemQuantity', 'itemUnit', 'itemUnitPrice', 'itemTvaRate'],
    section: 'prestations',
  },
  {
    id: 'remise', icon: <Percent size={16} />, labelKey: 'sections.remise',
    color: 'bg-[var(--navy-3)] text-pink-400 border-pink-400/20',
    fields: ['remiseType', 'remiseValue', 'remiseReason'], section: 'remise',
  },
  {
    id: 'garanties', icon: <BadgeCheck size={16} />, labelKey: 'sections.garanties',
    color: 'bg-[var(--navy-3)] text-teal-400 border-teal-400/20',
    fields: ['garantieLabor', 'garantieMaterials', 'garantieNotes', 'garantieDuree', 'garantieRetenue'],
    section: 'garanties',
  },
  {
    id: 'fiscalite', icon: <Receipt size={16} />, labelKey: 'customizer.fiscalite',
    color: 'bg-[var(--navy-3)] text-red-400 border-red-400/20',
    fields: ['vatRate', 'stampRate', 'stampMin', 'stampMax', 'retenueSource', 'tvaArticle'],
    section: 'general',
  },
  {
    id: 'paiement', icon: <CircleDollarSign size={16} />, labelKey: 'sections.paiement',
    color: 'bg-[var(--navy-3)] text-violet-400 border-violet-400/20',
    fields: ['paymentMethod', 'paymentDeposit', 'paymentConditions', 'paymentIban', 'paymentEcheance', 'paymentModeReglement'],
    section: 'paiement',
  },
  {
    id: 'livraison', icon: <ClipboardList size={16} />, labelKey: 'sections.livraison',
    color: 'bg-[var(--navy-3)] text-sky-400 border-sky-400/20',
    fields: ['delivererName', 'delivererIdCard', 'transporterName', 'transporterIdCard', 'deliveryAddress'],
    section: 'livraison', onlyFor: ['bl'] as DocumentType[],
  },
  {
    id: 'notes', icon: <ScrollText size={16} />, labelKey: 'sections.notes',
    color: 'bg-[var(--navy-3)] text-[var(--sand-muted)] border-[rgba(245,237,214,0.08)]',
    fields: ['notes', 'mentionsLegales', 'conditionsGenerales'], section: 'notes',
  },
  {
    id: 'signature', icon: <Pen size={16} />, labelKey: 'sections.signature',
    color: 'bg-[var(--navy-3)] text-indigo-400 border-indigo-400/20',
    fields: ['companyPhone', 'sigClientSubtitle', 'sigClientNameFr', 'sigClientRole', 'sigClientRoleFr', 'sigClientNameAr', 'sigCompanyNameFr', 'sigDirectionNameFr', 'sigDirectionRole', 'sigDirectionNameAr'],
    section: 'signature',
  },
];

export function CustomizationModal({
  open, onClose, doc, setDoc, hiddenFields, fieldPrefs, setFieldPrefs,
  customSections, setCustomSections, showSectionNav, setShowSectionNav, te,
}: CustomizationModalProps) {
  const [showSectionCreator, setShowSectionCreator] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSectionDef | null>(null);

  if (!open) return null;

  const relevantSections = DOC_TYPE_SECTIONS[doc.documentType] ?? DEFAULT_SECTION_ORDER;
  const ALL_SECTIONS = [...relevantSections, ...customSections.map(s => s.id).filter(id => !relevantSections.includes(id))];

  const filteredGroups = CUSTOMIZER_GROUPS.filter(group => {
    if (group.onlyFor && !group.onlyFor.includes(doc.documentType)) return false;
    return relevantSections.includes(group.section);
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--navy-2)] w-full sm:max-w-2xl sm:mx-3 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[rgba(245,237,214,0.08)]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center pt-2 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-[var(--navy-4)]" /></div>
        <div className="px-5 py-4 border-b border-[rgba(245,237,214,0.08)] flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-bold text-[var(--sand)] tracking-tight">
              {te('customizeTitle')}
              <span className="ms-2 text-[11px] font-semibold text-white bg-[var(--green-3)] px-2 py-0.5 rounded-md align-middle uppercase">
                {te(DOC_TYPE_EDITOR_LABELS[doc.documentType] ?? 'documentTypeQuote')}
              </span>
            </h3>
            <p className="text-[11px] text-[var(--sand-muted)] mt-0.5">{te('customizeSubtitle') || 'Cliquez sur une catégorie pour voir les champs'}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[var(--sand-muted)] hover:text-[var(--sand)] p-1 -me-1">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[var(--navy-2)]">
          {showSectionCreator ? (
            <SectionCreatorForm
              initialSection={editingSection}
              onSave={async (section) => {
                if (editingSection?.id) {
                  await fetch('/api/user/custom-sections', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }) });
                } else {
                  await fetch('/api/user/custom-sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ section }) });
                }
                const res = await fetch('/api/user/custom-sections');
                const data = await res.json();
                setCustomSections(data.sections ?? []);
                setFieldPrefs(prev => { const b = prev ?? {} as Record<string, Record<string, string[]>>; const dt = doc.documentType; const curr: Record<string, string[]> = b[dt] ?? {}; curr[section.id] = section.fields.map(f => f.id); return { ...b, [dt]: curr }; });
                setDoc(prev => ({ ...prev, sectionOrder: prev.sectionOrder.includes(section.id) ? prev.sectionOrder : [...prev.sectionOrder, section.id] }));
                setShowSectionCreator(false);
                setEditingSection(null);
              }}
              onCancel={() => { setShowSectionCreator(false); setEditingSection(null); }}
              te={te}
            />
          ) : (
            <>
              {filteredGroups.map(group => {
                const visibleCount = group.fields.filter(f => !hiddenFields.has(f)).length;
                return (
                  <details key={group.id} className="group rounded-xl border border-[rgba(245,237,214,0.08)] overflow-hidden">
                    <summary className={`flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none transition hover:bg-[var(--navy-3)] bg-[var(--navy-2)] ${group.color.split(' ').slice(0, 2).join(' ')}`}>
                      <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${group.color}`}>{group.icon}</span>
                      <span className="flex-1 text-[13px] font-semibold text-[var(--sand)]">{te(group.labelKey)}</span>
                      <span className="text-[10px] text-[var(--sand-muted)] font-medium">{visibleCount}/{group.fields.length}</span>
                      <ChevronDown size={14} className="text-[var(--sand-muted)] transition group-open:rotate-180" />
                    </summary>
                    <div className="px-3.5 pb-3 pt-1 space-y-1 bg-[var(--navy-3)]">
                      <div className="flex flex-wrap gap-1.5">
                        {group.fields.map(fieldId => {
                          const isHidden = hiddenFields.has(fieldId);
                          const label = te(`fields.${fieldId}`) || te(`general.${fieldId}`) || te(`client.${fieldId}`) || te(`prestations.${fieldId}`) || te(`paiement.${fieldId}`) || te(`chantier.${fieldId}`) || te(`materiaux.${fieldId}`) || te(`garanties.${fieldId}`) || te(`remise.${fieldId}`) || te(`mode.${fieldId}`) || fieldId;
                          return (
                            <label key={fieldId} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition text-[11px] ${isHidden ? 'bg-[var(--navy-2)] text-[var(--sand-muted)] border border-[rgba(245,237,214,0.08)] opacity-50' : 'bg-[var(--navy-2)] text-[var(--sand)] border border-[rgba(245,237,214,0.12)] font-medium shadow-sm'}`}>
                              <input type="checkbox" checked={!isHidden} onChange={() => {
                                setFieldPrefs(prev => {
                                  const current = { ...(prev ?? {}) };
                                  const currentTypePrefs = { ...((current[doc.documentType] as Record<string, string[]>) ?? {}) };
                                  for (const section of ALL_SECTIONS) {
                                    const sectionFields = SECTION_FIELDS[section] ?? customSections.find(c => c.id === section)?.fields.map(f => f.id) ?? [];
                                    if (sectionFields.includes(fieldId)) {
                                      const visible = [...(currentTypePrefs[section] ?? sectionFields)];
                                      if (isHidden) { if (!visible.includes(fieldId)) visible.push(fieldId); }
                                      else { const idx = visible.indexOf(fieldId); if (idx >= 0) visible.splice(idx, 1); }
                                      currentTypePrefs[section] = visible;
                                    }
                                  }
                                  current[doc.documentType] = currentTypePrefs;
                                  return current;
                                });
                              }} className="w-3.5 h-3.5 rounded text-[var(--green-3)]" />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                );
              })}
              {customSections.length > 0 && (
                <details className="group rounded-xl border border-[rgba(245,237,214,0.08)] overflow-hidden">
                  <summary className="flex items-center gap-3 px-3.5 py-3 cursor-pointer select-none transition hover:bg-[var(--navy-3)] bg-[var(--navy-2)]">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--navy-3)] text-amber-400"><Briefcase size={16} /></span>
                    <span className="flex-1 text-[13px] font-semibold text-[var(--sand)]">{te('customSections') || 'Mes sections'}</span>
                    <ChevronDown size={14} className="text-[var(--sand-muted)] transition group-open:rotate-180" />
                  </summary>
                  <div className="px-3.5 pb-3 pt-1 space-y-1 bg-[var(--navy-3)]">
                    <div className="flex flex-wrap gap-1.5">
                      {customSections.map(cs => (
                        <span key={cs.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--navy-2)] text-[11px] text-[var(--sand)] border border-amber-400/20 font-medium shadow-sm">
                          {cs.label}
                          <button type="button" onClick={async () => {
                            await fetch(`/api/user/custom-sections?id=${cs.id}`, { method: 'DELETE' });
                            setCustomSections(prev => prev.filter(c => c.id !== cs.id));
                            setFieldPrefs(prev => {
                              if (!prev) return prev;
                              const updated = { ...prev };
                              for (const docType of Object.keys(updated)) {
                                const typePrefs = updated[docType] as Record<string, string[]> | undefined;
                                if (typePrefs && typePrefs[cs.id]) {
                                  const rest = { ...typePrefs };
                                  delete rest[cs.id];
                                  updated[docType] = rest;
                                }
                              }
                              return updated;
                            });
                            setDoc(prev => ({ ...prev, sectionOrder: prev.sectionOrder.filter(s => s !== cs.id) }));
                          }} className="text-red-400 hover:text-red-300 ms-1">✕</button>
                          <button type="button" onClick={() => { setEditingSection(cs); setShowSectionCreator(true); }} className="text-blue-400 hover:text-blue-300 ms-0.5">✎</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              )}
              <button type="button" onClick={() => { setEditingSection({ id: '', label: '', fields: [] }); setShowSectionCreator(true); }}
                className="w-full mt-2 py-3 border-2 border-dashed border-[rgba(245,237,214,0.12)] rounded-xl text-[var(--sand-muted)] font-bold hover:bg-[var(--navy-3)] transition text-[12px] flex items-center justify-center gap-2">
                <Plus size={14} />
                {te('addCustomSection') ?? '+ Ajouter ma propre section'}
              </button>
            </>
          )}
        </div>
        <div className="px-5 py-3 border-t border-[rgba(245,237,214,0.08)] flex items-center justify-between bg-[var(--navy-2)]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input type="checkbox" checked={showSectionNav} onChange={() => setShowSectionNav(v => !v)} className="w-3.5 h-3.5 rounded text-[var(--green-3)]" />
              <span className="text-[10px] font-medium text-[var(--sand-muted)]">{te('showSectionNav') || 'Navigateur sections'}</span>
            </label>
            <div className="w-px h-4 bg-[rgba(245,237,214,0.08)]" />
            <button type="button" onClick={() => {
              const all = Object.fromEntries(ALL_SECTIONS.map(s => {
                if (SECTION_FIELDS[s]) return [s, [...SECTION_FIELDS[s]]];
                const cs = customSections.find(c => c.id === s);
                if (cs) return [s, cs.fields.map(f => f.id)];
                return [s, []];
              }));
              setFieldPrefs(prev => ({ ...(prev ?? {}), [doc.documentType]: all }));
            }} className="text-[11px] font-semibold text-[var(--green-3)] hover:text-[var(--green-2)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--green-glow)] transition">{te('selectAll')}</button>
            <button type="button" onClick={() => {
              const none = Object.fromEntries(ALL_SECTIONS.map(s => [s, []]));
              setFieldPrefs(prev => ({ ...(prev ?? {}), [doc.documentType]: none }));
            }} className="text-[11px] font-semibold text-red-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg hover:bg-[rgba(232,84,46,0.08)] transition">{te('deselectAll')}</button>
          </div>
          <button type="button" onClick={() => {
            const all = Object.fromEntries(ALL_SECTIONS.map(s => {
              if (SECTION_FIELDS[s]) return [s, [...SECTION_FIELDS[s]]];
              const cs = customSections.find(c => c.id === s);
              if (cs) return [s, cs.fields.map(f => f.id)];
              return [s, []];
            }));
            const prefs = { ...(fieldPrefs ?? {}), [doc.documentType]: fieldPrefs?.[doc.documentType] ?? all };
            fetch('/api/user/preferences', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fields: prefs }),
            });
            setFieldPrefs(prefs);
            onClose();
          }}
            className="bg-[var(--green-3)] text-[var(--navy-2)] text-[12px] font-semibold px-6 py-2.5 rounded-xl hover:bg-[var(--green-2)] active:scale-[0.97] transition shadow-sm">{te('customizeSave')}</button>
        </div>
      </div>
    </div>
  );
}
