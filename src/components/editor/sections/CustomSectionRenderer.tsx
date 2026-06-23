'use client';
import type { SectionProps } from './SectionProps';

export function CustomSectionRenderer({
  doc, customSections, hiddenFields, updateCustomField, te,
}: SectionProps) {
  const cs = customSections.find(c => c.id === doc.documentType);
  if (!cs) return null;

  return (
    <>
      {cs.fields.map(field => {
        const hiddenKey = `custom_${cs.id}_${field.id}`;
        if (hiddenFields.has(hiddenKey)) return null;
        const val = String((doc.customFields[cs.id] ?? {})[field.id] ?? '');
        const onChange = (v: string | number) => updateCustomField(cs.id, field.id, v);
        switch (field.type) {
          case 'text':
          case 'number':
            return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label>
              <input type={field.type} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={val} onChange={(e) => onChange(field.type === 'number' ? (parseFloat(e.target.value) || '') : e.target.value)} /></div>;
          case 'date':
            return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label>
              <input type="date" className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={val} onChange={(e) => onChange(e.target.value)} /></div>;
          case 'textarea':
            return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label>
              <textarea className="w-full border p-2 rounded-lg text-[11px] h-14 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={val} onChange={(e) => onChange(e.target.value)} /></div>;
          case 'select':
            return <div key={field.id}><label className="block text-[10px] sm:text-[9px] font-bold text-[var(--sand-muted)] mb-0.5 leading-relaxed">{field.label}</label>
              <select className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]"
                value={val} onChange={(e) => onChange(e.target.value)}>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select></div>;
        }
      })}
    </>
  );
}
