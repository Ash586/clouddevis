import type { DocumentType } from '@/types';

export interface DocTypeDesign {
  primary: string;
  primaryHex: string;
  primaryLight: string;
  primaryDark: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  accent: string;
}

const DESIGNS: Record<DocumentType, DocTypeDesign> = {
  devis: {
    primary: 'green-900',
    primaryHex: '#0B3D2E',
    primaryLight: '#F7F5F0',
    primaryDark: '#161616',
    borderColor: '#0B3D2E',
    gradientFrom: '#0B3D2E',
    gradientTo: '#C4A35A',
    accent: '#C4A35A',
  },
  facture: {
    primary: 'emerald-700',
    primaryHex: '#047857',
    primaryLight: '#d1fae5',
    primaryDark: '#065f46',
    borderColor: '#047857',
    gradientFrom: '#064e3b',
    gradientTo: '#059669',
    accent: '#10b981',
  },
  proforma: {
    primary: 'violet-700',
    primaryHex: '#6d28d9',
    primaryLight: '#ede9fe',
    primaryDark: '#5b21b6',
    borderColor: '#6d28d9',
    gradientFrom: '#5b21b6',
    gradientTo: '#7c3aed',
    accent: '#8b5cf6',
  },
  bc: {
    primary: 'amber-600',
    primaryHex: '#d97706',
    primaryLight: '#fef3c7',
    primaryDark: '#92400e',
    borderColor: '#d97706',
    gradientFrom: '#92400e',
    gradientTo: '#d97706',
    accent: '#f59e0b',
  },
  br: {
    primary: 'teal-600',
    primaryHex: '#0d9488',
    primaryLight: '#ccfbf1',
    primaryDark: '#115e59',
    borderColor: '#0d9488',
    gradientFrom: '#115e59',
    gradientTo: '#0d9488',
    accent: '#14b8a6',
  },
  intervention: {
    primary: 'rose-600',
    primaryHex: '#e11d48',
    primaryLight: '#ffe4e6',
    primaryDark: '#9f1239',
    borderColor: '#e11d48',
    gradientFrom: '#9f1239',
    gradientTo: '#e11d48',
    accent: '#f43f5e',
  },
  attachement: {
    primary: 'blue-900',
    primaryHex: '#1A3A6B',
    primaryLight: '#EEF3FB',
    primaryDark: '#1A1A1A',
    borderColor: '#1A3A6B',
    gradientFrom: '#1A3A6B',
    gradientTo: '#2E60B0',
    accent: '#C4A35A',
  },
};

export function getDesign(docType: DocumentType): DocTypeDesign {
  return DESIGNS[docType] ?? DESIGNS.devis;
}
