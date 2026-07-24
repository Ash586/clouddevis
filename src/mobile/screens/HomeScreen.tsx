'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Shield, FileText, Calculator, Globe, Download, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileI18n } from '@/mobile/lib/i18n';

interface HomeScreenProps {
  onLogin: () => void;
  onRegister: () => void;
}

const FEATURES = [
  { icon: Shield, title: 'Conforme DGI', desc: 'Vérification NIF, RC, TVA et Timbre Fiscal automatique', color: '#2563EB' },
  { icon: FileText, title: 'Tous documents', desc: 'Devis, Facture, Proforma, Bon de Commande et plus', color: '#1D4ED8' },
  { icon: Calculator, title: 'Calculs auto', desc: 'TVA 9%/19% et Timbre Fiscal calculés en temps réel', color: '#0EA5E9' },
  { icon: Globe, title: 'Multi-langues', desc: 'Français, Arabe et Anglais avec support RTL', color: '#7C3AED' },
];

const STEPS = [
  { num: '1', title: 'Entrez vos infos', desc: 'NIF, RC — une seule fois' },
  { num: '2', title: 'Choisissez le type', desc: 'Devis, Facture, Proforma…' },
  { num: '3', title: 'Ajoutez vos articles', desc: 'TVA calculée automatiquement' },
  { num: '4', title: 'Téléchargez le PDF', desc: 'Conforme, prêt à envoyer' },
];

const FAQ = [
  { q: 'Le Timbre Fiscal est-il géré automatiquement ?', a: "Oui : le Timbre Fiscal est ajouté dès que le montant atteint 10 000 DA sur une facture." },
  { q: 'Puis-je essayer gratuitement ?', a: "Oui : avec le plan gratuit vous pouvez créer jusqu'à 5 documents par mois." },
  { q: 'Mes données sont-elles sécurisées ?', a: "Vos données sont protégées par un chiffrement HTTPS et stockées dans votre compte privé." },
  { q: 'Rakmana fonctionne-t-il sur mobile ?', a: "Oui : le site s'adapte à tous les écrans, ou vous pouvez télécharger l'application." },
];

