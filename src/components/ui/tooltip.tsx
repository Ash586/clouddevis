'use client';

import { useState, useId, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom';
}

export function Tooltip({ children, content, side = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const tipId = useId();
  const childRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => setShow(true);
  const hideTooltip = () => setShow(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      <div ref={childRef} aria-describedby={show ? tipId : undefined}>
        {children}
      </div>
      {show && (
        <div
          id={tipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2 py-1 text-[10px] font-medium text-[var(--sand)] bg-[var(--navy-4)] rounded-lg shadow-sm whitespace-nowrap pointer-events-none animate-fade-in',
            side === 'top' ? 'bottom-full mb-1.5 left-1/2 -translate-x-1/2' : 'top-full mt-1.5 left-1/2 -translate-x-1/2',
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
