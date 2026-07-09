import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image, Font } from '@react-pdf/renderer';
import type { PDFDocumentData } from '../types';

// Keep words whole — no mid-word hyphenation (e.g. "gas-troscope").
Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  primary: '#2563EB',      // brand blue
  primaryDark: '#1E40AF',
  white: '#FFFFFF',
  text: '#0F2747',
  textLight: '#5A6B85',
  border: '#E5E9F0',
  bgLight: '#F3F6FC',
  timbreAmber: '#C77D11',
  gold: '#B4924C',
};

const NBSP = ' ';

/** Locale-independent money format: "43 500,00" (space group, comma decimals). */
function formatNum(n: number): string {
  const neg = n < 0;
  const [int, dec] = Math.abs(n).toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return (neg ? '-' : '') + grouped + ',' + dec;
}
function formatDA(n: number): string {
  return formatNum(n) + NBSP + 'DA';
}
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function joinDot(parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join('     ');
}

const TYPE_LABELS: Record<string, string> = {
  DEVIS: 'Devis', FACTURE: 'Facture', PROFORMA: 'Facture Proforma',
  BC: 'Bon de Commande', BR: 'Bon de Réception', BL: 'Bon de Livraison',
};

/** "Arrêté(e) … à la somme de" framing per document type. */
function wordsPrefix(type: string): string {
  if (type === 'FACTURE') return 'Arrêtée la présente facture à la somme de';
  if (type === 'DEVIS') return 'Arrêté le présent devis à la somme de';
  return `Arrêté le présent ${(TYPE_LABELS[type] || 'document').toLowerCase()} à la somme de`;
}

const styles = StyleSheet.create({
  page: { paddingTop: 32, paddingHorizontal: 36, paddingBottom: 40, fontSize: 9, fontFamily: 'Helvetica', color: COLORS.text, lineHeight: 1.4 },
  stripe: { height: 3, backgroundColor: COLORS.primary, marginHorizontal: -36, marginTop: -32, marginBottom: 14 },

  watermarkContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: -1 },
  watermarkText: { fontSize: 90, fontFamily: 'Helvetica-Bold', color: COLORS.border, opacity: 0.18, transform: 'rotate(-45deg)', textTransform: 'uppercase' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  companyName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: COLORS.text },
  companyActivity: { fontSize: 8, color: COLORS.textLight, fontStyle: 'italic', marginTop: 1 },
  companyLine: { fontSize: 8, color: COLORS.text, marginTop: 2 },
  companyMuted: { fontSize: 7.5, color: COLORS.textLight, marginTop: 1 },
  logo: { width: 64, height: 64, objectFit: 'contain' },

  fiscalBand: { marginTop: 8, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: COLORS.border },
  fiscalText: { fontSize: 7.5, color: COLORS.textLight },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  docKicker: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  docNumber: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: COLORS.text },
  docMeta: { fontSize: 8, color: COLORS.textLight, textAlign: 'right' },

  clientSection: { backgroundColor: COLORS.bgLight, borderRadius: 4, padding: 10, marginTop: 12, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  clientLabel: { fontSize: 7, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  clientName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.text },
  clientDetail: { fontSize: 8, color: COLORS.textLight, marginTop: 1 },

  objetBlock: { marginTop: 10 },
  objetText: { fontSize: 9, color: COLORS.text },
  objetLabel: { fontFamily: 'Helvetica-Bold' },

  table: { marginTop: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 6, paddingHorizontal: 6, borderRadius: 3 },
  th: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: COLORS.white, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  tableRowAlt: { backgroundColor: COLORS.bgLight },
  cNum: { width: '5%', fontSize: 8, textAlign: 'center', color: COLORS.textLight },
  cLabel: { width: '29%', fontSize: 8 },
  cQty: { width: '7%', fontSize: 8, textAlign: 'center' },
  cUnit: { width: '8%', fontSize: 8, textAlign: 'center' },
  cPrice: { width: '15%', fontSize: 8, textAlign: 'right' },
  cRem: { width: '8%', fontSize: 8, textAlign: 'right' },
  cTotal: { width: '18%', fontSize: 8, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  cTva: { width: '10%', fontSize: 8, textAlign: 'right' },
  codePrefix: { fontFamily: 'Helvetica-Bold', color: COLORS.textLight },

  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  bankBox: { width: '52%' },
  bankTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  bankLine: { fontSize: 8, color: COLORS.text },

  totalsBox: { width: '44%' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, paddingHorizontal: 8 },
  totalsRowTimbre: { backgroundColor: '#FBF1DE', borderRadius: 2 },
  totalsLabel: { fontSize: 8, color: COLORS.textLight },
  totalsValue: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  totalsNet: { backgroundColor: COLORS.primary, borderRadius: 4, marginTop: 2 },
  totalsNetLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: COLORS.white },
  totalsNetValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: COLORS.white },

  words: { marginTop: 12, fontSize: 8.5, fontStyle: 'italic', color: COLORS.text },

  notes: { marginTop: 10 },
  notesLabel: { fontSize: 7, color: COLORS.textLight, textTransform: 'uppercase', marginBottom: 2 },
  notesText: { fontSize: 8, color: COLORS.text },

  deliveryBox: { marginTop: 12, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: COLORS.border },
  deliveryLine: { fontSize: 9, color: COLORS.text, marginBottom: 3 },
  signature: { marginTop: 22, flexDirection: 'row', justifyContent: 'flex-end' },
  signatureBox: { width: 150, alignItems: 'center' },
  signatureLabel: { fontSize: 8, color: COLORS.textLight, marginBottom: 28 },
  signatureImg: { height: 44, objectFit: 'contain' },
  signatureLine: { width: 130, borderTopWidth: 0.5, borderTopColor: COLORS.border },
});

