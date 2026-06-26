'use client';

import { useRef, useState } from 'react';
import { Upload, X, AlignLeft, AlignCenter, AlignRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionContext } from './SectionProps';

const TEMPLATES = [
  {
    id: 'haussmann' as const,
    label: 'Haussmann',
    desc: 'Vert · Cormorant',
    accent: '#0d4a3e',
    preview: (
      <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '5px 5px 3px' }}>
        {/* Company name centered, italic */}
        <div style={{ width: '72%', height: 5, background: '#0d4a3e', borderRadius: 2, marginBottom: 3, marginTop: 3, opacity: 0.85 }} />
        <div style={{ width: '38%', height: 2, background: '#9ca3af', borderRadius: 1, marginBottom: 5 }} />
        {/* Separator with diamonds */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, width: '92%', marginBottom: 5 }}>
          <div style={{ flex: 1, height: 0.5, background: '#0d4a3e' }} />
          <div style={{ width: 4, height: 4, background: '#c9a227', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <div style={{ width: 14, height: 2.5, background: '#0d4a3e', borderRadius: 1 }} />
          <div style={{ width: 4, height: 4, background: '#c9a227', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 0.5, background: '#0d4a3e' }} />
        </div>
        {/* Two columns */}
        <div style={{ display: 'flex', gap: 4, width: '92%', marginBottom: 5 }}>
          <div style={{ flex: 1, borderRight: '0.5px solid #e5e7eb', paddingRight: 3 }}>
            <div style={{ height: 1.5, background: '#e5e7eb', borderRadius: 1, marginBottom: 2 }} />
            <div style={{ height: 1.5, background: '#e5e7eb', borderRadius: 1, marginBottom: 2 }} />
          </div>
          <div style={{ flex: 1, paddingLeft: 3 }}>
            <div style={{ height: 3.5, background: '#0d4a3e', borderRadius: 1, marginBottom: 2, opacity: 0.7 }} />
            <div style={{ height: 1.5, background: '#e5e7eb', borderRadius: 1 }} />
          </div>
        </div>
        {/* Table rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '92%', flex: 1 }}>
          {[1,2,3].map(i => <div key={i} style={{ height: 2.5, borderBottom: '0.5px solid #e5e7eb' }} />)}
        </div>
        {/* Total */}
        <div style={{ width: '44%', height: 7, background: '#0d4a3e', alignSelf: 'flex-end', marginTop: 4, borderRadius: 1 }} />
      </div>
    ),
  },
  {
    id: 'velours' as const,
    label: 'Velours Rouge',
    desc: 'Bordeaux · Playfair',
    accent: '#3d0d1c',
    preview: (
      <div style={{ width: '100%', height: '100%', background: '#fdfaf5', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 2.5, background: '#c9a227' }} />
        <div style={{ background: '#3d0d1c', padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '55%', height: 5, background: '#f0e0c8', borderRadius: 1, marginBottom: 3 }} />
            <div style={{ width: '32%', height: 1.5, background: '#c9a227', marginBottom: 2 }} />
            <div style={{ width: '45%', height: 2, background: '#c9a090', borderRadius: 1 }} />
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ border: '1px solid #c9a227', padding: '2px 5px', marginBottom: 3 }}>
              <div style={{ width: 20, height: 3.5, background: '#f0e0c8', borderRadius: 1 }} />
            </div>
            <div style={{ width: 24, height: 2, background: '#f9e8ee', borderRadius: 1, marginLeft: 'auto' }} />
            <div style={{ width: 18, height: 1.5, background: '#f9e8ee', borderRadius: 1, marginLeft: 'auto', marginTop: 1 }} />
          </div>
        </div>
        <div style={{ height: 1.5, background: '#c9a227' }} />
        <div style={{ padding: '4px 6px', flex: 1 }}>
          <div style={{ background: '#fff', border: '0.5px solid #e8d5b7', padding: '3px 4px', marginBottom: 4 }}>
            <div style={{ width: '60%', height: 3, background: '#3d0d1c', borderRadius: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 2.5, background: i%2===0 ? '#fdfaf5' : '#fff', borderBottom: '0.5px solid #e8d5b7' }} />)}
          </div>
          {/* Gold-bordered total */}
          <div style={{ marginTop: 4, marginLeft: 'auto', width: '40%', height: 7, border: '1px solid #c9a227', background: '#fff' }} />
        </div>
      </div>
    ),
  },
  {
    id: 'industrielle' as const,
    label: 'Précision Ind.',
    desc: 'Ardoise · Bleu',
    accent: '#1e40af',
    preview: (
      <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Split header */}
        <div style={{ display: 'flex', height: 32 }}>
          <div style={{ width: '45%', background: '#1e293b', padding: '5px 5px', flexShrink: 0 }}>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.7)', borderRadius: 1, marginBottom: 3, width: '65%' }} />
            <div style={{ height: 2, background: 'rgba(148,197,253,0.6)', borderRadius: 1, width: '50%', marginBottom: 2 }} />
            <div style={{ height: 1.5, background: 'rgba(148,197,253,0.4)', borderRadius: 1, width: '55%' }} />
          </div>
          <div style={{ flex: 1, background: '#f1f5f9', padding: '5px 5px' }}>
            <div style={{ height: 5, background: '#1e293b', borderRadius: 1, marginBottom: 3, width: '50%' }} />
            <div style={{ height: 1.5, background: '#94a3b8', borderRadius: 1, width: '70%', marginBottom: 1.5 }} />
            <div style={{ height: 1.5, background: '#94a3b8', borderRadius: 1, width: '55%' }} />
          </div>
        </div>
        {/* Client block */}
        <div style={{ background: '#f8fafc', margin: '3px 4px', padding: '3px 4px' }}>
          <div style={{ height: 2.5, background: '#2563eb', borderRadius: 1, marginBottom: 2, width: '40%', opacity: 0.6 }} />
          <div style={{ height: 2, background: '#0f172a', borderRadius: 1, width: '65%' }} />
        </div>
        {/* Table */}
        <div style={{ padding: '0 4px', flex: 1 }}>
          <div style={{ height: 5, background: '#334155', borderRadius: 1, marginBottom: 2 }} />
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 2.5, background: i%2===0 ? '#f8fafc' : '#fff', borderBottom: '0.5px solid #e2e8f0', display: 'flex', marginBottom: 1 }}>
              <div style={{ width: 2.5, background: '#2563eb', flexShrink: 0 }} />
            </div>
          ))}
          {/* Totals grid */}
          <div style={{ marginTop: 4, marginLeft: 'auto', width: '46%' }}>
            <div style={{ height: 2.5, border: '0.5px solid #e2e8f0', marginBottom: 1 }} />
            <div style={{ height: 6, background: '#1e40af' }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'nordic' as const,
    label: 'Nordic Minimal',
    desc: 'Teal · Montserrat',
    accent: '#0f766e',
    preview: (
      <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 3, background: '#0f766e' }} />
        <div style={{ padding: '6px 7px', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ width: '45%', height: 5, background: '#111827', borderRadius: 2 }} />
            <div style={{ width: '28%', height: 5, background: '#0f766e', borderRadius: 2 }} />
          </div>
          <div style={{ width: '35%', height: 2, background: '#e5e7eb', borderRadius: 1, marginBottom: 3 }} />
          <div style={{ height: 1, background: '#bbf7d0', marginBottom: 4 }} />
          <div style={{ background: '#f0fdf4', borderLeft: '2px solid #0f766e', padding: '3px 4px', marginBottom: 5 }}>
            <div style={{ width: '58%', height: 2.5, background: '#111827', borderRadius: 1 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 2.5, background: i%2===0 ? '#f0fdf4' : '#fff', borderBottom: '0.5px solid #e5e7eb' }} />)}
          </div>
          <div style={{ marginTop: 5, marginLeft: 'auto', width: '40%', height: 7, background: '#0f766e', borderRadius: 1 }} />
        </div>
      </div>
    ),
  },
] as const;

