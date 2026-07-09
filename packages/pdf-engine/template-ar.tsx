// ============================================================
// CloudDevis PDF Engine — Arabic RTL Template
// A4 PDF layout for Arabic-language documents
// Uses @react-pdf/renderer with RTL support
// ============================================================

import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import type { PDFDocumentData } from './types';

// ── Brand Colors ──────────────────────────────────────────────

const COLORS = {
  primary: '#0B3D2E',
  primaryLight: '#1A5C47',
  white: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  bgLight: '#F9FAFB',
  stampRed: '#DC2626',
  timbreAmber: '#D97706',
};

// ── Arabic Number Conversion ──────────────────────────────────

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

function toArabicDigits(n: number): string {
  return n
    .toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/\d/g, (d) => ARABIC_DIGITS[parseInt(d)])
    .replace(/,/g, '٬');
}

function formatDA_Ar(n: number): string {
  return toArabicDigits(n) + ' د.ج';
}

// ── Date Formatter ────────────────────────────────────────────

function formatDateAr(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${toArabicDigits(year)}/${toArabicDigits(parseInt(month))}/${toArabicDigits(parseInt(day))}`;
}

// ── Document Type Labels (Arabic) ─────────────────────────────

const TYPE_LABELS_AR: Record<string, string> = {
  DEVIS: 'تقدير',
  FACTURE: 'فاتورة',
  PROFORMA: 'فاتورة أولية',
  BC: 'أمر شراء',
  BR: 'استلام',
};

// ── Styles (RTL) ──────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    lineHeight: 1.6,
  },

  // ── Header ──
  header: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end', // RTL: company info on right
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: 'right',
  },
  companyAddress: {
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 2,
    textAlign: 'right',
  },
  companyTaxIds: {
    fontSize: 7,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
  logo: {
    width: 70,
    height: 70,
    objectFit: 'contain',
  },

  // ── Document Title ──
  titleSection: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  docTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textAlign: 'right',
  },
  docMeta: {
    alignItems: 'flex-start', // RTL: meta on left
  },
  docNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    textAlign: 'left',
  },
  docDate: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
    textAlign: 'left',
  },

  // ── Client Block ──
  clientSection: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
  },
  clientLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    marginBottom: 4,
    textAlign: 'right',
  },
  clientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'right',
  },
  clientDetail: {
    fontSize: 8,
    color: COLORS.textLight,
    textAlign: 'right',
  },

  // ── Items Table (RTL) ──
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row-reverse', // RTL
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: 'row-reverse', // RTL
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: COLORS.bgLight,
  },
  // RTL columns: reversed order
  colLabel: { width: '38%', fontSize: 8, textAlign: 'right' },
  colTotal: { width: '18%', fontSize: 8, textAlign: 'left', fontFamily: 'Helvetica-Bold' },
  colTva: { width: '8%', fontSize: 8, textAlign: 'center' },
  colPrice: { width: '16%', fontSize: 8, textAlign: 'left' },
  colUnit: { width: '10%', fontSize: 8, textAlign: 'center' },
  colQty: { width: '10%', fontSize: 8, textAlign: 'center' },

  // ── Totals ──
  totalsSection: {
    flexDirection: 'row', // RTL: totals on left
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  totalsBox: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  totalsRowTimbre: {
    backgroundColor: '#FEF3C7',
    borderRadius: 2,
  },
  totalsLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  totalsValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'left',
  },
  totalsRowTotal: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  totalsRowTotalLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'right',
  },
  totalsRowTotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'left',
  },

  // ── Timbre Stamp ──
  stampContainer: {
    position: 'absolute',
    bottom: 120,
    left: 50, // RTL: stamp on left
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: COLORS.stampRed,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    transform: 'rotate(-12deg)',
    opacity: 0.7,
  },
  stampText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.stampRed,
    textAlign: 'center',
  },
  stampAmount: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.stampRed,
  },

  // ── Total in Words ──
  wordsSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
  },
  wordsLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    marginBottom: 3,
    textAlign: 'right',
  },
  wordsText: {
    fontSize: 8,
    color: COLORS.text,
    textAlign: 'right',
  },

  // ── Notes ──
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    marginBottom: 3,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 8,
    color: COLORS.text,
    textAlign: 'right',
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 6,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 1.6,
  },
});

// ── Component ─────────────────────────────────────────────────

interface TemplateARProps {
  data: PDFDocumentData;
}

export function TemplateAR({ data }: TemplateARProps) {
  const isArtisan = data.mode === 'artisan';
  const rc = isArtisan ? '' : (data.company.rc || data.rcNumber || '');
  const nis = data.company.nis || data.nisNumber || '';
  const ai = data.company.ai || data.aiNumber || '';
  const capital = isArtisan ? '' : (data.company.capital || data.companyCapital || '');
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header (RTL) ── */}
        <View style={styles.header}>
          {data.company.logo && (
            <Image src={data.company.logo} style={styles.logo} />
          )}
          <View style={styles.headerRight}>
            <Text style={styles.companyName}>{data.company.name}</Text>
            <Text style={styles.companyAddress}>{data.company.address}</Text>
            {capital && (
              <Text style={styles.companyAddress}>الرأس المال: {capital}</Text>
            )}
            <Text style={styles.companyTaxIds}>
              {isArtisan && data.company.carteArtisan
                ? `م.ت.و: ${data.company.nif} | بطاقة حرفي: ${data.company.carteArtisan} | م.إ.ح: ${nis}`
                : `م.ت.و: ${data.company.nif} | س.ت: ${rc} | م.إ.ح: ${nis}${ai ? ` | م.ب.إ: ${ai}` : ''}`
              }
            </Text>
          </View>
        </View>

        {/* ── Document Title (RTL) ── */}
        <View style={styles.titleSection}>
          <View style={styles.docMeta}>
            <Text style={styles.docNumber}>{data.number}</Text>
            <Text style={styles.docDate}>التاريخ: {formatDateAr(data.date)}</Text>
            {data.dueDate && (
              <Text style={styles.docDate}>الاستحقاق: {formatDateAr(data.dueDate)}</Text>
            )}
          </View>
          <Text style={styles.docTitle}>{TYPE_LABELS_AR[data.type] || data.type}</Text>
        </View>

        {/* ── Client Block (RTL) ── */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>العميل</Text>
          <Text style={styles.clientName}>{data.client.name}</Text>
          {data.client.address && (
            <Text style={styles.clientDetail}>{data.client.address}</Text>
          )}
          {data.client.nif && (
            <Text style={styles.clientDetail}>م.ت.و: {data.client.nif}</Text>
          )}
          {data.client.phone && (
            <Text style={styles.clientDetail}>الهاتف: {data.client.phone}</Text>
          )}
        </View>

        {/* ── Items Table (RTL) ── */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colTotal]}></Text>
            <Text style={[styles.tableHeaderText, styles.colTva]}></Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}></Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}></Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}></Text>
            <Text style={[styles.tableHeaderText, styles.colLabel]}>الوصف</Text>
          </View>

          {data.items.map((item, index) => (
            <View
              key={index}
              style={
                index % 2 === 1
                  ? [styles.tableRow, styles.tableRowAlt]
                  : styles.tableRow
              }
            >
              <Text style={styles.colTotal}>{formatDA_Ar(item.totalHT)}</Text>
              <Text style={styles.colTva}>{toArabicDigits(item.tvaRate)}%</Text>
              <Text style={styles.colPrice}>{formatDA_Ar(item.unitPrice)}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colQty}>{toArabicDigits(item.quantity)}</Text>
              <Text style={styles.colLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Totals (RTL) ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>المجموع قبل الضريبة</Text>
              <Text style={styles.totalsValue}>{formatDA_Ar(data.totalHT)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>الضريبة</Text>
              <Text style={styles.totalsValue}>{formatDA_Ar(data.totalTVA)}</Text>
            </View>
            {data.timbreFiscal && (
              <View style={[styles.totalsRow, styles.totalsRowTimbre]}>
                <Text style={styles.totalsLabel}>الختم (المادة 220)</Text>
                <Text style={[styles.totalsValue, { color: COLORS.timbreAmber }]}>
                  {formatDA_Ar(data.timbreAmount)}
                </Text>
              </View>
            )}
            <View style={[styles.totalsRow, styles.totalsRowTotal]}>
              <Text style={styles.totalsRowTotalLabel}>المجموع شامل الضريبة</Text>
              <Text style={styles.totalsRowTotalValue}>{formatDA_Ar(data.totalTTC)}</Text>
            </View>
          </View>
        </View>

        {/* ── Timbre Stamp ── */}
        {data.timbreFiscal && (
          <View style={styles.stampContainer}>
            <Text style={styles.stampText}>ختم</Text>
            <Text style={styles.stampAmount}>١٬٠٠٠</Text>
            <Text style={styles.stampText}>د.ج</Text>
          </View>
        )}

        {/* ── Total in Words ── */}
        <View style={styles.wordsSection}>
          <Text style={styles.wordsLabel}>المبلغ بالحروف</Text>
          <Text style={styles.wordsText}>{data.totalInWords}</Text>
        </View>

        {/* ── Notes ── */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>ملاحظات</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            CloudDevis — أنشئ تقديراتك وفوترك في بضع نقرات{'\n'}
            www.clouddevis.vercel.app{'\n'}
            إشارات قانونية: يتم إعداد هذا المستند وفقاً للوائح الجزائرية السارية.
            {'\n'}الختم متوافق مع المادة 220 من قانون الضرائب غير المباشرة.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