export function HomeScreen({ onLogin, onRegister }: HomeScreenProps) {
  const { t, locale, dir } = useMobileI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div dir={dir} className="min-h-dvh bg-[#F3F6FC]">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(15,39,71,0.08)] bg-white/85 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#0EA5E9] flex items-center justify-center">
              <span className="text-white font-extrabold text-xs">CD</span>
            </div>
            <span className="font-extrabold text-[#0F2747] text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>Rakmana</span>
          </div>
          <button onClick={() => setMenuOpen((v) => !v)} className="w-10 h-10 flex items-center justify-center rounded-lg text-[#33425C] hover:bg-[#EDF2FB] transition">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-[rgba(15,39,71,0.06)] bg-white/95 backdrop-blur-lg">
            {['Fonctionnalités', 'Tarifs', 'FAQ'].map((item) => (
              <button key={item} onClick={() => setMenuOpen(false)} className="block w-full text-left px-5 py-3.5 text-sm font-medium text-[#33425C] hover:bg-[#EDF2FB] transition border-b border-[rgba(15,39,71,0.04)] last:border-0">
                {item}
              </button>
            ))}
            <div className="p-4 flex gap-2">
              <button onClick={() => { setMenuOpen(false); onLogin(); }} className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[rgba(15,39,71,0.14)] text-[#33425C] hover:bg-[#EDF2FB] transition">Connexion</button>
              <button onClick={() => { setMenuOpen(false); onRegister(); }} className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-lg shadow-[rgba(37,99,235,0.25)] transition">S'inscrire</button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="px-5 pt-8 pb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[rgba(37,99,235,0.09)] text-[#1D4ED8] border border-[rgba(37,99,235,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] shadow-[0_0_6px_#1D4ED8]" />
            Conforme DGI Algérie
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[rgba(212,168,67,0.12)] text-[#C77D11] border border-[rgba(212,168,67,0.3)]">
            Gratuit pour démarrer
          </span>
        </div>

        <h1 className="text-[26px] leading-tight font-extrabold text-[#0F2747] mb-3" style={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.5px' }}>
          Vos devis & factures conformes en 2 minutes
        </h1>
        <p className="text-sm leading-relaxed text-[#5A6B85] mb-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Arrêtez de perdre du temps et de l'argent à cause de documents non conformes : Rakmana vérifie NIF, RC, TVA et Timbre Fiscal pour vous.
        </p>

        <button onClick={onRegister} className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#2563EB] text-white shadow-lg shadow-[rgba(37,99,235,0.3)] hover:bg-[#1D4ED8] active:scale-[0.98] transition min-h-[52px]">
          Créer mon devis conforme maintenant
        </button>

        {/* Trust chips */}
        <div className="flex gap-2 overflow-x-auto mt-5 pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {[
            'Aucune carte requise',
            '5 documents/mois offerts',
            'Support en Arabe & Français',
          ].map((item) => (
            <span key={item} className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#EDF2FB] text-[#5A6B85] border border-[rgba(15,39,71,0.08)]">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#1D4ED8" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#1D4ED8" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-[rgba(30,64,175,0.04)] border-y border-[rgba(15,39,71,0.06)]">
        <div className="grid grid-cols-2 gap-px bg-[rgba(15,39,71,0.06)]">
          {[
            { value: '2 500+', label: 'Documents générés' },
            { value: '800+', label: 'Entreprises inscrites' },
            { value: '48', label: 'Wilayas couvertes' },
            { value: '100%', label: 'Conformité DGI' },
          ].map((s) => (
            <div key={s.label} className="bg-white px-4 py-4 text-center">
              <div className="text-lg font-bold text-[#0F2747]" style={{ fontFamily: "'Sora', sans-serif" }}>{s.value}</div>
              <div className="text-[10px] font-semibold text-[#5A6B85] uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="px-5 py-8">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-1.5 block">Ce qui nous différencie</span>
          <h2 className="text-xl font-bold text-[#0F2747]" style={{ fontFamily: "'Sora', sans-serif" }}>Tout ce dont votre TPE a besoin</h2>
        </div>
        <div className="space-y-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white rounded-2xl border border-[rgba(15,39,71,0.08)] p-4 hover:border-[rgba(37,99,235,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(15,39,71,0.10)]">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${f.color}12` }}>
                    <Icon size={20} style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2747] mb-0.5" style={{ fontFamily: "'Sora', sans-serif" }}>{f.title}</h3>
                    <p className="text-xs text-[#5A6B85] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-5 py-8 bg-white border-y border-[rgba(15,39,71,0.06)]">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-1.5 block">Simple comme bonjour</span>
          <h2 className="text-xl font-bold text-[#0F2747]" style={{ fontFamily: "'Sora', sans-serif" }}>De zéro à facture en 4 étapes</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {STEPS.map((s) => (
            <div key={s.num} className="bg-[#F3F6FC] rounded-xl p-3.5 border border-[rgba(15,39,71,0.06)]">
              <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white text-[11px] font-bold flex items-center justify-center mb-2">{s.num}</div>
              <div className="text-[13px] font-bold text-[#0F2747] mb-0.5" style={{ fontFamily: "'Sora', sans-serif" }}>{s.title}</div>
              <div className="text-[11px] text-[#5A6B85]">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 py-8">
        <div className="text-center mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#2563EB] mb-1.5 block">Questions fréquentes</span>
          <h2 className="text-xl font-bold text-[#0F2747]" style={{ fontFamily: "'Sora', sans-serif" }}>Tout ce que vous voulez savoir</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-[rgba(15,39,71,0.08)] overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
                <span className="text-[13px] font-semibold text-[#0F2747] pr-3">{item.q}</span>
                <ChevronRight size={16} className={cn('shrink-0 text-[#5A6B85] transition-transform', openFaq === i && 'rotate-90')} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3.5 text-xs text-[#5A6B85] leading-relaxed border-t border-[rgba(15,39,71,0.04)] pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 py-8 bg-white border-t border-[rgba(15,39,71,0.06)]">
        <div className="text-center">
          <h2 className="text-lg font-bold text-[#0F2747] mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
            Votre premier devis conforme vous attend
          </h2>
          <p className="text-xs text-[#5A6B85] mb-5">
            Rejoignez 800+ entreprises algériennes qui génèrent leurs documents fiscaux sans stress.
          </p>
          <button onClick={onRegister} className="w-full py-3.5 rounded-xl text-sm font-bold bg-[#2563EB] text-white shadow-lg shadow-[rgba(37,99,235,0.3)] hover:bg-[#1D4ED8] active:scale-[0.98] transition min-h-[52px]">
            Créer mon devis maintenant →
          </button>
          <p className="text-[10px] text-[#5A6B85] mt-3">
            ✓ Gratuit · ✓ Sans carte · ✓ Conforme DGI dès le premier document
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-5 py-6 bg-[#F3F6FC] border-t border-[rgba(15,39,71,0.06)]">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#1E40AF] to-[#0EA5E9] flex items-center justify-center">
              <span className="text-white font-extrabold text-[8px]">CD</span>
            </div>
            <span className="font-extrabold text-[#0F2747] text-xs" style={{ fontFamily: "'Sora', sans-serif" }}>Rakmana</span>
          </div>
          <p className="text-[10px] text-[#5A6B85]">© 2026 Rakmana. Tous droits réservés. 🇩🇿 Made in Algeria.</p>
        </div>
      </footer>

      {/* ── STICKY BOTTOM CTA ── */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[rgba(15,39,71,0.08)] bg-white/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-2 p-3">
          <button onClick={onLogin} className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[rgba(15,39,71,0.14)] text-[#33425C] hover:bg-[#EDF2FB] transition min-h-[48px]">
            Connexion
          </button>
          <button onClick={onRegister} className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#2563EB] text-white shadow-lg shadow-[rgba(37,99,235,0.25)] hover:bg-[#1D4ED8] transition min-h-[48px]">
            Créer un compte
          </button>
        </div>
      </div>
    </div>
  );
}
