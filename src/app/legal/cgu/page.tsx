export const dynamic = 'force-static';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CGU - Conditions Générales d\'Utilisation | CloudDevis',
  description: 'Conditions générales d\'utilisation du service CloudDevis de création de devis et factures.',
};

export default function CguPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">
        Conditions Générales d&apos;Utilisation
      </h1>
      <p className="text-sm text-slate-400 mb-10">Dernière mise à jour : 1 juin 2026</p>

      <div className="prose prose-slate prose-sm max-w-none space-y-8">
        <Section title="1. Objet">
          <p>
            Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU ») régissent l&apos;accès et
            l&apos;utilisation du service CloudDevis, une plateforme en ligne de création, gestion et
            édition de devis, factures, bons de commande et documents commerciaux (ci-après le « Service »).
          </p>
          <p>
            En créant un compte ou en utilisant le Service, vous acceptez sans réserve les présentes CGU.
            Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser le Service.
          </p>
        </Section>

        <Section title="2. Définitions">
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>« Éditeur »</strong> : CloudDevis, société éditrice du Service.</li>
            <li><strong>« Utilisateur »</strong> : toute personne physique ou morale utilisant le Service.</li>
            <li><strong>« Compte »</strong> : espace personnel créé par l&apos;Utilisateur pour accéder au Service.</li>
            <li><strong>« Documents »</strong> : devis, factures, proformas, bons de commande, bons de réception et tout document généré via le Service.</li>
            <li><strong>« Abonnement »</strong> : formule payante d&apos;utilisation du Service selon les tarifs en vigueur.</li>
          </ul>
        </Section>

        <Section title="3. Accès au Service">
          <p>
            L&apos;accès au Service est possible via un navigateur web standard. L&apos;Utilisateur est responsable
            de la configuration matérielle et logicielle nécessaire à l&apos;accès au Service.
          </p>
          <p>
            Le Service est accessible 24h/24 et 7j/7, sauf en cas de maintenance programmée ou d&apos;événements
            indépendants de la volonté de l&apos;Éditeur. CloudDevis s&apos;efforce de maintenir une disponibilité
            maximale mais ne peut garantir une disponibilité sans interruption.
          </p>
        </Section>

        <Section title="4. Création de Compte">
          <p>
            La création d&apos;un Compte nécessite la fourniture d&apos;informations exactes et complètes.
            L&apos;Utilisateur s&apos;engage à :
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fournir des informations personnelles exactes (nom, email).</li>
            <li>Maintenir la confidentialité de ses identifiants de connexion.</li>
            <li>Ne pas partager son compte avec des tiers.</li>
            <li>Informer immédiatement CloudDevis de toute utilisation non autorisée.</li>
          </ul>
        </Section>

        <Section title="5. Abonnements et Paiement">
          <p>
            Les formules d&apos;abonnement sont détaillées sur la page Tarifs. Les paiements sont traités
            via notre partenaire de paiement sécurisé. L&apos;Utilisateur autorise CloudDevis à prélever
            le montant de l&apos;abonnement selon la périodicité choisie (mensuelle ou annuelle).
          </p>
          <p>
            L&apos;Utilisateur peut résilier son abonnement à tout moment depuis son tableau de bord.
            La résiliation prend effet à la fin de la période en cours. Aucun remboursement
            n&apos;est effectué pour les périodes entamées.
          </p>
        </Section>

        <Section title="6. Propriété Intellectuelle">
          <p>
            Le Service, son code source, son design, ses marques et tout élément graphique sont
            la propriété exclusive de CloudDevis. L&apos;Utilisateur bénéficie d&apos;une licence
            non-exclusive, non-transférable pour utiliser le Service conformément aux présentes CGU.
          </p>
          <p>
            Les Documents créés par l&apos;Utilisateur restent sa propriété intellectuelle exclusive.
            CloudDevis ne revendique aucun droit sur le contenu des documents générés.
          </p>
        </Section>

        <Section title="7. Données et Confidentialité">
          <p>
            La Politique de Confidentialité, accessible sur la page dédiée, décrit la collecte,
            l&apos;utilisation et la protection des données personnelles. En utilisant le Service,
            vous consentez à cette politique.
          </p>
          <p>
            CloudDevis met en œuvre toutes les mesures techniques et organisationnelles
            nécessaires pour protéger les données des Utilisateurs conformément au RGPD.
          </p>
        </Section>

        <Section title="8. Responsabilité">
          <p>
            CloudDevis s&apos;engage à fournir un Service conforme aux spécifications décrites.
            La responsabilité de CloudDevis ne saurait être engagée en cas de :
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Utilisation non conforme du Service par l&apos;Utilisateur.</li>
            <li>Pertes de données liées à une négligence de l&apos;Utilisateur.</li>
            <li>Dommages indirects (perte de chiffre d&apos;affaires, préjudice commercial).</li>
            <li>Force majeure ou événements indépendants de sa volonté.</li>
          </ul>
        </Section>

        <Section title="9. Conservation et Sauvegarde">
          <p>
            CloudDevis conserve les Documents et données de l&apos;Utilisateur pendant toute la durée
            de l&apos;abonnement et jusqu&apos;à 12 mois après sa résiliation. Au-delà, les données
            sont définitivement supprimées.
          </p>
          <p>
            L&apos;Utilisateur est encouragé à exporter régulièrement ses documents. CloudDevis
            met à disposition des fonctionnalités d&apos;export PDF et de sauvegarde manuelle.
          </p>
        </Section>

        <Section title="10. Modification des CGU">
          <p>
            CloudDevis se réserve le droit de modifier les présentes CGU à tout moment.
            Les Utilisateurs seront informés par email des modifications substantielles.
            L&apos;utilisation continue du Service après modification vaut acceptation des nouvelles CGU.
          </p>
        </Section>

        <Section title="11. Droit Applicable">
          <p>
            Les présentes CGU sont soumises au droit algérien. Tout litige relatif à leur
            interprétation ou exécution relève de la compétence des tribunaux d&apos;Alger.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Pour toute question relative aux présentes CGU, vous pouvez nous contacter à :
            <br />
            Email : <a href="mailto:support@clouddevis.com" className="text-blue-600 underline">support@clouddevis.com</a>
          </p>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
