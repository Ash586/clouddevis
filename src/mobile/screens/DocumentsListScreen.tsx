'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, Plus, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { useMobileI18n } from '@/mobile/lib/i18n';
import { DocumentRow } from '../components/DocumentRow';
import { usePullToRefresh } from '@/mobile/lib/usePullToRefresh';
import { refreshAllData } from '@/mobile/lib/useApiSync';
import type { Document, DocumentType, DocumentStatus } from '@/mobile/types';

interface DocumentsListScreenProps {
  onNewDocument?: () => void;
  onEditDocument?: (doc: Document) => void;
  onDuplicateDocument?: (doc: Document) => void;
}

export function DocumentsListScreen({ onNewDocument, onEditDocument, onDuplicateDocument }: DocumentsListScreenProps) {
  const { t } = useMobileI18n();
  const savedDocuments = useDocumentStore((s) => s.savedDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType | ''>('');
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const { pull, refreshing, handlers: pullHandlers } = usePullToRefresh(
    useCallback(async () => { await refreshAllData(); }, []),
  );

  const filtered = useMemo(() => {
    return savedDocuments.filter((doc) => {
      const matchesSearch = !searchQuery ||
        doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.client?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || doc.type === filterType;
      const matchesStatus = !filterStatus || doc.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [savedDocuments, searchQuery, filterType, filterStatus]);

  const activeFilters = (filterType ? 1 : 0) + (filterStatus ? 1 : 0);

  return (
    <div className="flex flex-col min-h-dvh bg-[#F8FAFD]">
      {/* Header */}
      <div className="sticky z-10 bg-white/95 backdrop-blur border-b border-[rgba(0,26,77,0.06)]" style={{ top: 'var(--sat, env(safe-area-inset-top, 0px))' }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#001A4D] via-[#0052CC] to-[#001A4D]" />
        <div className="flex items-center justify-between px-4 py-2.5">
          <h1 className="text-base font-extrabold text-[#001A4D]">{t('docs.title')}</h1>
          <button
            onClick={onNewDocument}
            aria-label="Nouveau document"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052CC] text-white shadow-sm shadow-[#0052CC]/20 transition-all duration-200 hover:bg-[#0047B3] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              placeholder={t('docs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('docs.searchPlaceholder')}
              className="w-full rounded-lg border border-[rgba(0,26,77,0.06)] bg-[#F0F4FF] py-2 pl-8 pr-7 text-xs text-[#001A4D] placeholder-[#718096] transition-colors duration-200 focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/15"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} aria-label="Effacer" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#0052CC] transition-colors duration-150">
                <X size={12} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-[#4A5568] transition-colors duration-150 hover:text-[#0052CC]"
          >
            <Filter size={12} />
            {t('docs.filterAll')}
            {activeFilters > 0 && (
              <span className="flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#0052CC] px-1 text-[8px] font-bold text-white">
                {activeFilters}
              </span>
            )}
            <ChevronDown size={10} className={cn('transition-transform duration-200', showFilters && 'rotate-180')} />
          </button>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-2 flex flex-wrap gap-1.5"
            >
              {(['', 'DEVIS', 'FACTURE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all duration-150',
                    filterType === type
                      ? 'bg-[#0052CC] text-white'
                      : 'border border-[rgba(0,26,77,0.06)] bg-white text-[#4A5568] hover:bg-[#E6F0FF]',
                  )}
                >
                  {type || t('docs.filterAll')}
                </button>
              ))}
              {(['', 'PAID', 'SENT', 'DRAFT'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all duration-150',
                    filterStatus === status
                      ? 'bg-[#0052CC] text-white'
                      : 'border border-[rgba(0,26,77,0.06)] bg-white text-[#4A5568] hover:bg-[#E6F0FF]',
                  )}
                >
                  {status || t('docs.filterAll')}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {(pull > 0 || refreshing) && (
        <div className="flex items-center justify-center py-1.5">
          <div className={cn('h-4 w-4 rounded-full border-2 border-[#0052CC]/30 border-t-[#0052CC] animate-spin', !refreshing && 'opacity-50')} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0052CC]/5">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                <rect x="8" y="6" width="24" height="32" rx="3" stroke="#0052CC" strokeWidth="2" opacity="0.25" />
                <rect x="16" y="14" width="24" height="32" rx="3" fill="white" stroke="#0052CC" strokeWidth="2" />
                <line x1="22" y1="22" x2="34" y2="22" stroke="#0052CC" strokeWidth="1.5" opacity="0.4" />
                <line x1="22" y1="28" x2="30" y2="28" stroke="#0052CC" strokeWidth="1.5" opacity="0.3" />
                <line x1="22" y1="34" x2="32" y2="34" stroke="#0052CC" strokeWidth="1.5" opacity="0.2" />
              </svg>
            </div>
            <p className="text-sm font-bold text-[#0052CC]">{t('docs.empty')}</p>
            <p className="mt-1 text-xs text-[#718096]">{t('docs.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                onTap={() => onEditDocument?.(doc)}
                onDuplicate={() => onDuplicateDocument?.(doc)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
