import { FileText, FilePen, FileStack, ClipboardList, ScrollText, Wrench, Receipt, Truck } from 'lucide-react';
import { ENABLED_DOC_TYPES } from '@/lib/config';

export interface DocSummary {
  id: string; number: string; type: string; client: string;
  total: string; date: string; status: string;
}

export interface RecentDraft {
  id: string; number: string; type: string; clientName: string; updatedAt: string;
}

export interface DashboardStats {
  totalDocs: number; monthDocs: number; totalTTC: string | number;
  totalClients: number; trialDaysRemaining: number;
  draftCount: number; statusBreakdown: Record<string, number>;
  recentDraft: RecentDraft | null; typeBreakdown: Record<string, number>;
}

export const DOC_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  devis:        { label: 'Devis',        bg: 'bg-blue-400/10',              text: 'text-blue-400',           border: 'border-blue-400/20' },
  facture:      { label: 'Facture',      bg: 'bg-[rgba(37,99,235,0.1)]',   text: 'text-[var(--green-3)]',   border: 'border-[rgba(37,99,235,0.2)]' },
  proforma:     { label: 'Proforma',     bg: 'bg-purple-400/10',            text: 'text-purple-400',         border: 'border-purple-400/20' },
  bc:           { label: 'B. Commande',  bg: 'bg-amber-400/10',             text: 'text-amber-400',          border: 'border-amber-400/20' },
  br:           { label: 'B. Réception', bg: 'bg-teal-400/10',              text: 'text-teal-400',           border: 'border-teal-400/20' },
  bl:           { label: 'B. Livraison', bg: 'bg-cyan-400/10',              text: 'text-cyan-400',           border: 'border-cyan-400/20' },
  intervention: { label: 'Intervention', bg: 'bg-rose-400/10',              text: 'text-rose-400',           border: 'border-rose-400/20' },
  attachement:  { label: 'Attachement',  bg: 'bg-orange-400/10',            text: 'text-orange-400',         border: 'border-orange-400/20' },
};

const ALL_QUICK_CREATE = [
  { type: 'devis',        labelKey: 'devis',        icon: FileText },
  { type: 'facture',      labelKey: 'facture',      icon: Receipt },
  { type: 'bl',           labelKey: 'bonLivraison', icon: Truck },
  { type: 'proforma',     labelKey: 'proforma',     icon: ClipboardList },
  { type: 'bon_commande', labelKey: 'bonCommande',  icon: FileStack },
  { type: 'bon_reception',labelKey: 'bonReception', icon: ScrollText },
  { type: 'intervention', labelKey: 'intervention', icon: Wrench },
  { type: 'attachement',  labelKey: 'attachement',  icon: FilePen },
];
export const QUICK_CREATE_TYPES = ALL_QUICK_CREATE.filter(d => ENABLED_DOC_TYPES.includes(d.type as never));

export const DOC_TYPE_TO_FILTER: Record<string, string> = {
  devis: 'DEVIS', facture: 'FACTURE', proforma: 'PROFORMA',
  bc: 'BC', br: 'BR', bl: 'BL', intervention: 'INTERVENTION', attachement: 'ATTACHEMENT',
};
export const TYPE_FILTERS = ['ALL', ...ENABLED_DOC_TYPES.map(t => DOC_TYPE_TO_FILTER[t]).filter(Boolean)] as string[];

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'draft', ACCEPTED: 'accepted', PROGRESS: 'progress',
  DELIVERED: 'delivered', SENT: 'sent', PAID: 'paid',
};
