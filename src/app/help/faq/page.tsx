import Link from 'next/link';
import { HelpFAQ } from '@/components/help/HelpFAQ';

export const metadata = {
  title: 'Questions fréquentes',
  description: 'Trouvez rapidement des réponses aux questions les plus courantes sur CloudDevis.',
};

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[11px] text-[#999] mb-6">
        <Link href="/help" className="hover:text-[#0B3D2E] transition">Centre d&apos;aide</Link>
        <span>/</span>
        <span className="text-[#161616] font-semibold">Questions fréquentes</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-[20px]" style={{ background: '#0B3D2E10' }}>
          ❓
        </div>
        <h1 className="text-xl font-black tracking-tight mb-2" style={{ color: '#0B3D2E' }}>Questions fréquentes</h1>
        <p className="text-[12px] text-[#999]">Trouvez rapidement des réponses à vos questions</p>
      </div>

      {/* FAQ */}
      <HelpFAQ />

      {/* Contact */}
      <div className="mt-10 text-center bg-white border border-[#E4E0D8] rounded-xl p-6">
        <p className="text-[12px] text-[#666] mb-3">Vous n&apos;avez pas trouvé votre réponse ?</p>
        <a
          href="mailto:support@clouddevis.com"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-bold text-white transition hover:opacity-90"
          style={{ background: '#0B3D2E' }}
        >
          Contacter le support
        </a>
      </div>
    </div>
  );
}
