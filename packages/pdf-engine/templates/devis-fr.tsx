import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import type { PDFDocumentData } from '../types';

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
  gold: '#D4A843',
};

function formatDA(n: number): string {
  return n.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DA';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.text,
    lineHeight: 1.4,
    position: 'relative',
  },

  // Watermark
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  watermarkText: {
    fontSize: 80,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.border,
    opacity: 0.15,
    transform: 'rotate(-45deg)',
    textTransform: 'uppercase',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  companyTagline: {
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 2,
    fontStyle: 'italic',
  },
  companyAddress: {
    fontSize: 8,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  companyCapital: {
    fontSize: 7,
    color: COLORS.textLight,
    marginTop: 2,
  },
  companyTaxIds: {
    fontSize: 7,
    color: COLORS.textLight,
    marginTop: 4,
  },
  logo: {
    width: 70,
    height: 70,
    objectFit: 'contain',
  },

  // Document Title
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  docTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  docMeta: {
    alignItems: 'flex-end',
  },
  docNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
  },
  docDate: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
  },

  // Client Block
  clientSection: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  clientLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 8,
    color: COLORS.textLight,
  },

  // Items Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: COLORS.bgLight,
  },
  colNum: { width: '6%', fontSize: 8, textAlign: 'center', color: COLORS.textLight },
  colLabel: { width: '36%', fontSize: 8 },
  colQty: { width: '9%', fontSize: 8, textAlign: 'center' },
  colUnit: { width: '9%', fontSize: 8, textAlign: 'center' },
  colPrice: { width: '16%', fontSize: 8, textAlign: 'right' },
  colTotal: { width: '24%', fontSize: 8, textAlign: 'right', fontFamily: 'Helvetica-Bold' },

  // RIB Block
  ribBlock: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  ribTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  ribRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  ribLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    width: 80,
  },
  ribValue: {
    fontSize: 8,
    color: COLORS.text,
    fontFamily: 'Helvetica-Bold',
  },

  // Validity Banner
  validityBanner: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.timbreAmber,
  },
  validityText: {
    fontSize: 9,
    color: COLORS.text,
    fontFamily: 'Helvetica-Bold',
  },

  // Totals
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row',
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
  },
  totalsValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  totalsRowTotal: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  totalsRowTotalLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },
  totalsRowTotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
  },

  // Total in Words
  wordsSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: COLORS.bgLight,
    borderRadius: 4,
  },
  wordsLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  wordsText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: COLORS.text,
  },

  // Notes
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  notesText: {
    fontSize: 8,
    color: COLORS.text,
  },

  // Footer
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

interface DevisFRTemplateProps {
  data: PDFDocumentData;
}

