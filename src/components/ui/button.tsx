'use client';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-glow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy)]';

  const variants: Record<string, string> = {
    primary: 'bg-[var(--green-2)] hover:bg-[var(--green-3)] text-white shadow-lg shadow-[rgba(0,122,64,0.3)] hover:shadow-[rgba(0,149,77,0.4)] hover:-translate-y-0.5',
    secondary: 'bg-[var(--navy-3)] hover:bg-[var(--navy-4)] text-[var(--sand)] border border-[rgba(245,237,214,0.1)]',
    ghost: 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[rgba(245,237,214,0.06)]',
    outline: 'bg-transparent border border-[rgba(245,237,214,0.14)] text-[var(--sand-2)] hover:bg-[rgba(245,237,214,0.06)] hover:text-[var(--sand)]',
    gold: 'bg-[var(--gold)] hover:bg-[var(--gold-2)] text-[var(--navy)] shadow-lg shadow-[rgba(212,168,67,0.25)] hover:shadow-[rgba(212,168,67,0.4)] hover:-translate-y-0.5',
    danger: 'bg-[var(--stamp-red)] hover:bg-[#d0461e] text-white shadow-lg shadow-[rgba(232,84,46,0.25)] hover:shadow-[rgba(232,84,46,0.4)] hover:-translate-y-0.5',
  };

  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 min-h-[44px] text-xs gap-1.5',
    md: 'px-5 py-2.5 min-h-[44px] text-sm gap-2',
    lg: 'px-7 py-3.5 min-h-[48px] text-base gap-2.5',
  };

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading ? <span className="sr-only">Chargement...</span> : children}
    </button>
  );
}
