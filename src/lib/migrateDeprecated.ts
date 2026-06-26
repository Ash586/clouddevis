import { prisma } from '@/lib/prisma';
import type { CompanyInfo } from '@/types';

/**
 * Migrate User.companyInfo (JSON, deprecated) → Company model rows.
 * Safe to call repeatedly — checks if a Company record already exists.
 * Returns the migrated Company record, or null if no companyInfo to migrate.
 */
export async function migrateUserCompany(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyInfo: true },
  });
  if (!user?.companyInfo) return null;

  const existing = await prisma.company.findUnique({ where: { userId } });
  if (existing) return existing;

  const ci = JSON.parse(JSON.stringify(user.companyInfo)) as CompanyInfo | null;
  if (!ci) return null;

  return prisma.company.create({
    data: {
      userId,
      name: ci.name || '',
      nif: ci.taxIds?.nif || null,
      rc: ci.taxIds?.rc || null,
      nis: ci.taxIds?.nis || null,
      ai: ci.taxIds?.ai || null,
      address: ci.address || null,
      capital: ci.capital || null,
      logo: ci.logo || null,
      signature: ci.signature || null,
    },
  });
}

/**
 * Migrate Document.items (JSON, backward-compat) → LineItem rows.
 * Does nothing if LineItems already exist for this document.
 * Returns the count of LineItems created, or 0 if none needed.
 */
export async function migrateDocumentItems(documentId: string) {
  const existingCount = await prisma.lineItem.count({ where: { documentId } });
  if (existingCount > 0) return 0;

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: { items: true },
  });
  if (!doc?.items) return 0;

  const items = (JSON.parse(JSON.stringify(doc.items)) as Array<Record<string, unknown>>) || [];
  if (items.length === 0) return 0;

  const created = await prisma.lineItem.createMany({
    data: items.map((item) => ({
      documentId,
      label: String(item.designation || item.label || ''),
      quantity: Number(item.quantity) || 1,
      unit: String(item.unit || 'u'),
      unitPrice: Number(item.unitPrice) || 0,
      tvaRate: Number(item.tvaRate) || 19,
      totalHT: Number(item.totalHT || (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)) || 0,
    })),
    skipDuplicates: true,
  });

  return created.count;
}
