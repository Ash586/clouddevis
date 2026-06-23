import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const variants = {
  default: 'bg-[var(--navy-3)] text-[var(--sand-muted)] border-[rgba(15,39,71,0.1)]',
  success: 'bg-[var(--green-bg)] text-[var(--green-3)] border-[rgba(37,99,235,0.2)]',
  warning: 'bg-[rgba(245,158,11,0.1)] text-[var(--cd-warning)] border-[rgba(245,158,11,0.2)]',
  danger: 'bg-[rgba(232,84,46,0.1)] text-[var(--stamp-red)] border-[rgba(232,84,46,0.2)]',
  info: 'bg-[rgba(74,158,255,0.1)] text-[var(--cd-info)] border-[rgba(74,158,255,0.2)]',
};

export function Badge({ variant = 'default', className, role, ...props }: BadgeProps) {
  return (
    <span
      role={role || (variant !== 'default' ? 'status' : undefined)}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
