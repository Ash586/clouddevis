// ============================================================
// CloudDevis PDF Engine — Main Entry Point
// Generate PDF buffers from document data
// ============================================================

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { TemplateAR } from './template-ar';
import { DevisFRTemplate } from './templates/devis-fr';
import type { PDFDocumentData, PDFOptions } from './types';

export type { PDFDocumentData, PDFCompany, PDFClient, PDFLineItem, PDFDocumentType, PDFOptions } from './types';

/**
 * Generate a PDF buffer from document data.
 * Automatically selects French or Arabic template based on data.language.
 *
 * @param docData - Document data for PDF generation
 * @param options - Optional PDF formatting options
 * @returns Uint8Array containing the PDF bytes
 */
export async function generatePDF(
  docData: PDFDocumentData,
  options?: PDFOptions,
): Promise<Uint8Array> {
  // All French/Latin documents use the unified type-aware template; Arabic keeps its RTL template.
  const Template = docData.language === 'AR' ? TemplateAR : DevisFRTemplate;

  // Render the template (returns a <Document> element from @react-pdf/renderer)
  const docElement = <Template data={docData} />;

  // Generate PDF using @react-pdf/renderer
  const pdfDoc = pdf(docElement);

  // Use toBlob() which works reliably in both Node.js and browser
  const blob = await pdfDoc.toBlob();

  // Convert Blob to Uint8Array
  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Generate a PDF and return it as a base64 string.
 * Useful for Capacitor Filesystem operations.
 *
 * @param docData - Document data for PDF generation
 * @param options - Optional PDF formatting options
 * @returns Base64-encoded PDF string
 */
export async function generatePDFBase64(
  docData: PDFDocumentData,
  options?: PDFOptions,
): Promise<string> {
  const buffer = await generatePDF(docData, options);

  // Convert Uint8Array to base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generate a PDF and return it as a Blob.
 * Useful for browser-side operations.
 *
 * @param docData - Document data for PDF generation
 * @param options - Optional PDF formatting options
 * @returns Blob containing the PDF
 */
export async function generatePDFBlob(
  docData: PDFDocumentData,
  options?: PDFOptions,
): Promise<Blob> {
  // All French/Latin documents use the unified type-aware template; Arabic keeps its RTL template.
  const Template = docData.language === 'AR' ? TemplateAR : DevisFRTemplate;
  const docElement = <Template data={docData} />;
  const pdfDoc = pdf(docElement);
  return pdfDoc.toBlob();
}
