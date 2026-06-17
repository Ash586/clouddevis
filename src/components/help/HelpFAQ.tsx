'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQ_DATA = [
  {
    category: 'Général',
    items: [
      {
        q: 'Qu\'est-ce que CloudDevis ?',
        a: 'CloudDevis est un outil en ligne de création de devis et factures conforme à la réglementation algérienne. Il permet de générer des documents professionnels avec calcul automatique de la TVA et du Timbre Fiscal.',
        link: '/help/getting-started/bienvenue',
      },
      {
        q: 'Puis-je utiliser CloudDevis gratuitement ?',
        a: 'Oui ! La version gratuite permet de créer 5 documents par mois avec toutes les fonctionnalités de base. Aucune carte bancaire n\'est requise pour commencer.',
        link: '/help/getting-started/choisir-plan',
      },
      {
        q: 'CloudDevis est-il sécurisé ?',
        a: 'Oui. Nous utilisons HTTPS, le chiffrement TLS 1.3 et des cookies sécurisés. Les données sont stockées sur des serveurs sécurisés avec sauvegardes automatiques quotidiennes.',
        link: '/help/account/securite',
      },
      {
        q: 'Fonctionne-t-il sur mobile ?',
        a: 'Oui, CloudDevis est entièrement responsive. Vous pouvez créer des devis et factures depuis votre smartphone ou tablette, directement depuis un navigateur — sans installation requise.',
      },
    ],
  },
  {
    category: 'Documents',
    items: [
      {
        q: 'Quels types de documents puis-je créer ?',
        a: 'CloudDevis支持 7 types de documents : Devis, Facture, Proforma, Bon de Commande, Bon de Réception, Intervention et Attachement. Chaque type est adapté à un usage spécifique.',
        link: '/help/documents/types-documents',
      },
      {
        q: 'Comment créer un devis ?',
        a: 'Allez dans l\'éditeur, remplissez vos informations entreprise, ajoutez le client, puis les lignes de prestation. Le total est calculé automatiquement. Exportez en PDF quand c\'est prêt.',
        link: '/help/documents/creer-devis',
      },
      {
        q: 'Comment exporter en PDF ?',
        a: 'Cliquez sur le bouton "PDF" dans la barre d\'outils ou utilisez Ctrl+P. Le PDF s\'ouvre dans un nouvel onglet, prêt à être imprimé ou enregistré.',
        link: '/help/documents/exporter-pdf',
      },
      {
        q: 'Puis-je réutiliser mes anciennes prestations ?',
        a: 'Oui ! Utilisez le catalogue d\'articles (icône 📦) pour réutiliser toutes les prestations que vous avez déjà saisies. C\'est un gain de temps considérable.',
        link: '/help/documents/utiliser-catalogue',
      },
    ],
  },
  {
    category: 'Fiscalité',
    items: [
      {
        q: 'Comment fonctionne le Timbre Fiscal ?',
        a: 'Le Timbre Fiscal est de 1% du montant TTC, applicable uniquement aux factures dont le montant dépasse 10 000 DA. Le minimum est de 5 DA et le maximum de 2 500 DA. Les devis en sont exclus.',
        link: '/help/legal/timbre-fiscal',
      },
      {
        q: 'Quel taux de TVA appliquer ?',
        a: 'Le taux normal est de 19%. Le taux réduit de 9% s\'applique à certains produits de première nécessité. Sélectionnez le bon taux dans les paramètres du document.',
        link: '/help/legal/calculer-tva',
      },
      {
        q: 'Qu\'est-ce qu\'un NIF et comment l\'obtenir ?',
        a: 'Le NIF (Numéro d\'Identification Fiscale) est un numéro de 11 chiffres délivré par la DGI. Il est obligatoire pour toute facturation. Vous pouvez le demander auprès de votre centre des impôts.',
        link: '/help/legal/nif-rc-nis-ai',
      },
      {
        q: 'Ma facture est-elle conforme aux normes DGI ?',
        a: 'Oui, si elle contient toutes les mentions obligatoires : numéro séquentiel, NIF vendeur/acheteur, désignation, TVA détaillée, timbre fiscal. CloudDevis génère des factures 100% conformes.',
        link: '/help/legal/facture-legale',
      },
    ],
  },
  {
    category: 'Compte',
    items: [
      {
        q: 'Comment modifier mes informations entreprise ?',
        a: 'Allez dans Paramètres > Informations. Vous pouvez modifier le nom, l\'adresse, les numéros fiscaux, le logo et toutes les données qui apparaissent sur vos documents.',
        link: '/help/account/profil',
      },
      {
        q: 'Comment ajouter mon logo ?',
        a: 'Dans l\'éditeur, allez dans la section "Design & Logo", téléchargez votre logo (max 500 Ko), et choisissez sa position (gauche ou droite). Il apparaîtra sur tous vos documents.',
        link: '/help/account/profil',
      },
      {
        q: 'Comment protéger mon compte ?',
        a: 'Utilisez un mot de passe fort (12+ caractères, majuscules, chiffres, symboles). Activez la déconnexion automatique et vérifiez régulièrement vos sessions actives.',
        link: '/help/account/securite',
      },
      {
        q: 'Puis-je exporter mes données ?',
        a: 'Oui. Allez dans Paramètres > Confidentialité > Exporter mes données. Vous recevrez une archive ZIP contenant tous vos documents, clients et paramètres.',
        link: '/help/account/exporter-donnees',
      },
    ],
  },
  {
    category: 'Problèmes',
    items: [
      {
        q: 'J\'ai oublié mon mot de passe',
        a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié", entrez votre email et suivez les instructions envoyées. Vérifiez aussi vos spams.',
        link: '/help/troubleshooting/connexion',
      },
      {
        q: 'L\'application est lente',
        a: 'Videz le cache de votre navigateur, désactivez les extensions inutiles, et assurez-vous d\'utiliser une version récente de Chrome ou Firefox.',
        link: '/help/troubleshooting/performance',
      },
      {
        q: 'Le PDF ne s\'affiche pas',
        a: 'Enregistrez d\'abord le document (Ctrl+S), puis réessayez. Si le problème persiste, désactivez le bloqueur de publicité pour ce site.',
        link: '/help/troubleshooting/erreurs-courantes',
      },
      {
        q: 'Comment contacter le support ?',
        a: 'Envoyez un email à support@clouddevis.com avec la description du problème, des captures d\'écran si possible, et les étapes pour reproduire. Réponse sous 24h.',
        link: '/help/troubleshooting/quand-support',
      },
    ],
  },
];

export function HelpFAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {FAQ_DATA.map((group) => (
        <div key={group.category}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#999] mb-3">{group.category}</h2>
          <div className="bg-white border border-[#E4E0D8] rounded-xl overflow-hidden divide-y divide-[#F0EFEC]">
            {group.items.map((item) => {
              const key = `${group.category}-${item.q}`;
              const isOpen = openKey === key;
              return (
                <div key={key}>
                  <button
                    onClick={() => setOpenKey(isOpen ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[#F8F7F4] transition"
                  >
                    <span className="text-[12.5px] font-semibold text-[#161616] pr-4">{item.q}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <p className="text-[12px] text-[#444] leading-[1.7]">{item.a}</p>
                      {item.link && (
                        <Link href={item.link} className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 hover:underline" style={{ color: '#0B3D2E' }}>
                          En savoir plus →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
