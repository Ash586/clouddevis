'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom';
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={cn(
          'absolute z-50 px-2 py-1 text-[10px] font-medium text-[var(--sand)] bg-[var(--navy-4)] rounded-lg shadow-sm whitespace-nowrap pointer-events-none animate-fade-in',
          side === 'top' ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2' : 'top-full mt-1.5 left-1/2 -translate-x-1/2',
        )}>
          {content}
        </div>
      )}
    </div>
  );
}
