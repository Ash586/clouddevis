'use client';
import { useSectionContext } from './SectionProps';

export function NotesSection() {
  const { doc, updateDoc, hiddenFields, te } = useSectionContext();
  return (
    <>
      {!hiddenFields.has('notes') && <textarea placeholder={te('notes.placeholder')} className="w-full border p-2 rounded-lg text-[11px] h-16 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.notes ?? ''} onChange={(e) => updateDoc('notes', e.target.value)} />}
    </>
  );
}
