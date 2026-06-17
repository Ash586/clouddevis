import Link from 'next/link';

const POPULAR = [
  { title: 'Créer un devis professionnel', slug: 'creer-devis', category: 'documents', time: '3 min' },
  { title: 'Comprendre le Timbre Fiscal', slug: 'timbre-fiscal', category: 'legal', time: '5 min' },
  { title: 'Configurer vos informations entreprise', slug: 'profil', category: 'account', time: '4 min' },
  { title: 'Exporter vos documents en PDF', slug: 'exporter-pdf', category: 'documents', time: '2 min' },
  { title: 'Résoudre les problèmes de connexion', slug: 'connexion', category: 'troubleshooting', time: '3 min' },
];

export function HelpPopular() {
  return (
    <div className="space-y-2">
      {POPULAR.map((a) => (
        <Link
          key={a.slug}
          href={`/help/${a.category}/${a.slug}`}
          className="flex items-center justify-between bg-white border border-[#E4E0D8] rounded-lg px-4 py-3 hover:shadow-sm hover:border-[#0B3D2E]/20 transition group"
        >
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: '#0B3D2E10', color: '#0B3D2E' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </span>
            <span className="text-[12px] font-semibold text-[#161616] group-hover:text-[#0B3D2E] transition">{a.title}</span>
          </div>
          <span className="text-[10px] text-[#BBB]">{a.time}</span>
        </Link>
      ))}
    </div>
  );
}
