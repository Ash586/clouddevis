import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { calculateDocument } from '@/lib/calculations';
import { TRIAL_DAYS, canCreateDocument, getDocLimit } from '@/lib/subscription';
import { validateDocumentBody } from '@/lib/validation';
import type { DocumentState } from '@/types';

const DOC_TYPE_MAP: Record<string, 'DEVIS' | 'PROFORMA' | 'BC' | 'BR' | 'FACTURE' | 'INTERVENTION' | 'ATTACHEMENT'> = { devis: 'DEVIS', proforma: 'PROFORMA', bc: 'BC', br: 'BR', facture: 'FACTURE', intervention: 'INTERVENTION', attachement: 'ATTACHEMENT' };

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: session.userId };
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (type) {
      const validTypes = ['DEVIS', 'PROFORMA', 'BC', 'BR', 'FACTURE', 'INTERVENTION', 'ATTACHEMENT'];
      const upperType = type.toUpperCase();
      if (validTypes.includes(upperType)) where.type = upperType;
    }
    if (status) {
      const validStatuses = ['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED'];
      const upperStatus = status.toUpperCase();
      if (validStatuses.includes(upperStatus)) where.status = upperStatus;
    }
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from && !isNaN(new Date(from).getTime())) dateFilter.gte = new Date(from);
      if (to && !isNaN(new Date(to).getTime())) dateFilter.lte = new Date(to + 'T23:59:59');
      if (Object.keys(dateFilter).length > 0) where.createdAt = dateFilter;
    }

    const [docs, total, statusGroup, typeGroup] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { client: { select: { name: true } } },
      }),
      prisma.document.count({ where }),
      prisma.document.groupBy({
        by: ['status'],
        where: { userId: session.userId },
        _count: { status: true },
      }),
      prisma.document.groupBy({
        by: ['type'],
        where: { userId: session.userId },
        _count: { type: true },
        _sum: { totalTTC: true },
      }),
    ]);

    const statusBreakdown: Record<string, number> = {};
    for (const row of statusGroup) statusBreakdown[row.status] = row._count.status;

    const typeBreakdown: Record<string, { count: number; total: number }> = {};
    for (const row of typeGroup) {
      typeBreakdown[row.type] = { count: row._count.type, total: row._sum.totalTTC || 0 };
    }

    return NextResponse.json({
      documents: docs.map(d => ({
        id: d.id, number: d.number, type: d.type, status: d.status,
        client: d.client?.name || '',
        total: d.totalTTC.toLocaleString('fr-DZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        date: d.date.toISOString().split('T')[0],
        createdAt: d.createdAt.toISOString().split('T')[0],
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      statusBreakdown,
      typeBreakdown,
    });
  } catch (error) {
    logger.error('GET /api/documents error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { subscriptionStatus: true, docCountThisMonth: true, lastDocResetAt: true, trialStartAt: true },
    });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    // Reset doc count if new month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (!user.lastDocResetAt || user.lastDocResetAt < startOfMonth) {
      await prisma.user.update({ where: { id: session.userId }, data: { docCountThisMonth: 0, lastDocResetAt: now } });
      user.docCountThisMonth = 0;
    }

    // Check trial expiration
    const isTrial = user.subscriptionStatus === 'TRIAL';
    if (isTrial && user.trialStartAt) {
      const daysSinceTrial = Math.floor((now.getTime() - user.trialStartAt.getTime()) / 86400000);
      if (daysSinceTrial >= TRIAL_DAYS) {
        await prisma.user.update({ where: { id: session.userId }, data: { subscriptionStatus: 'FREE' } });
        return NextResponse.json({ error: 'Essai terminé. Choisissez un forfait pour continuer.' }, { status: 403 });
      }
    }

    // Check doc limit
    const sessionUser = { userId: session.userId, email: session.email, subscriptionStatus: user.subscriptionStatus, name: '', mode: '', sector: null, country: '', language: 'fr' };
    if (!canCreateDocument(sessionUser, user.docCountThisMonth)) {
      const limit = getDocLimit(sessionUser);
      return NextResponse.json({ error: `Limite mensuelle de documents atteinte (${limit}). Passez à un forfait supérieur.`, limit }, { status: 403 });
    }

    const body = await req.json();
    const validation = validateDocumentBody(body);
    if (!validation.valid) {
      return NextResponse.json({ error: Object.values(validation.errors).join(', ') }, { status: 400 });
    }
    const doc = body as Record<string, unknown>;
    if (typeof doc !== 'object' || !doc) {
      return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
    }
    const rawItems = (doc.items as Array<Record<string, unknown>>) || [];
    if (!Array.isArray(rawItems)) {
      return NextResponse.json({ error: 'items doit être un tableau' }, { status: 400 });
    }
    const items: Array<{ id: string; designation: string; quantity: number; unit: string; unitPrice: number; category: string | null }> = rawItems.map((i) => ({
      id: String(i.id || ''), designation: String(i.designation || ''), quantity: Number(i.quantity) || 0,
      unit: String(i.unit || 'unité'), unitPrice: Number(i.unitPrice) || 0, category: (i.category as string) || null,
    }));

    const docInput = {
      items, tvaRate: Number(doc.tvaRate) || 0,
      discount: (doc.discount as DocumentState['discount']) || { type: 'percentage', value: 0, reason: '' },
      stampDuty: (doc.stampDuty as DocumentState['stampDuty']) || { rate: 1, minAmount: 5, maxAmount: 2500 },
      paymentMode: String(doc.paymentMode || 'cheque'),
      acompte: Number(doc.acompte) || 0,
      documentType: String(doc.documentType || 'devis'),
    } as unknown as DocumentState;

    const result = calculateDocument(docInput);

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

    const created = await prisma.document.create({
      data: {
        userId: session.userId,
        type: typeValue,
        number: String(doc.documentNumber || ''),
        date: doc.date ? new Date(String(doc.date)) : new Date(),
        mode: (String(doc.mode || 'ARTISAN').toUpperCase()) as 'ARTISAN' | 'ENTREPRISE',
        paymentMode: String(doc.paymentMode || 'cheque'),
        items: JSON.stringify(items),
        clientId: existingClientId,
        customFields: JSON.stringify({
          ...(typeof doc.customFields === 'object' && doc.customFields ? doc.customFields : {}),
          sectionOrder: Array.isArray(doc.sectionOrder) ? doc.sectionOrder : [],
          hiddenBlocks: Array.isArray(doc.hiddenBlocks) ? doc.hiddenBlocks : [],
        }),
        subTotalHT: result.subTotalHT, tvaAmount: result.tvaAmount,
        timbreFiscal: result.timbreFiscal, totalTTC: result.totalTTC,
        acompte: Number(doc.acompte) || 0, netAPayer: result.netAPayer,
        totalInWords: result.totalInWords, notes: (doc.notes as string) || null,
      },
    });

    // Increment doc count
    await prisma.user.update({ where: { id: session.userId }, data: { docCountThisMonth: { increment: 1 } } });

    return NextResponse.json({ id: created.id, number: created.number });
  } catch (error) {
    logger.error('POST /api/documents error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

const VALID_STATUSES = ['DRAFT', 'ACCEPTED', 'PROGRESS', 'DELIVERED'];

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });

    const upperStatus = String(status).toUpperCase();
    if (!VALID_STATUSES.includes(upperStatus)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const doc = await prisma.document.findFirst({ where: { id, userId: session.userId } });
    if (!doc) return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });

    const updated = await prisma.document.update({
      where: { id },
      data: { status: upperStatus as 'DRAFT' | 'ACCEPTED' | 'PROGRESS' | 'DELIVERED' },
    });

    return NextResponse.json({ id: updated.id, status: updated.status });
  } catch (error) {
    logger.error('PATCH /api/documents error', { error: String(error) });
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
