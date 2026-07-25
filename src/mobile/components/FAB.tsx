'use client';

import { useState } from 'react';
import { Plus, FileText, Receipt, Copy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FABProps {
  onNewDevis: () => void;
  onNewFacture: () => void;
  onDuplicate?: () => void;
  canDuplicate?: boolean;
}

export function FAB({ onNewDevis, onNewFacture, onDuplicate, canDuplicate }: FABProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: 'Devis', icon: FileText, onClick: () => { onNewDevis(); setOpen(false); }, color: '#0052CC', bg: 'bg-[#0052CC]/8' },
    { label: 'Facture', icon: Receipt, onClick: () => { onNewFacture(); setOpen(false); }, color: '#D4A843', bg: 'bg-[#D4A843]/10' },
  ];
  if (canDuplicate && onDuplicate) {
    actions.push({ label: 'Dupliquer', icon: Copy, onClick: () => { onDuplicate(); setOpen(false); }, color: '#001A4D', bg: 'bg-[#001A4D]/5' });
  }

  return (
    <div className="fixed right-3 bottom-24 z-40 flex flex-col items-end gap-2.5 pb-[env(safe-area-inset-bottom,0px)]">
      {open && actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            aria-label={action.label}
            className="flex items-center gap-2 rounded-xl border border-[rgba(0,26,77,0.06)] bg-white px-3.5 py-2 shadow-lg shadow-[#001A4D]/8 transition-all duration-200 hover:shadow-xl active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0052CC]/40"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${action.bg}`}>
              <Icon size={14} style={{ color: action.color }} />
            </div>
            <span className="text-sm font-bold text-[#001A4D]">{action.label}</span>
          </button>
        );
      })}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fermer' : 'Nouveau document'}
        className={cn(
          'flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0052CC] text-white shadow-lg shadow-[#0052CC]/30 transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/50',
          open && 'rotate-45 bg-[#DC3545] shadow-[#DC3545]/30',
        )}
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>
    </div>
  );
}
