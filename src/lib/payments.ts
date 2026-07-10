/**
 * Shared payment / overdue logic for invoices. Kept in one place so the
 * documents API, the reminders job, and any UI compute "overdue" identically.
 */

/** Default number of days after the invoice date an invoice is considered due
 *  when no explicit due date was set (Algeria SMB norm ≈ 30 days). */
export const DEFAULT_PAYMENT_TERM_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** The effective due instant (ms): explicit dueDate if set, else date + term. */
export function dueInstant(date: Date, dueDate: Date | null | undefined): number {
  if (dueDate) return dueDate.getTime();
  return date.getTime() + DEFAULT_PAYMENT_TERM_DAYS * DAY_MS;
}

/**
 * An invoice is overdue when it is a FACTURE, not fully paid, and its due
 * instant has passed. Devis/BL/etc. are never "overdue" — only real invoices.
 */
export function isOverdue(
  doc: { type: string; status: string; remaining: number; dueDate: Date | null | undefined; date: Date },
  nowMs: number = Date.now(),
): boolean {
  if (doc.type !== 'FACTURE') return false;
  if (doc.status === 'PAID') return false;
  if (doc.remaining <= 0.01) return false;
  return dueInstant(doc.date, doc.dueDate) < nowMs;
}

/** Whole days an invoice is past due (0 if not yet due). */
export function daysOverdue(date: Date, dueDate: Date | null | undefined, nowMs: number = Date.now()): number {
  const diff = nowMs - dueInstant(date, dueDate);
  return diff <= 0 ? 0 : Math.floor(diff / DAY_MS);
}
