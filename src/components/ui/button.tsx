'use client';
import { cn } from '@/lib/utils';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: Props) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none font-sora';
  
  const variants: Record<string, string> = {
    primary: 'bg-[var(--green-2)] hover:bg-[var(--green-3)] text-white shadow-lg shadow-[rgba(0,122,64,0.3)] hover:shadow-[rgba(0,149,77,0.4)] hover:-translate-y-0.5',
    secondary: 'bg-[var(--navy-3)] hover:bg-[var(--navy-4)] text-[var(--sand)] border border-[rgba(245,237,214,0.1)]',
    ghost: 'text-[var(--sand-muted)] hover:text-[var(--sand)] hover:bg-[rgba(245,237,214,0.06)]',
    outline: 'bg-transparent border border-[rgba(245,237,214,0.14)] text-[var(--sand-2)] hover:bg-[rgba(245,237,214,0.06)] hover:text-[var(--sand)]',
    gold: 'bg-[var(--gold)] hover:bg-[var(--gold-2)] text-[var(--navy)] shadow-lg shadow-[rgba(212,168,67,0.25)] hover:shadow-[rgba(212,168,67,0.4)] hover:-translate-y-0.5',
  };
  
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };
  
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
