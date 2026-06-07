'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  const tc = useTranslations('common');
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-4">
        <svg className="w-12 h-12 text-amber-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        <h2 className="text-lg font-bold text-slate-900 mb-2">{tc('unexpectedError')}</h2>
        <p className="text-sm text-slate-500 mb-4">{tc('errorDescription')}</p>
        <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition">
          {tc('retry')}
        </button>
      </div>
    </div>
  );
}
