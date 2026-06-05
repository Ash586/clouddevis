import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">404</h1>
        <p className="text-sm text-slate-500 mb-6">Cette page est introuvable ou n&apos;existe pas encore.</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
