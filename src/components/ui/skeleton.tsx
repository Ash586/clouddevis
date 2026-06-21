import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of skeleton lines to render (default 1) */
  lines?: number;
}

export function Skeleton({ className, lines, ...props }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="space-y-2" aria-hidden="true" role="presentation">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn('animate-pulse rounded-xl bg-[var(--navy-3)]', i < lines - 1 ? 'h-4' : 'h-4 w-3/4', className)}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={cn('animate-pulse rounded-xl bg-[var(--navy-3)]', className)}
      {...props}
    />
  );
}
