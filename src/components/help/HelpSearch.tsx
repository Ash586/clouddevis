'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { HelpLang } from '@/lib/helpTranslations';
import { hT } from '@/lib/helpTranslations';

const ARTICLES = [
  { titleFr: 'Créer un devis', titleAr: 'إنشاء عرض سعر', titleEn: 'Create a quote', slug: 'creer-devis', category: 'documents', keywords: 'devis créer nouveau prix' },
  { titleFr: 'Créer une facture', titleAr: 'إنشاء فاتورة', titleEn: 'Create an invoice', slug: 'creer-facture', category: 'documents', keywords: 'facture créer invoice' },
  { titleFr: 'Le Timbre Fiscal', titleAr: 'الطابع الضريبي', titleEn: 'Stamp Duty', slug: 'timbre-fiscal', category: 'legal', keywords: 'timbre fiscal tax stamp algérie' },
  { titleFr: 'Calculer la TVA', titleAr: 'حساب TVA', titleEn: 'Calculate VAT', slug: 'calculer-tva', category: 'legal', keywords: 'tva 19% 9% calculer' },
  { titleFr: 'NIF, RC, NIS, AI', titleAr: 'NIF, RC, NIS, AI', titleEn: 'NIF, RC, NIS, AI', slug: 'nif-rc-nis-ai', category: 'legal', keywords: 'nif rc nis ai numéro identifiant' },
  { titleFr: 'Configurer mon profil', titleAr: 'إعداد ملفي الشخصي', titleEn: 'Configure profile', slug: 'profil', category: 'account', keywords: 'profil compte settings' },
  { titleFr: 'Ajouter un client', titleAr: 'إضافة عميل', titleEn: 'Add a client', slug: 'ajouter-client', category: 'documents', keywords: 'client customer ajout' },
  { titleFr: 'Gérer les paiements', titleAr: 'إدارة المدفوعات', titleEn: 'Manage payments', slug: 'paiements', category: 'billing', keywords: 'paiement payment banque rib' },
  { titleFr: 'Exporter en PDF', titleAr: 'تصدير PDF', titleEn: 'Export to PDF', slug: 'exporter-pdf', category: 'documents', keywords: 'pdf export imprimer' },
  { titleFr: 'Problèmes de connexion', titleAr: 'مشاكل تسجيل الدخول', titleEn: 'Login issues', slug: 'connexion', category: 'troubleshooting', keywords: 'connexion login password problème' },
  { titleFr: 'Modes Artisan / Entreprise', titleAr: 'أوضاع الحرفي / المؤسسة', titleEn: 'Artisan / Company modes', slug: 'modes', category: 'account', keywords: 'artisan entreprise mode' },
  { titleFr: 'Les types de documents', titleAr: 'أنواع الوثائق', titleEn: 'Document types', slug: 'types-documents', category: 'documents', keywords: 'devis facture proforma bon commande' },
];

const CAT_ICONS: Record<string, string> = {
  documents: '📄', legal: '⚖️', billing: '💰', account: '👤', troubleshooting: '🔧',
};

interface Props {
  lang: HelpLang;
}

export function HelpSearch({ lang }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = (key: string) => hT(lang, key);

  const results = query.length >= 2
    ? ARTICLES.filter(a =>
        a.titleFr.toLowerCase().includes(query.toLowerCase()) ||
        a.titleAr.includes(query) ||
        a.titleEn.toLowerCase().includes(query.toLowerCase()) ||
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
      <div className="flex items-center bg-white border border-[#E4E0D8] rounded-xl px-4 py-3 shadow-sm focus-within:shadow-md focus-within:border-[#1E40AF] transition">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mr-2">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#BBB]"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setOpen(false); }} className="text-[#BBB] hover:text-[#666] text-[14px] ml-2">&times;</button>
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
              <span className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: '#1E40AF' }}>
                {CAT_ICONS[a.category] || '📖'}
              </span>
              <div>
                <div className="text-[12px] font-semibold text-[#161616]">{lang === 'ar' ? a.titleAr : lang === 'en' ? a.titleEn : a.titleFr}</div>
                <div className="text-[10px] text-[#999] capitalize">{a.category}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {open && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E0D8] rounded-xl shadow-lg p-6 text-center z-50">
          <div className="text-[13px] text-[#999]">{t('noResults')} &ldquo;{query}&rdquo;</div>
          <Link href="#contact" onClick={() => setOpen(false)} className="text-[12px] font-semibold mt-2 inline-block" style={{ color: '#1E40AF' }}>{t('contactSupport')} &rarr;</Link>
        </div>
      )}
    </div>
  );
}
