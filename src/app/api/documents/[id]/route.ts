import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDocument } from '@/lib/calculations';
import { logger } from '@/lib/logger';
import { validateDocumentBody } from '@/lib/validation';
import { DocumentState } from '@/types';

const DOC_TYPE_MAP: Record<string, 'DEVIS' | 'PROFORMA' | 'BC' | 'BR' | 'FACTURE' | 'INTERVENTION' | 'ATTACHEMENT'> = { devis: 'DEVIS', proforma: 'PROFORMA', bc: 'BC', br: 'BR', facture: 'FACTURE', intervention: 'INTERVENTION', attachement: 'ATTACHEMENT' };

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const doc = await prisma.document.findFirst({ where: { id, userId: session.userId } });
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

    return NextResponse.json({ document: doc });
  } catch (error) {
    logger.error('GET /api/documents/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.document.findFirst({ where: { id, userId: session.userId } });
    if (!existing) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

    const body = await req.json();
    const validation = validateDocumentBody(body);
    if (!validation.valid) {
      return NextResponse.json({ error: Object.values(validation.errors).join(', ') }, { status: 400 });
    }

    const doc = body as Record<string, unknown>;

    const items = ((doc.items as Array<Record<string, unknown>>) || []).map((i) => ({
      id: String(i.id || ''),
      designation: String(i.designation || ''),
      quantity: Number(i.quantity) || 0,
      unit: String(i.unit || 'unité'),
      unitPrice: Number(i.unitPrice) || 0,
      category: (i.category as string) || null,
    }));

    const result = calculateDocument({
      items,
      tvaRate: Number(doc.tvaRate) || 0,
      discount: (doc.discount as DocumentState['discount']) || { type: 'percentage', value: 0, reason: '' },
      stampDuty: (doc.stampDuty as DocumentState['stampDuty']) || { rate: 1, minAmount: 5, maxAmount: 2500 },
      paymentMode: String(doc.paymentMode || 'cheque'),
      acompte: Number(doc.acompte) || 0,
    } as unknown as DocumentState);

    let existingClientId: string | null = null;
    const clientInfo = doc.clientInfo as Record<string, unknown> | undefined;
    const clientName = clientInfo?.name ? String(clientInfo.name).trim() : '';
    if (clientName) {
      const existingClient = await prisma.client.findFirst({
        where: { userId: session.userId, name: clientName },
        select: { id: true },
      });
      existingClientId = existingClient?.id ?? null;
    }

    const documentType = String(doc.documentType || 'devis').toLowerCase();
    const typeValue = DOC_TYPE_MAP[documentType] || 'DEVIS';

    const updated = await prisma.document.update({
      where: { id },
      data: {
        clientId: existingClientId,
        type: typeValue,
        number: String(doc.documentNumber || ''),
        date: doc.date ? new Date(String(doc.date)) : new Date(),
        mode: (String(doc.mode || 'ARTISAN').toUpperCase()) as 'ARTISAN' | 'ENTREPRISE',
        paymentMode: String(doc.paymentMode || 'cheque'),
        items: JSON.stringify(items),
        customFields: JSON.stringify({
          ...(typeof doc.customFields === 'object' && doc.customFields ? doc.customFields : {}),
          sectionOrder: Array.isArray(doc.sectionOrder) ? doc.sectionOrder : [],
          hiddenBlocks: Array.isArray(doc.hiddenBlocks) ? doc.hiddenBlocks : [],
        }),
        subTotalHT: result.subTotalHT,
        tvaAmount: result.tvaAmount,
        timbreFiscal: result.timbreFiscal,
        totalTTC: result.totalTTC,
        acompte: Number(doc.acompte) || 0,
        netAPayer: result.netAPayer,
        totalInWords: result.totalInWords,
        notes: (doc.notes as string) || null,
      },
    });

    return NextResponse.json({ id: updated.id, number: updated.number });
  } catch (error) {
    logger.error('PUT /api/documents/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.document.findFirst({ where: { id, userId: session.userId } });
    if (!existing) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/documents/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
