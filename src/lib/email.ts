import { logger } from '@/lib/logger';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email via Resend API.
 * Requires RESEND_API_KEY env var. Falls back to console logging in development.
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Rakmana <noreply@clouddevis.io>';

  if (!apiKey) {
    logger.warn('RESEND_API_KEY not configured — email not sent', { to, subject });
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (!res.ok) {
      const err = await res.text();
      logger.error('Resend API error', { status: res.status, error: err });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to send email', { error: String(error) });
    return false;
  }
}
