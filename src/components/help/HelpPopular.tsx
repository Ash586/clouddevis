import Link from 'next/link';
import type { HelpLang } from '@/lib/helpTranslations';

const POPULAR = [
  { titleFr: 'Créer un devis professionnel', titleAr: 'إنشاء عرض سعر احترافي', titleEn: 'Create a professional quote', slug: 'creer-devis', category: 'documents', time: 3 },
  { titleFr: 'Comprendre le Timbre Fiscal', titleAr: 'فهم الطابع الضريبي', titleEn: 'Understanding Stamp Duty', slug: 'timbre-fiscal', category: 'legal', time: 5 },
  { titleFr: 'Configurer vos informations entreprise', titleAr: 'إعداد معلومات المؤسسة', titleEn: 'Configure company info', slug: 'profil', category: 'account', time: 4 },
  { titleFr: 'Exporter vos documents en PDF', titleAr: 'تصدير الوثائق PDF', titleEn: 'Export documents to PDF', slug: 'exporter-pdf', category: 'documents', time: 2 },
  { titleFr: 'Résoudre les problèmes de connexion', titleAr: 'حل مشاكل تسجيل الدخول', titleEn: 'Fix login issues', slug: 'connexion', category: 'troubleshooting', time: 3 },
];

const MIN_LABEL: Record<HelpLang, string> = { fr: 'min', ar: 'دقيقة', en: 'min' };

interface Props {
  lang: HelpLang;
}

export function HelpPopular({ lang }: Props) {
  return (
    <div className="space-y-2">
      {POPULAR.map((a) => (
        <Link
          key={a.slug}
          href={`/help/${a.category}/${a.slug}`}
          className="flex items-center justify-between bg-white border border-[#E4E0D8] rounded-lg px-4 py-3 hover:shadow-sm hover:border-[#1E40AF]/20 transition group"
        >
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ background: '#1E40AF10', color: '#1E40AF' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </span>
            <span className="text-[12px] font-semibold text-[#161616] group-hover:text-[#1E40AF] transition">
              {lang === 'ar' ? a.titleAr : lang === 'en' ? a.titleEn : a.titleFr}
            </span>
          </div>
          <span className="text-[10px] text-[#BBB]">{a.time} {MIN_LABEL[lang]}</span>
        </Link>
      ))}
    </div>
  );
}
