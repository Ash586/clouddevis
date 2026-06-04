'use client';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-sm p-6', className)} {...props}>
      {children}
    </div>
  );
}
