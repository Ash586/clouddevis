import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendEmailResult } from '@/lib/email';
import { buildInvoiceEmail } from '@/lib/invoiceEmail';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Email a document to its client. Body: { to?: string, message?: string }.
 * Recipient defaults to the linked client's email. On success the document is
 * marked SENT (unless already PAID) and an in-app notification is created.
 */
export const POST = withApiErrorHandling(withAuth(async (req, session, ctx) => {
  try {
    const { id } = await ctx!.params as { id: string };
    const body = await req.json().catch(() => ({}));
    const toOverride = typeof body.to === 'string' ? body.to.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';

    const doc = await prisma.document.findFirst({
      where: { id, userId: session.userId },
      include: { client: { select: { name: true, email: true } } },
    });
    if (!doc) return NextResponse.json({ error: 'Document introuvable' }, { status: 404 });

    const to = toOverride || doc.client?.email || '';
    if (!to || !EMAIL_RE.test(to)) {
      return NextResponse.json({ error: 'Adresse email du client manquante ou invalide', code: 'NO_EMAIL' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { name: true, email: true } });
    const companyInfo = (doc.companyInfo as { name?: string } | null) ?? null;
    const senderName = companyInfo?.name?.trim() || user?.name?.trim() || 'Votre entreprise';

    const items = (() => {
      try { return typeof doc.items === 'string' ? JSON.parse(doc.items) : (doc.items ?? []); }
      catch { return []; }
    })();

    const { subject, html } = buildInvoiceEmail({
      docType: doc.type,
      number: doc.number,
      date: doc.date,
      dueDate: doc.dueDate,
      items: Array.isArray(items) ? items : [],
      subTotalHT: doc.subTotalHT,
      tvaAmount: doc.tvaAmount,
      timbreFiscal: doc.timbreFiscal,
      totalTTC: doc.totalTTC,
      netAPayer: doc.netAPayer,
      amountPaid: doc.amountPaid,
      senderName,
      clientName: doc.client?.name ?? '',
      message,
    });

    const result = await sendEmailResult({ to, subject, html, replyTo: user?.email });
    if (!result.ok) {
      const msg = result.reason === 'not_configured'
        ? "L'envoi d'emails n'est pas encore configuré sur ce compte."
        : "Échec de l'envoi de l'email. Réessayez.";
      return NextResponse.json({ error: msg, code: result.reason }, { status: result.reason === 'not_configured' ? 503 : 502 });
    }

    // Mark SENT (keep PAID/its later states) and notify the owner.
    if (doc.status !== 'PAID') {
      await prisma.document.update({ where: { id }, data: { status: 'SENT' } });
    }
    await prisma.notification.create({
      data: {
        userId: session.userId,
        type: 'SUCCESS',
        title: `Document envoyé`,
        message: `${doc.number ?? 'Le document'} a été envoyé à ${to}.`,
        link: `/dashboard/editor?id=${doc.id}`,
      },
    });

    return NextResponse.json({ ok: true, to, status: doc.status !== 'PAID' ? 'SENT' : doc.status });
  } catch (error) {
    logger.error('POST /api/documents/[id]/send error', { error: String(error) });
    throw error;
  }
}), { component: 'invoice', severity: 'medium', userImpact: 'degraded' });
