import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategory, getArticlesByCategory, CATEGORIES } from '@/lib/helpData';

export function generateStaticParams() {
  return CATEGORIES.map(c => ({ category: c.id }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category);
  if (!cat) return { title: 'Catégorie introuvable' };
  return { title: `${cat.icon} ${cat.title}`, description: cat.description };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  const articles = getArticlesByCategory(params.category);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-[#999] mb-6">
        <Link href="/help" className="hover:text-[#1E40AF] transition">Centre d&apos;aide</Link>
        <span>/</span>
        <span className="text-[#161616] font-semibold">{cat.title}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <span className="w-12 h-12 rounded-xl flex items-center justify-center text-[22px] shrink-0" style={{ background: cat.color + '12' }}>
          {cat.icon}
        </span>
        <div>
          <h1 className="text-xl font-black tracking-tight" style={{ color: cat.color }}>{cat.title}</h1>
          <p className="text-[12px] text-[#999] mt-0.5">{cat.description}</p>
        </div>
      </div>

      {/* Articles */}
      <div className="space-y-2">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/help/${params.category}/${a.slug}`}
            className="flex items-center justify-between bg-white border border-[#E4E0D8] rounded-lg px-4 py-3.5 hover:shadow-sm hover:border-[#1E40AF]/20 transition group"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: cat.color + '10', color: cat.color }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </span>
              <div>
                <div className="text-[13px] font-semibold text-[#161616] group-hover:text-[#1E40AF] transition">{a.title}</div>
                <div className="text-[11px] text-[#999] mt-0.5">{a.description}</div>
              </div>
            </div>
            <span className="text-[10px] text-[#BBB] shrink-0">{a.readTime}</span>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12 text-[13px] text-[#999]">
          Aucun article dans cette catégorie pour le moment.
        </div>
      )}
    </div>
  );
}
