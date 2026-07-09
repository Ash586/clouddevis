'use client';
import { useSectionContext } from './SectionProps';

const MODES = [
  {
    value: 'artisan' as const,
    icon: '🔨',
    label: 'Artisan',
    desc: 'Nom + téléphone',
  },
  {
    value: 'entreprise' as const,
    icon: '🏢',
    label: 'Entreprise',
    desc: 'RC · NIF · NIS · AI',
  },
];

export function ModeSection() {
  const { mode, setMode, hiddenFields } = useSectionContext();

  if (hiddenFields.has('businessMode')) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {MODES.map(m => {
          const active = mode === m.value;
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={`text-left p-2.5 rounded-xl border-2 transition ${
                active
                  ? 'border-[var(--green-2)] bg-[rgba(37,99,235,0.06)]'
                  : 'border-[rgba(15,39,71,0.08)] bg-[var(--navy-3)] hover:border-[rgba(15,39,71,0.15)]'
              }`}
            >
              <div className="text-base mb-0.5">{m.icon}</div>
              <div className={`text-[11px] font-bold ${active ? 'text-[var(--green-3)]' : 'text-[var(--sand)]'}`}>
                {m.label}
              </div>
              <div className="text-[9px] text-[var(--sand-muted)]">{m.desc}</div>
              {active && (
                <div className="mt-1.5 inline-flex items-center gap-1 bg-[var(--green-2)] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                  ✓ Actif
                </div>
              )}
            </button>
          );
        })}
      </div>
      {mode === 'entreprise' && (
        <div className="flex items-center gap-1.5 bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.12)] rounded-lg px-2.5 py-1.5">
          <span className="text-[10px]">🏛️</span>
          <span className="text-[9px] text-[var(--sand-muted)]">RC, NIF, NIS, AI et Capital apparaîtront sur le PDF</span>
        </div>
      )}
      {mode === 'artisan' && (
        <div className="flex items-center gap-1.5 bg-[rgba(245,237,214,0.04)] border border-[rgba(245,237,214,0.06)] rounded-lg px-2.5 py-1.5">
          <span className="text-[10px]">💡</span>
          <span className="text-[9px] text-[var(--sand-muted)]">Passez en mode Entreprise pour ajouter RC, NIF, NIS, AI</span>
        </div>
      )}
    </div>
  );
}
