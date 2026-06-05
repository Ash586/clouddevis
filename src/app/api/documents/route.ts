import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDocument, generateDocumentNumber } from '@/lib/calculations';

const DOC_TYPE_MAP: Record<string, string> = { devis: 'DEVIS', proforma: 'PROFORMA', bc: 'BC', br: 'BR', facture: 'FACTURE' };

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const docs = await prisma.document.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { client: { select: { name: true } } },
  });

  const mapped = docs.map(d => ({
    id: d.id,
    number: d.number,
    type: d.type,
    client: d.client?.name || '',
    total: d.totalTTC.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    date: d.date.toISOString().split('T')[0],
    status: d.status,
  }));

  return NextResponse.json({ documents: mapped });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const body = await req.json();
  const doc = body as Record<string, any>;

  const items = (doc.items || []).map((i: any) => ({
    id: i.id,
    designation: i.designation,
    quantity: i.quantity,
    unit: i.unit,
    unitPrice: i.unitPrice,
    category: i.category || null,
  }));

  const result = calculateDocument({
    items,
    tvaRate: doc.tvaRate || 0,
    discount: doc.discount || { type: 'percentage', value: 0, reason: '' },
    stampDuty: doc.stampDuty || { rate: 1, minAmount: 5, maxAmount: 2500 },
    paymentMode: doc.paymentMode || 'cheque',
    acompte: doc.acompte || 0,
  } as unknown as import('@/types').DocumentState);

  let existingClientId: string | null = null;
  const clientName = doc.clientInfo?.name?.trim();
  if (clientName) {
    const existing = await prisma.client.findFirst({
      where: { userId: session.userId, name: clientName },
      select: { id: true },
    });
    existingClientId = existing?.id ?? null;
  }

  // Auto-generate unique document number based on count of same type this year
  const docType = (DOC_TYPE_MAP[doc.documentType] || 'DEVIS') as string;
  const yearStart = new Date(`${new Date().getFullYear()}-01-01`);
  const sameTypeCount = await prisma.document.count({
    where: {
      userId: session.userId,
      type: docType as any,
      createdAt: { gte: yearStart },
    },
  });
  const autoNumber = doc.documentNumber || generateDocumentNumber(doc.documentType || 'devis', doc.mode || 'artisan', sameTypeCount + 1);

  const created = await prisma.document.create({
    data: {
      userId: session.userId,
      clientId: existingClientId,
      type: docType as any,
      status: 'DRAFT' as any,
      number: autoNumber,
      date: doc.date ? new Date(doc.date) : new Date(),
      mode: (doc.mode?.toUpperCase?.() || 'ARTISAN') as any,
      paymentMode: doc.paymentMode || 'cheque',
      items: JSON.stringify(items),
      customFields: JSON.stringify({
        ...(doc.customFields || {}),
        sectionOrder: doc.sectionOrder || [],
        hiddenBlocks: doc.hiddenBlocks || [],
      }),
      subTotalHT: result.subTotalHT,
      tvaAmount: result.tvaAmount,
      timbreFiscal: result.timbreFiscal,
      totalTTC: result.totalTTC,
      acompte: doc.acompte || 0,
      netAPayer: result.netAPayer,
      totalInWords: result.totalInWords,
      notes: doc.notes || null,
    },
  });
  return NextResponse.json({ id: created.id, number: created.number }, { status: 201 });
}
