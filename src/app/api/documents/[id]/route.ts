import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDocument } from '@/lib/calculations';

const DOC_TYPE_MAP: Record<string, string> = { devis: 'DEVIS', proforma: 'PROFORMA', bc: 'BC', br: 'BR', facture: 'FACTURE' };
const DOC_TYPE_REVERSE: Record<string, string> = { DEVIS: 'devis', PROFORMA: 'proforma', BC: 'bc', BR: 'br', FACTURE: 'facture' };

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const doc = await prisma.document.findFirst({ where: { id, userId: session.userId } });
  if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

  return NextResponse.json({ document: doc });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.document.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

  const body = await req.json();
  const doc = body as Record<string, any>;

  const items = (doc.items || []).map((i: any) => ({
    id: i.id, designation: i.designation, quantity: i.quantity, unit: i.unit, unitPrice: i.unitPrice, category: i.category || null,
  }));

  const result = calculateDocument({
    items, tvaRate: doc.tvaRate || 0,
    discount: doc.discount || { type: 'percentage', value: 0, reason: '' },
    stampDuty: doc.stampDuty || { rate: 1, minAmount: 5, maxAmount: 2500 },
    paymentMode: doc.paymentMode || 'cheque',
    acompte: doc.acompte || 0,
  } as unknown as import('@/types').DocumentState);

  const updated = await prisma.document.update({
    where: { id },
    data: {
      type: (DOC_TYPE_MAP[doc.documentType] || 'DEVIS') as any,
      number: doc.documentNumber || '',
      date: doc.date ? new Date(doc.date) : new Date(),
      mode: (doc.mode?.toUpperCase?.() || 'ARTISAN') as any,
      paymentMode: doc.paymentMode || 'cheque',
      items: JSON.stringify(items),
      customFields: JSON.stringify(doc.customFields || {}),
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

  return NextResponse.json({ id: updated.id, number: updated.number });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.document.findFirst({ where: { id, userId: session.userId } });
  if (!existing) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
