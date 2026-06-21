'use client';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'interactive';
}

export function Card({ variant = 'default', className, children, onClick, ...props }: CardProps) {
  const base = 'rounded-2xl border transition-all duration-200';

  const variants = {
    default: 'bg-[var(--navy-2)] border-[var(--border)] shadow-xl p-4 sm:p-6 hover:border-[var(--border-2)]',
    elevated: 'bg-[var(--navy-2)] border-transparent shadow-2xl p-4 sm:p-6',
    outlined: 'bg-transparent border-[var(--border)] p-4 sm:p-6',
    interactive: 'bg-[var(--navy-2)] border-[var(--border)] shadow-lg p-4 sm:p-6 hover:border-[var(--green-2)] hover:shadow-xl hover:-translate-y-0.5 cursor-pointer',
  };

  return (
    <div
      className={cn(base, variants[variant], className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e as unknown as React.MouseEvent<HTMLDivElement>); } } : undefined}
      aria-pressed={onClick ? undefined : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
