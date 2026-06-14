import Link from 'next/link';
import { LandingAnimations, LandingFAQ, LangSwitcher } from '@/components/landing/LandingPageClient';
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA';
import { ThemeHint } from '@/components/layout/ThemeHint';

const FAQ_ITEMS = [
  { q: 'Le Timbre Fiscal est-il géré automatiquement ?', a: "Oui. CloudDevis l\u2019applique automatiquement aux factures concernées à partir de 10 000 DA, selon les règles configurées dans l\u2019application. Les devis restent exclus du calcul." },
  { q: 'Puis-je essayer CloudDevis gratuitement ?', a: "Oui. Vous pouvez créer un compte gratuit et générer vos premiers documents avec les limites incluses dans la formule gratuite." },
  { q: 'Mes données sont-elles sécurisées ?', a: "Vos sessions utilisent des cookies sécurisés et les communications passent par HTTPS en production. Les données de compte et documents sont associées à votre espace utilisateur." },
  { q: 'CloudDevis fonctionne-t-il sur mobile ?', a: "Oui, CloudDevis est entièrement responsive. Vous pouvez créer des devis depuis votre smartphone ou tablette, directement depuis un navigateur — sans installation requise." },
  { q: 'Comment fonctionne la TVA sur les documents ?', a: "CloudDevis calcule la TVA selon le taux sélectionné et affiche les totaux en temps réel pour limiter les erreurs de saisie." },
  { q: "Comment payer l\u2019abonnement Pro en Algérie ?", a: "Les moyens de paiement disponibles dépendent de la configuration active du compte et des options proposées au moment de la souscription." },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <div className="landing-body">
        <ThemeHint />

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
                <div className="nav-cta">
                  <Link href="/auth/login" className="btn btn-ghost">Se connecter</Link>
                  <Link href="/auth/register" className="btn btn-primary">Essai gratuit →</Link>
                </div>
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
                      <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#4DCA8A" /></svg>
                      Conforme DGI Algérie
                    </span>
                    <span className="badge badge-gold">Gratuit pour démarrer</span>
                  </div>
                  <h1 className="hero-title">
                    Vos devis &amp; factures<br />
                    <em>conformes en 2 minutes</em>
                  </h1>
                  <p className="hero-sub">
                    Une plateforme algérienne pensée pour NIF, RC, TVA 9%/19% et Timbre Fiscal sur les factures concernées. Moins d&apos;erreurs, moins de retards.
                  </p>
                  <div className="hero-ctas">
                    <Link href="/auth/register" className="btn btn-primary btn-lg">
                      Créer mon premier devis →
                    </Link>
                  </div>
                  {/* Trust items — horizontal scroll chips on mobile */}
                  <div className="hero-trust-mobile">
                    <div className="trust-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#4DCA8A" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#4DCA8A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Aucune carte requise
                    </div>
                    <div className="trust-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#4DCA8A" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#4DCA8A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      5 documents/mois offerts
                    </div>
                    <div className="trust-item">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#4DCA8A" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#4DCA8A" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Support en Arabe &amp; Français
                    </div>
                  </div>
                </div>

                {/* Desktop hero visual */}
                <div className="hero-visual hero-visual-desktop">
                  <div className="glow-chip chip-1">
                    <div className="chip-dot" style={{ background: '#4DCA8A', boxShadow: '0 0 6px #4DCA8A' }}></div>
                    TVA calculée automatiquement
                  </div>
                  <div className="glow-chip chip-2">
                    <div className="chip-dot" style={{ background: '#F0C864', boxShadow: '0 0 6px #F0C864' }}></div>
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
                    { icon: '🪪', name: 'NIF', desc: "Numéro d\u2019Identification Fiscale — validé" },
                    { icon: '📋', name: 'RC', desc: 'Registre du Commerce — format vérifié' },
                    { icon: '🔢', name: 'NIS / AI', desc: "Numéro d\u2019Identification Statistique" },
                    { icon: '💹', name: 'TVA 9% / 19%', desc: "Calcul automatique selon l\u2019activité" },
                    { icon: '🪙', name: 'Timbre Fiscal', desc: "Ajouté automatiquement au total — conforme à l\u2019article 220 du CII", span: true },
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
                  <div className="card-title">5 types de documents en un clic</div>
                  <div className="card-desc">Devis, Proforma, Bon de Commande, Bon de Réception, Facture. Chaque type avec ses champs spécifiques pré-remplis selon la loi algérienne.</div>
                  <div className="doc-types-row">
                    {['📝 Devis', '📊 Proforma', '🛒 Bon de Commande', '📦 Bon de Réception', '🧾 Facture'].map(d => (
                      <span key={d} className="doc-type-pill">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="bento-card bento-span3 animate-on-scroll">
                  <div className="card-icon icon-gold">⚡</div>
                  <div className="card-title">Généré en moins de 30 secondes</div>
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
                  <div className="card-title">Prévisualisation en direct</div>
                  <div className="card-desc">Voyez votre document se construire en temps réel pendant la saisie. Ce que vous voyez est exactement ce qui est imprimé.</div>
                  <div className="mini-preview">
                    <span className="label">TVA calculée →</span>
                    <span className="value">✓ Automatique</span>
                  </div>
                </div>
                <div className="bento-card bento-span2 animate-on-scroll">
                  <div className="card-icon icon-purple">🌍</div>
                  <div className="card-title">Trilingue : FR · AR · EN</div>
                  <div className="card-desc">Générez vos documents en français, arabe avec support RTL complet, ou en anglais pour vos clients internationaux.</div>
                  <div className="doc-types-row">
                    <span className="doc-type-pill">🇫🇷 Français</span>
                    <span className="doc-type-pill">🇩🇿 العربية</span>
                    <span className="doc-type-pill">🇬🇧 English</span>
                  </div>
                </div>
                <div className="bento-card bento-span2 animate-on-scroll">
                  <div className="card-icon icon-blue">📍</div>
                  <div className="card-title">4 pays pris en charge</div>
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
                {[
                  {
                    plan: 'Gratuit', amount: '0', period: 'Pour toujours · Sans carte', featured: false,
                    features: [
                      { ok: true, text: '5 documents par mois' }, { ok: true, text: 'Tous les types de documents' },
                      { ok: true, text: 'Export PDF' }, { ok: true, text: 'Calcul TVA automatique' },
                      { ok: false, text: 'Historique des documents' }, { ok: false, text: 'Logo entreprise personnalisé' },
                      { ok: false, text: 'Envoi par email' },
                    ],
                    cta: 'Commencer gratuitement', ghost: true, href: '/auth/register',
                  },
                  {
                    plan: 'Pro', amount: '2 000', period: 'par mois · Annulable à tout moment', featured: true, popular: 'Le plus populaire',
                    features: [
                      { ok: true, text: 'Documents illimités' }, { ok: true, text: 'Tous les types de documents' },
                      { ok: true, text: 'Export PDF haute qualité' }, { ok: true, text: 'Historique complet' },
                      { ok: true, text: 'Logo et signature personnalisés' }, { ok: true, text: 'Envoi par email direct' },
                      { ok: true, text: 'Support prioritaire' },
                    ],
                    cta: "Démarrer l\u2019essai gratuit →", ghost: false, href: '/auth/register',
                  },
                  {
                    plan: 'Enterprise', amount: 'Sur mesure', period: 'Devis personnalisé', featured: false, custom: true,
                    features: [
                      { ok: true, text: 'Multi-utilisateurs (équipe)' }, { ok: true, text: 'Tableau de bord partagé' },
                      { ok: true, text: 'Accès API (intégration ERP)' }, { ok: true, text: 'Formation dédiée' },
                      { ok: true, text: 'SLA garanti' }, { ok: true, text: 'Facturation mensuelle ou annuelle' },
                      { ok: true, text: 'Gestionnaire de compte dédié' },
                    ],
                    cta: 'Nous contacter', ghost: true, href: '/enterprise',
                  },
                ].map((p, i) => (
                  <div key={i} className={`price-card animate-on-scroll ${p.featured ? 'featured' : ''}`}>
                    {p.popular && <div className="price-popular">{p.popular}</div>}
                    <div className="price-plan">{p.plan}</div>
                    <div className="price-amount" style={p.custom ? { fontSize: 28, marginTop: 7 } : {}}>
                      {p.amount}<span>{!p.custom && ' DA'}</span>
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
                    <Link href={p.href} className={`btn price-cta ${p.ghost ? 'btn-ghost' : 'btn-primary'}`}>{p.cta}</Link>
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
                  <Link href="/auth/register" className="btn btn-primary btn-lg">Créer mon devis maintenant →</Link>
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
                    <li><Link href="/auth/register">Démo</Link></li>
                  </ul>
                </div>
                <div className="footer-col">
                  <h5>Aide</h5>
                  <ul>
                    <li><a href="#faq">FAQ</a></li>
                    <li><Link href="/enterprise">Nous contacter</Link></li>
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
