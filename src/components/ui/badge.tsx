import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'bg-[var(--navy-3)] text-[var(--sand-muted)] border-[rgba(245,237,214,0.1)]',
  success: 'bg-[rgba(0,149,77,0.1)] text-[var(--green-3)] border-[rgba(0,149,77,0.2)]',
  warning: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  danger: 'bg-red-400/10 text-red-400 border-red-400/20',
  info: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
};

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