interface DevisFRTemplateProps {
  data: PDFDocumentData;
}

export function DevisFRTemplate({ data }: DevisFRTemplateProps) {
  const c = data.company;
  const cl = data.client;
  const isArtisan = data.mode === 'artisan';
  const rc = isArtisan ? '' : (c.rc || data.rcNumber);
  const nis = c.nis || data.nisNumber;
  const ai = c.ai || data.aiNumber;
  const activity = c.activity || data.companyTagline;
  const capital = isArtisan ? '' : (c.capital || data.companyCapital);
  const rib = c.rib || data.rib;
  const ccp = c.ccp || data.ccpNumber;
  const bank = c.bankName || data.bankName;

  const fiscal = joinDot([
    rc && `RC : ${rc}`,
    c.nif && `NIF : ${c.nif}`,
    nis && `NIS : ${nis}`,
    ai && `AI : ${ai}`,
    isArtisan && c.carteArtisan && `Carte Artisan : ${c.carteArtisan}`,
  ]);
  const contact = joinDot([
    c.phone && `Tél : ${c.phone}`,
    c.fax && `Fax : ${c.fax}`,
    c.email,
  ]);
  const net = data.netAPayer ?? (data.totalTTC + (data.timbreFiscal ? data.timbreAmount : 0) - (data.acompte || 0));
  const typeLabel = TYPE_LABELS[data.type] || 'Document';
  // A Bon de Livraison proves delivery, not payment: no TVA column, no timbre,
  // no TTC / Net à payer, no "arrêté à la somme de", and a dual signature footer.
  const isBL = data.type === 'BL';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.stripe} />

        {data.showWatermark && (
          <View style={styles.watermarkContainer}>
            <Text style={styles.watermarkText}>{typeLabel}</Text>
          </View>
        )}

        {/* Letterhead */}
        <View style={styles.header}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.companyName}>{c.name || ' '}</Text>
            {activity ? <Text style={styles.companyActivity}>{activity}</Text> : null}
            {c.address ? <Text style={styles.companyLine}>{c.address}</Text> : null}
            {capital ? <Text style={styles.companyMuted}>Au capital de {capital}</Text> : null}
            {contact ? <Text style={styles.companyMuted}>{contact}</Text> : null}
          </View>
          {c.logo ? <Image src={c.logo} style={styles.logo} /> : null}
        </View>

        {(fiscal || rib || ccp || bank) ? (
          <View style={styles.fiscalBand}>
            {fiscal ? <Text style={styles.fiscalText}>{fiscal}</Text> : null}
            {(bank || rib || ccp) ? (
              <Text style={[styles.fiscalText, { marginTop: 1 }]}>
                {joinDot([bank && `Banque : ${bank}`, rib && `RIB : ${rib}`, ccp && `CCP : ${ccp}`])}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Title */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.docKicker}>{typeLabel}</Text>
            <Text style={styles.docNumber}>{data.number}</Text>
          </View>
          <View>
            <Text style={styles.docMeta}>Date : {formatDate(data.date)}</Text>
            {data.paymentMode ? <Text style={styles.docMeta}>Mode de paiement : {data.paymentMode}</Text> : null}
            {data.validUntil ? <Text style={styles.docMeta}>{`Valide jusqu${'’'}au : ${formatDate(data.validUntil)}`}</Text> : null}
          </View>
        </View>

        {/* Client */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>Doit</Text>
          <Text style={styles.clientName}>{cl.name}</Text>
          {cl.address ? <Text style={styles.clientDetail}>{cl.address}</Text> : null}
          <Text style={styles.clientDetail}>
            {joinDot([cl.nif && `NIF : ${cl.nif}`, cl.ai && `AI : ${cl.ai}`, cl.rc && `RC : ${cl.rc}`, cl.nis && `NIS : ${cl.nis}`])}
          </Text>
        </View>

        {/* Objet / Reference */}
        {(data.reference || data.objet) ? (
          <View style={styles.objetBlock}>
            {data.reference ? <Text style={styles.objetText}><Text style={styles.objetLabel}>Référence : </Text>{data.reference}</Text> : null}
            {data.objet ? <Text style={[styles.objetText, { marginTop: 1 }]}><Text style={styles.objetLabel}>Objet : </Text>{data.objet}</Text> : null}
          </View>
        ) : null}

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.cNum]}>N°</Text>
            <Text style={[styles.th, styles.cLabel]}>Désignation</Text>
            <Text style={[styles.th, styles.cQty]}>Qté</Text>
            <Text style={[styles.th, styles.cUnit]}>Unité</Text>
            <Text style={[styles.th, styles.cPrice]}>P.U HT</Text>
            <Text style={[styles.th, styles.cRem]}>Rem.</Text>
            <Text style={[styles.th, styles.cTotal]}>Montant HT</Text>
            {!isBL ? <Text style={[styles.th, styles.cTva]}>TVA</Text> : null}
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <Text style={styles.cNum}>{index + 1}</Text>
              <Text style={styles.cLabel}>
                {item.code ? <Text style={styles.codePrefix}>{item.code} · </Text> : null}
                {item.label}
              </Text>
              <Text style={styles.cQty}>{item.quantity}</Text>
              <Text style={styles.cUnit}>{item.unit}</Text>
              <Text style={styles.cPrice}>{formatNum(item.unitPrice)}</Text>
              <Text style={styles.cRem}>{item.remise ? `${item.remise}%` : '—'}</Text>
              <Text style={styles.cTotal}>{formatNum(item.totalHT)}</Text>
              {!isBL ? <Text style={styles.cTva}>{item.tvaRate}%</Text> : null}
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.bottomRow}>
          <View style={styles.totalsBox}>
            {isBL ? (
              <View style={[styles.totalsRow, styles.totalsNet]}>
                <Text style={styles.totalsNetLabel}>Total HT</Text>
                <Text style={styles.totalsNetValue}>{formatDA(data.totalHT)}</Text>
              </View>
            ) : (
              <>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Total HT</Text>
                  <Text style={styles.totalsValue}>{formatDA(data.totalHT)}</Text>
                </View>
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>TVA</Text>
                  <Text style={styles.totalsValue}>{formatDA(data.totalTVA)}</Text>
                </View>
                {data.timbreFiscal ? (
                  <View style={[styles.totalsRow, styles.totalsRowTimbre]}>
                    <Text style={styles.totalsLabel}>Timbre fiscal</Text>
                    <Text style={[styles.totalsValue, { color: COLORS.timbreAmber }]}>{formatDA(data.timbreAmount)}</Text>
                  </View>
                ) : null}
                {data.acompte ? (
                  <View style={styles.totalsRow}>
                    <Text style={styles.totalsLabel}>Acompte</Text>
                    <Text style={styles.totalsValue}>- {formatDA(data.acompte)}</Text>
                  </View>
                ) : null}
                <View style={[styles.totalsRow, styles.totalsNet]}>
                  <Text style={styles.totalsNetLabel}>Net à payer</Text>
                  <Text style={styles.totalsNetValue}>{formatDA(net)}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Amount in words (payment documents only) */}
        {!isBL ? (
          <Text style={styles.words}>
            {`${wordsPrefix(data.type)} : ${data.totalInWords}.`}
          </Text>
        ) : null}

        {/* BL delivery block: deliverer / transporter identity + delivery location */}
        {isBL && (data.delivererName || data.transporterName || data.deliveryAddress) ? (
          <View style={styles.deliveryBox}>
            {data.deliveryAddress ? (
              <Text style={styles.deliveryLine}>Lieu de livraison : {data.deliveryAddress}</Text>
            ) : null}
            {data.delivererName ? (
              <Text style={styles.deliveryLine}>
                Livreur : {data.delivererName}{data.delivererIdCard ? `  (CIN : ${data.delivererIdCard})` : ''}
              </Text>
            ) : null}
            {data.transporterName ? (
              <Text style={styles.deliveryLine}>
                Transporteur : {data.transporterName}{data.transporterIdCard ? `  (CIN : ${data.transporterIdCard})` : ''}
              </Text>
            ) : null}
          </View>
        ) : null}

        {/* Notes */}
        {data.notes ? (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        ) : null}

        {/* Signature — BL needs both parties (livreur + réception client) */}
        {isBL ? (
          <View style={[styles.signature, { justifyContent: 'space-between' }]}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature du livreur</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature et cachet du client (réception)</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        ) : (
          <View style={styles.signature}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Cachet et signature</Text>
              {c.signature ? <Image src={c.signature} style={styles.signatureImg} /> : <View style={styles.signatureLine} />}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
