'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, User, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientData {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  nif?: string;
  nis?: string;
  rc?: string;
  ai?: string;
}

interface Props {
  value: string;
  onSelect: (client: ClientData) => void;
  placeholder?: string;
}

export function ClientCombobox({ value, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClientData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) { setResults([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/clients?search=${encodeURIComponent(q)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.clients ?? []);
        }
      } catch {}
      setLoading(false);
    }, 250);
  }, []);

  useEffect(() => { search(query); }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (client: ClientData) => {
    onSelect(client);
    setQuery('');
    setOpen(false);
    setHighlightIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx(i => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      select(results[highlightIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--sand-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={value ? '' : query}
            placeholder={placeholder || 'Rechercher un client...'}
            className="w-full bg-[var(--navy-3)] border p-2 pl-7 pr-7 rounded-lg text-[11px] font-medium outline-none focus:ring-2 focus:ring-[var(--green-2)]"
            onFocus={() => { if (query.trim()) setOpen(true); }}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlightIdx(-1); }}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--sand-muted)] hover:text-[var(--sand)]">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {value && (
        <div className="mt-1.5 flex items-center gap-1.5 bg-[var(--green-glow)] border border-[rgba(37,99,235,0.2)] rounded-lg px-2.5 py-1.5">
          <User size={12} className="text-[var(--green-3)] shrink-0" />
          <span className="text-[11px] font-bold text-[var(--green-3)] flex-1 truncate">{value}</span>
          <button type="button" onClick={() => onSelect({ id: '', name: '' })} className="text-[var(--green-3)] hover:text-red-400 transition shrink-0">
            <X size={12} />
          </button>
        </div>
      )}

      {open && results.length > 0 && (
        <div ref={listRef} className="absolute top-full left-0 right-0 mt-1 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl z-[70] max-h-[240px] overflow-y-auto">
          {loading && <div className="px-3 py-2 text-[10px] text-[var(--sand-muted)]">Recherche...</div>}
          {!loading && results.map((client, i) => (
            <button type="button" key={client.id} onClick={() => select(client)}
              className={cn(
                'w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition border-b border-[rgba(15,39,71,0.04)] last:border-0',
                i === highlightIdx ? 'bg-[var(--navy-4)]' : 'hover:bg-[var(--navy-3)]',
              )}>
              <div className="w-7 h-7 rounded-lg bg-[var(--green-glow)] flex items-center justify-center shrink-0">
                <User size={13} className="text-[var(--green-3)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-[var(--sand)] truncate">{client.name}</div>
                <div className="flex items-center gap-2 text-[9px] text-[var(--sand-muted)]">
                  {client.phone && <span>{client.phone}</span>}
                
                </div>
              </div>
              <Check size={12} className={cn('shrink-0', value === client.name ? 'text-[var(--green-3)]' : 'text-transparent')} />
            </button>
          ))}
        </div>
      )}

      {open && query.trim() && !loading && results.length === 0 && (
        <div ref={listRef} className="absolute top-full left-0 right-0 mt-1 bg-[var(--navy-2)] border border-[rgba(15,39,71,0.1)] rounded-xl shadow-2xl z-[70] px-3 py-4 text-center">
          <p className="text-[11px] text-[var(--sand-muted)]">Aucun client trouvé</p>
          <p className="text-[9px] text-[var(--sand-muted)] mt-1">Entrez le nom pour créer un nouveau client</p>
        </div>
      )}
    </div>
  );
}
