import Link from 'next/link';

export const metadata = {
  title: 'Centre d\'aide',
  description: 'Centre d\'aide Rakmana — Trouvez des réponses à vos questions, tutoriels et guides complets.',
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <header className="sticky top-0 z-50 bg-white border-b border-[#E4E0D8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-[15px] tracking-tight" style={{ color: '#1E40AF' }}>
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] font-black" style={{ background: '#1E40AF' }}>CD</span>
            Rakmana
          </Link>
          <nav className="flex items-center gap-4 text-[12px] font-semibold">
            <Link href="/help" className="text-[#1E40AF] hover:underline">Centre d&apos;aide</Link>
            <Link href="/legal/cgu" className="text-[#666] hover:text-[#1E40AF] transition">CGU</Link>
            <Link href="/" className="text-[#666] hover:text-[#1E40AF] transition">Accueil</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
