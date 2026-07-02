import Link from 'next/link';
import { LandingAnimations, LandingFAQ, LangSwitcher } from '@/components/landing/LandingPageClient';
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA';
import { NavAuthCta } from '@/components/landing/NavAuthCta';
import { PLANS, formatPrice } from '@/lib/pricing';

const FAQ_ITEMS = [
   { q: 'Le Timbre Fiscal est-il géré automatiquement ?', a: "Oui : le Timbre Fiscal est ajouté dès que le montant atteint 10 000 DA sur une facture (les devis ne sont pas concernés)." },
   { q: 'Puis-je essayer CloudDevis gratuitement ?', a: "Oui : avec le plan gratuit vous pouvez créer jusqu’à 5 documents par mois, suffit pour tester." },
   { q: 'Mes données sont-elles sécurisées ?', a: "Vos données sont protégées par un chiffrement HTTPS et stockées dans votre compte privé – aucun accès tiers." },
   { q: 'CloudDevis fonctionne-t-il sur mobile ?', a: "Oui : le site s’adapte à tous les écrans, vous pouvez créer ou consulter vos documents où que vous soyez, sans installer d’application." },
   { q: 'Comment fonctionne la TVA sur les documents ?', a: "La TVA (9 % ou 19 %) est recalculée à chaque ligne ; vous voyez immédiatement le total HT et TTC, fini les erreurs de calcul." },
   { q: 'Comment payer l’abonnement Pro en Algérie ?', a: "Vous pouvez payer par carte bancaire, virement bancaire ou via les portefeuilles locaux disponibles lors de la souscription ; les options exactes s’affichent dans la page de paiement." },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <div className="landing-body">
        <LandingAnimations>
          {/* ════════════ NAV ════════════ */}
          <nav>
            <div className="container">
              <div className="nav-inner">
                <Link href="/" className="logo">
                  <div className="logo-dot"></div>
                  CloudDevis
                </Link>
                <ul className="nav-links">
                  <li><a href="#features">Fonctionnalités</a></li>
                  <li><a href="#pricing">Tarifs</a></li>
                  <li><a href="#faq">FAQ</a></li>
                </ul>
                <NavAuthCta />
              </div>
            </div>
          </nav>

          {/* ════════════ HERO ════════════ */}
          <section className="hero">
            <div className="container">
              <div className="hero-grid">
                <div>
                  <div className="hero-eyebrow">
                    <span className="badge badge-green">
                      <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="var(--green-3)" /></svg>
                      Conforme DGI Algérie
                    </span>
                    <span className="badge badge-gold">Gratuit pour démarrer</span>
                  </div>
                    <h1 className="hero-title">
                     Vos devis & factures conformes en 2 minutes – zéro erreur, zéro stress
                   </h1>
                   <p className="hero-sub">
                     Arrêtez de perdre du temps et de l’argent à cause de devis non conformes : CloudDevis vérifie NIF, RC, TVA et Timbre Fiscal pour vous, dès la première saisie.
                   </p>
                   <div className="hero-ctas">
                     <Link href="/auth/register" className="btn btn-primary btn-lg" data-plausible="CTA Click" data-event-location="hero" data-event-label="Créer mon devis conforme maintenant">
                       Créer mon devis conforme maintenant
                     </Link>
                   </div>
                  {/* Trust items — horizontal scroll chips on mobile */}
                  <div className="hero-trust-mobile">
                    <div className="trust-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--green-3)" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="var(--green-3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Aucune carte requise
                    </div>
                    <div className="trust-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--green-3)" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="var(--green-3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      5 documents/mois offerts
                    </div>
                    <div className="trust-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--green-3)" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="var(--green-3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Support en Arabe &amp; Français
                    </div>
                  </div>
                </div>

                {/* Desktop hero visual */}
                <div className="hero-visual hero-visual-desktop">
                  <div className="glow-chip chip-1">
                    <div className="chip-dot" style={{ background: 'var(--green-3)', boxShadow: '0 0 6px var(--green-3)' }}></div>
                    TVA calculée automatiquement
                  </div>
                  <div className="glow-chip chip-2">
                    <div className="chip-dot" style={{ background: 'var(--gold-2)', boxShadow: '0 0 6px var(--gold-2)' }}></div>
                    PDF généré en 1 clic
                  </div>
                  <div className="doc-preview">
                    <div className="doc-topbar">
                      <div className="doc-logo-area">
                        <div className="doc-logo-box">SB</div>
                        <div>
                          <div className="doc-company-name">SARL Bâtiment Plus</div>
                          <div className="doc-company-sub">NIF: 00212345678901</div>
                        </div>
                      </div>
                      <div className="doc-type-badge">FACTURE</div>
                    </div>
                    <div className="doc-meta-row">
                      <div className="doc-meta-item"><label>N° Facture</label><span>FAC-2026-042</span></div>
                      <div className="doc-meta-item"><label>Date</label><span>10 juin 2026</span></div>
                      <div className="doc-meta-item"><label>RC</label><span>16/00-1234567B08</span></div>
                      <div className="doc-meta-item"><label>Échéance</label><span>10 juil. 2026</span></div>
                    </div>
                    <table className="doc-table">
                      <thead><tr><th>Désignation</th><th>Qté</th><th>P.U. (DA)</th><th>Total HT</th></tr></thead>
                      <tbody>
                        <tr><td>Installation électrique Type A</td><td>3</td><td>24 000</td><td>72 000</td></tr>
                        <tr><td>{"Main d\u2019œuvre forfait"}</td><td>1</td><td>40 000</td><td>40 000</td></tr>
                      </tbody>
                    </table>
                    <div className="doc-totals">
                      <div className="doc-total-row"><span className="tl">Total HT</span><span className="tv">112 000,00 DA</span></div>
                      <div className="doc-total-row"><span className="tl">TVA (9%)</span><span className="tv">10 080,00 DA</span></div>
                      <div className="doc-total-row"><span className="tl">Timbre fiscal</span><span className="tv">1 000,00 DA</span></div>
                      <div className="doc-total-row grand"><span className="tl">TOTAL TTC</span><span className="tv">123 080,00 DA</span></div>
                    </div>
                  </div>
                </div>

                {/* Compact doc preview for mobile — shown below text */}
                <div className="hero-visual-mobile">
                  <div className="doc-preview doc-preview-compact">
                    <div className="doc-topbar">
                      <div className="doc-logo-area">
                        <div className="doc-logo-box">SB</div>
                        <div>
                          <div className="doc-company-name">SARL Bâtiment Plus</div>
                          <div className="doc-company-sub">NIF: 00212345678901</div>
                        </div>
                      </div>
                      <div className="doc-type-badge">FACTURE</div>
                    </div>
                    <div className="doc-meta-row">
                      <div className="doc-meta-item"><label>N°</label><span>FAC-2026-042</span></div>
                      <div className="doc-meta-item"><label>Date</label><span>10 juin 2026</span></div>
                    </div>
                    <table className="doc-table">
                      <thead><tr><th>Désignation</th><th>Qté</th><th>P.U.</th><th>Total</th></tr></thead>
                      <tbody>
                        <tr><td>Installation élec.</td><td>3</td><td>24 000</td><td>72 000</td></tr>
                        <tr><td>Main d&apos;œuvre</td><td>1</td><td>40 000</td><td>40 000</td></tr>
                      </tbody>
                    </table>
                    <div className="doc-totals">
                      <div className="doc-total-row"><span className="tl">Total HT</span><span className="tv">112 000,00 DA</span></div>
                      <div className="doc-total-row"><span className="tl">TVA (9%)</span><span className="tv">10 080,00 DA</span></div>
                      <div className="doc-total-row grand"><span className="tl">TOTAL TTC</span><span className="tv">123 080,00 DA</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════ STATS ════════════ */}
          <div className="stats-strip">
            <div className="container">
              <div className="stats-grid">
                {[
                  { value: '2 500+', label: 'Documents générés' },
                  { value: '800+', label: 'Entreprises inscrites' },
                  { value: '48', label: 'Wilayas couvertes' },
                  { value: '100%', label: 'Conformité DGI' },
                ].map((s, i) => (
                  <div key={i} className="stat-item animate-on-scroll">
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ════════════ COMPLIANCE ════════════ */}
          <section className="compliance" id="compliance">
            <div className="container">
              <div className="compliance-grid">
                <div className="compliance-fields">
                   {[
                     { icon: '🪪', name: 'NIF', desc: "NIF – vérifié automatiquement pour éviter les amendes de 50 000 DA à 500 000 DA." },
                     { icon: '📋', name: 'RC', desc: "RC – contrôle du format pour empêcher les rejets du registre." },
                     { icon: '🔢', name: 'NIS / AI', desc: "Numéro d\u2019Identification Statistique" },
                     { icon: '💹', name: 'TVA 9%/19%', desc: "TVA 9 %/19 % – calculée en temps réel, vous ne payez jamais trop ou trop peu." },
                     { icon: '🪙', name: 'Timbre Fiscal', desc: "Timbre Fiscal ajouté automatiquement – évitez les redressements de 50 000 DA à 500 000 DA sur chaque facture ≥ 10 000 DA.", span: true },
                   ].map((f, i) => (
                    <div key={i} className="field-tag animate-on-scroll" style={f.span ? { gridColumn: 'span 2' } : {}}>
                      <div className="field-icon">{f.icon}</div>
                      <div>
                        <span className="field-name">{f.name}</span>
                        <span className="field-desc">{f.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="compliance-text">
                  <div className="section-eyebrow">Conformité légale native</div>
                  <h2 className="section-title">Arrêtez de risquer<br />des redressements fiscaux</h2>
                  <p className="section-sub">
                    CloudDevis est conçu dès le premier jour pour répondre aux exigences de la <strong>Direction Générale des Impôts</strong> algérienne. Chaque champ obligatoire est validé, chaque calcul est vérifié.
                  </p>
                  <div className="compliance-warning">
                    <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                    <p>Une facture sans Timbre Fiscal ou avec un NIF incorrect peut entraîner une amende de <strong>50 000 DA à 500 000 DA</strong>. CloudDevis vous protège automatiquement.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════ FEATURES ════════════ */}
          <section className="features" id="features">
            <div className="container">
              <div className="section-head">
                <div className="section-eyebrow">Ce qui nous différencie</div>
                <h2 className="section-title">Tout ce dont votre TPE a besoin</h2>
                <p className="section-sub">Du devis à la facture, en passant par le bon de commande — une seule plateforme, zéro paperasse.</p>
              </div>
              <div className="bento-grid">
                <div className="bento-card bento-span3 bento-big animate-on-scroll">
                  <div className="card-icon icon-green">📄</div>
                   <div className="card-title">Créez devis, factures, proforma, BC ou BR en un seul clic – plus besoin de changer d’outil</div>
                  <div className="card-desc">Devis, Proforma, Bon de Commande, Bon de Réception, Facture. Chaque type avec ses champs spécifiques pré-remplis selon la loi algérienne.</div>
                  <div className="doc-types-row">
                    {['📝 Devis', '📊 Proforma', '🛒 Bon de Commande', '📦 Bon de Réception', '🧾 Facture'].map(d => (
                      <span key={d} className="doc-type-pill">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="bento-card bento-span3 animate-on-scroll">
                  <div className="card-icon icon-gold">⚡</div>
                   <div className="card-title">Obtenez votre PDF prêt à envoyer en moins de 30 secondes – facturez vos clients plus vite</div>
                  <div className="card-desc">Saisissez vos articles, prévisualisez en temps réel, téléchargez le PDF. Le tout sans compte requis pour démarrer.</div>
                  <div className="speed-bar">
                    {[{ label: 'Saisie', pct: 95 }, { label: 'Calcul TVA', pct: 100 }, { label: 'Export PDF', pct: 88 }].map(s => (
                      <div key={s.label} className="speed-row">
                        <span className="s-label">{s.label}</span>
                        <div className="speed-track"><div className="speed-fill" style={{ width: `${s.pct}%` }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bento-card bento-span2 animate-on-scroll">
                  <div className="card-icon icon-teal">👁️</div>
                   <div className="card-title">Voyez exactement ce qui sera imprimé pendant que vous saisissez – fini les surprises à l’impression</div>
                  <div className="card-desc">Voyez votre document se construire en temps réel pendant la saisie. Ce que vous voyez est exactement ce qui est imprimé.</div>
                  <div className="mini-preview">
                    <span className="label">TVA calculée →</span>
                    <span className="value">✓ Automatique</span>
                  </div>
                </div>
                <div className="bento-card bento-span2 animate-on-scroll">
                  <div className="card-icon icon-purple">🌍</div>
                   <div className="card-title">Éditez vos documents en français, arabe ou anglais – choisissez la langue de votre client sans copier‑coller</div>
                  <div className="card-desc">Générez vos documents en français, arabe avec support RTL complet, ou en anglais pour vos clients internationaux.</div>
                  <div className="doc-types-row">
                    <span className="doc-type-pill">🇫🇷 Français</span>
                    <span className="doc-type-pill">🇩🇿 العربية</span>
                    <span className="doc-type-pill">🇬🇧 English</span>
                  </div>
                </div>
                <div className="bento-card bento-span2 animate-on-scroll">
                  <div className="card-icon icon-blue">📍</div>
                   <div className="card-title">Facturez conformément aux règles de l’Algérie, Tunisie, Maroc et France – idéal si vous travaillez à l’international</div>
                  <div className="card-desc">Algérie, Tunisie, Maroc, France. Chaque pays avec ses propres règles fiscales appliquées automatiquement.</div>
                  <div className="doc-types-row">
                    <span className="doc-type-pill">🇩🇿 Algérie</span>
                    <span className="doc-type-pill">🇹🇳 Tunisie</span>
                    <span className="doc-type-pill">🇲🇦 Maroc</span>
                    <span className="doc-type-pill">🇫🇷 France</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════ HOW IT WORKS ════════════ */}
          <section className="how" id="how">
            <div className="container">
              <div className="section-head">
                <div className="section-eyebrow">Simple comme bonjour</div>
                <h2 className="section-title">De zéro à facture<br />en 4 étapes</h2>
              </div>
              <div className="steps-grid">
                {[
                  { num: '1', title: 'Entrez les infos de votre société', desc: 'NIF, RC, adresse — une seule fois. Tout est sauvegardé pour vos prochains documents.' },
                  { num: '2', title: 'Choisissez le type de document', desc: 'Devis, Facture, Proforma, BC ou BR — le bon format est sélectionné automatiquement.' },
                  { num: '3', title: 'Ajoutez vos articles', desc: 'Désignation, quantité, prix unitaire. TVA et Timbre Fiscal calculés en temps réel, sans erreur.' },
                  { num: '4', title: 'Téléchargez le PDF conforme', desc: 'Document 100% légal, prêt à envoyer à votre client ou à présenter à votre comptable.' },
                ].map((s, i) => (
                  <div key={i} className="step-card animate-on-scroll">
                    <div className="step-num">{s.num}</div>
                    <div className="step-title">{s.title}</div>
                    <div className="step-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════ TESTIMONIALS ════════════ */}
          <section className="testimonials" id="testimonials">
            <div className="container">
              <div className="section-head">
                <div className="section-eyebrow">Ils nous font confiance</div>
                <h2 className="section-title">Ce que disent nos utilisateurs</h2>
              </div>
              <div className="testimonials-grid">
                {[
                  { avatar: 'AM', color: 'av-a', name: 'Ahmed M.', role: 'Entrepreneur BTP · Alger', text: "Avant CloudDevis, je passais 2 heures à faire mes factures sur Word. Maintenant c\u2019est 5 minutes, et mon comptable est enfin satisfait de la conformité." },
                  { avatar: 'SB', color: 'av-b', name: 'Samira B.', role: "Architecte d\u2019intérieur · Oran", text: "Le calcul automatique du Timbre Fiscal m\u2019a sauvé d\u2019un redressement. Je ne savais pas que c\u2019était obligatoire sur tous mes devis. Merci CloudDevis !" },
                  { avatar: 'KT', color: 'av-c', name: 'Karim T.', role: 'Comptable indépendant · Constantine', text: "Je gère les devis de 3 artisans depuis CloudDevis. L\u2019interface en arabe est impeccable et mes clients reçoivent des documents parfaitement présentés." },
                ].map((t, i) => (
                  <div key={i} className="tcard animate-on-scroll">
                    <div className="tcard-stars">{'⭐'.repeat(5).split('').map((s, j) => <span key={j}>{s}</span>)}</div>
                    <p className="tcard-text">{t.text}</p>
                    <div className="tcard-author">
                      <div className={`tcard-avatar ${t.color}`}>{t.avatar}</div>
                      <div>
                        <div className="tcard-name">{t.name}</div>
                        <div className="tcard-role">{t.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════ PRICING ════════════ */}
          <section className="pricing" id="pricing">
            <div className="container">
              <div className="section-head">
                <div className="section-eyebrow">Tarifs transparents</div>
                <h2 className="section-title">Choisissez votre formule</h2>
                <p className="section-sub">{"Pas de surprise. Pas d\u2019engagement. Passez à la formule supérieure quand vous en avez besoin."}</p>
              </div>
              <div className="pricing-grid">
                {[{
                  id: 'free', plan: 'Gratuit', amount: '0', period: 'Pour toujours · Sans carte', featured: false,
                  features: [
                    { ok: true, text: `${PLANS.free.limits.docsPerMonth} documents par mois` },
                    { ok: true, text: 'Tous les types de documents' },
                    { ok: true, text: 'Export PDF' },
                    { ok: true, text: 'Calcul TVA automatique' },
                    { ok: false, text: 'Documents illimités' },
                    { ok: false, text: 'Logo entreprise personnalisé' },
                    { ok: false, text: 'Envoi par email' },
                  ],
                  cta: 'Commencer gratuitement', ghost: true, href: '/auth/register',
                }, {
                  id: 'standard', plan: 'Standard', amount: formatPrice(PLANS.standard.price), period: 'par mois · Annulable à tout moment', featured: true, popular: 'Le plus populaire',
                  features: [
                    { ok: true, text: 'Documents illimités' },
                    { ok: true, text: 'Tous les types de documents' },
                    { ok: true, text: 'Export PDF haute qualité' },
                    { ok: true, text: `Jusqu'à ${PLANS.standard.limits.teamMembers} utilisateurs` },
                    { ok: true, text: 'Logo et signature personnalisés' },
                    { ok: true, text: 'Envoi par email direct' },
                    { ok: true, text: `${PLANS.standard.limits.storageMB / 1024} Go de stockage` },
                  ],
                  cta: "Démarrer l'essai gratuit →", ghost: false, href: '/auth/register',
                }, {
                  id: 'enterprise', plan: 'Enterprise', amount: 'Sur mesure', period: 'Devis personnalisé', featured: false, custom: true,
                  features: [
                    { ok: true, text: 'Multi-utilisateurs (équipe)' },
                    { ok: true, text: 'Tableau de bord partagé' },
                    { ok: true, text: 'Accès API (intégration ERP)' },
                    { ok: true, text: 'Formation dédiée' },
                    { ok: true, text: 'SLA garanti' },
                    { ok: true, text: 'Facturation mensuelle ou annuelle' },
                    { ok: true, text: 'Gestionnaire de compte dédié' },
                  ],
                  cta: 'Nous contacter', ghost: true, href: '/enterprise',
                }].map((p, i) => (
                  <div key={i} className={`price-card animate-on-scroll ${p.featured ? 'featured' : ''}`}>
                    {p.popular && <div className="price-popular">{p.popular}</div>}
                    <div className="price-plan">{p.plan}</div>
                    <div className="price-amount" style={p.custom ? { fontSize: 28, marginTop: 7 } : {}}>
                      {p.amount}{!p.custom && <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--sand-muted)' }}>/mois</span>}
                    </div>
                    <div className="price-period">{p.period}</div>
                    <div className="price-divider"></div>
                    <ul className="price-feature-list">
                      {p.features.map((f, j) => (
                        <li key={j}>
                          <span className={f.ok ? 'pf-check' : 'pf-x'}>{f.ok ? '✓' : '–'}</span>
                          {f.text}
                        </li>
                      ))}
                    </ul>
                    <Link href={p.href} className={`btn price-cta ${p.ghost ? 'btn-ghost' : 'btn-primary'}`} data-plausible="CTA Click" data-event-location={`pricing_${p.id}`} data-event-label={p.cta}>{p.cta}</Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════ FAQ ════════════ */}
          <section className="faq" id="faq">
            <div className="container">
              <div className="section-head">
                <div className="section-eyebrow">Questions fréquentes</div>
                <h2 className="section-title">Tout ce que vous voulez savoir</h2>
              </div>
              <LandingFAQ items={FAQ_ITEMS} />
            </div>
          </section>

          {/* ════════════ CTA ════════════ */}
          <section className="cta-section">
            <div className="container">
              <div className="cta-card">
                <h2 className="cta-title">
                  Votre premier devis conforme<br />vous attend — gratuitement
                </h2>
                <p className="cta-sub">
                  Rejoignez 800+ entreprises algériennes qui génèrent leurs documents fiscaux sans stress.
                </p>
                <div className="cta-buttons">
                  <Link href="/auth/register" className="btn btn-primary btn-lg" data-plausible="CTA Click" data-event-location="bottom_cta" data-event-label="Créer mon devis maintenant">Créer mon devis maintenant →</Link>
                </div>
                <p className="cta-note">✓ Gratuit · ✓ Sans carte · ✓ Conforme DGI dès le premier document</p>
              </div>
            </div>
          </section>

          {/* ════════════ FOOTER ════════════ */}
          <footer>
            <div className="container">
              <div className="footer-grid">
                <div className="footer-brand">
                  <Link href="/" className="logo">
                    <div className="logo-dot"></div>
                    CloudDevis
                  </Link>
                  <p>La première plateforme SaaS algérienne de génération de devis et factures conformes à la réglementation DGI. Simple, rapide, légal.</p>
                  <div className="footer-social">
                    <a href="#" className="social-btn" aria-label="Facebook">f</a>
                    <a href="#" className="social-btn" aria-label="LinkedIn">in</a>
                    <a href="#" className="social-btn" aria-label="Instagram">ig</a>
                  </div>
                </div>
                <div className="footer-col">
                  <h5>Produit</h5>
                  <ul>
                    <li><a href="#features">Fonctionnalités</a></li>
                    <li><a href="#pricing">Tarifs</a></li>
                     <li><Link href="/auth/register">Voir une démo en direct</Link></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h5>Aide</h5>
                  <ul>
                    <li><a href="#faq">FAQ</a></li>
                     <li><Link href="/enterprise">Nous contacter par email ou téléphone</Link></li>
                    <li><Link href="/partners">Programme Partenaire</Link></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h5>Légal</h5>
                  <ul>
                    <li><Link href="/legal/cgu">{"Conditions d\u2019utilisation"}</Link></li>
                    <li><Link href="/legal/privacy">Politique de confidentialité</Link></li>
                    <li><Link href="/legal/mentions">Mentions légales</Link></li>
                  </ul>
                </div>
              </div>
              <div className="footer-bottom">
                <p>© 2026 CloudDevis. Tous droits réservés. 🇩🇿 Made in Algeria.</p>
                <LangSwitcher />
              </div>
            </div>
          </footer>

        </LandingAnimations>
        <StickyMobileCTA />
      </div>
    </div>
  );
}
