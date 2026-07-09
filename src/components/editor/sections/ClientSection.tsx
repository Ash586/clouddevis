'use client';

import { ClientCombobox } from '@/components/editor/ClientCombobox';
import { validateNIF, validateNIS, validateRC, validateAI } from '@/lib/validation';
import { useSectionContext } from './SectionProps';

export function ClientSection() {
  const { doc, mode, updateClientInfo, updateCompanyInfo, updateArtisanInfo, updateTaxIds, hiddenFields, te } = useSectionContext();
  return (
    <div className="space-y-2">
      {!hiddenFields.has('clientName') && <ClientCombobox value={doc.clientInfo.name} onSelect={(c) => updateClientInfo({ name: c.name, address: c.address ?? doc.clientInfo.address, phone: c.phone ?? doc.clientInfo.phone, email: c.email ?? doc.clientInfo.email, nif: c.nif ?? doc.clientInfo.nif, nis: c.nis ?? doc.clientInfo.nis, rc: c.rc ?? doc.clientInfo.rc, ai: c.ai ?? doc.clientInfo.ai })} placeholder={te('client.clientName')} />}
      {!hiddenFields.has('clientAddress') && <textarea placeholder={te('client.clientAddress')} className="w-full border p-2 rounded-lg text-[11px] h-12 resize-none outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.address ?? ''} onChange={(e) => updateClientInfo({ address: e.target.value })} />}
      {!hiddenFields.has('clientPhone') && <input type="text" placeholder={te('client.clientPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.phone ?? ''} onChange={(e) => updateClientInfo({ phone: e.target.value })} />}

      {!hiddenFields.has('clientEmail') && <div className="flex items-center gap-2 pt-1">
        <input type="text" placeholder={te('client.companyEmail')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.clientInfo.email ?? ''} onChange={(e) => updateClientInfo({ email: e.target.value })} /></div>}
      {mode === 'artisan' && doc.artisanInfo && <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.yourInfo')}</h4>
        <input type="text" placeholder={te('client.yourName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.name} onChange={(e) => updateArtisanInfo({ name: e.target.value })} />
        <input type="text" placeholder={te('client.yourAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.address} onChange={(e) => updateArtisanInfo({ address: e.target.value })} />
        <input type="text" placeholder={te('client.yourPhone')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.artisanInfo.phone ?? ''} onChange={(e) => updateArtisanInfo({ phone: e.target.value })} />
      </div>}
      {mode === 'entreprise' && doc.companyInfo && <div className="border-t border-[rgba(245,237,214,0.06)] pt-2 space-y-2">
        <h4 className="text-[10px] font-bold text-[var(--sand-muted)] uppercase tracking-wider">{te('client.yourCompany')}</h4>
        <input type="text" placeholder={te('client.companyName')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyInfo.name} onChange={(e) => updateCompanyInfo({ name: e.target.value })} />
        <input type="text" placeholder={te('client.companyAddress')} className="w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 focus:ring-[var(--green-2)]" value={doc.companyInfo.address} onChange={(e) => updateCompanyInfo({ address: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input type="text" placeholder={te('client.companyNif')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.nif && !validateNIF(doc.companyInfo.taxIds.nif) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.nif} onChange={(e) => updateTaxIds({ nif: e.target.value })} />
            {doc.companyInfo.taxIds.nif && !validateNIF(doc.companyInfo.taxIds.nif) && <span className="text-[8px] text-red-500">11 chiffres requis</span>}
          </div>
          <div>
            <input type="text" placeholder={te('client.companyRc')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.rc && !validateRC(doc.companyInfo.taxIds.rc) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.rc} onChange={(e) => updateTaxIds({ rc: e.target.value })} />
            {doc.companyInfo.taxIds.rc && !validateRC(doc.companyInfo.taxIds.rc) && <span className="text-[8px] text-red-500">Format RC invalide</span>}
          </div>
          <div>
            <input type="text" placeholder={te('client.companyNis')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.nis && !validateNIS(doc.companyInfo.taxIds.nis) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.nis} onChange={(e) => updateTaxIds({ nis: e.target.value })} />
            {doc.companyInfo.taxIds.nis && !validateNIS(doc.companyInfo.taxIds.nis) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
          </div>
          <div>
            <input type="text" placeholder={te('client.companyAi')} className={`w-full border p-2 rounded-lg text-[11px] outline-none focus:ring-2 ${doc.companyInfo.taxIds.ai && !validateAI(doc.companyInfo.taxIds.ai) ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'focus:ring-[var(--green-2)]'}`} value={doc.companyInfo.taxIds.ai} onChange={(e) => updateTaxIds({ ai: e.target.value })} />
            {doc.companyInfo.taxIds.ai && !validateAI(doc.companyInfo.taxIds.ai) && <span className="text-[8px] text-red-500">10 chiffres requis</span>}
          </div>
        </div></div>}
    </div>
  );
}
