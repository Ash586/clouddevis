'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TrendingUp, Share2, DollarSign, Users, ShieldCheck, ArrowRight, CheckCircle, Clock, CreditCard } from 'lucide-react';

export default function PartnersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ background: 'var(--navy)' }}>
      <nav className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 no-underline" style={{ color: 'var(--sand)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ background: 'var(--navy-3, #1C2537)' }}>CD</div>
            CloudDevis
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-semibold min-h-[44px] flex items-center px-4 no-underline" style={{ color: 'var(--sand-muted)' }}>Connexion</Link>
            <Link href="/auth/register" className="text-sm font-semibold px-4 py-2.5 rounded-lg text-white min-h-[44px] flex items-center no-underline" style={{ background: 'var(--green-2, #006233)' }}>S&apos;inscrire</Link>
          </div>
        </div>
      </nav>

      <section className="px-4 sm:px-6 pt-12 sm:pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold mb-6" style={{ background: 'rgba(0,98,51,0.1)', color: 'var(--green-3)', border: '1px solid rgba(0,98,51,0.2)' }}>
            <TrendingUp className="w-4 h-4" />
            Programme d&apos;affiliation CloudDevis
          </div>
          <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight" style={{ color: 'var(--sand)' }}>
            Gagnez <span style={{ color: 'var(--green-3)' }}>20%</span> de commission<br />sur chaque abonnement
          </h1>
          <p className="text-base sm:text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--sand-muted)' }}>
            Partagez votre lien de parrainage. Quand un utilisateur s&apos;inscrit et souscrit un abonnement payant, vous touchez votre commission.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => router.push('/auth/register?intent=partner')}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white min-h-[44px] transition-all active:scale-[0.98]"
              style={{ background: 'var(--green-2, #006233)' }}
            >
              Rejoindre le programme <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-xl text-sm font-semibold min-h-[44px]"
              style={{ background: 'var(--navy-2, #111827)', color: 'var(--sand-muted)', border: '1px solid rgba(245,237,214,0.08)' }}
            >
              En savoir plus
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <DollarSign className="w-6 h-6" />, value: '20%', label: 'Commission directe', color: 'var(--green-3)' },
              { icon: <Share2 className="w-6 h-6" />, value: 'Illimité', label: 'Parrainages', color: 'var(--gold)' },
              { icon: <Clock className="w-6 h-6" />, value: '30 jours', label: 'Durée d\'attribution', color: '#a78bfa' },
              { icon: <CreditCard className="w-6 h-6" />, value: '2 000 DA', label: 'Paiement minimum', color: 'var(--green-3)' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl p-5 text-center" style={{ background: 'var(--navy-2, #111827)', border: '1px solid rgba(245,237,214,0.06)' }}>
                <div className="flex justify-center mb-3" style={{ color: stat.color }}>{stat.icon}</div>
                <p className="text-2xl font-black mb-1" style={{ color: 'var(--sand)' }}>{stat.value}</p>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--sand-muted)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-4 sm:px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12" style={{ color: 'var(--sand)' }}>Comment ça marche</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', icon: <Share2 className="w-6 h-6" />, title: 'Partagez votre lien', desc: 'Rejoignez le programme et obtenez votre code de parrainage unique. Partagez-le sur vos réseaux.' },
              { step: '2', icon: <Users className="w-6 h-6" />, title: 'Inscriptions via votre lien', desc: 'Les nouveaux utilisateurs qui s\'inscrivent avec votre lien sont automatiquement associés à votre compte.' },
              { step: '3', icon: <DollarSign className="w-6 h-6" />, title: 'Gagnez des commissions', desc: 'Dès qu\'un parrainé active un abonnement payant, vous recevez 20% de commission.' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-6 relative" style={{ background: 'var(--navy-2, #111827)', border: '1px solid rgba(245,237,214,0.06)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-sm font-bold" style={{ background: 'rgba(0,98,51,0.15)', color: 'var(--green-3)' }}>{item.step}</div>
                <div className="mb-3" style={{ color: 'var(--green-3)' }}>{item.icon}</div>
                <h3 className="text-base font-bold mb-2" style={{ color: 'var(--sand)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--sand-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl p-8" style={{ background: 'var(--navy-2, #111827)', border: '1px solid rgba(245,237,214,0.06)' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--sand)' }}>Règles de transparence</h2>
            <div className="space-y-4">
              {[
                { icon: <CheckCircle className="w-5 h-5" />, text: 'La commission de 20% est calculée sur le montant TTC de l\'abonnement payant activé par votre parrainé.' },
                { icon: <CheckCircle className="w-5 h-5" />, text: 'Le paiement est disponible dès que vos commissions en attente atteignent 2 000 DA.' },
                { icon: <CheckCircle className="w-5 h-5" />, text: 'Votre lien d\'affiliation a une durée d\'attribution de 30 jours après le premier clic.' },
                { icon: <CheckCircle className="w-5 h-5" />, text: 'Les commissions sont uniquement validées après activation d\'un abonnement payant (hors essai gratuit).' },
                { icon: <ShieldCheck className="w-5 h-5" />, text: 'Les Super Affiliates gagnent en plus 5% sur les ventes de leur équipe de parrainés.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0" style={{ color: 'var(--green-3)' }}>{item.icon}</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--sand-muted)' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--sand)' }}>Prêt à gagner des commissions ?</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--sand-muted)' }}>Rejoignez des centaines de partenaires qui génèrent déjà des revenus avec CloudDevis.</p>
          <button
            onClick={() => router.push('/auth/register?intent=partner')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white min-h-[44px] mx-auto transition-all active:scale-[0.98]"
            style={{ background: 'var(--green-2, #006233)' }}
          >
            Commencer maintenant <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <footer className="px-4 sm:px-6 py-8" style={{ borderTop: '1px solid rgba(245,237,214,0.06)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm no-underline" style={{ color: 'var(--sand-muted)' }}>CloudDevis</Link>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="text-xs no-underline" style={{ color: 'var(--sand-muted)' }}>Confidentialité</Link>
            <Link href="/legal/cgu" className="text-xs no-underline" style={{ color: 'var(--sand-muted)' }}>CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
