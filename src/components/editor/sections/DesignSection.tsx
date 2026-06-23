'use client';
import type { SectionProps } from './SectionProps';

export function DesignSection({ doc, mode, updateCompanyInfo, updateDoc, hiddenFields, te, showToast }: SectionProps) {
  if (mode !== 'entreprise') return null;
  return (
    <div className="space-y-2">
      {!hiddenFields.has('logo') && (
        <div className="flex items-center gap-2 p-2 bg-[var(--navy-3)] rounded-xl border border-[rgba(245,237,214,0.06)]">
          <input type="file" accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 500 * 1024) { showToast('Logo max 500 Ko', 'error'); return; }
              showToast('Encodage du logo…', 'info');
              const reader = new FileReader();
              reader.onload = (ev) => {
                updateCompanyInfo({ logo: ev.target?.result as string });
                showToast('Logo ajouté avec succès', 'success');
              };
              reader.readAsDataURL(file);
            }}
            className="text-[10px] text-[var(--sand-muted)] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[var(--green-glow)] file:text-[var(--green-3)] hover:file:bg-[var(--green-glow)] flex-1" />
          {doc.companyInfo?.logo && (
            <button onClick={() => updateCompanyInfo({ logo: '' })}
              className="text-[10px] text-red-500 font-semibold hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-400/10 transition whitespace-nowrap">
              {te('removeLogo') || '✕'}
            </button>
          )}
        </div>
      )}
      {!hiddenFields.has('logoPosition') && doc.companyInfo?.logo && (
        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] font-bold text-[var(--sand-muted)]">{te('logoPosition') || 'Position'}</span>
          <div className="flex bg-[var(--navy-4)] rounded-lg p-0.5 border border-[rgba(245,237,214,0.1)]">
            <button onClick={() => updateDoc('logoPosition', 'left')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${doc.logoPosition === 'left' ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]'}`}>
              {te('logoLeft') || 'Gauche'}
            </button>
            <button onClick={() => updateDoc('logoPosition', 'right')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${doc.logoPosition === 'right' || !doc.logoPosition ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]'}`}>
              {te('logoRight') || 'Droite'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
