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
        <label htmlFor={iid} className="block text-xs font-semibold text-[var(--sand-muted)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        id={iid}
        className={cn(
          'w-full rounded-xl border border-[rgba(15,39,71,0.1)] bg-[var(--navy-2)] px-3.5 py-2.5 text-sm text-[var(--sand)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--green-glow)] focus:border-[var(--green-2)] transition-all',
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
