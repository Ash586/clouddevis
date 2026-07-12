'use client';

// ============================================================
// Rakmana Mobile — Document Row Skeleton
// Pulse placeholder shown while documents are loading.
// ============================================================

import { cn } from '@/lib/utils';

function Pulse({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg bg-[var(--navy-3)] animate-pulse', className)} />
  );
}

export function DocumentRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--navy-2)] border border-[var(--border)] mb-3">
      {/* Type icon placeholder */}
      <Pulse className="w-10 h-10 rounded-xl flex-shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <Pulse className="h-3.5 w-32" />
        <Pulse className="h-2.5 w-20" />
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <Pulse className="h-5 w-16 rounded-full" />
        <Pulse className="h-3.5 w-12" />
      </div>
    </div>
  );
}

export function DocumentListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <DocumentRowSkeleton key={i} />
      ))}
    </div>
  );
}
