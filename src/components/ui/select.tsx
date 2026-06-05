'use client';
import { cn } from '@/lib/utils';

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: Props) {
  const iid = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={iid} className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={iid}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all',
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
