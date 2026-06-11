'use client';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-[var(--navy-2)] rounded-2xl border border-[rgba(245,237,214,0.08)] shadow-xl p-4 sm:p-6 transition-all hover:border-[rgba(245,237,214,0.15)]', className)} {...props}>
      {children}
    </div>
  );
}
