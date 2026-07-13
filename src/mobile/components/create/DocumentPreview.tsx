'use client';

// ============================================================
// Rakmana Mobile — Document Preview
// A faithful, modern rendering of the actual Algerian invoice/
// devis the user is about to download — company letterhead,
// client "DOIT" block, objet, line-item table (code · remise ·
// TVA), totals box, amount in words and signature.
// Shown full-screen so the user SEES the document before export.
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import { useDocumentStore } from '@/stores/documentStore';
import { useCompanyStore } from '@/stores/companyStore';
import { DOCUMENT_TYPE_LABELS, UNIT_LABELS } from '@/mobile/types';
import { numberToFrenchWords, formatDateAlgerian } from '@/lib/dgi';

function da(n: number): string {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface DocumentPreviewProps {
  open: boolean;
  docNumber: string;
  busy?: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export function DocumentPreview({ open, docNumber, busy, onClose, onDownload, onShare }: DocumentPreviewProps) {
  const doc = useDocumentStore((s) => s.currentDoc);
  const totals = useDocumentStore((s) => s.totals);
  const company = useCompanyStore((s) => s.company);

  const showRemise = doc.items.some((i) => (i.remise ?? 0) > 0);
  const typeLabel = DOCUMENT_TYPE_LABELS[doc.type].toUpperCase();

  // Document ink palette (a printed page is always light)
  const ink = '#0F2747';
  const muted = '#5A6B85';
  const accent = '#2563EB';
  const hair = 'rgba(15,39,71,0.14)';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col"
          style={{ background: '#11141f' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ paddingTop: 'calc(10px + env(safe-area-inset-top, 0px))' }}
          >
            <button type="button" onClick={onClose} aria-label="Fermer l'aperçu"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white active:scale-95 transition-transform">
              <X size={20} />
            </button>
            <span className="text-sm font-semibold text-white/90">Aperçu du document</span>
            <span className="w-10" />
          </div>

          {/* Paper — scaled to 75% so the full page is visible without scrolling */}
          <div className="flex-1 overflow-y-auto px-2 pb-4 flex justify-center">
            <div style={{ width: '133.33%', transformOrigin: 'top center', transform: 'scale(0.75)' }}>
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="mx-auto bg-white rounded-lg overflow-hidden"
              style={{ maxWidth: 720, boxShadow: '0 20px 60px rgba(0,0,0,0.5)', color: ink }}
            >
              {/* accent top stripe */}
              <div style={{ height: 4, background: accent }} />

              <div className="p-5">
                {/* ── Letterhead ── */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-[17px] font-bold leading-tight" style={{ color: ink }}>
                      {company?.name || 'Votre société'}
                    </h1>
                    {company?.activity && (
                      <p className="text-[11px] mt-0.5" style={{ color: muted }}>{company.activity}</p>
                    )}
                    {company?.address && (
                      <p className="text-[11px] mt-1.5" style={{ color: ink }}>{company.address}</p>
                    )}
                    {company?.capital && (
                      <p className="text-[11px]" style={{ color: muted }}>Capital : {company.capital}</p>
                    )}
                    <div className="text-[11px] mt-1 flex flex-wrap gap-x-3" style={{ color: ink }}>
                      {company?.phone && <span>Tél : {company.phone}</span>}
                      {company?.fax && <span>Fax : {company.fax}</span>}
                      {company?.email && <span>{company.email}</span>}
                    </div>
                  </div>
                  {company?.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo} alt="" className="w-16 h-16 object-contain shrink-0" />
                  ) : null}
                </div>

                {/* Bank + fiscal band */}
                {(company?.bankName || company?.rib || company?.ccp) && (
                  <div className="text-[10px] mt-2 pt-2" style={{ color: muted, borderTop: `1px solid ${hair}` }}>
                    {company?.bankName && <span>Banque : {company.bankName}  </span>}
                    {company?.rib && <span>RIB : {company.rib}  </span>}
                    {company?.ccp && <span>CCP : {company.ccp}</span>}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 text-[10px] mt-1" style={{ color: muted }}>
                  {company?.rc && <span>RC : {company.rc}</span>}
                  {company?.nif && <span>NIF : {company.nif}</span>}
                  {company?.nis && <span>NIS : {company.nis}</span>}
                  {company?.ai && <span>AI : {company.ai}</span>}
                </div>

                {/* ── Title row ── */}
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: accent }}>{typeLabel}</p>
                    <p className="text-[17px] font-bold leading-tight" style={{ color: ink }}>{docNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px]" style={{ color: ink }}>Le {formatDateAlgerian(new Date())}</p>
                    <p className="text-[10px]" style={{ color: muted }}>
                      {PAYMENT_LABEL[doc.paymentMode] ?? doc.paymentMode}
                    </p>
                  </div>
                </div>

                {/* ── Client (DOIT) ── */}
                <div className="mt-3 p-3 rounded-md" style={{ background: '#F3F6FC', border: `1px solid ${hair}` }}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: muted }}>Doit</p>
                  <p className="text-[13px] font-bold mt-0.5" style={{ color: ink }}>
                    {doc.client?.name || '—'}
                  </p>
                  {doc.client?.address && <p className="text-[11px]" style={{ color: ink }}>{doc.client.address}</p>}
                  <div className="flex flex-wrap gap-x-3 text-[10px] mt-1" style={{ color: muted }}>
                    {doc.client?.nif && <span>NIF : {doc.client.nif}</span>}
                    {doc.client?.ai && <span>AI : {doc.client.ai}</span>}
                    {doc.client?.rc && <span>RC : {doc.client.rc}</span>}
                    {doc.client?.nis && <span>NIS : {doc.client.nis}</span>}
                  </div>
                </div>

                {/* ── Objet / Référence ── */}
                {(doc.objet || doc.reference) && (
                  <div className="mt-3 text-[11px]" style={{ color: ink }}>
                    {doc.reference && (
                      <p><span className="font-semibold">Référence : </span>{doc.reference}</p>
                    )}
                    {doc.objet && (
                      <p className="mt-0.5"><span className="font-semibold">Objet : </span>{doc.objet}</p>
                    )}
                  </div>
                )}

                {/* ── Items table ── */}
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-[10.5px]" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F3F6FC', color: muted }}>
                        <Th>N°</Th>
                        <Th align="left">Désignation</Th>
                        <Th align="right">Qté</Th>
                        <Th align="right">P.U HT</Th>
                        {showRemise && <Th align="right">Rem.</Th>}
                        <Th align="right">Montant HT</Th>
                        <Th align="right">TVA</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.items.map((it, i) => (
                        <tr key={it.id} style={{ borderBottom: `1px solid ${hair}` }}>
                          <Td>{i + 1}</Td>
                          <Td align="left">
                            {it.code && <span className="mono" style={{ color: muted }}>{it.code} · </span>}
                            {it.label}
                          </Td>
                          <Td align="right">{it.quantity}&nbsp;{UNIT_LABELS[it.unit]}</Td>
                          <Td align="right">{da(it.unitPrice)}</Td>
                          {showRemise && <Td align="right">{it.remise ? `${it.remise}%` : '—'}</Td>}
                          <Td align="right">{da(it.totalHT)}</Td>
                          <Td align="right">{it.tvaRate}%</Td>
                        </tr>
                      ))}
                      {doc.items.length === 0 && (
                        <tr><Td>—</Td><Td align="left">Aucun article</Td><Td align="right" /><Td align="right" /><Td align="right" /><Td align="right" /></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ── Totals ── */}
                <div className="flex justify-end mt-4">
                  <div className="w-[230px] text-[11px]">
                    <Row label="Total HT" value={`${da(totals.subTotalHT)} DA`} ink={ink} />
                    <Row label="TVA" value={`${da(totals.totalTVA)} DA`} ink={ink} />
                    <Row label="Timbre" value={`${da(totals.timbreAmount)} DA`} ink={totals.timbreFiscal ? '#C77D11' : muted} />
                    {!!doc.acompte && <Row label="Acompte" value={`- ${da(doc.acompte)} DA`} ink={muted} />}
                    <div className="flex justify-between items-center mt-1 px-3 py-2 rounded-md"
                      style={{ background: accent, color: '#fff' }}>
                      <span className="font-semibold">Net à payer</span>
                      <span className="font-bold text-[13px]">{da(totals.netAPayer)} DA</span>
                    </div>
                  </div>
                </div>

                {/* ── Amount in words ── */}
                <p className="text-[10.5px] italic mt-3" style={{ color: ink }}>
                  Arrêté{doc.type === 'DEVIS' ? ' le présent devis' : 'e la présente facture'} à la somme de :{' '}
                  {numberToFrenchWords(totals.netAPayer)}.
                </p>

                {doc.notes && (
                  <p className="text-[10px] mt-2" style={{ color: muted }}>{doc.notes}</p>
                )}

                {/* ── Signature ── */}
                <div className="flex justify-end mt-6">
                  <div className="text-center">
                    <p className="text-[10px] mb-8" style={{ color: muted }}>Cachet et signature</p>
                    {company?.signature ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={company.signature} alt="" className="h-12 mx-auto object-contain" />
                    ) : (
                      <div style={{ width: 120, borderTop: `1px solid ${hair}` }} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            </div>
          </div>

          {/* Footer actions */}
          <div
            className="shrink-0 flex items-center gap-2 px-4 py-3"
            style={{ background: '#181c2a', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button type="button" onClick={onDownload} disabled={busy}
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-60"
              style={{ background: accent }}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={18} />}
              Télécharger le PDF
            </button>
            <button type="button" onClick={onShare} disabled={busy}
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white active:scale-[0.98] transition-transform disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <Share2 size={18} /> Partager
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PAYMENT_LABEL: Record<string, string> = {
  especes: 'Espèces', cheque: 'Chèque', virement: 'Virement', cb: 'Carte bancaire',
};

function Th({ children, align = 'center' }: { children?: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th style={{ textAlign: align, padding: '5px 4px', fontWeight: 600, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.2, whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}

function Td({ children, align = 'center' }: { children?: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return <td style={{ textAlign: align, padding: '5px 4px', verticalAlign: 'top' }}>{children}</td>;
}

function Row({ label, value, ink }: { label: string; value: string; ink: string }) {
  return (
    <div className="flex justify-between py-0.5" style={{ color: ink }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
