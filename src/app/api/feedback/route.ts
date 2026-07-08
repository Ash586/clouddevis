import { NextResponse } from 'next/server';
import { withApiErrorHandling } from '@/lib/sentry/api';
import { withAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';

const MAX_MESSAGE = 2000;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@clouddevis.com';

export const POST = withApiErrorHandling(withAuth(async (req, session) => {
  try {
    const body = await req.json();
    const rawType = String((body as Record<string, unknown>).type ?? 'suggestion').toLowerCase();
    const message = String((body as Record<string, unknown>).message ?? '').trim();
    const email = String((body as Record<string, unknown>).email ?? '').trim();

    if (!message) {
      return NextResponse.json({ error: 'message est requis' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json({ error: `message trop long (max ${MAX_MESSAGE})` }, { status: 400 });
    }
    const type = rawType === 'bug' ? 'BUG' : 'SUGGESTION';

    const feedback = await prisma.feedback.create({
      data: {
        userId: session.userId,
        type,
        message,
        email: email || null,
      },
    });

    // Best-effort notification — never block the response on email delivery.
    sendEmail({
      to: SUPPORT_EMAIL,
      subject: `[${type}] Nouveau retour utilisateur`,
      html: `<p><strong>Type:</strong> ${type}</p>`
        + `<p><strong>Utilisateur:</strong> ${session.email} (${session.userId})</p>`
        + (email ? `<p><strong>Contact:</strong> ${email}</p>` : '')
        + `<p><strong>Message:</strong></p><p>${message.replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`,
    }).catch(() => {});

    return NextResponse.json({ ok: true, id: feedback.id });
  } catch (error) {
    logger.error('Feedback submit error', { error: String(error) });
    throw error;
  }
}), { component: 'api', severity: 'low', userImpact: 'degraded' });
