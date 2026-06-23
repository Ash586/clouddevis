export interface HelpArticle {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
  tags: string[];
  content: string;
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORIES: HelpCategory[] = [
  { id: 'getting-started', title: 'Démarrage rapide', description: 'Premiers pas avec CloudDevis', icon: '🚀', color: '#1E40AF' },
  { id: 'documents', title: 'Créer des documents', description: 'Devis, factures, proformas', icon: '📄', color: '#1A6B4F' },
  { id: 'billing', title: 'Facturation & paiement', description: 'Gestion des paiements', icon: '💰', color: '#C4A35A' },
  { id: 'legal', title: 'Conformité légale', description: 'NIF, RC, TVA, Timbre fiscal', icon: '⚖️', color: '#2E60B0' },
  { id: 'troubleshooting', title: 'Résolution de problèmes', description: 'Aide et dépannage', icon: '🔧', color: '#B05A2E' },
  { id: 'account', title: 'Compte & paramètres', description: 'Profil, sécurité, équipe', icon: '👤', color: '#6B2E8B' },
];

export const ARTICLES: HelpArticle[] = [
  // ═══════════ GETTING STARTED ═══════════
  {
    slug: 'bienvenue',
    title: 'Bienvenue sur CloudDevis',
    description: 'Découvrez CloudDevis et ses fonctionnalités principales.',
    readTime: '5 min',
    category: 'getting-started',
    tags: ['intro', 'bienvenue', 'fonctionnalités'],
    content: `# Bienvenue sur CloudDevis

CloudDevis est un outil de création de devis et factures conforme à la réglementation algérienne.

## Fonctionnalités principales

- **Devis professionnels** : Créez des devis élégants en quelques clics
- **Factures conformes** : Générez des factures respectant les normes DGI
- **Calcul automatique** : TVA, Timbre Fiscal, totaux calculés en temps réel
- **Multi-types** : Devis, Facture, Proforma, Bon de Commande, etc.
- **Mode Entreprise & Artisan** : S'adapte à votre structure
- **Export PDF** : Téléchargez vos documents en PDF haute qualité

## Comment commencer

1. Créez un compte gratuit
2. Complétez les informations de votre entreprise
3. Ajoutez vos clients
4. Créez votre premier devis

> **Astuce** : La version gratuite permet de créer 5 documents par mois.`,
  },
  {
    slug: 'creer-compte',
    title: 'Créer un compte',
    description: 'Inscrivez-vous en quelques étapes simples.',
    readTime: '3 min',
    category: 'getting-started',
    tags: ['inscription', 'compte', 'register'],
    content: `# Créer un compte CloudDevis

## Étape 1 : Accédez à la page d'inscription

Rendez-vous sur **clouddevis.com** et cliquez sur **"Essai gratuit"**.

## Étape 2 : Remplissez vos informations

- **Email** : Votre adresse email professionnelle
- **Mot de passe** : Au moins 8 caractères
- **Nom complet** : Votre nom et prénom

## Étape 3 : Confirmez votre email

Un email de confirmation vous sera envoyé. Cliquez sur le lien pour activer votre compte.

## Étape 4 : Complétez votre profil

Renseignez les informations de votre entreprise :
- Nom de l'entreprise
- Adresse
- Numéros d'identification (NIF, RC, NIS)

> **Important** : Ces informations apparaîtront sur vos documents.`,
  },
  {
    slug: 'tournee-controle',
    title: 'Visite guidée du tableau de bord',
    description: 'Découvrez les différentes sections du tableau de bord.',
    readTime: '7 min',
    category: 'getting-started',
    tags: ['tableau de bord', 'navigation', 'dashboard'],
    content: `# Visite guidée du tableau de bord

## Vue d'ensemble

Le tableau de bord vous donne un aperçu rapide de votre activité :

- **Documents récents** : Accès rapide à vos derniers documents
- **Statistiques** : Nombre de devis, factures, montants
- **Actions rapides** : Créer un devis, ajouter un client

## Navigation principale

- **Documents** : Liste de tous vos devis et factures
- **Clients** : Gestion de votre carnet de clients
- **Paramètres** : Configuration de votre compte et entreprise

## Menu d'action

Dans l'éditeur, vous trouverez :
- **Enregistrement** : Sauvegardez votre travail
- **PDF** : Exportez en PDF
- **Annuler/Rétablir** : Ctrl+Z / Ctrl+Shift+Z`,
  },
  {
    slug: 'choisir-plan',
    title: 'Choisir la bonne formule',
    description: 'Comparez les formules et trouvez celle qui vous convient.',
    readTime: '5 min',
    category: 'getting-started',
    tags: ['plan', 'tarif', 'abonnement', 'pricing'],
    content: `# Choisir la bonne formule

## Formule Gratuite

- 5 documents par mois
- Toutes les fonctionnalités de base
- Support par email
- Idéal pour tester

## Formule Pro

- Documents illimités
- Toutes les fonctionnalités avancées
- Support prioritaire
- Personnalisation avancée
- **1 500 DA/mois**

## Comment changer de formule ?

1. Allez dans **Paramètres** → **Abonnement**
2. Sélectionnez la formule souhaitée
3. Validez le paiement

> **Note** : La formule Pro offre 7 jours d'essai gratuit.`,
  },

  // ═══════════ DOCUMENTS ═══════════
  {
    slug: 'types-documents',
    title: 'Les types de documents',
    description: 'Comprendre les différences entre chaque type de document.',
    readTime: '8 min',
    category: 'documents',
    tags: ['devis', 'facture', 'proforma', 'bon de commande'],
    content: `# Les types de documents

## Devis (Quote)
Document commercial proposant un prix pour des services ou produits. **Pas d'obligation fiscale**.

## Facture (Invoice)
Document comptable officiel. **Obligatoire** pour toute transaction. Conforme aux normes DGI.

## Proforma
Facture provisoire. Utilisée avant la confirmation d'une commande.

## Bon de Commande (BC)
Document d'achat. Confirme la commande de produits ou services.

## Bon de Réception (BR)
Accusé de réception des produits ou services livrés.

## Intervention
Document de suivi des interventions techniques.

## Attachement
Liste détaillée des travaux réalisés avec quantités.

| Document | TVA | Timbre | Obligatoire |
|----------|-----|--------|-------------|
| Devis | Optionnel | Non | Non |
| Facture | Oui | Oui (>10k DA) | Oui |
| Proforma | Optionnel | Non | Non |
| BC | Non | Non | Non |`,
  },
  {
    slug: 'creer-devis',
    title: 'Créer un devis professionnel',
    description: 'Guide complet pour créer un devis étape par étape.',
    readTime: '10 min',
    category: 'documents',
    tags: ['devis', 'créer', 'étape par étape'],
    content: `# Créer un devis professionnel

## Étape 1 : Informations entreprise

Renseignez les données de votre société :
- Nom de l'entreprise
- Adresse complète
- Numéros : NIF, RC, NIS, AI

## Étape 2 : Informations client

Ajoutez les données du client :
- Nom du client
- Adresse
- NIF (si entreprise)

## Étape 3 : Ajouter des lignes

Pour chaque prestation :
1. Cliquez sur **"+ Ajouter une ligne"**
2. Saisissez la **désignation**
3. Entrez la **quantité** et l'**unité**
4. Indiquez le **prix unitaire**

## Étape 4 : Vérifiez les totaux

Le système calcule automatiquement :
- **Sous-total HT**
- **TVA** (selon le taux choisi)
- **Timbre fiscal** (si applicable)
- **Total TTC**

## Étape 5 : Exportez en PDF

Cliquez sur **"PDF"** pour télécharger votre devis.

> **Astuce** : Utilisez Ctrl+S pour sauvegarder rapidement.`,
  },
  {
    slug: 'creer-facture',
    title: 'Créer une facture conforme',
    description: 'Créez une facture respectant la réglementation algérienne.',
    readTime: '12 min',
    category: 'documents',
    tags: ['facture', 'créer', 'conforme', 'DGI'],
    content: `# Créer une facture conforme

## Informations obligatoires

Une facture légale en Algérie doit contenir :

1. **Numéro de facture** (séquentiel)
2. **Date d'émission**
3. **Informations vendeur** : Nom, adresse, NIF, RC
4. **Informations acheteur** : Nom, adresse, NIF
5. **Désignation des prestations**
6. **Quantités et prix unitaires HT**
7. **Base imposable**
8. **TVA** (taux applicable)
9. **Total TTC**
10. **Timbre fiscal** (si > 10 000 DA)

## Calcul automatique

CloudDevis calcule automatiquement :
- TVA au taux sélectionné (9% ou 19%)
- Timbre fiscal (1% avec min/max)
- Total à payer

## Validation légale

Vérifiez que :
- Le NIF du client est valide (11 chiffres)
- La TVA est correctement appliquée
- Le timbre fiscal est calculé si nécessaire
- Le document est signé et horodaté`,
  },
  {
    slug: 'ajouter-client',
    title: 'Ajouter un client',
    description: 'Comment ajouter et gérer vos clients.',
    readTime: '4 min',
    category: 'documents',
    tags: ['client', 'ajouter', 'carnet'],
    content: `# Ajouter un client

## Méthode 1 : Depuis l'éditeur

1. Ouvrez un document
2. Allez dans la section **"Client"**
3. Remplissez les informations :
   - Nom
   - Adresse
   - NIF (optionnel)
   - Téléphone
   - Email

## Méthode 2 : Depuis le carnet de clients

1. Allez dans **"Clients"** dans le menu
2. Cliquez sur **"Ajouter un client"**
3. Remplissez le formulaire
4. Enregistrez

## Informations enregistrées

- Nom et adresse
- Numéro d'identification (NIF)
- Coordonnées (téléphone, email)
- Historique des documents

> **Astuce** : Les clients sont sauvegardés automatiquement.`,
  },
  {
    slug: 'exporter-pdf',
    title: 'Exporter en PDF',
    description: 'Téléchargez vos documents au format PDF.',
    readTime: '2 min',
    category: 'documents',
    tags: ['pdf', 'export', 'télécharger'],
    content: `# Exporter en PDF

## Comment exporter ?

1. Enregistrez votre document (Ctrl+S)
2. Cliquez sur le bouton **"PDF"** dans la barre d'outils
3. Le PDF s'ouvre dans un nouvel onglet
4. Imprimez ou enregistrez

## Raccourcis clavier

- **Ctrl+P** : Imprimer / Exporter PDF
- **Ctrl+S** : Enregistrer

## Personnalisation

Le PDF inclut automatiquement :
- Votre logo (si configuré)
- Les informations entreprise
- Les informations client
- Le tableau des prestations
- Les totaux et la TVA
- Le timbre fiscal (si applicable)
- Les mentions légales

## Astuces

- Vérifiez l'aperçu avant d'exporter
- Utilisez "Ajuster" pour voir le document complet
- Le format A4 est optimisé pour l'impression`,
  },
  {
    slug: 'utiliser-catalogue',
    title: 'Utiliser le catalogue d\'articles',
    description: 'Réutilisez vos prestations précédentes pour gagner du temps.',
    readTime: '5 min',
    category: 'documents',
    tags: ['catalogue', 'articles', 'réutiliser'],
    content: `# Utiliser le catalogue d'articles

## Qu'est-ce que le catalogue ?

Le catalogue stocke toutes les prestations que vous avez déjà utilisées. Il vous permet de les réutiliser sans ressaisir les informations.

## Comment y accéder ?

1. Ouvrez l'éditeur de document
2. Dans la section **"Prestations"**
3. Cliquez sur l'icône **📦** (catalogue)

## Utilisation

1. Parcourez la liste des articles
2. Cliquez sur un article pour l'ajouter
3. La ligne se pré-remplit automatiquement
4. Ajustez la quantité si nécessaire

## Avantages

- Gain de temps considérable
- Pas d'erreur de saisie
- Cohérence des prix
- Historique complet`,
  },
  {
    slug: 'remise-tva-ligne',
    title: 'Gérer les remises et TVA par ligne',
    description: 'Appliquez des remises et des taux TVA différents par ligne.',
    readTime: '6 min',
    category: 'documents',
    tags: ['remise', 'tva', 'ligne', 'pourcentage'],
    content: `# Gérer les remises et TVA par ligne

## Remises

### Remise en pourcentage
- Sélectionnez **"%"** comme type de remise
- Entrez le pourcentage (ex: 10 pour 10%)
- Le montant est calculé automatiquement

### Remise en montant fixe
- Sélectionnez **"DA"** comme type
- Entrez le montant en dinars

### Motif de remise
- Ajoutez une raison (ex: "Fidélité", "Promotion")
- Le motif apparaît sur le document

## TVA par ligne

Le taux TVA s'applique à l'ensemble du document. Pour des taux différents :
1. Créez des lignes séparées
2. Appliquez le bon taux à chaque groupe
3. Le système calcule les totaux séparément`,
  },

  // ═══════════ BILLING ═══════════
  {
    slug: 'modes-paiement',
    title: 'Modes de paiement',
    description: 'Les différents modes de paiement disponibles.',
    readTime: '5 min',
    category: 'billing',
    tags: ['paiement', 'mode', 'banque', 'rib'],
    content: `# Modes de paiement

## Modes disponibles

### Chèque
- Enregistrement du numéro de chèque
- Date d'échéance
- Banque émettrice

### Virement bancaire
- RIB du bénéficiaire
- Référence du virement
- Date d'exécution

### Espèces
- Paiement en cash
- Reçu de paiement

### Carte bancaire
- CB, Visa, Mastercard
- Paiement électronique

## Configuration RIB

Pour faciliter vos paiements :
1. Allez dans **Paramètres** → **Devis**
2. Renseignez votre **RIB**
3. Ajoutez le nom de la banque
4. Entrez le numéro CCP

> **Astuce** : Le RIB apparaît automatiquement sur vos documents.`,
  },
  {
    slug: 'enregistrer-paiement',
    title: 'Enregistrer un paiement',
    description: 'Comment enregistrer un paiement reçu d\'un client.',
    readTime: '6 min',
    category: 'billing',
    tags: ['paiement', 'enregistrer', 'reçu'],
    content: `# Enregistrer un paiement

## Étape 1 : Sélectionnez la facture

1. Allez dans la liste des factures
2. Trouvez la facture concernée
3. Cliquez dessus pour l'ouvrir

## Étape 2 : Enregistrez le paiement

1. Cliquez sur **"Enregistrer un paiement"**
2. Sélectionnez le **mode de paiement**
3. Entrez le **montant** reçu
4. Ajoutez une **référence** (optionnel)
5. Validez

## Types de paiement

### Paiement intégral
Le client paie le montant total de la facture.

### Paiement partiel
Le client paie une partie. Le reste est à solder.

### Paiement échelonné
Plusieurs paiements sur une période donnée.

## Suivi

Consultez l'état de paiement dans :
- Liste des factures (colonne "Statut")
- Détail de la facture
- Rapports financiers`,
  },
  {
    slug: 'acompte',
    title: 'Gérer les acomptes',
    description: 'Comment demander et enregistrer un acompte.',
    readTime: '5 min',
    category: 'billing',
    tags: ['acompte', 'avance', 'paiement partiel'],
    content: `# Gérer les acomptes

## Qu'est-ce qu'un acompte ?

Un acompte est un paiement partiel effectué avant la livraison des services ou produits.

## Demander un acompte

1. Dans l'éditeur, allez dans **"Règlement & Paiement"**
2. Entrez le montant de l'acompte
3. Le montant s'affiche sur le document

## Calcul automatique

CloudDevis soustrait l'acompte du total :
- **Total HT**
- **TVA**
- **Timbre**
- **Acompte** (soustraction)
- **Net à payer** = Total TTC - Acompte

## Bonnes pratiques

- Demandez 30% d'acompte minimum
- Mentionnez les conditions sur le devis
- Enregistrez l'acompte reçu
- Éditez un reçu d'acompte`,
  },
  {
    slug: 'factures-recurrentes',
    title: 'Factures récurrentes',
    description: 'Créez des factures automatiques pour vos abonnements.',
    readTime: '6 min',
    category: 'billing',
    tags: ['récurrent', 'automatique', 'abonnement'],
    content: `# Factures récurrentes

## Principe

Les factures récurrentes sont générées automatiquement à intervalles réguliers.

## Cas d'utilisation

- Abonnements mensuels
- Contrats de maintenance
- Loyer de matériel
- Services récurrents

## Configuration

1. Créez un modèle de facture
2. Définissez la **fréquence** (mensuel, trimestriel, annuel)
3. Paramérez les **dates** de génération
4. Activez la **génération automatique**

## Gestion

- Modifiez ou supprimez une série
- Consultez l'historique
- Pause temporaire
- Annulation définitive

> **Note** : Les factures générées sont enregistrées dans votre espace.`,
  },
  {
    slug: 'devise-monnaie',
    title: 'Gérer les devises',
    description: 'Utilisez différentes devises pour vos documents.',
    readTime: '4 min',
    category: 'billing',
    tags: ['devise', 'monnaie', 'DA', 'euro'],
    content: `# Gérer les devises

## Devise par défaut

La devise est configurée dans **Paramètres** :
- **DA** (Dinar Algérien) par défaut
- Tous les montants sont en DA

## Changer la devise

1. Allez dans **Paramètres**
2. Sélectionnez la devise souhaitée
3. Le symbole s'affiche automatiquement sur les documents

## Format d'affichage

- **DA** : 1 500,00 DA
- **EUR** : 1 500,00 €
- **USD** : $1,500.00

## Attention

- La devise ne change pas les calculs
- Les taux de TVA restent en pourcentage
- Le timbre fiscal est toujours en DA`,
  },

  // ═══════════ LEGAL ═══════════
  {
    slug: 'timbre-fiscal',
    title: 'Le Timbre Fiscal',
    description: 'Tout comprendre sur le timbre fiscal algérien.',
    readTime: '6 min',
    category: 'legal',
    tags: ['timbre', 'fiscal', 'stamp', '10000'],
    content: `# Le Timbre Fiscal

## Définition

Le timbre fiscal est une taxe perçue par l'État sur certaines transactions commerciales.

## Quand s'applique-t-il ?

- **Factures** : À partir de **10 000 DA**
- **Devis** : **Jamais** (les devis sont exclus)
- **Proforma** : **Jamais**

## Calcul

- Taux : **1%** du montant total TTC
- **Minimum** : 5 DA
- **Maximum** : 2 500 DA

### Exemple
Montant TTC = 150 000 DA
Timbre = 150 000 × 1% = 1 500 DA

## Cas particuliers

- Montant < 10 000 DA → Pas de timbre
- Montant > 250 000 DA → Timbre plafonné à 2 500 DA
- TVA non incluse dans le calcul du timbre

## Gestion automatique

CloudDevis calcule le timbre automatiquement :
1. Vérifie si le montant dépasse 10 000 DA
2. Applique le taux de 1%
3. Respecte le minimum et maximum
4. Affiche le détail sur la facture`,
  },
  {
    slug: 'calculer-tva',
    title: 'Calculer la TVA',
    description: 'Comprendre et appliquer les taux de TVA.',
    readTime: '7 min',
    category: 'legal',
    tags: ['tva', '19%', '9%', 'taxe', 'calculation'],
    content: `# Calculer la TVA

## Taux de TVA en Algérie

### Taux normal : 19%
Appliqué à la majorité des biens et services.

### Taux réduit : 9%
Appliqué à certains produits de première nécessité.

### Taux exonéré : 0%
Opérations exonérées de TVA.

## Comment ça marche ?

### Exemple avec TVA 19%
- HT = 100 000 DA
- TVA = 100 000 × 19% = 19 000 DA
- TTC = 119 000 DA

### Exemple avec TVA 9%
- HT = 100 000 DA
- TVA = 100 000 × 9% = 9 000 DA
- TTC = 109 000 DA

## Dans CloudDevis

1. Sélectionnez le taux dans **"Données Générales"**
2. Le système applique le taux à toutes les lignes
3. La TVA s'affiche dans les totaux
4. Le détail apparaît sur le PDF

## Vérification

- Le NIF du client est requis pour la TVA
- Conservez vos factures 10 ans
- Déclarez la TVA mensuellement`,
  },
  {
    slug: 'nif-rc-nis-ai',
    title: 'NIF, RC, NIS, AI',
    description: 'Les identifiants fiscaux obligatoires.',
    readTime: '8 min',
    category: 'legal',
    tags: ['nif', 'rc', 'nis', 'ai', 'identifiant', 'fiscal'],
    content: `# NIF, RC, NIS, AI

## NIF - Numéro d'Identification Fiscale

- **Format** : 11 chiffres
- **Usage** : Identification de l'entreprise auprès de la DGI
- **Obligatoire** : Oui, pour toute facturation

## RC - Registre du Commerce

- **Format** : 9 à 14 caractères (alphanumérique)
- **Usage** : Inscription au registre du commerce
- **Exemple** : 12/B/0807586-00/09-BLIDA

## NIS - Numéro d'Identification Statistique

- **Format** : 10 chiffres
- **Usage** : Identification statistique (INS)
- **Délivré par** : Institut National de la Statistique

## AI - Article d'Immatriculation

- **Format** : 10 chiffres
- **Usage** : Identification fiscale complémentaire
- **Délivré par** : Direction des Impôts

## Validation

CloudDevis valide automatiquement :
- NIF : 11 chiffres exactement
- RC : Format alphanumérique
- NIS : 10 chiffres exactement
- AI : 10 chiffres exactement`,
  },
  {
    slug: 'facture-legale',
    title: 'Facture légale en Algérie',
    description: 'Les mentions obligatoires pour une facture conforme.',
    readTime: '9 min',
    category: 'legal',
    tags: ['facture', 'légale', 'conforme', 'obligatoire'],
    content: `# Facture légale en Algérie

## Mentions obligatoires

### En-tête
- Raison sociale du vendeur
- Adresse complète
- NIF, RC, NIS
- Numéro de facture (séquentiel)
- Date d'émission

### Client
- Raison sociale de l'acheteur
- Adresse
- NIF

### Désignation
- Description précise des prestations
- Quantités et unités
- Prix unitaire HT
- Montant HT

### Fiscalité
- Base imposable
- Taux et montant TVA
- Taux et montant Timbre fiscal
- Total TTC

### Mentions légales
- "Facture acquittée" (si payée)
- Numéro du chèque (si paiement par chèque)
- Date d'échéance

## Sanctions

Une facture non conforme peut entraîner :
- Redressement fiscal
- Pénalités de retard
- Amendes

> **CloudDevis** génère des factures 100% conformes.`,
  },
  {
    slug: 'compliance-tunisia-morocco',
    title: 'Conformité dans les pays voisins',
    description: 'Exigences fiscales en Tunisie et au Maroc.',
    readTime: '6 min',
    category: 'legal',
    tags: ['tunisie', 'maroc', 'conformité', 'étranger'],
    content: `# Conformité dans les pays voisins

## Tunisie

### Identifiants
- **Matricule fiscal** : 13 chiffres
- **RC** : Registre du commerce
- **MF** : Matricule fiscal

### TVA
- Taux normal : **19%**
- Taux réduit : **7%** et **0%**
- Timbre : **1%** (plafonné)

### Mentions obligatoires
- Numéro de facture
- Date
- Désignation
- TVA détaillée

## Maroc

### Identifiants
- **IF** : Identifiant fiscal (15 chiffres)
- **RC** : Registre du commerce
- **Patente** : Numéro de patente

### TVA
- Taux normal : **20%**
- Taux réduit : **14%**, **10%**, **7%**
- Exonéré : **0%**

### Mentions obligatoires
- Numéro de facture séquentiel
- Désignation détaillée
- TVA détaillée

> **Note** : CloudDevis est optimisé pour l'Algérie. L'utilisation pour d'autres pays nécessite des ajustements.`,
  },

  // ═══════════ TROUBLESHOOTING ═══════════
  {
    slug: 'erreurs-courantes',
    title: 'Erreurs courantes et solutions',
    description: 'Résolvez les erreurs les plus fréquentes.',
    readTime: '8 min',
    category: 'troubleshooting',
    tags: ['erreur', 'bug', 'solution', 'problème'],
    content: `# Erreurs courantes et solutions

## Erreur de calcul TVA

**Symptôme** : La TVA ne s'affiche pas correctement

**Solution** :
1. Vérifiez le taux TVA dans les paramètres
2. Assurez-vous que le client a un NIF
3. Rechargez la page

## Erreur de sauvegarde

**Symptôme** : Le document ne s'enregistre pas

**Solution** :
1. Vérifiez votre connexion internet
2. Videz le cache du navigateur
3. Essayez Ctrl+S

## Erreur PDF

**Symptôme** : Le PDF ne génère pas

**Solution** :
1. Enregistrez d'abord le document
2. Attendez le chargement complet
3. Désactivez les bloqueurs de publicité

## Erreur de connexion

**Symptôme** : Impossible de se connecter

**Solution** :
1. Vérifiez email et mot de passe
2. Réinitialisez votre mot de passe
3. Contactez le support`,
  },
  {
    slug: 'connexion',
    title: 'Problèmes de connexion',
    description: 'Résolvez vos problèmes d\'accès à votre compte.',
    readTime: '5 min',
    category: 'troubleshooting',
    tags: ['connexion', 'login', 'mot de passe', 'compte'],
    content: `# Problèmes de connexion

## Mot de passe oublié

1. Allez sur la page de connexion
2. Cliquez sur **"Mot de passe oublié"**
3. Entrez votre email
4. Suivez les instructions dans l'email

## Email non confirmé

1. Vérifiez votre boîte de réception
2. Cherchez l'email de confirmation
3. Cliquez sur le lien de confirmation
4. Si non reçu, demandez un renvoi

## Compte verrouillé

Après 5 tentatives échouées :
- Votre compte est temporairement verrouillé
- Attendez 15 minutes
- Ou réinitialisez votre mot de passe

## Problème de session

1. Videz les cookies du site
2. Fermez tous les onglets
3. Ouvrez un nouvel onglet
4. Connectez-vous à nouveau

## Navigateur incompatible

Utilisez un navigateur moderne :
- Chrome (recommandé)
- Firefox
- Edge
- Safari`,
  },
  {
    slug: 'performance',
    title: 'Améliorer les performances',
    description: 'Optimisez la vitesse et la fluidité de l\'application.',
    readTime: '6 min',
    category: 'troubleshooting',
    tags: ['performance', 'vitesse', 'lent', 'optimisation'],
    content: `# Améliorer les performances

## Navigateur

### Mises à jour
- Utilisez la dernière version de votre navigateur
- Activez les mises à jour automatiques

### Cache
- Videz le cache régulièrement
- Utilisez le mode navigation privée si nécessaire

### Extensions
- Désactivez les extensions inutiles
- Bloqueurs de publicité : ajoutez une exception

## Connexion

- Utilisez une connexion stable (WiFi ou 4G)
- Évitez les réseaux encombrés
- Testez votre débit sur speedtest.net

## Application

- Fermez les onglets inutiles
- Limitez le nombre de documents ouverts
- Utilisez Ctrl+S fréquemment

## Mobile

- Utilisez un smartphone récent
- Fermez les applications en arrière-plan
- Utilisez le mode WiFi de préférence`,
  },
  {
    slug: 'navigateurs-supportes',
    title: 'Navigateurs supportés',
    description: 'Les navigateurs compatibles avec CloudDevis.',
    readTime: '3 min',
    category: 'troubleshooting',
    tags: ['navigateur', 'compatible', 'chrome', 'firefox'],
    content: `# Navigateurs supportés

## Navigateurs recommandés

### Google Chrome ✅
- Version 90+
- Meilleure compatibilité
- Support JavaScript complet

### Mozilla Firefox ✅
- Version 88+
- Bonne performance
- Respect de la vie privée

### Microsoft Edge ✅
- Version 90+
- Basé sur Chromium
- Intégré à Windows

### Safari ✅
- Version 14+
- Pour macOS et iOS
- Bonne performance

## Navigateurs non supportés

- Internet Explorer ❌
- Anciennes versions de Chrome/Firefox ❌
- Navigateurs de sécurité obsolètes ❌

## Mobile

- Chrome Android ✅
- Safari iOS ✅
- Samsung Internet ✅

> **Conseil** : Utilisez Chrome pour la meilleure expérience.`,
  },
  {
    slug: 'quand-support',
    title: 'Quand contacter le support ?',
    description: 'Quand et comment contacter l\'assistance technique.',
    readTime: '4 min',
    category: 'troubleshooting',
    tags: ['support', 'aide', 'contact', 'assistance'],
    content: `# Quand contacter le support ?

## Cas nécessitant le support

### Problèmes techniques
- Erreur persistante après réessayage
- Données manquantes ou corrompues
- Fonctionnalité qui ne répond pas

### Problèmes de facturation
- Paiement non enregistré
- Erreur sur la facture
- Demande de remboursement

### Questions avancées
- Intégration API
- Migration de données
- Configuration entreprise

## Informations à préparer

Avant de contacter le support :
1. Votre **adresse email** de compte
2. La **description** du problème
3. Les **captures d'écran** si possible
4. Le **navigateur** utilisé
5. Les **étapes** pour reproduire

## Canaux de contact

- **Email** : support@clouddevis.com
- **Temps de réponse** : 24h en jours ouvrés

## Ce qui n'est pas un bug

- Fonctionnalité prévue mais mal comprise
- Erreur de saisie utilisateur
- Incompatibilité de navigateur`,
  },

  // ═══════════ ACCOUNT ═══════════
  {
    slug: 'profil',
    title: 'Configurer votre profil',
    description: 'Paramétrez les informations de votre entreprise.',
    readTime: '6 min',
    category: 'account',
    tags: ['profil', 'entreprise', 'paramètres', 'configuration'],
    content: `# Configurer votre profil

## Informations entreprise

### Onglet Informations
- **Nom** : Raison sociale
- **Adresse** : Adresse complète du siège
- **Téléphone** : Numéro de contact

### Onglet Préférences
- **Devise** : DA (par défaut)
- **Langue** : Français, Arabe, Anglais
- **Format de date** : JJ/MM/AAAA

### Onglet Sécurité
- **Mot de passe** : Changez votre mot de passe
- **Sessions** : Gérez vos sessions actives

## Numéros d'identification

### NIF (11 chiffres)
Numéro d'identification fiscale

### RC (9-14 caractères)
Numéro de registre du commerce

### NIS (10 chiffres)
Numéro d'identification statistique

### AI (10 chiffres)
Article d'immatriculation

## Logo de l'entreprise

1. Allez dans **Paramètres**
2. Section **Design & Logo**
3. Téléchargez votre logo
4. Choisissez la position (gauche/droite)

> **Astuce** : Le logo apparaît sur tous vos documents.`,
  },
  {
    slug: 'securite',
    title: 'Sécurité du compte',
    description: 'Protégez votre compte avec les bonnes pratiques.',
    readTime: '7 min',
    category: 'account',
    tags: ['sécurité', 'mot de passe', 'session', 'protection'],
    content: `# Sécurité du compte

## Bonnes pratiques mot de passe

### Caractéristiques d'un bon mot de passe
- Au moins **12 caractères**
- Mélange de **majuscules** et **minuscules**
- Au moins un **chiffre**
- Au moins un **caractère spécial**

### Exemple de mot de passe fort
\`C1oudD3v!s#2024\`

## Sessions actives

1. Allez dans **Paramètres** → **Sécurité**
2. Consultez les sessions actives
3. Déconnectez les sessions suspectes

## Authentification

### Connexion sécurisée
- HTTPS obligatoire
- Cookies sécurisés
- Session expire après inactivité

### Déconnexion automatique
- Après 30 minutes d'inactivité
- Fermeture du navigateur
- Déconnexion manuelle

## En cas de compromission

1. Changez votre mot de passe immédiatement
2. Déconnectez toutes les sessions
3. Contactez le support
4. Vérifiez vos documents récents`,
  },
  {
    slug: 'donnees-confidentialite',
    title: 'Données et confidentialité',
    description: 'Comment vos données sont protégées.',
    readTime: '6 min',
    category: 'account',
    tags: ['données', 'confidentialité', 'gdpr', 'protection'],
    content: `# Données et confidentialité

## Protection des données

### Chiffrement
- **HTTPS** pour toutes les communications
- **TLS 1.3** pour la sécurité des échanges
- Certificat SSL valide

### Stockage
- Serveurs sécurisés
- Sauvegardes automatiques
- Chiffrement des données au repos

## Données collectées

### Données personnelles
- Nom et prénom
- Adresse email
- Numéro de téléphone

### Données professionnelles
- Nom de l'entreprise
- Adresse
- Numéros fiscaux

### Données d'utilisation
- Pages visitées
- Documents créés
- Actions effectuées

## Vos droits

### Droit d'accès
Demandez une copie de vos données.

### Droit de suppression
Supprimez définitivement votre compte et vos données.

### Droit de rectification
Modifiez vos données personnelles à tout moment.

## Export de données

1. Allez dans **Paramètres**
2. Cliquez sur **"Exporter mes données"**
3. Téléchargez l'archive ZIP

> **Note** : L'export contient tous vos documents et données.`,
  },
  {
    slug: 'equipe-utilisateurs',
    title: 'Gérer l\'équipe',
    description: 'Ajoutez des membres et gérez les permissions.',
    readTime: '8 min',
    category: 'account',
    tags: ['équipe', 'utilisateurs', 'permissions', 'rôle'],
    content: `# Gérer l'équipe

## Ajouter un membre

1. Allez dans **Paramètres** → **Équipe**
2. Cliquez sur **"Inviter un membre"**
3. Entrez l'email du membre
4. Sélectionnez le rôle
5. Envoyez l'invitation

## Rôles disponibles

### Administrateur
- Accès complet
- Gère les membres
- Modifie les paramètres
- Supprime des documents

### Éditeur
- Crée et modifie les documents
- Consulte les rapports
- Ne gère pas les paramètres

### Visuel
- Consulte uniquement
- Pas de modification
- Pas de suppression

## Gestion des permissions

### Par défaut
- Chaque membre voit ses documents
- Les administrateurs voient tout

### Permissions personnalisées
- Accès par client
- Accès par projet
- Accès par type de document

## Supprimer un membre

1. Sélectionnez le membre
2. Cliquez sur **"Retirer"**
3. Confirmez l'action

> **Attention** : Le membre perdra immédiatement l'accès.`,
  },
  {
    slug: 'exporter-donnees',
    title: 'Exporter vos données',
    description: 'Téléchargez une copie de toutes vos données.',
    readTime: '4 min',
    category: 'account',
    tags: ['export', 'données', 'télécharger', 'backup'],
    content: `# Exporter vos données

## Que contient l'export ?

### Documents
- Tous vos devis et factures
- Historique des modifications
- PDF générés

### Clients
- Liste des clients
- Coordonnées
- Historique des documents

### Paramètres
- Configuration entreprise
- Préférences
- Templates

## Comment exporter ?

1. Allez dans **Paramètres**
2. Section **Confidentialité**
3. Cliquez sur **"Exporter mes données"**
4. Attendez la préparation
5. Téléchargez l'archive ZIP

## Format de l'export

- **Archive ZIP** compressée
- **Documents** : JSON + PDF
- **Clients** : JSON
- **Paramètres** : JSON
- **README** : Instructions

## Sauvegarde automatique

CloudDevis effectue des sauvegardes :
- **Quotidiennes** : Données complètes
- **Hebdomadaires** : Archivage
- **Mensuelles** : Conservation longue durée

> **Conseil** : Exportez régulièrement vos données.`,
  },
];

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return ARTICLES.filter(a => a.category === categoryId);
}

export function getArticle(categoryId: string, slug: string): HelpArticle | undefined {
  return ARTICLES.find(a => a.category === categoryId && a.slug === slug);
}

export function getCategory(id: string): HelpCategory | undefined {
  return CATEGORIES.find(c => c.id === id);
}
