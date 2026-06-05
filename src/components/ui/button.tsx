'use client';
import { cn } from '@/lib/utils';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: Props) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none';
  const variants: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200',
    ghost: 'text-slate-600 hover:bg-slate-100',
    outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
  };
  const sizes: Record<string, string> = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-6 sm:px-8 py-3 sm:py-4 text-sm gap-2',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
