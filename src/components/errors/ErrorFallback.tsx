'use client';

export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-red-200/50 bg-white p-6 shadow-sm dark:border-red-950/50 dark:bg-slate-900">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Erreur inattendue</p>
        <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-50">Une erreur est survenue</h1>
        <p className="mb-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          L&apos;erreur a été transmise à notre équipe. Vous pouvez réessayer ou revenir plus tard.
        </p>
        <button
          type="button"
          onClick={resetError}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          Réessayer
        </button>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-5 max-h-48 overflow-auto rounded-lg bg-slate-950 p-3 text-left text-xs text-red-200">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
