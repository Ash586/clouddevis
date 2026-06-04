'use client';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border animate-in zoom-in-95">
        <h3 className="text-lg font-black text-slate-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
