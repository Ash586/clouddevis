'use client';

import { useState, useRef } from 'react';
import { Plus, FileText, Copy, X } from 'lucide-react';
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
    { label: 'Devis', icon: FileText, onClick: () => { onNewDevis(); setOpen(false); }, color: '#2563EB' },
    { label: 'Facture', icon: FileText, onClick: () => { onNewFacture(); setOpen(false); }, color: '#E8542E' },
  ];
  if (canDuplicate && onDuplicate) {
    actions.push({ label: 'Duplicate', icon: Copy, onClick: () => { onDuplicate(); setOpen(false); }, color: '#D4A843' });
  }

  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom,0px)]">
      {/* Action items */}
      {open && actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex items-center gap-2 rounded-xl border border-[rgba(15,39,71,0.09)] bg-white px-4 py-2.5 shadow-lg transition-all active:scale-[0.97] animate-in slide-in-from-bottom-2 fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Icon size={16} style={{ color: action.color }} />
            <span className="text-sm font-bold text-[#2563EB]">{action.label}</span>
          </button>
        );
      })}

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30 transition-all active:scale-95',
          open && 'rotate-45 bg-[#E8542E] shadow-[#E8542E]/30',
        )}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}
