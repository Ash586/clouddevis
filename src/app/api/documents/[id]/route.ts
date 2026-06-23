import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDocument } from '@/lib/calculations';
import { logger } from '@/lib/logger';
import { validateDocumentBody } from '@/lib/validation';
import { DocumentState } from '@/types';

const DOC_TYPE_MAP: Record<string, 'DEVIS' | 'PROFORMA' | 'BC' | 'BR' | 'FACTURE' | 'INTERVENTION' | 'ATTACHEMENT'> = { devis: 'DEVIS', proforma: 'PROFORMA', bc: 'BC', br: 'BR', facture: 'FACTURE', intervention: 'INTERVENTION', attachement: 'ATTACHEMENT' };

export const GET = withApiErrorHandling(getHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function getHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { id } = await params;
    const doc = await prisma.document.findFirst({ where: { id, userId: session.userId } });
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

    return NextResponse.json({ document: doc });
  } catch (error) {
    logger.error('GET /api/documents/[id] error', { error: String(error) });
    throw error;
  }
}

export const PUT = withApiErrorHandling(putHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function putHandler(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
      description: (i.description as string) || undefined,
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

    const rawCustomFields = (typeof doc.customFields === 'object' && doc.customFields ? doc.customFields : {}) as Record<string, unknown>;

    // Build _editorMeta — all fields missing dedicated columns in Document model
    const editorMeta: Record<string, unknown> = {
      clientInfo: doc.clientInfo || {},
      artisanInfo: doc.artisanInfo || null,
      discount: doc.discount || { type: 'percentage', value: 0, reason: '' },
      stampDuty: doc.stampDuty || { rate: 1, minAmount: 5, maxAmount: 2500 },
      paymentDetails: doc.paymentDetails || { terms: '', iban: '' },
      chantierAddress: doc.chantierAddress || '',
      chantierType: doc.chantierType || '',
      chantierSurface: doc.chantierSurface || 0,
      chantierEtat: doc.chantierEtat || '',
      chantierProtection: doc.chantierProtection || '',
      materiauxMarque: doc.materiauxMarque || '',
      materiauxType: doc.materiauxType || '',
      materiauxCouleur: doc.materiauxCouleur || '',
      materiauxQte: doc.materiauxQte || 0,
      garantieMO: doc.garantieMO || '',
      garantieMateriaux: doc.garantieMateriaux || '',
      garantieNotes: doc.garantieNotes || '',
      companyTagline: doc.companyTagline || '',
      companyCapital: doc.companyCapital || '',
      rcNumber: doc.rcNumber || '',
      nisNumber: doc.nisNumber || '',
      aiNumber: doc.aiNumber || '',
      rib: doc.rib || '',
      bankName: doc.bankName || '',
      bankAgency: doc.bankAgency || '',
      ccpNumber: doc.ccpNumber || '',
      validityDays: doc.validityDays ?? 30,
      reference: doc.reference || '',
      showWatermark: doc.showWatermark || false,
      objet: doc.objet || '',
      docCity: doc.docCity || '',
      companyPhone: doc.companyPhone || '',
      sigClientSubtitle: doc.sigClientSubtitle || '',
      sigClientNameFr: doc.sigClientNameFr || '',
      sigClientRole: doc.sigClientRole || '',
      sigClientRoleFr: doc.sigClientRoleFr || '',
      sigClientNameAr: doc.sigClientNameAr || '',
      sigCompanyNameFr: doc.sigCompanyNameFr || '',
      sigDirectionNameFr: doc.sigDirectionNameFr || '',
      sigDirectionRole: doc.sigDirectionRole || '',
      sigDirectionNameAr: doc.sigDirectionNameAr || '',
    };

    const updated = await prisma.document.update({
      where: { id },
      data: {
        clientId: existingClientId,
        type: typeValue,
        number: String(doc.documentNumber || ''),
        date: doc.date ? new Date(String(doc.date)) : new Date(),
        validUntil: doc.validUntil ? new Date(String(doc.validUntil)) : undefined,
        mode: (String(doc.mode || 'ARTISAN').toUpperCase()) as 'ARTISAN' | 'ENTREPRISE',
        paymentMode: String(doc.paymentMode || 'cheque'),
        bcRef: (doc.bcRef as string) || null,
        brRef: (doc.brRef as string) || null,
        items: JSON.stringify(items),
        companyInfo: doc.companyInfo && typeof doc.companyInfo === 'object' && Object.keys(doc.companyInfo).length > 0 ? doc.companyInfo as object : undefined,
        logoPosition: typeof doc.logoPosition === 'string' ? doc.logoPosition : undefined,
        customFields: JSON.stringify({
          ...rawCustomFields,
          sectionOrder: Array.isArray(doc.sectionOrder) ? doc.sectionOrder : [],
          hiddenBlocks: Array.isArray(doc.hiddenBlocks) ? doc.hiddenBlocks : [],
          _editorMeta: editorMeta,
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

    // Sync client tax fields (nif, nis, rc, ai) from document clientInfo
    if (existingClientId && clientInfo) {
      const updateData: Record<string, string | null> = {};
      if (clientInfo.nif !== undefined) updateData.nif = String(clientInfo.nif).trim() || null;
      if (clientInfo.nis !== undefined) updateData.nis = String(clientInfo.nis).trim() || null;
      if (clientInfo.rc !== undefined) updateData.rc = String(clientInfo.rc).trim() || null;
      if (clientInfo.ai !== undefined) updateData.ai = String(clientInfo.ai).trim() || null;
      if (Object.keys(updateData).length > 0) {
        await prisma.client.update({ where: { id: existingClientId }, data: updateData });
      }
    }

    return NextResponse.json({ id: updated.id, number: updated.number });
  } catch (error) {
    logger.error('PUT /api/documents/[id] error', { error: String(error) });
    throw error;
  }
}

export const DELETE = withApiErrorHandling(deleteHandler, { component: 'invoice', severity: 'high', userImpact: 'blocking' });
async function deleteHandler(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    throw error;
  }
}
