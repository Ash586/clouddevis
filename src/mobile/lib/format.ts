// CloudDevis Mobile — shared formatting helpers

export function formatAmount(amount: number): string {
  return (
    amount.toLocaleString('fr-DZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' DA'
  );
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
  });
}
