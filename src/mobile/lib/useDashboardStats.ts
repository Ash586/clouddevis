// ============================================================
// Rakmana Mobile — Dashboard Stats Hook
// Fetches /api/dashboard once on mount (after auth).
// Falls back to computing from savedDocuments on error.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useDocumentStore } from '@/stores/documentStore';

// ── Shape returned by /api/dashboard ─────────────────────────

interface ApiDashboardStats {
  totalDocs: number;
  monthDocs: number;
  totalTTC: number;
  totalClients: number;
  draftCount: number;
  statusBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
}

// ── Shape consumed by StatCards ───────────────────────────────

export interface DashboardStats {
  monthDocs: number;
  totalTTC: number;
  totalClients: number;
  draftCount: number;
  /** ACCEPTED + DELIVERED docs (approx. "payés/livrés") */
  deliveredCount: number;
  /** Factures with status SENT — awaiting payment */
  unpaidCount: number;
}

// ── Fallback: compute from local savedDocuments ───────────────

function computeLocalStats(): DashboardStats {
  const docs = useDocumentStore.getState().savedDocuments;
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  const thisMonth = docs.filter((d) => {
    const dd = new Date(d.date);
    return dd.getMonth() === m && dd.getFullYear() === y;
  });
  return {
    monthDocs: thisMonth.length,
    totalTTC: docs.reduce((s, d) => s + (d.totalTTC ?? 0), 0),
    totalClients: 0,
    draftCount: docs.filter((d) => d.status === 'DRAFT').length,
    deliveredCount: docs.filter((d) => d.status === 'PAID').length,
    unpaidCount: docs.filter((d) => d.status === 'SENT').length,
  };
}

// ── Hook ─────────────────────────────────────────────────────

interface UseDashboardStatsResult {
  stats: DashboardStats;
  loading: boolean;
  error: boolean;
  refetch: () => void;
}

const DEFAULT_STATS: DashboardStats = {
  monthDocs: 0,
  totalTTC: 0,
  totalClients: 0,
  draftCount: 0,
  deliveredCount: 0,
  unpaidCount: 0,
};

export function useDashboardStats(enabled = true): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/dashboard', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { stats: ApiDashboardStats };
      const s = json.stats;
      setStats({
        monthDocs: s.monthDocs ?? 0,
        totalTTC: Number(s.totalTTC ?? 0),
        totalClients: s.totalClients ?? 0,
        draftCount: s.draftCount ?? 0,
        deliveredCount:
          (s.statusBreakdown?.DELIVERED ?? 0) +
          (s.statusBreakdown?.ACCEPTED ?? 0),
        unpaidCount: s.statusBreakdown?.SENT ?? 0,
      });
    } catch {
      // Fall back to local store computation
      setStats(computeLocalStats());
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
