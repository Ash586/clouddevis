'use client';

import { useRef, useState } from 'react';
import { Upload, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionContext } from './SectionProps';

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

  const showLogo = !hiddenFields.has('logo');
  const showPos  = !hiddenFields.has('logoPosition') && !!logo;
  const showSize = !hiddenFields.has('logoSize') && !!logo;

  if (!showLogo && !showPos && !showSize) return null;

  return (
    <div className="space-y-4">

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
