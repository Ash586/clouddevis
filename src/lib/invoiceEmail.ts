import { BRAND_NAME } from '@/lib/brand';

interface EmailItem {
  designation?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
}

export interface InvoiceEmailInput {
  docType: string;            // DB enum: FACTURE, DEVIS, …
  number: string | null;
  date: Date;
  dueDate?: Date | null;
  items: EmailItem[];
  subTotalHT: number;
  tvaAmount: number;
  timbreFiscal: number;
  totalTTC: number;
  netAPayer: number;
  amountPaid: number;
  senderName: string;         // company or artisan name
  clientName: string;
  message?: string;           // optional free-text note from the sender
}

const DOC_LABELS: Record<string, string> = {
  FACTURE: 'Facture', DEVIS: 'Devis', PROFORMA: 'Facture Proforma',
  BC: 'Bon de Commande', BR: 'Bon de Réception', BL: 'Bon de Livraison',
  INTERVENTION: "Rapport d'Intervention", ATTACHEMENT: "Décompte d'Attachement",
};

const e = (s: unknown) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const money = (n: number) => `${n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DA`;
const dateFr = (d: Date) => d.toLocaleDateString('fr-DZ');

/**
 * Build an email-safe (inline-styled, table-based) HTML representation of a
 * document, plus its subject line. Designed to render cleanly across email
 * clients — no external CSS, no flexbox.
 */
export function buildInvoiceEmail(input: InvoiceEmailInput): { subject: string; html: string } {
  const label = DOC_LABELS[input.docType] ?? input.docType;
  const title = `${label}${input.number ? ` N° ${input.number}` : ''}`;
  const subject = `${title} — ${input.senderName}`;
  const remaining = Math.max(0, input.netAPayer - input.amountPaid);

  const rows = input.items.map((it) => {
    const qty = Number(it.quantity) || 0;
    const pu = Number(it.unitPrice) || 0;
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;color:#111">${e(it.designation)}${it.description ? `<div style="font-size:11px;color:#888">${e(it.description)}</div>` : ''}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;color:#555;text-align:center">${qty}${it.unit ? ` ${e(it.unit)}` : ''}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;color:#555;text-align:right">${money(pu)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #eee;font-size:13px;color:#111;text-align:right;font-weight:600">${money(qty * pu)}</td>
    </tr>`;
  }).join('');

  const totalRow = (l: string, v: string, strong = false) =>
    `<tr><td style="padding:3px 0;font-size:13px;color:#555;text-align:right">${e(l)}</td><td style="padding:3px 0 3px 24px;font-size:13px;color:#111;text-align:right;${strong ? 'font-weight:800' : ''}">${v}</td></tr>`;

  const html = `<div style="background:#f4f5f7;padding:24px 0;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="padding:20px 24px;border-bottom:1px solid #eee">
      <div style="font-size:18px;font-weight:800;color:#111;text-transform:uppercase">${e(input.senderName)}</div>
      <div style="font-size:14px;color:#16a34a;font-weight:700;margin-top:2px">${e(title)}</div>
    </div>
    <div style="padding:20px 24px">
      <p style="font-size:14px;color:#333;margin:0 0 12px">Bonjour ${e(input.clientName || '')},</p>
      <p style="font-size:14px;color:#333;margin:0 0 16px">Veuillez trouver ci-dessous votre ${e(label.toLowerCase())} du ${dateFr(input.date)}.</p>
      ${input.message ? `<div style="background:#f8fafc;border-left:3px solid #16a34a;padding:10px 14px;font-size:13px;color:#444;margin:0 0 16px;white-space:pre-line">${e(input.message)}</div>` : ''}
      <table style="width:100%;border-collapse:collapse;margin:8px 0 16px">
        <thead><tr>
          <th style="padding:8px 10px;border-bottom:2px solid #ddd;font-size:11px;color:#888;text-align:left;text-transform:uppercase">Désignation</th>
          <th style="padding:8px 10px;border-bottom:2px solid #ddd;font-size:11px;color:#888;text-align:center;text-transform:uppercase">Qté</th>
          <th style="padding:8px 10px;border-bottom:2px solid #ddd;font-size:11px;color:#888;text-align:right;text-transform:uppercase">P.U.</th>
          <th style="padding:8px 10px;border-bottom:2px solid #ddd;font-size:11px;color:#888;text-align:right;text-transform:uppercase">Total</th>
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="4" style="padding:12px;text-align:center;color:#999;font-size:13px">—</td></tr>`}</tbody>
      </table>
      <table style="width:100%;border-collapse:collapse">
        <tr><td></td><td style="width:50%">
          <table style="width:100%;border-collapse:collapse">
            ${totalRow('Total HT', money(input.subTotalHT))}
            ${input.tvaAmount > 0 ? totalRow('TVA', money(input.tvaAmount)) : ''}
            ${input.timbreFiscal > 0 ? totalRow('Timbre fiscal', money(input.timbreFiscal)) : ''}
            ${input.amountPaid > 0 ? totalRow('Déjà payé', money(input.amountPaid)) : ''}
            ${totalRow(input.docType === 'FACTURE' ? 'Net à payer' : 'Total TTC', money(input.docType === 'FACTURE' ? remaining : input.totalTTC), true)}
          </table>
        </td></tr>
      </table>
      ${input.dueDate ? `<p style="font-size:12px;color:#b45309;margin:16px 0 0">Échéance de paiement : <strong>${dateFr(input.dueDate)}</strong></p>` : ''}
    </div>
    <div style="padding:14px 24px;border-top:1px solid #eee;text-align:center;font-size:11px;color:#999">
      Document généré par ${e(BRAND_NAME)}
    </div>
  </div>
</div>`;

  return { subject, html };
}
