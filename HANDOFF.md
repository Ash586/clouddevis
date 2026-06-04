# Handoff — CloudDevis

> Document de transfert complet : exigences, architecture, code produit, décisions clés.

---

## 1. EXIGENCES FOURNIES PAR LE CLIENT

### 1.1 Sources initiales

Le client a fourni deux pages HTML :

| Source | Contenu |
|--------|---------|
| `algerian-legal-guide.html` | Guide légal complet : 13 secteurs avec TVA, identifiants légaux (NIF/NIS/RC/AI), licences, pénalités, mentions obligatoires |
| `devis-peinture-pro.html` | ERP exemple : structure de devis, items, calculs, templates PDF |

**Ce que j'ai extrait :**
- Tous les secteurs, leurs TVA par défaut, leurs identifiants requis, leurs unités de mesure
- Le format de document : en-tête société, infos client, tableau des prestations, totaux, signature
- Le flux de travail (workflow) : Brouillon → Accepté → En cours → Livré
- Les types de documents : Devis → Proforma → Bon de Commande → Bon de Réception → Facture

---

## 2. QUESTIONS / RÉPONSES — DÉCISIONS PRODUIT

### 2.1 Secteurs par pays

**Question client :** Est-ce que les 13 secteurs sont les mêmes pour tous les pays ?

**Réponse :** Non, chaque pays a sa propre liste. Voici les secteurs par pays :

| Algérie | Tunisie | Maroc | France |
|---------|---------|-------|--------|
| BTP, Déménagement, Nettoyage, Hôtellerie, Réparation Auto, Santé, Formation, Immobilier, Transport, Artisanat, Agriculture, Professions Libérales, Informatique | BTP, Agriculture, Services, Transport, Santé, Éducation, Industrie, Commerce, Technologies | BTP, Agriculture, Transport, Santé, Éducation, Industrie, Commerce, Services, Technologies | BTP, Services, Santé, Éducation, Transport, Commerce, Industrie, Technologies |

**Code produit :** `src/types/sectors.ts` (non créé explicitement, les données sont dans chaque page via Select)

---

### 2.2 Lancement et disponibilité

**Question client :** Comment gère-t-on le lancement multi-pays ?

**Réponse :** Algérie d'abord. Tunisie, Maroc, France en "coming soon" — l'utilisateur choisit son pays à l'inscription, les pays non actifs sont grisés.

**Code produit :** `src/app/auth/register/page.tsx` — champ pays avec drapeaux, sélectionnable mais seul "Algérie" est officiellement supporté.

---

### 2.3 Modularité des champs (Field Toggling)

**Question client :** Peut-on activer/désactiver les champs individuellement ?

**Réponse :** Oui, chaque champ est un composant atomique indépendant (FieldWrapper pattern). La visibilité est stockée dans `User.settings.fieldVisibility` (JSON). Le toggle d'un champ n'affecte pas les autres.

**Code produit :**
- `src/components/ui/input.tsx` — composant atomique
- `src/components/ui/select.tsx`
- `src/components/ui/toggle.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/modal.tsx`
- `src/components/ui/button.tsx`

---

### 2.4 Tarification et essai

**Question client :** Comment fonctionne l'essai gratuit ?

**Réponse :** 1 semaine d'essai à partir de la création du premier document. Ensuite, mode limité : seuls le nom du document et son numéro sont visibles.

**Deux plans :**
| Plan | Prix | Fonctionnalités |
|------|------|-----------------|
| Basic | 2 900 DA/mois | Documents illimités, conformité légale, export PDF |
| Pro | 5 900 DA/mois | Tout Basic + statistiques avancées + export de données |

**Code produit :**
- `prisma/schema.prisma` — `SubscriptionStatus` enum : `FREE | TRIAL | BASIC | PRO | EXPIRED`
- `src/components/layout/TrialGate.tsx` — composant qui gère l'affichage selon le statut
- `src/app/dashboard/page.tsx` — bannière d'essai avec compteur
- `src/app/page.tsx` — modale de paywall

