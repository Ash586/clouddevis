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
    <div className="flex flex-col min-h-dvh bg-[#F3F6FC]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-[rgba(15,39,71,0.09)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-[#2563EB] via-[#1E40AF] to-[#2563EB]" />
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-extrabold text-[#2563EB]">{t('docs.title')}</h1>
          <button
            onClick={onNewDocument}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/25 active:scale-95 transition-all"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B85]" />
            <input
              type="text"
              placeholder={t('docs.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[rgba(15,39,71,0.09)] bg-[#EDF2FB] py-2.5 pl-9 pr-8 text-sm text-[#2563EB] placeholder-[#5A6B85] focus:border-[#2563EB] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A6B85] hover:text-[#2563EB]">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="mt-2 flex items-center gap-2 text-xs font-bold text-[#33425C]"
          >
            <Filter size={14} />
            {t('docs.filterAll')}
            {activeFilters > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-1 text-[9px] font-bold text-white">
                {activeFilters}
              </span>
            )}
            <ChevronDown size={12} className={cn('transition-transform', showFilters && 'rotate-180')} />
          </button>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 flex flex-wrap gap-2"
            >
              {/* Type filter */}
              {(['', 'DEVIS', 'FACTURE'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    filterType === type
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[rgba(15,39,71,0.09)] bg-white text-[#33425C] hover:bg-[#EDF2FB]',
                  )}
                >
                  {type || t('docs.filterAll')}
                </button>
              ))}

              {/* Status filter */}
              {(['', 'PAID', 'SENT', 'DRAFT'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    filterStatus === status
                      ? 'bg-[#2563EB] text-white'
                      : 'border border-[rgba(15,39,71,0.09)] bg-white text-[#33425C] hover:bg-[#EDF2FB]',
                  )}
                >
                  {status || t('docs.filterAll')}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Pull to refresh */}
      {(pull > 0 || refreshing) && (
        <div className="flex items-center justify-center py-2">
          <div className={cn('h-5 w-5 rounded-full border-2 border-[#2563EB]/30 border-t-[#2563EB] animate-spin', !refreshing && 'opacity-50')} />
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB]/5">
              <FileText size={28} className="text-[#2563EB]/30" />
            </div>
            <p className="text-sm font-bold text-[#2563EB]">{t('docs.empty')}</p>
            <p className="mt-1 text-xs text-[#5A6B85]">{t('docs.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-2">
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
