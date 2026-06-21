import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-[var(--navy)]">
      <div className="text-center max-w-sm animate-in">
        <div className="w-16 h-16 bg-[var(--green-bg)] text-[var(--green-3)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
        </div>
        <h1 className="text-4xl font-black text-[var(--sand)] mb-2">404</h1>
        <p className="text-sm text-[var(--sand-muted)] mb-6">Cette page est introuvable ou n&apos;existe pas encore.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-[var(--green-2)] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-[var(--green-3)] transition">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}