export function DevisFRTemplate({ data }: DevisFRTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {data.showWatermark && (
          <View style={styles.watermarkContainer}>
            <Text style={styles.watermarkText}>DEVIS</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{data.company.name}</Text>
            {data.companyTagline && <Text style={styles.companyTagline}>{data.companyTagline}</Text>}
            <Text style={styles.companyAddress}>{data.company.address}</Text>
            {data.companyCapital && <Text style={styles.companyCapital}>Au Capital Social de {data.companyCapital}</Text>}
            <Text style={styles.companyTaxIds}>
              NIF: {data.company.nif}
              {data.rcNumber ? ` | R.C.: ${data.rcNumber}` : ''}
              {data.nisNumber ? ` | NIS: ${data.nisNumber}` : ''}
            </Text>
            {data.aiNumber && <Text style={styles.companyTaxIds}>N°AI: {data.aiNumber}</Text>}
          </View>
          {data.company.logo && <Image src={data.company.logo} style={styles.logo} />}
        </View>

        {/* Document Title */}
        <View style={styles.titleSection}>
          <Text style={styles.docTitle}>DEVIS</Text>
          <View style={styles.docMeta}>
            <Text style={styles.docNumber}>{data.number}</Text>
            {data.reference && <Text style={styles.docDate}>Réf: {data.reference}</Text>}
            <Text style={styles.docDate}>Date: {formatDate(data.date)}</Text>
            {data.validUntil && <Text style={styles.docDate}>{`Valide jusqu\u2019au: ${formatDate(data.validUntil)}`}</Text>}
          </View>
        </View>

        {/* Client Block */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>Adressé à</Text>
          <Text style={styles.clientName}>{data.client.name}</Text>
          {data.client.address && <Text style={styles.clientDetail}>{data.client.address}</Text>}
          {data.client.nif && <Text style={styles.clientDetail}>NIF: {data.client.nif}</Text>}
          {data.client.rc && <Text style={styles.clientDetail}>RC: {data.client.rc}</Text>}
          {data.client.nis && <Text style={styles.clientDetail}>NIS: {data.client.nis}</Text>}
          {data.client.phone && <Text style={styles.clientDetail}>Tél: {data.client.phone}</Text>}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colNum]}>N°</Text>
            <Text style={[styles.tableHeaderText, styles.colLabel]}>Désignation</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qté</Text>
            <Text style={[styles.tableHeaderText, styles.colUnit]}>Unité</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Prix Unit. HT</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Montant HT</Text>
          </View>
          {data.items.map((item, index) => (
            <View
              key={index}
              style={index % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}
            >
              <Text style={styles.colNum}>{index + 1}</Text>
              <Text style={styles.colLabel}>{item.label}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{item.unit}</Text>
              <Text style={styles.colPrice}>{formatDA(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatDA(item.totalHT)}</Text>
            </View>
          ))}
        </View>

        {/* RIB Block */}
        {data.rib && (
          <View style={styles.ribBlock}>
            <Text style={styles.ribTitle}>RIB</Text>
            <View style={styles.ribRow}>
              <Text style={styles.ribLabel}>RIB:</Text>
              <Text style={styles.ribValue}>{data.rib}</Text>
            </View>
            {data.bankName && (
              <View style={styles.ribRow}>
                <Text style={styles.ribLabel}>Banque:</Text>
                <Text style={styles.ribValue}>{data.bankName}</Text>
              </View>
            )}
            {data.bankAgency && (
              <View style={styles.ribRow}>
                <Text style={styles.ribLabel}>Agence:</Text>
                <Text style={styles.ribValue}>{data.bankAgency}</Text>
              </View>
            )}
            {data.ccpNumber && (
              <View style={styles.ribRow}>
                <Text style={styles.ribLabel}>CCP:</Text>
                <Text style={styles.ribValue}>{data.ccpNumber}</Text>
              </View>
            )}
          </View>
        )}

        {/* Validity Banner */}
        {data.validityDays && (
          <View style={styles.validityBanner}>
            <Text style={styles.validityText}>
              {`Ce devis est valable ${data.validityDays} jours à compter de la date d'émission.`}
            </Text>
          </View>
        )}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Sous-total HT</Text>
              <Text style={styles.totalsValue}>{formatDA(data.totalHT)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>TVA</Text>
              <Text style={styles.totalsValue}>{formatDA(data.totalTVA)}</Text>
            </View>
            {data.timbreFiscal && (
              <View style={[styles.totalsRow, styles.totalsRowTimbre]}>
                <Text style={styles.totalsLabel}>Timbre fiscal (Art. 220)</Text>
                <Text style={[styles.totalsValue, { color: COLORS.timbreAmber }]}>
                  {formatDA(data.timbreAmount)}
                </Text>
              </View>
            )}
            <View style={[styles.totalsRow, styles.totalsRowTotal]}>
              <Text style={styles.totalsRowTotalLabel}>Total TTC</Text>
              <Text style={styles.totalsRowTotalValue}>{formatDA(data.totalTTC)}</Text>
            </View>
          </View>
        </View>

        {/* Total in Words */}
        <View style={styles.wordsSection}>
          <Text style={styles.wordsLabel}>Montant en lettres</Text>
          <Text style={styles.wordsText}>{data.totalInWords}</Text>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            CloudDevis — Générez vos devis et factures en quelques clics{'\n'}
            www.clouddevis.vercel.app{'\n'}
            Mentions légales : Ce document est établi conformément à la réglementation algérienne en vigueur.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
