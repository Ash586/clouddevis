'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const ARTICLES = [
  { title: 'Créer un devis', slug: 'creer-devis', category: 'documents', keywords: 'devis créer nouveau prix' },
  { title: 'Créer une facture', slug: 'creer-facture', category: 'documents', keywords: 'facture créer invoice' },
  { title: 'Le Timbre Fiscal', slug: 'timbre-fiscal', category: 'legal', keywords: 'timbre fiscal tax stamp algérie' },
  { title: 'Calculer la TVA', slug: 'calculer-tva', category: 'legal', keywords: 'tva 19% 9% calculer' },
  { title: 'NIF, RC, NIS, AI', slug: 'nif-rc-nis-ai', category: 'legal', keywords: 'nif rc nis ai numéro identifiant' },
  { title: 'Configurer mon profil', slug: 'profil', category: 'account', keywords: 'profil compte settings' },
  { title: 'Ajouter un client', slug: 'ajouter-client', category: 'documents', keywords: 'client customer ajout' },
  { title: 'Gérer les paiements', slug: 'paiements', category: 'billing', keywords: 'paiement payment banque rib' },
  { title: 'Exporter en PDF', slug: 'exporter-pdf', category: 'documents', keywords: 'pdf export imprimer' },
  { title: 'Problèmes de connexion', slug: 'connexion', category: 'troubleshooting', keywords: 'connexion login password problème' },
  { title: 'Modes Artisan / Entreprise', slug: 'modes', category: 'account', keywords: 'artisan entreprise mode' },
  { title: 'Les types de documents', slug: 'types-documents', category: 'documents', keywords: 'devis facture proforma bon commande' },
];

export function HelpSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results = query.length >= 2
    ? ARTICLES.filter(a =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.keywords.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative max-w-xl mx-auto">
      <div className="flex items-center bg-white border border-[#E4E0D8] rounded-xl px-4 py-3 shadow-sm focus-within:shadow-md focus-within:border-[#0B3D2E] transition">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mr-2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#BBB]"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-[#BBB] hover:text-[#666] text-[14px] ml-2">&times;</button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E0D8] rounded-xl shadow-lg overflow-hidden z-50">
          {results.map((a) => (
            <Link
              key={a.slug}
              href={`/help/${a.category}/${a.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[#F8F7F4] transition border-b border-[#F0EFEC] last:border-0"
            >
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: '#0B3D2E' }}>
                {a.category === 'documents' ? '📄' : a.category === 'legal' ? '⚖️' : a.category === 'billing' ? '💰' : a.category === 'account' ? '👤' : '🔧'}
              </span>
              <div>
                <div className="text-[12px] font-semibold text-[#161616]">{a.title}</div>
                <div className="text-[10px] text-[#999] capitalize">{a.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E0D8] rounded-xl shadow-lg p-6 text-center z-50">
          <div className="text-[13px] text-[#999]">Aucun résultat pour &ldquo;{query}&rdquo;</div>
          <Link href="#contact" onClick={() => setOpen(false)} className="text-[12px] font-semibold mt-2 inline-block" style={{ color: '#0B3D2E' }}>Contacter le support &rarr;</Link>
        </div>
      )}
    </div>
  );
}
