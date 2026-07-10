import { logger } from '@/lib/logger';

interface EmailAttachment {
  filename: string;
  /** Base64-encoded file content. */
  content: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export type SendEmailResult = { ok: true } | { ok: false; reason: 'not_configured' | 'error'; detail?: string };

/**
 * Send email via Resend API.
 * Requires RESEND_API_KEY env var. Falls back to console logging in development.
 * Returns a boolean for backward-compat callers; use sendEmailResult for detail.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  return (await sendEmailResult(params)).ok;
}

/** Like sendEmail but returns a structured result so callers can surface why it failed. */
export async function sendEmailResult({ to, subject, html, replyTo, attachments }: SendEmailParams): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Rakmana <noreply@clouddevis.io>';

  if (!apiKey) {
    logger.warn('RESEND_API_KEY not configured — email not sent', { to, subject });
    return { ok: false, reason: 'not_configured' };
  }

  try {
    const body: Record<string, unknown> = { from, to: [to], subject, html };
    if (replyTo) body.reply_to = replyTo;
    if (attachments?.length) body.attachments = attachments;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error('Resend API error', { status: res.status, error: err });
      return { ok: false, reason: 'error', detail: err };
    }

    return { ok: true };
  } catch (error) {
    logger.error('Failed to send email', { error: String(error) });
    return { ok: false, reason: 'error', detail: String(error) };
  }
}
