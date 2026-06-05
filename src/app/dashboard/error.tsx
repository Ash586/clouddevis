'use client';

import { useEffect } from 'react';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-4">
        <div className="text-4xl mb-3">⚠️</div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Une erreur est survenue</h2>
        <p className="text-sm text-slate-500 mb-4">Veuillez réessayer ou nous contacter si le problème persiste.</p>
        <button onClick={reset} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition">
          Réessayer
        </button>
      </div>
    </div>
  );
}