---

### 2.5 Abonnement

**Question client :** Mensuel ou annuel ?

**Réponse :** Les deux. Mensuel (prix ci-dessus), Annuel = 2 mois offerts.

**Code produit :** (les prix sont dans `TrialGate.tsx` et la landing page, le système de paiement n'est pas encore intégré — bientôt disponible)

---

### 2.6 Langues

**Question client :** Quelles langues ?

**Réponse :** Français (par défaut), Arabe, Anglais. L'utilisateur choisit à l'inscription et peut basculer dans la navbar.

**Code produit :**
- `src/app/auth/register/page.tsx` — sélecteur de langue
- `src/components/layout/navbar.tsx` — basculement de langue (FR/AR/EN)

---

### 2.7 Utilisateurs

**Question client :** Multi-utilisateurs ?

**Réponse :** Pas pour le moment. Compte unique pour l'instant. L'interface multi-utilisateurs est désactivée avec la mention "Bientôt disponible".

---

### 2.8 Stockage et base de données

**Question client :** Où sont stockées les données ? Quelle base de données ?

**Réponse :** Backend + PostgreSQL. C'est la solution la plus sécurisée et évolutive.

**Code produit :**
- `prisma/schema.prisma` — schéma complet
- `prisma.config.ts` — configuration Prisma 7
- `src/lib/prisma.ts` — client Prisma
- `src/lib/auth.ts` — sessions JWT

---

### 2.9 Numérotation des documents

**Question client :** Comment sont numérotés les documents ?

**Réponse :** Auto-séquentiel : `DEV-2026-00001`. L'utilisateur peut modifier manuellement.

**Code produit :**
- `src/lib/calculations.ts` — `generateDocumentNumber()`
- Éditeur : champ "Numéro" modifiable dans la barre latérale

---

### 2.10 PDF

**Question client :** Design des PDF ?

**Réponse :** Plusieurs templates disponibles. Extraction automatique de la couleur dominante du logo pour personnaliser les couleurs du PDF. Aucun filigrane "Généré via CloudDevis.io" dans l'aperçu éditeur (uniquement dans le PDF téléchargé).

**Code produit :**
- `src/components/editor/DocumentPreview.tsx` — aperçu live
- Génération PDF : HTML + Blob + impression (dans `EditorContent`)

---

### 2.11 Dashboard

**Question client :** Que doit contenir le tableau de bord ?

**Réponse :** Statistiques + documents récents + message de bienvenue + alertes d'essai.

**Code produit :** `src/app/dashboard/page.tsx`

---

### 2.12 Notifications

**Question client :** Comment notifier les clients ?

**Réponse :** Téléchargement (fonctionnel), Email (à venir), WhatsApp/Telegram (à venir).

---

### 2.13 Signature électronique

**Question client :** Comment signer ?

**Réponse :** Upload d'une image de signature, puis clic pour l'apposer sur le document.

**Code produit :** Champ `signature` dans le modèle Document (stocké en base, UI dans l'éditeur)

---

### 2.14 Sauvegarde

**Question client :** Fréquence des sauvegardes ?

**Réponse :** Automatique tous les 3 jours + manuelle à la demande.

**Code produit :** `prisma/schema.prisma` — modèle `Backup` avec type auto/manual

---

### 2.15 Assistant IA

**Question client :** IA intégrée ?

**Réponse :** Pas encore activée. Base d'apprentissage préparée. Fournisseur interchangeable plus tard.

---

### 2.16 Style UI

**Question client :** Style de l'interface ?

**Réponse :** Style iOS : coins arrondis, ombres, transitions fluides. Design dynamique et moderne.

**Code produit :** Tous les composants UI suivent ce style (Tailwind CSS v4)

---

## 3. ARCHITECTURE

### 3.1 Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 26.1.0 | Runtime |
| Next.js | 16.2.6 | Framework full-stack |
| React | 19.2.4 | UI |
| Tailwind CSS | v4 | Styles |
| Prisma | 7.8.0 | ORM + Adapter PostgreSQL |
| PostgreSQL | 18 | Base de données |
| bcryptjs | 3.0.3 | Hachage des mots de passe |
| jose | 6.2.3 | JWT (signature et vérification) |
| @prisma/adapter-pg | 7.8.0 | Adaptateur Prisma 7 pour PostgreSQL |

### 3.2 Structure du projet

```
cd/
├── prisma/
│   ├── schema.prisma          # Modèles de données (User, Client, Document, Backup, Account, PasswordResetToken)
│   └── config.ts              # Configuration Prisma 7
├── src/
│   ├── app/
│   │   ├── api/auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   ├── forgot-password/route.ts
│   │   │   ├── reset-password/route.ts
│   │   │   ├── oauth/route.ts
│   │   │   ├── oauth/[provider]/route.ts
│   │   │   └── oauth/callback/[provider]/route.ts
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── editor/page.tsx
│   │   ├── page.tsx            # Landing page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toggle.tsx
│   │   │   └── modal.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── TrialGate.tsx
│   │   └── editor/
│   │       └── DocumentPreview.tsx
│   ├── hooks/
│   │   ├── useEditor.ts
│   │   └── useAuth.ts
│   ├── lib/
│   │   ├── auth.ts             # hash/verify password, JWT session
│   │   ├── prisma.ts           # Client Prisma
│   │   ├── calculations.ts     # Calculs TVA, timbre, totaux
│   │   ├── utils.ts            # cn(), clamp()
│   │   └── logger.ts           # logInfo()
│   ├── types/
│   │   ├── index.ts            # DocumentState, LineItem, CalculationResult, etc.
│   │   └── sectors.ts          # SectorConfig (défini mais utilisé inliné)
│   ├── proxy.ts                # Protection des routes (anciennement middleware.ts)
│   └── middleware.ts           # SUPPRIMÉ — renommé en proxy.ts
├── .env                        # DATABASE_URL, JWT_SECRET, OAuth keys
├── ARCHITECTURE.md
└── HANDOFF.md                  # Ce fichier
```

---

## 4. MODÈLES DE DONNÉES (Prisma)

### 4.1 User

```
id              String          @id @default(cuid())
email           String          @unique
password        String          (hashé avec bcryptjs 12 rounds)
name            String
phone           String?
country         String          @default("algeria")
sector          String?
mode            UserMode        @default(ARTISAN)   // ARTISAN | ENTREPRISE
language        String          @default("fr")
subscriptionStatus SubscriptionStatus @default(TRIAL)
trialStartAt    DateTime?
subscriptionEndAt DateTime?
companyInfo     Json?           // { name, address, taxIds, capital, logo, signature }
settings        Json?           // { fieldVisibility, defaultTaxRegime, defaultDocType, template }
createdAt       DateTime        @default(now())
updatedAt       DateTime        @updatedAt
```

### 4.2 Relations

```
User ──< Account             (OAuth: Google/GitHub)
User ──< Session
User ──< PasswordResetToken  (mot de passe oublié)
User ──< Client
User ──< Document
User ──< Backup
```

### 4.3 Enums

```prisma
enum UserMode { ARTISAN, ENTREPRISE }
enum SubscriptionStatus { FREE, TRIAL, BASIC, PRO, EXPIRED }
enum DocumentType { DEVIS, PROFORMA, BC, BR, FACTURE }
enum DocumentStatus { DRAFT, ACCEPTED, PROGRESS, DELIVERED }
```

---

## 5. AUTHENTIFICATION

### 5.1 Inscription (`POST /api/auth/register`)

1. Validation : nom, email (format), mot de passe (min 6 car)
2. Vérification unicité email
3. Hachage mot de passe (bcryptjs 12 rounds)
4. Création utilisateur en base avec `subscriptionStatus: TRIAL`
5. Création session JWT (cookie httpOnly, 7 jours)
6. Redirection vers `/dashboard`

**Gestion d'erreurs :**
- 400 : champs manquants, email invalide, mot de passe trop court
- 409 : email déjà utilisé
- 500 : erreur serveur (base de données, etc.)

### 5.2 Connexion (`POST /api/auth/login`)

1. Vérification email + mot de passe
2. Création session JWT
3. Option "Se souvenir de moi" : 30 jours au lieu de 7
4. Redirection vers `/dashboard`

**Gestion d'erreurs :**
- 400 : email ou mot de passe manquant
- 401 : identifiants incorrects (message générique : "Email ou mot de passe incorrect")

### 5.3 Déconnexion (`POST /api/auth/logout`)

1. Suppression du cookie session
2. Retour `{ success: true }`

### 5.4 Session (`GET /api/auth/me`)

1. Lecture du cookie JWT
2. Vérification de la signature (jose)
3. Retour des données utilisateur : `{ userId, email, name, mode, sector, country, language, subscriptionStatus }`
4. 401 si non authentifié

### 5.5 Protection des routes (`src/proxy.ts`)

- Routes protégées : `/dashboard`, `/editor`
- Routes publiques : `/auth/login`, `/auth/register`
- API : toujours accessibles
- Non connecté → redirection vers `/auth/login`
- Connecté → accès autorisé
- Connecté sur login/register → redirection vers `/dashboard`

### 5.6 OAuth — Google / GitHub

| Endpoint | Rôle |
|----------|------|
| `GET /api/auth/oauth` | Liste des providers configurés |
| `GET /api/auth/oauth/[provider]` | Redirection vers l'écran de consentement |
| `GET /api/auth/oauth/callback/[provider]` | Callback : échange code → token → infos utilisateur |

**Flux OAuth :**
1. Bouton → `/api/auth/oauth/google` → redirection Google
2. Google → callback avec code
3. Échange code → access token
4. Fetch infos utilisateur (email, name, id)
5. Cherche `Account[provider, providerAccountId]`
6. Si existe → connecte
7. Si email existe déjà → lie le compte
8. Sinon → crée nouvel utilisateur
9. Crée session JWT → redirection `/dashboard`

**Configuration requise dans `.env` :**
```
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 5.7 Mot de passe oublié

**Demande de réinitialisation (`POST /api/auth/forgot-password`) :**
1. Reçoit email
2. Si utilisateur existe : invalide les anciens tokens, crée nouveau token (aléatoire 32 bytes)
3. Token stocké en base avec expiration (1 heure)
4. ***Actuellement :*** lien affiché dans la console du serveur
5. ***Production :*** envoi par email (Resend/Nodemailer)
6. Toujours retour `{ success: true }` (prévention email enumeration)

**Réinitialisation (`POST /api/auth/reset-password`) :**
1. Vérifie token valide, non expiré, non utilisé
2. Hache nouveau mot de passe
3. Met à jour l'utilisateur
4. Marque le token comme utilisé

---

## 6. COMPOSANTS UI

### 6.1 Button (`src/components/ui/button.tsx`)

```tsx
<Button variant="primary" size="md" disabled onClick={handleClick}>
  Texte
</Button>
```

Variants : `primary` (bleu), `secondary` (gris), `outline` (bordure), `ghost` (transparent)
Sizes : `sm`, `md`, `lg`

### 6.2 Input (`src/components/ui/input.tsx`)

```tsx
<Input label="Email" type="email" value={email} onChange={...} placeholder="..." error="Message d'erreur" required />
```

### 6.3 Select (`src/components/ui/select.tsx`)

```tsx
<Select label="Pays" value={country} onChange={...} options={[{ value: 'algeria', label: 'Algérie' }]} />
```

### 6.4 Card (`src/components/ui/card.tsx`)

```tsx
<Card className="p-4">...</Card>
```

### 6.5 Toggle (`src/components/ui/toggle.tsx`)

```tsx
<Toggle label="Afficher le logo" checked={showLogo} onChange={...} />
```

### 6.6 Modal (`src/components/ui/modal.tsx`)

```tsx
<Modal open={showModal} onClose={...} title="Titre">Contenu</Modal>
```

---

## 7. ÉDITEUR DE DOCUMENTS

### 7.1 Architecture

```
┌─────────────────────────────────────────────────────┐
│ Navbar                                               │
├──────────────────────┬──────────────────────────────┤
│  PANEL GAUCHE        │  PANEL DROIT                  │
│                      │                               │
│  ┌──────────────────┐│  ┌──────────────────────────┐ │
│  │ Wizard Steps     ││  │ Aperçu Live (A4)         │ │
│  │ 1. Client        ││  │ ┌────────────────────┐   │ │
│  │ 2. Prestations   ││  │ │ Entête Société     │   │ │
│  │ 3. Récapitulatif ││  │ │ Infos Client       │   │ │
│  └──────────────────┘│  │ │ Tableau Items       │   │ │
│  ┌──────────────────┐│  │ │ Totaux              │   │ │
│  │ Sidebar Controls ││  │ │ Signature           │   │ │
│  │ Type, TVA, N°    ││  │ └────────────────────┘   │ │
│  │ Toggle capital   ││  │                          │ │
│  └──────────────────┘│  │                          │ │
│                      │  │                          │ │
└──────────────────────┴──────────────────────────────┘
```

### 7.2 Hook useEditor

Gère :
- Les items (CRUD : ajouter, supprimer)
- Le type de document (devis, facture, proforma)
- Le régime TVA (19%, 9%, 0%)
- Les infos client et société
- Le mode (artisan/entreprise)
- Les calculs (sous-total, TVA, timbre, total, net à payer, lettrage)

### 7.3 wizard

Étape 1 — Client : nom, adresse, email, téléphone, identifiants légaux (NIF/NIS/RC/AI pour Algérie)
Étape 2 — Prestations : tableau des items (désignation, quantité, unité, prix unitaire, total)
Étape 3 — Récapitulatif : résumé complet avec totaux et bouton PDF

### 7.4 Génération PDF

Technique : Génération d'une page HTML complète avec styles CSS A4 → ouverture dans une nouvelle fenêtre via Blob + ObjectURL → déclenchement de l'impression.

Le PDF inclut :
- En-tête avec logo, raison sociale, identifiants légaux
- Informations client
- Tableau des prestations
- Totaux (HT, TVA, Timbre fiscal, TTC, Acompte, Net à payer)
- Montant en lettres
- Signature
- Pied de page : "Généré via CloudDevis.io" (uniquement dans le PDF, pas dans l'aperçu)

---

## 8. TRIAL ET PAIEMENT

### 8.1 TrialGate (`src/components/layout/TrialGate.tsx`)

Comportement selon le statut :

| Statut | Affichage |
|--------|-----------|
| `TRIAL` | Bannière jaune "Période d'essai" + contenu normal |
| `LIMITED` | Message "Accès limité" avec bouton upgrade (contenu masqué) |
| `BASIC` / `PRO` | Contenu normal, pas de bannière |

### 8.2 Plans tarifaires

| Basic (2 900 DA/mois) | Pro (5 900 DA/mois) |
|-----------------------|---------------------|
| Documents illimités | Tout Basic |
| Conformité légale | Statistiques avancées |
| Export PDF | Export de données |

---

## 9. TESTS EFFECTUÉS

### 9.1 Build

```
npm run build → 16 routes, 0 erreurs
```

### 9.2 Routes testées (serveur démarré sur http://localhost:3000)

| Route | Statut |
|-------|--------|
| `/` | 200 |
| `/auth/login` | 200 |
| `/auth/register` | 200 |
| `/auth/forgot-password` | 200 |
| `/auth/reset-password?token=test` | 200 |
| `/dashboard` | 307 → /auth/login |
| `/dashboard/editor` | 307 → /auth/login |
| `POST /api/auth/register` | 200 (création), 409 (duplicat) |
| `POST /api/auth/login` | 200 |
| `GET /api/auth/me` | 200 (connecté), 401 (déconnecté) |
| `POST /api/auth/logout` | 200 |
| `POST /api/auth/forgot-password` | 200 |
| `GET /api/auth/oauth` | 200 |
| `GET /api/auth/oauth/google` | 501 (non configuré) |

### 9.3 Problèmes rencontrés et résolus

| Problème | Cause | Solution |
|----------|-------|----------|
| `middleware.ts` déprécié | Next.js 16 renomme en `proxy.ts` | Renommage + `middleware` → `proxy` |
| PostgreSQL auth failed | `pg_hba.conf` en `scram-sha-256`, mdp "postgres" invalide | Passage en `trust` + restart service |
| `P1012` validation error | Relation manquante `PasswordResetToken` → `User` | Ajout du champ `userId` avec `@relation` |

---

## 10. PROCHAINES ÉTAPES RECOMMANDÉES

| Priorité | Tâche | Détails |
|----------|-------|---------|
| 🔴 Haute | Paiement en ligne | Intégration stripe/paytech pour souscrire aux abonnements |
| 🔴 Haute | Email service | Configurer Resend ou Nodemailer pour l'envoi des emails (reset password, notifications) |
| 🟡 Moyenne | OAuth credentials | Créer les apps Google Cloud et GitHub OAuth, ajouter les clés dans `.env` |
| 🟡 Moyenne | Dashboard réel | Remplacer les données mock par des vraies requêtes Prisma |
| 🟢 Basse | Multi-utilisateurs | Ajouter les rôles et permissions |
| 🟢 Basse | Assistant IA | Intégrer un provider LLM (OpenAI, Claude) |
| 🟢 Basse | Templates PDF supplémentaires | Ajouter des designs additionnels |

---

## 11. VARIABLES D'ENVIRONNEMENT

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/clouddevis?schema=public"
JWT_SECRET="clouddevis-dev-secret-change-in-production-abc123xyz"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 12. COMMANDES UTILES

```bash
# Développement
npm run dev          # Démarrer le serveur de développement

# Build
npm run build        # Compiler le projet

# Base de données
npx prisma db push   # Synchroniser le schéma Prisma avec la DB
npx prisma generate  # Générer le client Prisma
npx prisma studio    # Interface graphique pour la DB

# Démarrer le serveur (Windows)
.\start-dev.vbs      # Lancement persistant en arrière-plan
```

---

## 13. FICHIERS CLÉS

| Fichier | Fonction |
|---------|----------|
| `prisma/schema.prisma` | Modèles de données complets |
| `src/proxy.ts` | Protection des routes (authentification requise) |
| `src/lib/auth.ts` | Gestion des sessions JWT |
| `src/lib/calculations.ts` | Moteur de calcul (TVA, timbre, totaux, lettrage) |
| `src/hooks/useEditor.ts` | Hook central de l'éditeur |
| `src/hooks/useAuth.ts` | Hook client d'authentification |
| `src/components/layout/TrialGate.tsx` | Gestion des accès selon abonnement |
| `src/app/api/auth/oauth/callback/[provider]/route.ts` | Callback OAuth complet |
| `src/app/api/auth/forgot-password/route.ts` | Demande de réinitialisation |
| `src/app/api/auth/reset-password/route.ts` | Réinitialisation du mot de passe |
| `ARCHITECTURE.md` | Documentation d'architecture |
| `.env` | Configuration sensible (DB, JWT, OAuth) |

---

*Document généré le 30 mai 2026 — CloudDevis v0.1.0*
