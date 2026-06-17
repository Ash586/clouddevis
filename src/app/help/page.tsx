import Link from 'next/link';
import { HelpSearch } from '@/components/help/HelpSearch';
import { HelpCategories } from '@/components/help/HelpCategories';
import { HelpPopular } from '@/components/help/HelpPopular';
import { HelpContact } from '@/components/help/HelpContact';

export default function HelpPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3" style={{ color: '#0B3D2E' }}>
          Centre d&apos;aide CloudDevis
        </h1>
        <p className="text-[13px] text-[#666] max-w-lg mx-auto">
          Trouvez des réponses à vos questions, consultez nos tutoriels et guides complets.
        </p>
      </div>

      {/* Search */}
      <HelpSearch />

      {/* Categories */}
      <section className="mt-10">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999] mb-4">Explorer par catégorie</h2>
        <HelpCategories />
      </section>

      {/* Popular articles */}
      <section className="mt-12">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999] mb-4">Articles populaires</h2>
        <HelpPopular />
      </section>

      {/* Contact */}
      <section className="mt-12">
        <HelpContact />
      </section>
    </div>
  );
}
