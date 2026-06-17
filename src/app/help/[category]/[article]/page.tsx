import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategory, getArticle, getArticlesByCategory, CATEGORIES } from '@/lib/helpData';
import { HelpArticleContent } from '@/components/help/HelpArticleContent';

export function generateStaticParams() {
  const params: { category: string; article: string }[] = [];
  for (const cat of CATEGORIES) {
    const articles = getArticlesByCategory(cat.id);
    for (const a of articles) {
      params.push({ category: cat.id, article: a.slug });
    }
  }
  return params;
}

export function generateMetadata({ params }: { params: { category: string; article: string } }) {
  const article = getArticle(params.category, params.article);
  if (!article) return { title: 'Article introuvable' };
  return { title: article.title, description: article.description };
}

export default function ArticlePage({ params }: { params: { category: string; article: string } }) {
  const cat = getCategory(params.category);
  if (!cat) notFound();

  const article = getArticle(params.category, params.article);
  if (!article) notFound();

  const siblings = getArticlesByCategory(params.category);
  const currentIdx = siblings.findIndex(a => a.slug === params.article);
  const prev = currentIdx > 0 ? siblings[currentIdx - 1] : null;
  const next = currentIdx < siblings.length - 1 ? siblings[currentIdx + 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-[#999] mb-6">
        <Link href="/help" className="hover:text-[#0B3D2E] transition">Centre d&apos;aide</Link>
        <span>/</span>
        <Link href={`/help/${params.category}`} className="hover:text-[#0B3D2E] transition">{cat.title}</Link>
        <span>/</span>
        <span className="text-[#161616] font-semibold">{article.title}</span>
      </nav>

      {/* Article */}
      <article className="bg-white border border-[#E4E0D8] rounded-xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] shrink-0" style={{ background: cat.color + '12' }}>
            {cat.icon}
          </span>
          <div>
            <h1 className="text-lg font-black tracking-tight" style={{ color: '#161616' }}>{article.title}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-[#999]">{article.readTime} de lecture</span>
              {article.tags.map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#F0EFEC] text-[#999] font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <HelpArticleContent content={article.content} />
      </article>

      {/* Navigation */}
      <div className="flex justify-between mt-6 gap-4">
        {prev ? (
          <Link
            href={`/help/${params.category}/${prev.slug}`}
            className="flex-1 bg-white border border-[#E4E0D8] rounded-lg px-4 py-3 hover:shadow-sm hover:border-[#0B3D2E]/20 transition group text-left"
          >
            <div className="text-[9px] text-[#999] uppercase tracking-wider font-bold mb-1">&larr; Précédent</div>
            <div className="text-[12px] font-semibold text-[#161616] group-hover:text-[#0B3D2E] transition">{prev.title}</div>
          </Link>
        ) : <div className="flex-1" />}
        {next ? (
          <Link
            href={`/help/${params.category}/${next.slug}`}
            className="flex-1 bg-white border border-[#E4E0D8] rounded-lg px-4 py-3 hover:shadow-sm hover:border-[#0B3D2E]/20 transition group text-right"
          >
            <div className="text-[9px] text-[#999] uppercase tracking-wider font-bold mb-1">Suivant &rarr;</div>
            <div className="text-[12px] font-semibold text-[#161616] group-hover:text-[#0B3D2E] transition">{next.title}</div>
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </div>
  );
}
