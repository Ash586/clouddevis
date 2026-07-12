'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { track, PAGE_EVENTS } from '@/lib/analytics';

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="bg-[var(--navy-2)]/95 backdrop-blur-lg border-t border-[var(--border)] px-4 py-3">
        <Link
          href="/auth/register"
          onClick={() => track(PAGE_EVENTS.CTA_CLICK, { location: 'sticky_mobile', label: 'Créer un devis' })}
          className="flex items-center justify-center gap-2 w-full py-3.5 min-h-[52px] rounded-xl bg-[var(--green-2)] text-white text-sm font-bold shadow-lg shadow-[rgba(37,99,235,0.3)] active:scale-[0.98] transition no-underline"
        >
          <FileText size={18} />
          Créer un devis
        </Link>
      </div>
    </div>
  );
}