const SIZE_OPTS = [
  { value: 'sm', label: 'S', title: 'Petite (60px)' },
  { value: 'md', label: 'M', title: 'Moyenne (110px)' },
  { value: 'lg', label: 'L', title: 'Grande (180px)' },
] as const;

const POS_OPTS = [
  { value: 'left',   Icon: AlignLeft,   title: 'Gauche' },
  { value: 'center', Icon: AlignCenter, title: 'Centre' },
  { value: 'right',  Icon: AlignRight,  title: 'Droite' },
] as const;

export function DesignSection() {
  const { doc, updateCompanyInfo, updateDoc, hiddenFields, showToast } = useSectionContext();
  const activeTemplate = doc.previewTemplate ?? 'haussmann';
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const logo: string | undefined = doc.companyInfo?.logo;
  const position = doc.logoPosition ?? 'right';
  const size = doc.logoSize ?? 'md';

  function processFile(file: File) {
    if (!file.type.startsWith('image/')) { showToast('Fichier image requis (PNG, JPG, SVG…)', 'error'); return; }
    if (file.size > 1024 * 1024) { showToast('Logo trop volumineux — max 1 Mo', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateCompanyInfo({ logo: ev.target?.result as string });
      showToast('Logo ajouté ✓', 'success');
    };
    reader.readAsDataURL(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  const showLogo    = !hiddenFields.has('logo');
  const showPos     = !hiddenFields.has('logoPosition') && !!logo;
  const showSize    = !hiddenFields.has('logoSize') && !!logo;

  if (!showLogo && !showPos && !showSize) return null;

  return (
    <div className="space-y-4">

      {/* ── Template picker ── */}
      <div>
        <p className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-widest mb-2">Modèle de document</p>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map(({ id, label, desc, accent, preview }) => {
            const active = activeTemplate === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateDoc('previewTemplate', id)}
                className={cn(
                  'relative rounded-lg overflow-hidden border-2 transition-all text-left',
                  active
                    ? 'shadow-sm'
                    : 'border-[rgba(245,237,214,0.08)] hover:border-[rgba(245,237,214,0.2)]',
                )}
                style={{ borderColor: active ? accent : undefined, aspectRatio: '3/4' }}
                title={label}
              >
                {/* Miniature preview */}
                <div className="w-full h-full">
                  {preview}
                </div>
                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-[var(--navy)]/80 px-1.5 py-1">
                  <div className="text-[9px] font-bold text-[var(--sand)] leading-tight truncate">{label}</div>
                  <div className="text-[8px] text-[var(--sand-muted)] truncate">{desc}</div>
                </div>
                {/* Active checkmark */}
                {active && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: accent }}>
                    <Check size={9} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Logo upload / preview ── */}
      {showLogo && (
        logo ? (
          /* ── Preview with replace + remove ── */
          <div className="relative group rounded-xl border border-[rgba(245,237,214,0.1)] bg-[var(--navy-3)] overflow-hidden">
            <div className="flex items-center justify-center p-5 min-h-[100px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt="Logo"
                className={cn(
                  'object-contain transition-all',
                  size === 'sm' && 'max-w-[60px]  max-h-[40px]',
                  size === 'md' && 'max-w-[110px] max-h-[60px]',
                  size === 'lg' && 'max-w-[180px] max-h-[90px]',
                )}
              />
            </div>
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-[var(--navy)]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[var(--green-2)] text-white hover:bg-[var(--green-3)] transition"
              >
                <Upload size={12} /> Remplacer
              </button>
              <button
                type="button"
                onClick={() => updateCompanyInfo({ logo: '' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
              >
                <X size={12} /> Supprimer
              </button>
            </div>
          </div>
        ) : (
          /* ── Drop zone ── */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'w-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 py-7 cursor-pointer',
              dragging
                ? 'border-[var(--green-2)] bg-[var(--green-glow)]'
                : 'border-[rgba(245,237,214,0.12)] hover:border-[rgba(245,237,214,0.25)] bg-[var(--navy-3)] hover:bg-[var(--navy-4)]',
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
              dragging ? 'bg-[var(--green-2)]/20 text-[var(--green-3)]' : 'bg-[var(--navy-4)] text-[var(--sand-muted)]',
            )}>
              <Upload size={18} />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-semibold text-[var(--sand-muted)]">
                {dragging ? 'Déposez ici…' : 'Cliquer ou déposer votre logo'}
              </p>
              <p className="text-[10px] text-[var(--sand-muted)]/60 mt-0.5">PNG · JPG · SVG · max 1 Mo</p>
            </div>
          </button>
        )
      )}

      {/* Hidden file input */}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

      {/* ── Size + Position controls (only when logo loaded) ── */}
      {(showSize || showPos) && logo && (
        <div className="flex items-center justify-between gap-3 px-1">

          {/* Size */}
          {showSize && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--sand-muted)] shrink-0">Taille</span>
              <div className="flex bg-[var(--navy-4)] rounded-lg p-0.5">
                {SIZE_OPTS.map(({ value, label, title }) => (
                  <button
                    key={value}
                    type="button"
                    title={title}
                    onClick={() => updateDoc('logoSize', value)}
                    className={cn(
                      'w-8 h-7 rounded-md text-[11px] font-black transition',
                      size === value
                        ? 'bg-[var(--green-2)] text-white shadow-sm'
                        : 'text-[var(--sand-muted)] hover:text-[var(--sand)]',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Position */}
          {showPos && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--sand-muted)] shrink-0">Position</span>
              <div className="flex bg-[var(--navy-4)] rounded-lg p-0.5">
                {POS_OPTS.map(({ value, Icon, title }) => (
                  <button
                    key={value}
                    type="button"
                    title={title}
                    onClick={() => updateDoc('logoPosition', value)}
                    className={cn(
                      'w-8 h-7 rounded-md flex items-center justify-center transition',
                      position === value
                        ? 'bg-[var(--green-2)] text-white shadow-sm'
                        : 'text-[var(--sand-muted)] hover:text-[var(--sand)]',
                    )}
                  >
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
