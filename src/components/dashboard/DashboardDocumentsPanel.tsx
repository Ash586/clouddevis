'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Search, FileStack, ArrowUpDown, Eye, Trash2, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DOC_TYPE_CONFIG, STATUS_LABELS, TYPE_FILTERS, type DocSummary } from './dashboardConstants';

interface Props {
  docs: DocSummary[];
  loading: boolean;
  totalDocs: number;
  page: number;
  totalPages: number;
  searchQuery: string;
  typeFilter: string;
  sortBy: string;
  sortOrder: string;
  onPageChange: (p: number) => void;
  onSearchChange: (q: string) => void;
  onTypeFilterChange: (t: string) => void;
  onSortChange: (col: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function DashboardDocumentsPanel({
  docs, loading, totalDocs, page, totalPages,
  searchQuery, typeFilter, sortBy, sortOrder,
  onPageChange, onSearchChange, onTypeFilterChange, onSortChange, onDeleteRequest,
}: Props) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const router = useRouter();

  const filterChipClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
      active
        ? 'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] border-[rgba(37,99,235,0.2)]'
        : 'bg-transparent text-[var(--sand-muted)] border-[rgba(15,39,71,0.06)] hover:border-[rgba(15,39,71,0.12)] hover:text-[var(--sand)]'
    }`;

  return (
    <Card className="overflow-hidden border-[rgba(15,39,71,0.06)]">
      {/* Header: title + search */}
      <div className="px-5 sm:px-6 pt-5 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-sora font-bold text-[var(--sand)]">{t('recentDocs')}</h2>
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]" />
            <input
              type="text"
              placeholder={tc('search')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-lg text-xs text-[var(--sand)] focus:outline-none focus:ring-1 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all"
            />
          </div>
        </div>
        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {TYPE_FILTERS.map((tf) => (
            <button key={tf} type="button" onClick={() => onTypeFilterChange(tf)} className={filterChipClass(typeFilter === tf)}>
              {tf === 'ALL' ? t('allTypes') : DOC_TYPE_CONFIG[tf.toLowerCase()]?.label || tf}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="px-6 pb-6 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-14 bg-[var(--navy-3)] rounded-xl animate-pulse" />)}
        </div>
      ) : docs.length === 0 ? (
        <EmptyState
          hasAnyDocs={totalDocs > 0}
          hasSearch={!!searchQuery || typeFilter !== 'ALL'}
          t={t}
          tc={tc}
          onClear={() => { onSearchChange(''); onTypeFilterChange('ALL'); }}
          onCreate={(type) => router.push(`/dashboard/editor?type=${type}`)}
        />
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden">
            {docs.map((doc) => {
              const cfg = DOC_TYPE_CONFIG[doc.type.toLowerCase()];
              return (
                <div key={doc.id} onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}
                  className="flex items-center gap-3 px-5 py-3 border-t border-[rgba(15,39,71,0.04)] active:bg-[rgba(15,39,71,0.03)] transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg?.bg || ''} ${cfg?.text || ''} ${cfg?.border || ''}`}>
                        {cfg?.label || doc.type}
                      </span>
                      <span className="font-mono text-[11px] text-[var(--sand-muted)] truncate">{doc.number || '—'}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--sand)] truncate">{doc.client || '—'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-sm font-bold text-[var(--sand)] whitespace-nowrap">{doc.total} {tc('currency')}</span>
                    <StatusBadge status={doc.status} label={tc(STATUS_LABELS[doc.status] || 'draft')} />
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteRequest(doc.id); }}
                    className="shrink-0 -me-1 p-2 text-red-400/70 active:text-red-400 active:bg-red-400/10 rounded-lg transition-colors" aria-label={tc('delete')}>
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[rgba(15,39,71,0.06)]">
                  <SortHeader column="number" label={t('tableNumber')} current={sortBy} dir={sortOrder} onSort={onSortChange} />
                  <SortHeader column="client"  label={t('tableClient')}  current={sortBy} dir={sortOrder} onSort={onSortChange} />
                  <SortHeader column="type"    label={t('tableType')}    current={sortBy} dir={sortOrder} onSort={onSortChange} />
                  <SortHeader column="total"   label={t('tableTotal')}   current={sortBy} dir={sortOrder} onSort={onSortChange} align="right" />
                  <SortHeader column="status"  label={t('tableStatus')}  current={sortBy} dir={sortOrder} onSort={onSortChange} />
                  <th className="px-6 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(15,39,71,0.04)]">
                {docs.map((doc) => (
                  <tr key={doc.id} className="group hover:bg-[rgba(15,39,71,0.02)] transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/editor?id=${doc.id}`)}>
                    <td className="px-6 py-3 text-sm font-mono text-[var(--sand)]">{doc.number || '—'}</td>
                    <td className="px-6 py-3 text-sm text-[var(--sand-2)] max-w-xs truncate">{doc.client || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.bg || ''} ${DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.text || ''} ${DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.border || ''}`}>
                        {DOC_TYPE_CONFIG[doc.type.toLowerCase()]?.label || doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-[var(--sand)] text-right">{doc.total} {tc('currency')}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={doc.status} label={tc(STATUS_LABELS[doc.status] || 'draft')} />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/editor?id=${doc.id}`); }}
                          className="p-1.5 text-[var(--sand-muted)] hover:text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.1)] rounded-lg transition-all" title={t('view')}>
                          <Eye size={14} />
                        </button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); onDeleteRequest(doc.id); }}
                          className="p-1.5 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title={tc('delete')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[rgba(15,39,71,0.06)]">
              <span className="text-[11px] text-[var(--sand-muted)]">{page} / {totalPages}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1}
                  className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border',
                    page <= 1
                      ? 'opacity-50 cursor-not-allowed border-[rgba(15,39,71,0.04)] text-[var(--sand-muted)]/50'
                      : 'border-[rgba(15,39,71,0.06)] hover:border-[rgba(15,39,71,0.14)] text-[var(--sand-muted)] hover:text-[var(--sand)]')}>
                  <ChevronLeft size={14} /> {tc('back')}
                </button>
                <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
                  className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border',
                    page >= totalPages
                      ? 'opacity-50 cursor-not-allowed border-[rgba(37,99,235,0.1)] bg-[rgba(37,99,235,0.05)] text-[var(--green-3)]/50'
                      : 'border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] hover:bg-[rgba(37,99,235,0.15)]')}>
                  {t('next')} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ── Sub-components ── */

