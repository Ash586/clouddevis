import { prisma } from '@/lib/prisma';
import { isOverdue, daysOverdue } from '@/lib/payments';

/** Link that deep-links to the unpaid documents view. */
const UNPAID_LINK = '/dashboard?tab=documents&status=SENT';

/** Don't re-remind about the same invoice more than once per this window. */
const REMIND_COOLDOWN_DAYS = 7;
const MAX_REMINDERS_PER_RUN = 10;

/**
 * Scan a user's FACTURE documents and create an in-app reminder notification for
 * each one that is overdue and unpaid, unless we already reminded about it in the
 * last REMIND_COOLDOWN_DAYS. Returns how many reminders were created. Safe to call
 * on every dashboard load — it dedupes and caps itself.
 */
export async function remindOverdueInvoices(userId: string): Promise<number> {
  const now = Date.now();
  const cooldownSince = new Date(now - REMIND_COOLDOWN_DAYS * 24 * 60 * 60 * 1000);

  // Candidate unpaid invoices (cheap pre-filter in SQL; precise overdue check in JS).
  const candidates = await prisma.document.findMany({
    where: {
      userId,
      type: 'FACTURE',
      status: { notIn: ['PAID', 'DRAFT'] },
    },
    select: { id: true, number: true, netAPayer: true, amountPaid: true, status: true, date: true, dueDate: true, client: { select: { name: true } } },
    orderBy: { date: 'asc' },
    take: 100,
  });

  const overdue = candidates.filter(d => {
    const remaining = Math.max(0, (d.netAPayer || 0) - (d.amountPaid || 0));
    return isOverdue({ type: 'FACTURE', status: d.status, remaining, dueDate: d.dueDate, date: d.date }, now);
  });
  if (overdue.length === 0) return 0;

  // Which of these did we already remind about recently? Dedup by the per-invoice link.
  const links = overdue.map(d => `/dashboard/editor?id=${d.id}`);
  const recent = await prisma.notification.findMany({
    where: { userId, link: { in: links }, createdAt: { gte: cooldownSince }, title: { contains: 'chéance' } },
    select: { link: true },
  });
  const alreadyReminded = new Set(recent.map(n => n.link));

  const toCreate = overdue
    .filter(d => !alreadyReminded.has(`/dashboard/editor?id=${d.id}`))
    .slice(0, MAX_REMINDERS_PER_RUN);
  if (toCreate.length === 0) return 0;

  await prisma.notification.createMany({
    data: toCreate.map(d => {
      const days = daysOverdue(d.date, d.dueDate, now);
      const remaining = Math.max(0, (d.netAPayer || 0) - (d.amountPaid || 0));
      const who = d.client?.name ? ` (${d.client.name})` : '';
      return {
        userId,
        type: 'WARNING' as const,
        title: `Facture ${d.number ?? ''} en retard d'échéance`,
        message: `La facture ${d.number ?? ''}${who} est impayée depuis ${days} jour(s) — reste ${remaining.toFixed(2)} DA à encaisser.`,
        link: `/dashboard/editor?id=${d.id}`,
      };
    }),
  });

  return toCreate.length;
}

export { UNPAID_LINK };
