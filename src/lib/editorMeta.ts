import { z } from 'zod';

const DiscountSchema = z.object({
  type: z.enum(['percentage', 'fixed']).default('percentage'),
  value: z.number().min(0).default(0),
  reason: z.string().default(''),
});

const StampDutySchema = z.object({
  rate: z.number().default(1),
  minAmount: z.number().default(5),
  maxAmount: z.number().default(2500),
});

const PaymentDetailsSchema = z.object({
  terms: z.string().default(''),
  iban: z.string().default(''),
});

export const EditorMetaSchema = z.object({
  tvaRate: z.number().default(19),
  logoSize: z.enum(['sm', 'md', 'lg']).default('md'),
  clientInfo: z.record(z.unknown()).default({}),
  artisanInfo: z.record(z.unknown()).nullable().default(null),
  discount: DiscountSchema.default({}),
  stampDuty: StampDutySchema.default({}),
  paymentDetails: PaymentDetailsSchema.default({}),
  chantierAddress: z.string().default(''),
  chantierType: z.string().default(''),
  chantierSurface: z.number().default(0),
  chantierEtat: z.string().default(''),
  chantierProtection: z.string().default(''),
  materiauxMarque: z.string().default(''),
  materiauxType: z.string().default(''),
  materiauxCouleur: z.string().default(''),
  materiauxQte: z.number().default(0),
  garantieMO: z.string().default(''),
  garantieMateriaux: z.string().default(''),
  garantieNotes: z.string().default(''),
  companyTagline: z.string().default(''),
  companyCapital: z.string().default(''),
  rcNumber: z.string().default(''),
  nisNumber: z.string().default(''),
  aiNumber: z.string().default(''),
  rib: z.string().default(''),
  bankName: z.string().default(''),
  bankAgency: z.string().default(''),
  ccpNumber: z.string().default(''),
  validityDays: z.number().default(30),
  reference: z.string().default(''),
  showWatermark: z.boolean().default(false),
  previewTemplate: z.string().default('haussmann'),
  objet: z.string().default(''),
  docCity: z.string().default(''),
  companyPhone: z.string().default(''),
  sigClientSubtitle: z.string().default(''),
  sigClientNameFr: z.string().default(''),
  sigClientRole: z.string().default(''),
  sigClientRoleFr: z.string().default(''),
  sigClientNameAr: z.string().default(''),
  sigCompanyNameFr: z.string().default(''),
  sigDirectionNameFr: z.string().default(''),
  sigDirectionRole: z.string().default(''),
  sigDirectionNameAr: z.string().default(''),
  validUntil: z.string().default(''),
  bcRef: z.string().default(''),
  brRef: z.string().default(''),
});

export type EditorMeta = z.infer<typeof EditorMetaSchema>;

export function buildEditorMeta(doc: Record<string, unknown>): EditorMeta {
  return EditorMetaSchema.parse({
    tvaRate: Number(doc.tvaRate) || 0,
    logoSize: typeof doc.logoSize === 'string' ? doc.logoSize : 'md',
    clientInfo: doc.clientInfo || {},
    artisanInfo: doc.artisanInfo || null,
    discount: doc.discount,
    stampDuty: doc.stampDuty,
    paymentDetails: doc.paymentDetails,
    chantierAddress: doc.chantierAddress,
    chantierType: doc.chantierType,
    chantierSurface: doc.chantierSurface,
    chantierEtat: doc.chantierEtat,
    chantierProtection: doc.chantierProtection,
    materiauxMarque: doc.materiauxMarque,
    materiauxType: doc.materiauxType,
    materiauxCouleur: doc.materiauxCouleur,
    materiauxQte: doc.materiauxQte,
    garantieMO: doc.garantieMO,
    garantieMateriaux: doc.garantieMateriaux,
    garantieNotes: doc.garantieNotes,
    companyTagline: doc.companyTagline,
    companyCapital: doc.companyCapital,
    rcNumber: doc.rcNumber,
    nisNumber: doc.nisNumber,
    aiNumber: doc.aiNumber,
    rib: doc.rib,
    bankName: doc.bankName,
    bankAgency: doc.bankAgency,
    ccpNumber: doc.ccpNumber,
    validityDays: doc.validityDays,
    reference: doc.reference,
    showWatermark: doc.showWatermark,
    previewTemplate: doc.previewTemplate,
    objet: doc.objet,
    docCity: doc.docCity,
    companyPhone: doc.companyPhone,
    sigClientSubtitle: doc.sigClientSubtitle,
    sigClientNameFr: doc.sigClientNameFr,
    sigClientRole: doc.sigClientRole,
    sigClientRoleFr: doc.sigClientRoleFr,
    sigClientNameAr: doc.sigClientNameAr,
    sigCompanyNameFr: doc.sigCompanyNameFr,
    sigDirectionNameFr: doc.sigDirectionNameFr,
    sigDirectionRole: doc.sigDirectionRole,
    sigDirectionNameAr: doc.sigDirectionNameAr,
  });
}

/** Parse and validate an `_editorMeta` blob loaded from DB (customFields JSON). */
export function parseEditorMeta(raw: unknown): EditorMeta {
  const result = EditorMetaSchema.safeParse(raw);
  if (result.success) return result.data;
  // Fall back to defaults on schema mismatch — old documents missing new fields
  return EditorMetaSchema.parse({});
}
