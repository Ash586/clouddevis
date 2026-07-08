import Link from 'next/link';

const CATEGORIES = [
  { id: 'getting-started', title: 'Démarrage rapide', desc: 'Premiers pas avec Rakmana', icon: '🚀', color: '#1E40AF', articles: 4 },
  { id: 'documents', title: 'Créer des documents', desc: 'Devis, factures, proformas', icon: '📄', color: '#1A6B4F', articles: 6 },
  { id: 'billing', title: 'Facturation & paiement', desc: 'Gestion des paiements', icon: '💰', color: '#C4A35A', articles: 5 },
  { id: 'legal', title: 'Conformité légale', desc: 'NIF, RC, TVA, Timbre fiscal', icon: '⚖️', color: '#2E60B0', articles: 5 },
  { id: 'troubleshooting', title: 'Résolution de problèmes', desc: 'Aide et dépannage', icon: '🔧', color: '#B05A2E', articles: 5 },
  { id: 'account', title: 'Compte & paramètres', desc: 'Profil, sécurité, équipe', icon: '👤', color: '#6B2E8B', articles: 5 },
];

export function HelpCategories() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.id}
          href={`/help/${cat.id}`}
          className="group bg-white border border-[#E4E0D8] rounded-xl p-4 hover:shadow-md hover:border-[#1E40AF]/20 transition-all"
        >
          <div className="flex items-start gap-3">
            <span className="w-10 h-10 rounded-lg flex items-center justify-center text-[18px] shrink-0" style={{ background: cat.color + '10' }}>
              {cat.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-[#161616] group-hover:text-[#1E40AF] transition">{cat.title}</div>
              <div className="text-[11px] text-[#999] mt-0.5">{cat.desc}</div>
            </div>
            <span className="text-[10px] font-bold text-[#CCC] shrink-0">{cat.articles} articles</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
