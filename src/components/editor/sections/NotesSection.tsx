'use client';
import type { SectionProps } from './SectionProps';

export function NotesSection({ doc, updateDoc, hiddenFields, te }: SectionProps) {
  return (
    <>
      {!hiddenFields.has('notes') && <textarea placeholder={te('notes.placeholder')} className="w-full border p-2 rounded-lg text-[11px] h-16 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.notes ?? ''} onChange={(e) => updateDoc('notes', e.target.value)} />}
    </>
  );
}
