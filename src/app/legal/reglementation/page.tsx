export const dynamic = 'force-static';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réglementation Algérienne | Rakmana',
  description: 'Références légales et réglementaires applicables aux documents commerciaux en Algérie. Conformité D.E. 05-468, loi 04-02, code du timbre.',
};

export default function ReglementationPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
        Réglementation Algérienne
      </h1>
      <p className="text-sm text-slate-400 mb-2">
        Références légales pour les documents commerciaux
      </p>
      <p className="text-xs text-slate-400 mb-10">
        Dernière mise à jour : 2 juillet 2026
      </p>

      <div className="prose prose-slate prose-sm max-w-none space-y-10">

        {/* ── Bannière conformité ─────────────────────────── */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-sm text-green-900">
          <p className="font-bold mb-1">✓ Conforme à la réglementation algérienne</p>
          <p className="text-green-800 text-xs leading-relaxed">
            Rakmana génère des documents conformes aux exigences du Décret Exécutif n°05-468,
            de la Loi n°04-02 et du Code du Timbre algérien. Les mentions obligatoires sont
            automatiquement incluses dans chaque document.
          </p>
        </div>

        {/* ── 1. Lois de base ─────────────────────────────── */}
        <Section title="1. Textes fondamentaux">
          <LegalCard
            number="01"
            title="Loi n°04-02 du 23 juin 2004"
            subtitle="Pratiques commerciales"
            description="Fixe les règles applicables aux pratiques commerciales en Algérie. Obligation de facturation pour toute vente de biens ou prestation de services entre agents économiques."
            articles={[
              'Art. 10 : Toute vente doit faire l&apos;objet d&apos;une facture',
              'Art. 24 : Interdiction des factures fictives et fausses factures',
              'Art. 26 : Pratiques commerciales déloyales',
            ]}
          />
          <LegalCard
            number="02"
            title="Décret Exécutif n°05-468"
            subtitle="10 décembre 2005"
            description="Fixe les conditions et modalités d&apos;établissement de la facture, du bon de livraison et de la facture récapitulative. Texte de référence principal pour la facturation en Algérie."
            articles={[
              'Art. 3-4 : 19 mentions obligatoires sur la facture',
              'Art. 10 : Conditions de validité de la facture',
              'Art. 14-16 : Bon de livraison en remplacement de la facture',
              'Art. 18 : Sanctions pour infraction',
            ]}
          />
          <LegalCard
            number="03"
            title="Décret Exécutif n°16-66"
            subtitle="16 février 2016"
            description="Définit le modèle du document tenant lieu de facture et les catégories d&apos;agents économiques tenus de l&apos;utiliser."
            articles={[
              'Modèle normalisé de facture',
              'Catégories d&apos;agents économiques concernés',
            ]}
          />
          <LegalCard
            number="04"
            title="Loi n°05-01 — Code du Timbre"
            subtitle="Droit de timbre sur les factures"
            description="Institue le droit de timbre sur les factures et documents commerciaux. Le timbre est calculé sur le montant TTC."
            articles={[
              'Taux : 1% du montant TTC',
              'Minimum : 5 DA',
              'Maximum : 2 500 DA',
              'Seuil d&apos;application : 10 000 DA TTC',
            ]}
          />
          <LegalCard
            number="05"
            title="Loi n°05-01 — Plafond espèces"
            subtitle="Transactions en espèces"
            description="Tout paiement dépassant 500 000 DA doit être effectué par virement ou chèque barré."
            articles={[
              'Plafond : 500 000 DA pour les paiements en espèces',
              'Obligation de virement ou chèque barré au-delà',
            ]}
          />
        </Section>

        {/* ── 2. Identifiants obligatoires ─────────────────── */}
        <Section title="2. Identifiants obligatoires">
          <p className="text-slate-600 text-sm mb-4">
            Toute entreprise algérienne doit disposer des identifiants suivants, qui figurent
            obligatoirement sur les factures et documents commerciaux.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <IdCard
              acronym="NIF"
              full="Numéro d&apos;Identification Fiscale"
              authority="Direction Générale des Impôts (DGI)"
              format="15 chiffres"
              structure="Positions 1-2 : Code wilaya | 3-4 : Année | 5-12 : N° séquentiel | 13-14 : Code activité | 15 : Clé"
              usage="Factures, déclarations fiscales, contrats commerciaux"
            />
            <IdCard
              acronym="NIS"
              full="Numéro d&apos;Identification Statistique"
              authority="Office National des Statistiques (ONS)"
              format="15 chiffres"
              structure="Attribué automatiquement lors de l&apos;immatriculation au RC"
              usage="Formalités administratives, appels d&apos;offres, opérations douanières"
            />
            <IdCard
              acronym="RC"
              full="Registre de Commerce"
              authority="Centre National du Registre de Commerce (CNRC)"
              format="Wilaya / Type / Année / Numéro"
              structure="Ex : 16/B/0807586/09"
              usage="Toute activité commerciale, existence légale de l&apos;entreprise"
            />
            <IdCard
              acronym="AI"
              full="Article d&apos;Imposition"
              authority="Direction Générale des Impôts (DGI)"
              format="Numéro fiscal interne"
              structure="Complément au NIF pour les déclarations fiscales"
              usage="Déclarations fiscales, relations avec les services des impôts"
            />
          </div>
        </Section>

        {/* ── 3. Mentions obligatoires par type ─────────────── */}
        <Section title="3. Mentions obligatoires par type de document">
          <p className="text-slate-600 text-sm mb-4">
            Le Décret Exécutif 05-468 impose des mentions spécifiques selon le type de document.
            Rakmana inclut automatiquement toutes les mentions requises.
          </p>

          <DocTypeTable
            title="Facture (D.E. 05-468)"
            rows={[
              { mention: 'Numéro de facture séquentiel', required: true },
              { mention: 'Date d&apos;établissement', required: true },
              { mention: 'Nom / raison sociale du vendeur', required: true },
              { mention: 'Adresse du vendeur', required: true },
              { mention: 'NIF du vendeur', required: true },
              { mention: 'NIS du vendeur', required: true },
              { mention: 'Numéro RC du vendeur', required: true },
              { mention: 'Nom / raison sociale du client', required: true },
              { mention: 'Adresse du client', required: true },
              { mention: 'NIF du client (si professionnel)', required: true },
              { mention: 'Désignation des biens/services', required: true },
              { mention: 'Quantités et unités', required: true },
              { mention: 'Prix unitaire HT', required: true },
              { mention: 'Remises et rabais', required: false },
              { mention: 'Montant total HT', required: true },
              { mention: 'Taux de TVA applicable', required: true },
              { mention: 'Montant de la TVA', required: true },
              { mention: 'Montant total TTC', required: true },
              { mention: 'Conditions et mode de paiement', required: true },
            ]}
          />

          <DocTypeTable
            title="Bon de Livraison (D.E. 05-468, Art. 14-16)"
            rows={[
              { mention: 'Numéro et date de l&apos;autorisation', required: true },
              { mention: 'Numéro et date du bon de livraison', required: true },
              { mention: 'Nom du vendeur + RC + NIF', required: true },
              { mention: 'Nom et adresse du client', required: true },
              { mention: 'Désignation précise des biens', required: true },
              { mention: 'Quantités livrées', required: true },
              { mention: 'Nom et CIN du livreur/transporteur', required: true },
              { mention: 'Signature et cachet du vendeur', required: true },
              { mention: 'Signature du réceptionnaire', required: true },
            ]}
            note="Le BL peut remplacer la facture pour les transactions répétitives (art. 14). Autorisation préalable de l&apos;administration requise."
          />

          <DocTypeTable
            title="Devis"
            rows={[
              { mention: 'Numéro et date du devis', required: true },
              { mention: 'Identité du prestataire (RC, NIF)', required: true },
              { mention: 'Identité du client', required: true },
              { mention: 'Description des travaux/services', required: true },
              { mention: 'Prix unitaire et total HT', required: true },
              { mention: 'TVA applicable', required: true },
              { mention: 'Durée de validité', required: false },
              { mention: 'Conditions d&apos;exécution', required: false },
            ]}
            note="Le devis n&apos;est pas soumis au timbre fiscal (exempté)."
          />

          <DocTypeTable
            title="Bon de Commande"
            rows={[
              { mention: 'Numéro et date', required: true },
              { mention: 'Identité de l&apos;acheteur', required: true },
              { mention: 'Identité du fournisseur', required: true },
              { mention: 'Description détaillée des produits', required: true },
              { mention: 'Quantités et prix unitaires HT', required: true },
              { mention: 'Taux de TVA et montant TTC', required: true },
              { mention: 'Conditions de livraison', required: false },
              { mention: 'Conditions de paiement', required: false },
            ]}
          />
        </Section>

        {/* ── 4. TVA ─────────────────────────────────────── */}
        <Section title="4. Taxe sur la Valeur Ajoutée (TVA)">
          <p className="text-slate-600 text-sm mb-4">
            La TVA est obligatoire sur toute facture. Le taux varie selon la nature des biens
            ou services.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-bold text-slate-900">Taux</th>
                  <th className="text-left py-2 px-3 font-bold text-slate-900">Applicabilité</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3 font-mono font-bold">19%</td>
                  <td className="py-2 px-3">Taux normal — la plupart des biens et services</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3 font-mono font-bold">9%</td>
                  <td className="py-2 px-3">Taux réduit — produits de première nécessité, médicaments</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3 font-mono font-bold">0%</td>
                  <td className="py-2 px-3">Exonéré — exportations, opérations bancaires</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 5. Timbre fiscal ─────────────────────────────── */}
        <Section title="5. Timbre Fiscal">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm mb-4">
            <p className="font-bold text-amber-900 mb-1">Calcul automatique dans Rakmana</p>
            <p className="text-amber-800 text-xs">
              Le timbre est calculé automatiquement sur chaque facture dont le montant TTC
              dépasse 10 000 DA. Rakmana applique le taux légal de 1% avec les bornes
              minimum (5 DA) et maximum (2 500 DA).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-bold text-slate-900">Élément</th>
                  <th className="text-left py-2 px-3 font-bold text-slate-900">Valeur</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3">Taux</td>
                  <td className="py-2 px-3 font-mono font-bold">1% du montant TTC</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3">Seuil d&apos;application</td>
                  <td className="py-2 px-3 font-mono font-bold">10 000 DA TTC</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3">Minimum</td>
                  <td className="py-2 px-3 font-mono font-bold">5 DA</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3">Maximum</td>
                  <td className="py-2 px-3 font-mono font-bold">2 500 DA</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2 px-3">Documents exemptés</td>
                  <td className="py-2 px-3">Devis, Proforma, Bon de Livraison, Attachement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 6. Correspondance Rakmana ──────────────────── */}
        <Section title="6. Comment Rakmana assure la conformité">
          <div className="grid gap-3 sm:grid-cols-2">
            <FeatureCard
              icon="19"
              title="19 mentions obligatoires"
              description="Toutes les mentions du D.E. 05-468 sont incluses automatiquement dans chaque facture générée."
            />
            <FeatureCard
              icon="NIF"
              title="Validation des identifiants"
              description="NIF (15 chiffres), NIS, RC et AI sont validés en temps réel lors de la saisie."
            />
            <FeatureCard
              icon="%"
              title="Calcul TVA automatique"
              description="Taux de 19%, 9% ou 0% appliqués selon la configuration. TVA détaillée par ligne."
            />
            <FeatureCard
              icon=".timbre"
              title="Timbre fiscal intégré"
              description="Calcul automatique du timbre (1% TTC) avec bornes légales. Exemption devis/BL."
            />
            <FeatureCard
              icon="#"
              title="Numérotation séquentielle"
              description="Numéros uniques et séquentiels pour chaque type de document (FAC-AAAA-XXXX)."
            />
            <FeatureCard
              icon="✓"
              title="Archivage 10 ans"
              description="Conservation légale des documents pendant 10 ans conforme aux obligations comptables."
            />
          </div>
        </Section>

        {/* ── 7. Liens utiles ─────────────────────────────── */}
        <Section title="7. Liens utiles">
          <ul className="space-y-2 text-sm">
            <li>
              <a href="https://www.mfdgi.gov.dz" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                Direction Générale des Impôts (DGI)
              </a>
              {' — Portail fiscal, déclarations en ligne, NIF'}
            </li>
            <li>
              <a href="https://sijilcom.cnrc.dz" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                Centre National du Registre de Commerce (CNRC)
              </a>
              {' — Immatriculation, consultation RC'}
            </li>
            <li>
              <a href="https://www.ons.dz" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                Office National des Statistiques (ONS)
              </a>
              {' — Attribution NIS'}
            </li>
            <li>
              <a href="https://www.joradp.dz" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                Journal Officiel de la République Algérienne
              </a>
              {' — Textes de loi officiels'}
            </li>
            <li>
              <a href="https://www.commerce.gov.dz" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
                Ministère du Commerce
              </a>
              {' — Réglementation commerciale'}
            </li>
          </ul>
        </Section>

        {/* ── Avertissement ────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-500 leading-relaxed">
          <p className="font-bold text-slate-700 mb-2">Avertissement</p>
          <p>
            Les informations présentes sur cette page sont données à titre informatif et ne
            constituent pas un avis juridique. Pour toute question relative à la conformité
            de vos documents, veuillez consulter un professionnel du droit ou l&apos;administration
            fiscale compétente (DGI).
          </p>
          <p className="mt-2">
            Références : Loi n°04-02 du 23/06/2004, Décret Exécutif n°05-468 du 10/12/2005,
            Décret Exécutif n°16-66 du 16/02/2016, Loi n°05-01 (Code du Timbre).
          </p>
        </div>

      </div>
    </>
  );
}

/* ── Sous-composants ──────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function LegalCard({
  number,
  title,
  subtitle,
  description,
  articles,
}: {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  articles: string[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 mb-3">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--green-2)] text-white text-xs font-bold flex items-center justify-center">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
          <p className="text-xs text-slate-400 mb-2">{subtitle}</p>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">{description}</p>
          <ul className="space-y-1">
            {articles.map((a, i) => (
              <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                <span className="text-[var(--green-2)] mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: a }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function IdCard({
  acronym,
  full,
  authority,
  format,
  structure,
  usage,
}: {
  acronym: string;
  full: string;
  authority: string;
  format: string;
  structure: string;
  usage: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-black text-[var(--green-2)]">{acronym}</span>
        <span className="text-xs text-slate-500" dangerouslySetInnerHTML={{ __html: full }} />
      </div>
      <div className="space-y-1.5 text-xs text-slate-600">
        <p><span className="font-bold text-slate-700">Organisme :</span> {authority}</p>
        <p><span className="font-bold text-slate-700">Format :</span> <span className="font-mono">{format}</span></p>
        <p dangerouslySetInnerHTML={{ __html: `<span class="font-bold text-slate-700">Structure :</span> ${structure}` }} />
        <p><span className="font-bold text-slate-700">Usage :</span> {usage}</p>
      </div>
    </div>
  );
}

function DocTypeTable({
  title,
  rows,
  note,
}: {
  title: string;
  rows: { mention: string; required: boolean }[];
  note?: string;
}) {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-slate-900 text-sm mb-2">{title}</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2 px-3 font-bold text-slate-700">Mention obligatoire</th>
              <th className="text-center py-2 px-3 font-bold text-slate-700 w-20">Obligatoire</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="py-2 px-3 text-slate-600" dangerouslySetInnerHTML={{ __html: r.mention }} />
                <td className="py-2 px-3 text-center">
                  {r.required ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">✓</span>
                  ) : (
                    <span className="text-slate-300 text-[10px]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <p className="text-xs text-slate-400 mt-2 italic">{note}</p>
      )}
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-start gap-3">
      <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-[var(--green-2)]/10 text-[var(--green-2)] text-xs font-black flex items-center justify-center">
        {icon}
      </span>
      <div>
        <h4 className="font-bold text-slate-900 text-xs mb-0.5">{title}</h4>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
