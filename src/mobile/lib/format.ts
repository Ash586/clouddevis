// Rakmana Mobile — shared formatting helpers

// Mirrors src/lib/dgi.ts formatCurrency: non-breaking space (U+00A0) as
// thousands separator instead of the thin space (U+202F) that fr-DZ emits.
const _moneyFormatter = new Intl.NumberFormat('fr-DZ', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: true,
});

export function formatAmount(amount: number): string {
  const formatted = _moneyFormatter.format(amount).replace(/\u202F/g, '\u00A0');
  return formatted + '\u00A0DA';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
}