function EmptyState({ hasAnyDocs, hasSearch, t, tc, onClear, onCreate }: {
  hasAnyDocs: boolean; hasSearch: boolean;
  t: ReturnType<typeof useTranslations>; tc: ReturnType<typeof useTranslations>;
  onClear: () => void; onCreate: (type: string) => void;
}) {
  if (hasSearch) {
    return (
      <div className="text-center py-14 px-6">
        <div className="w-12 h-12 bg-[var(--navy-3)] text-[var(--sand-muted)] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FileStack size={24} />
        </div>
        <p className="text-sm font-bold text-[var(--sand)] mb-1">{t('noResults')}</p>
        <p className="text-xs text-[var(--sand-muted)] mb-5">{t('noResultsDesc')}</p>
        <button type="button" onClick={onClear}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--navy-3)] text-[var(--sand-muted)] text-[11px] font-bold hover:bg-[var(--navy-4)] hover:text-[var(--sand)] transition-all">
          <X size={13} /> {t('clearFilters')}
        </button>
      </div>
    );
  }

  if (!hasAnyDocs) {
    return (
      <div className="text-center py-14 px-6">
        <div className="w-14 h-14 bg-[var(--navy-3)] text-[var(--sand-muted)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FileStack size={28} />
        </div>
        <p className="text-sm font-bold text-[var(--sand)] mb-1">{t('emptyTitle')}</p>
        <p className="text-xs text-[var(--sand-muted)] mb-5">{t('emptyDesc')}</p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" onClick={() => onCreate('devis')}>
            <Plus size={15} className="me-1" /> {t('createFirstDevis')}
          </Button>
          <Button variant="ghost" onClick={() => onCreate('facture')}>
            <Plus size={15} className="me-1" /> {t('createFirstFacture')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const styles: Record<string, string> = {
    DRAFT:     'bg-[var(--navy-4)] text-[var(--sand-muted)] border-[rgba(15,39,71,0.1)]',
    SENT:      'bg-amber-400/10 text-amber-400 border-amber-400/20',
    PAID:      'bg-[rgba(37,99,235,0.1)] text-[var(--green-3)] border-[rgba(37,99,235,0.2)]',
    DELIVERED: 'bg-teal-400/10 text-teal-400 border-teal-400/20',
    ACCEPTED:  'bg-blue-400/10 text-blue-400 border-blue-400/20',
    PROGRESS:  'bg-purple-400/10 text-purple-400 border-purple-400/20',
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles[status] || styles.DRAFT}`}>
      {label}
    </span>
  );
}

function SortHeader({ column, label, current, dir, onSort, align }: {
  column: string; label: string; current: string; dir: string;
  onSort: (c: string) => void; align?: 'left' | 'right';
}) {
  const active = current === column;
  return (
    <th className={`px-6 py-3 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      <button type="button" onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
          active ? 'text-[var(--green-3)]' : 'text-[var(--sand-muted)] hover:text-[var(--sand)]'
        }`}>
        {label}
        <ArrowUpDown size={11} className={active ? 'opacity-100' : 'opacity-30'} />
      </button>
    </th>
  );
}
