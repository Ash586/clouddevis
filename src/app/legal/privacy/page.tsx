export const dynamic = 'force-static';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Rakmana',
  description: 'Politique de confidentialité et protection des données personnelles sur Rakmana.',
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">
        Politique de Confidentialité
      </h1>
      <p className="text-sm text-slate-400 mb-10">Dernière mise à jour : 1 juin 2026</p>

      <div className="prose prose-slate prose-sm max-w-none space-y-8">
        <Section title="1. Introduction">
          <p>
            Rakmana accorde une importance capitale à la protection de vos données personnelles.
            La présente Politique de Confidentialité décrit comment nous collectons, utilisons,
            stockons et protégeons vos informations lorsque vous utilisez notre Service.
          </p>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
            algérienne 18-07 relative à la protection des personnes physiques dans le traitement
            des données à caractère personnel, nous nous engageons à garantir la confidentialité
            et la sécurité de vos données.
          </p>
        </Section>

        <Section title="2. Responsable du Traitement">
          <p>
            Le responsable du traitement des données est Rakmana.
            <br />
            Email : <a href="mailto:support@clouddevis.com" className="text-blue-600 underline">support@clouddevis.com</a>
          </p>
        </Section>

        <Section title="3. Données Collectées">
          <p>Nous collectons les catégories de données suivantes :</p>
          <h3 className="font-semibold text-slate-800 mt-4 mb-2">3.1 Données d&apos;inscription</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Mot de passe (chiffré et stocké de manière sécurisée)</li>
          </ul>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">3.2 Données de profil</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Numéro de téléphone</li>
            <li>Adresse professionnelle</li>
            <li>Identifiants fiscaux (NIF, RC, NIS, AI) — fournis volontairement</li>
          </ul>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">3.3 Données d&apos;utilisation</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Documents créés (devis, factures, etc.)</li>
            <li>Préférences d&apos;édition et configuration</li>
            <li>Pages visitées et interactions avec le Service</li>
          </ul>

          <h3 className="font-semibold text-slate-800 mt-4 mb-2">3.4 Données techniques</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Adresse IP</li>
            <li>Type et version de navigateur</li>
            <li>Système d&apos;exploitation</li>
            <li>Cookies et technologies de traçage (voir section 7)</li>
          </ul>
        </Section>

        <Section title="4. Finalités du Traitement">
          <p>Vos données sont traitées pour les finalités suivantes :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Fourniture et gestion du Service</li>
            <li>Création et stockage de vos documents</li>
            <li>Communication liée à votre compte (facturation, notifications)</li>
            <li>Amélioration du Service et analyse d&apos;utilisation</li>
            <li>Respect des obligations légales et fiscales</li>
            <li>Support client et assistance technique</li>
          </ul>
        </Section>

        <Section title="5. Base Légale du Traitement">
          <p>Le traitement de vos données repose sur les bases légales suivantes :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Exécution du contrat</strong> : fourniture du Service conformément aux CGU</li>
            <li><strong>Consentement</strong> : pour les cookies non essentiels et communications marketing</li>
            <li><strong>Obligation légale</strong> : conservation des documents fiscaux</li>
            <li><strong>Intérêt légitime</strong> : amélioration du Service, sécurité</li>
          </ul>
        </Section>

        <Section title="6. Destinataires des Données">
          <p>
            Vos données sont traitées par le personnel autorisé de Rakmana. Nous pouvons
            partager certaines données avec des sous-traitants tiers de confiance :
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Hébergement</strong> : Vercel Inc. (USA) — données stockées dans la région Europe</li>
            <li><strong>Base de données</strong> : PostgreSQL via Vercel Postgres</li>
            <li><strong>Paiement</strong> : Stripe — uniquement pour les transactions (aucune donnée bancaire stockée chez nous)</li>
            <li><strong>Email</strong> : Service de messagerie transactionnelle</li>
          </ul>
          <p className="mt-3">
            Nous ne vendons jamais vos données personnelles à des tiers.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            Nous utilisons des cookies essentiels au fonctionnement du Service (authentification,
            session, préférences de langue). Ces cookies ne nécessitent pas de consentement préalable.
          </p>
          <p>
            Nous utilisons également des cookies d&apos;analyse (Vercel Analytics) qui collectent
            des données anonymisées. Vous pouvez les désactiver via les paramètres de votre navigateur.
          </p>
          <p>Types de cookies utilisés :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Session</strong> : cookie d&apos;authentification (durée : session)</li>
            <li><strong>Préférences</strong> : langue, thème (durée : 1 an)</li>
            <li><strong>Sécurité</strong> : protection CSRF (durée : session)</li>
          </ul>
        </Section>

        <Section title="8. Durée de Conservation">
          <p>
            Vos données sont conservées pendant toute la durée de votre abonnement et jusqu&apos;à
            12 mois après la résiliation de votre compte. Au-delà, elles sont définitivement supprimées
            ou anonymisées.
          </p>
          <p>
            Les documents fiscaux (factures) peuvent être conservés plus longtemps conformément
            aux obligations légales en vigueur.
          </p>
        </Section>

        <Section title="9. Vos Droits">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : modifier vos données inexactes</li>
            <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données</li>
            <li><strong>Droit à la limitation</strong> : restreindre le traitement</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
            <li><strong>Droit d&apos;opposition</strong> : vous opposer au traitement</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits, contactez-nous à <a href="mailto:support@clouddevis.com" className="text-blue-600 underline">support@clouddevis.com</a>.
            Nous répondrons à votre demande dans un délai maximal de 30 jours.
          </p>
        </Section>

        <Section title="10. Sécurité">
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles
            appropriées pour protéger vos données :
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Chiffrement TLS 1.3 en transit</li>
            <li>Chiffrement au repos de la base de données</li>
            <li>Hachage des mots de passe (bcrypt)</li>
            <li>Authentification sécurisée avec JWT</li>
            <li>Protection CSRF via tokens</li>
            <li>Rate limiting et protection contre les attaques par force brute</li>
            <li>Audits de sécurité réguliers</li>
          </ul>
        </Section>

        <Section title="11. Transferts Internationaux">
          <p>
            Vos données sont hébergées sur des serveurs situés en Europe (région Ouest de l&apos;Europe).
            Tout transfert vers des pays hors UE est encadré par les clauses contractuelles types
            de la Commission européenne ou par des décisions d&apos;adéquation.
          </p>
        </Section>

        <Section title="12. Modification de la Politique">
          <p>
            Nous pouvons modifier la présente politique à tout moment. Les modifications seront
            notifiées par email et via le Service. Nous vous encourageons à consulter régulièrement
            cette page.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            Pour toute question relative à la protection de vos données :<br />
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
