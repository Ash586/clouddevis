// ── Algerian DGI Fiscal Calendar & Threshold Logic ──────────────

export const IFU_THRESHOLD = 8_000_000; // 8M DA — above = régime réel

export interface G50Deadline {
  month: number; // 1-12, the month the declaration covers
  year: number;
  dueDate: Date; // 20th of the following month
  label: string; // e.g. "Janvier 2026"
  isPast: boolean;
  isCurrentMonth: boolean;
}

export interface FiscalSummary {
  year: number;
  totalRevenue: number;
  totalTVACollected: number;
  totalTimbrePaid: number;
  invoiceCount: number;
  regime: 'forfaitaire' | 'reel';
  ifuProgress: number; // 0-100
  g50Deadlines: G50Deadline[];
  currentQuarter: number;
  quarterRevenue: number;
  monthlyRevenues: number[];
}

const MONTH_LABELS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function getG50Deadlines(year: number, now: Date): G50Deadline[] {
  const deadlines: G50Deadline[] = [];

  for (let m = 0; m < 12; m++) {
    const dueMonth = m + 1; // declaration for month m is due in month m+1
    const dueYear = dueMonth > 11 ? year + 1 : year;
    const actualDueMonth = dueMonth > 11 ? 0 : dueMonth;
    const dueDate = new Date(dueYear, actualDueMonth, 20);

    const isCurrentMonth = now.getMonth() === m && now.getFullYear() === year;

    deadlines.push({
      month: m + 1,
      year,
      dueDate,
      label: `${MONTH_LABELS_FR[m]} ${year}`,
      isPast: now > dueDate,
      isCurrentMonth,
    });
  }

  return deadlines;
}

export function determineRegime(annualRevenue: number): 'forfaitaire' | 'reel' {
  return annualRevenue >= IFU_THRESHOLD ? 'reel' : 'forfaitaire';
}

export function getCurrentQuarter(now: Date): number {
  return Math.floor(now.getMonth() / 3) + 1;
}

export function computeFiscalSummary(
  invoices: Array<{
    totalTTC: number;
    tvaAmount: number;
    timbreFiscal: number;
    date: Date | string;
  }>,
  year: number,
  now: Date
): FiscalSummary {
  let totalRevenue = 0;
  let totalTVACollected = 0;
  let totalTimbrePaid = 0;
  let invoiceCount = 0;
  const monthlyRevenues = new Array(12).fill(0);

  const currentQuarter = getCurrentQuarter(now);
  let quarterRevenue = 0;
  const quarterStart = (currentQuarter - 1) * 3;
  const quarterEnd = quarterStart + 2;

  for (const inv of invoices) {
    const d = typeof inv.date === 'string' ? new Date(inv.date) : inv.date;
    if (d.getFullYear() !== year) continue;

    totalRevenue += inv.totalTTC;
    totalTVACollected += inv.tvaAmount;
    totalTimbrePaid += inv.timbreFiscal;
    invoiceCount++;

    const m = d.getMonth();
    monthlyRevenues[m] += inv.totalTTC;

    if (m >= quarterStart && m <= quarterEnd) {
      quarterRevenue += inv.totalTTC;
    }
  }

  const regime = determineRegime(totalRevenue);
  const ifuProgress = Math.min(100, Math.round((totalRevenue / IFU_THRESHOLD) * 100));
  const g50Deadlines = getG50Deadlines(year, now);

  return {
    year,
    totalRevenue,
    totalTVACollected,
    totalTimbrePaid,
    invoiceCount,
    regime,
    ifuProgress,
    g50Deadlines,
    currentQuarter,
    quarterRevenue,
    monthlyRevenues,
  };
}
