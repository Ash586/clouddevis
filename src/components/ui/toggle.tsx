'use client';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, checked, onChange }: Props) {
  return (
    <label className="flex items-center justify-between py-1.5 cursor-pointer group">
      <span className="text-sm text-slate-700 group-hover:text-slate-900 transition">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30',
          checked ? 'bg-blue-600' : 'bg-slate-200'
        )}
      >
        <span className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )} />
      </button>
    </label>
  );
}
