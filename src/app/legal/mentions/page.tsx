export const dynamic = 'force-static';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales | Rakmana',
  description: 'Mentions légales du service Rakmana.',
};

export default function MentionsPage() {
  return (
    <>
      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">
        Mentions Légales
      </h1>
      <p className="text-sm text-slate-400 mb-10">Dernière mise à jour : 1 juin 2026</p>

      <div className="prose prose-slate prose-sm max-w-none space-y-8">
        <Section title="Éditeur du Service">
          <p>
            <strong>Rakmana</strong> est un service édité par :
          </p>
          <ul className="list-none pl-0 space-y-1">
            <li><strong>Dénomination</strong> : Rakmana</li>
            <li><strong>Forme juridique</strong> : Entreprise individuelle (EURL)</li>
            <li><strong>Siège social</strong> : Alger, Algérie</li>
            <li><strong>Email</strong> : <a href="mailto:support@clouddevis.com" className="text-blue-600 underline">support@clouddevis.com</a></li>
          </ul>
        </Section>

        <Section title="Directeur de la Publication">
          <p>Le directeur de la publication est le gérant de Rakmana.</p>
        </Section>

        <Section title="Hébergement">
          <p>
            Le Service est hébergé par :
          </p>
          <ul className="list-none pl-0 space-y-1">
            <li><strong>Vercel Inc.</strong></li>
            <li>340 S Lemon Ave #4133</li>
            <li>Walnut, CA 91789</li>
            <li>États-Unis</li>
            <li><a href="https://vercel.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">https://vercel.com</a></li>
          </ul>
        </Section>

        <Section title="Propriété Intellectuelle">
          <p>
            L&apos;ensemble du Service Rakmana, incluant son nom, son logo, son design,
            son code source, ses interfaces et sa documentation, est protégé par les lois
            sur la propriété intellectuelle. Toute reproduction, représentation, modification
            ou exploitation non autorisée est interdite.
          </p>
        </Section>

        <Section title="Protection des Données">
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD) 2016/679
            et à la loi algérienne 18-07, vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement et de portabilité de vos données.
          </p>
          <p>
            Pour toute demande, contactez : <a href="mailto:support@clouddevis.com" className="text-blue-600 underline">support@clouddevis.com</a>
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Le Service utilise des cookies essentiels à son fonctionnement. Pour plus
            d&apos;informations, consultez notre <a href="/legal/privacy" className="text-blue-600 underline">Politique de Confidentialité</a>.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Pour toute question, réclamation ou information :<br />
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
      <h2 className="text-xl font-bold text-slate-900 mb-4">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
