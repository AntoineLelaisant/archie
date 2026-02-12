---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/project-context.md'
---

# archie-v2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for archie-v2, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**Gestion de compte (FR1-FR5)**

- FR1: L'utilisateur peut créer un compte avec email et mot de passe
- FR2: L'utilisateur peut se connecter et se déconnecter
- FR3: L'utilisateur peut consulter et modifier son profil
- FR4: L'utilisateur peut supprimer son compte et toutes ses données
- FR5: L'utilisateur peut consulter son espace de stockage utilisé (quota 2 Go)

**Dépôt de documents (FR6-FR11)**

- FR6: L'utilisateur peut déposer un ou plusieurs documents par drag & drop sur desktop
- FR7: L'utilisateur peut déposer un document via sélecteur de fichier sur mobile
- FR8: L'utilisateur peut prendre une photo de document avec la caméra mobile et la déposer
- FR9: L'utilisateur peut déposer plusieurs documents en batch (upload simultané)
- FR10: Le système accepte les formats PDF, JPG, PNG, WEBP, HEIC, XLSX et DOCX
- FR11: Le système rejette les fichiers qui dépassent le quota de stockage de l'utilisateur
- FR43: L'utilisateur peut déposer un fichier ZIP contenant des documents organisés en dossiers, avec le choix de conserver la structure existante ou de laisser l'IA optimiser le classement

**Traitement IA — pipeline (FR12-FR20)**

- FR12: Le système extrait le texte des documents déposés
- FR13: Le système extrait les entités typées du texte (émetteur, type de document, date, personne, montant)
- FR14: Le système génère une représentation indexable du contenu textuel pour la recherche sémantique
- FR15: Le système classifie automatiquement chaque document dans l'arborescence
- FR16: Le système oriente les documents à faible confiance de classification vers la file "À trier"
- FR17: Le système chiffre le document après traitement
- FR18: L'utilisateur reçoit un feedback du classement dans les 2 secondes suivant la fin du traitement (ex: "Classé dans Factures > EDF > 2025")
- FR19: Le système génère un thumbnail de chaque document
- FR20: Le système stocke le document et diffère le classement si le service IA est indisponible (mode dégradé)

**Organisation & navigation (FR21-FR24)**

- FR21: Le système génère automatiquement une arborescence de classement basée sur les documents de l'utilisateur
- FR22: L'arborescence ne réorganise pas les dossiers existants entre les visites. L'ajout de nouveaux documents peut créer de nouveaux dossiers mais ne déplace pas les documents déjà classés
- FR23: L'utilisateur peut naviguer dans l'arborescence pour parcourir ses documents
- FR24: L'utilisateur peut consulter les documents de la file "À trier"

**Recherche (FR25-FR28)**

- FR25: L'utilisateur peut rechercher ses documents en langage naturel via une barre de recherche unique
- FR26: Le système retourne les résultats pertinents en combinant indexation textuelle, recherche sémantique et métadonnées
- FR27: L'utilisateur peut visualiser une preview inline de chaque résultat de recherche
- FR28: L'utilisateur peut ouvrir le document complet depuis un résultat de recherche

**Gestion documentaire (FR29-FR34)**

- FR29: L'utilisateur peut déplacer un document d'un dossier à un autre dans l'arborescence
- FR30: Le système enregistre chaque déplacement comme signal d'apprentissage pour améliorer la classification future
- FR31: L'utilisateur peut supprimer un ou plusieurs documents
- FR32: L'utilisateur peut consulter les documents récemment déposés
- FR33: L'utilisateur peut télécharger un document pour le partager hors de l'application
- FR34: L'utilisateur peut exporter l'ensemble de ses documents et métadonnées (portabilité)

**Confidentialité & conformité (FR35-FR40)**

- FR35: Le système présente une demande de consentement explicite à l'inscription couvrant le traitement de tous types de documents, y compris les données de santé
- FR36: L'utilisateur peut exercer son droit à l'effacement sous 30 jours maximum (suppression complète : document, métadonnées, embeddings, texte OCR, logs d'accès)
- FR37: Le système chiffre les documents stockés at-rest
- FR38: Le système ne conserve les documents en clair que pendant la durée du pipeline de traitement
- FR39: Le système isole les données de chaque utilisateur (aucun accès croisé)
- FR40: Le système journalise les accès aux documents (qui, quand, quelle action) avec une rétention de 12 mois maximum, supprimés lors de l'exercice du droit à l'effacement (FR36)

**Pages publiques (FR41-FR42)**

- FR41: Un visiteur peut consulter la landing page présentant Archie
- FR42: Un visiteur peut consulter les CGU et la politique de confidentialité

### NonFunctional Requirements

**Performance**

- NFR-P1: Recherche (résultats affichés) < 1s
- NFR-P2: Pipeline de traitement complet < 20s par document
- NFR-P3: Feedback SSE (classement) < 2s après fin du pipeline
- NFR-P4: LCP (Largest Contentful Paint) < 2.5s
- NFR-P5: FID (First Input Delay) < 100ms
- NFR-P6: CLS (Cumulative Layout Shift) < 0.1
- NFR-P7: Upload batch (20 fichiers) : début du traitement < 5s

**Sécurité**

- NFR-S1: Tous les documents stockés sont chiffrés at-rest (AES-256 minimum)
- NFR-S2: Les communications sont chiffrées in-transit (HTTPS/TLS 1.3)
- NFR-S3: Le document est en clair uniquement pendant le pipeline de traitement, avec une durée maximale de 60 secondes — en cas d'échec, chiffrement automatique à l'expiration
- NFR-S4: Isolation complète des données entre utilisateurs — aucune requête ne peut accéder aux documents d'un autre utilisateur
- NFR-S5: Seul le texte extrait est transmis au service LLM externe, jamais le document original
- NFR-S6: Aucune donnée utilisateur n'alimente un modèle partagé (zéro cross-learning)
- NFR-S7: Les sessions expirent après inactivité (durée configurable, défaut 24h)
- NFR-S8: Les mots de passe sont hashés avec un algorithme résistant (bcrypt/argon2)
- NFR-S9: Journalisation des accès aux documents (audit trail) : logs horodatés, stockage en append-only, rétention 12 mois maximum

**Fiabilité & disponibilité**

- NFR-R1: Mode dégradé fonctionnel si le service LLM est indisponible — document stocké, classement différé et repris automatiquement
- NFR-R2: Mode dégradé fonctionnel si le service OCR est indisponible — même principe de reprise
- NFR-R3: Aucun document ne peut être perdu suite à une erreur du pipeline — le fichier original est persisté avant tout traitement
- NFR-R4: Les jobs en échec dans la queue sont retentés automatiquement (3 tentatives avec backoff exponentiel)
- NFR-R5: Backups chiffrés des données avec une fréquence quotidienne (RPO 24h maximum)

**Scalabilité**

- NFR-SC1: Le système supporte 50 utilisateurs actifs simultanés au lancement MVP
- NFR-SC2: Le système supporte 200 utilisateurs actifs simultanés (stretch goal 3 mois)
- NFR-SC3: Le pipeline de traitement supporte le traitement parallèle d'au moins 10 documents simultanément
- NFR-SC4: Le stockage supporte 2 Go × nombre d'utilisateurs sans dégradation des temps d'accès

**Accessibilité**

- NFR-A1: Conformité WCAG 2.1 niveau AA sur les parcours principaux
- NFR-A2: Navigation clavier complète sur toutes les fonctionnalités
- NFR-A3: Contraste de couleurs ≥ 4.5:1 (texte normal) et ≥ 3:1 (grands textes)
- NFR-A4: Labels ARIA sur tous les composants interactifs

**Intégrations externes**

- NFR-I1: Interface abstraite pour le fournisseur LLM, remplaçable sans modification des couches application et stockage
- NFR-I2: Interface abstraite pour le fournisseur OCR, remplaçable sans modification des couches application et stockage
- NFR-I3: Timeout configurable sur les appels API externes (défaut 30s)
- NFR-I4: Circuit breaker sur les appels au service LLM pour éviter les cascades d'échecs

**Infrastructure**

- NFR-INF1: Hébergement 100% français (Scaleway) — aucune donnée hors UE
- NFR-INF2: Déploiement conteneurisé en développement et en production
- NFR-INF3: Monitoring des coûts par utilisateur (API LLM, API OCR, stockage) avec tableau de bord quotidien

### Additional Requirements

**Depuis l'Architecture :**

- Starter template : composition de starters officiels (create-turbo + sv create + nest new + shadcn-svelte + houdini + drizzle + bullmq + zod). L'initialisation du projet via cette séquence est la première story d'implémentation.
- CQRS léger avec @nestjs/cqrs : séparation Commands (écriture) / Queries (lecture) + bus d'événements. Pas d'Event Sourcing.
- Transaction middleware sur CommandBus : @Transactional() opt-in, events publiés après le commit uniquement. @nestjs/cls + AsyncLocalStorage pour la propagation du contexte transactionnel.
- Module Core (`apps/api/src/core/`) : domain/ (TS pur) + infrastructure/ (NestJS-aware). Erreurs de base, event payloads partagés, projections publiques, CQRS bus, guards, filters, pipes.
- Envelope encryption : master key (env var) → data keys par utilisateur via HKDF (SHA-256). Data keys chiffrées stockées en PostgreSQL. Suppression de la data key = données irrécupérables (RGPD).
- Index vectoriel HNSW pour pgvector : `m = 16, ef_construction = 64`. Adapté au volume MVP (~10k-40k vecteurs).
- Auth JWT dans cookie httpOnly (15 min) + refresh token révocable en PostgreSQL (7 jours). Refresh silencieux via SvelteKit hooks.
- Hashing Argon2id (OWASP minimum : memory 19 MiB, iterations 2, parallelism 1).
- Rate limiting @nestjs/throttler : Login 5/min, Upload 20/min, Recherche 60/min, Global 100/min.
- SSE relay : Worker BullMQ → Redis Pub/Sub → NestJS SSE endpoint → SvelteKit relay → Browser EventSource. Le browser ne parle jamais à NestJS directement.
- Circuit breaker cockatiel : seuil 5 échecs/60s, half-open après 30s. Timeout 30s par appel. S'intègre dans la couche infrastructure.
- Mapping erreurs : DomainError → GraphQLError avec code dans `extensions`. ExceptionFilter NestJS global.
- PDF viewer : pdf.js (Mozilla) lazy-loaded au clic. Web worker pour ne pas bloquer le thread principal.
- Upload : form action SvelteKit (no-JS fallback) + enrichissement XHR pour le progress. Upload parallèle en batch.
- Tesseract : intégré comme librairie native dans les workers BullMQ (pas de service séparé). Image Docker avec Tesseract pré-installé + langues fr/en.
- Monitoring : Grafana + Prometheus self-hosted sur Scaleway + Sentry (SaaS plan gratuit).
- Redis multi-usage : BullMQ (queue) + cache applicatif (TTL 5 min) + Pub/Sub (SSE). Cache invalidé à chaque modification de document.
- Dependency-cruiser : 5 règles enforçant les frontières hexagonales et l'isolation inter-modules. Exécuté en CI et en local.
- Séquence d'implémentation recommandée : Auth → Data → Encryption → Ingestion → Pipeline → Search → SSE → Frontend → Monitoring.

**Depuis le UX Design :**

- Design system "Indigo Doux" : palette neutres + accent indigo-500. Police Inter. Espacements multiples de 4px. Border-radius doux, shadows minimales.
- Grid/card layout exclusif : tous les documents en format grille de cartes. Pas de vue liste.
- Pas de sidebar latérale : l'arborescence est le corps de la page, pas un panneau latéral.
- DocumentCard avec 3 variantes : `recent` (label statut + bouton "Modifier" + breadcrumb), `search` (breadcrumb, sans label), `tree` (sans breadcrumb, sans label).
- Labels de statut sur documents récents : "Classé dans [dossier]" ou "À trier".
- Bouton "Modifier" visible uniquement sur les cartes de documents récents.
- Breadcrumb de localisation sur chaque carte hors contexte arborescence.
- FolderSelector : composant unique réutilisé en 3 contextes (dropdown inline, modal, action groupée). Supporte recherche + navigation arbre + création de dossier à la volée.
- Lucide Icons comme bibliothèque d'icônes (lucide-svelte pour web).
- Toasts factuels : ton outil, pas assistant. Sujet = le document, jamais l'IA. Pas de première personne. Pas de points d'exclamation.
- Toast classement (emerald, 5s auto-dismiss) avec bouton "Déplacer". Toast "À trier" (amber, 5s). Toast erreur (red, persiste).
- États vides intentionnels : message sobre + action si pertinent. Pas d'illustrations ni mascottes.
- Skeletons pour tous les chargements (pas de spinners rotatifs).
- Navigation clavier : `/` pour focus recherche, Ctrl+A pour tout sélectionner, Delete pour supprimer, Arrow keys pour navigation arbre.
- Skip link "Aller au contenu" en premier élément du DOM.
- Responsive desktop-first : grilles 2 colonnes (mobile) / 3 colonnes (tablette) / 4 colonnes (desktop).
- FolderSelector : dropdown inline sur desktop, modal plein écran sur mobile.
- Cibles tactiles ≥ 44x44px, espacement ≥ 8px entre cibles.
- axe-core intégré dans les tests CI.
- prefers-reduced-motion respecté (désactiver animations).
- Sélection multiple : Ctrl+clic (desktop), appui long (mobile). ContextualActionBar quand ≥ 1 sélectionné.
- Drag & drop pour déplacer fichiers et dossiers. Feedback visuel : bordure indigo pointillée sur la cible.
- Confirmation uniquement pour la suppression (action destructive). Pas de confirmation pour le déplacement.
- Consentement + message souveraineté au premier upload : "Vos documents sont hébergés en France, chiffrés, et ne quittent jamais l'Europe."

**Depuis le Project Context :**

- Architecture hexagonale stricte : zéro import @nestjs/* dans domain/ ou application/ (sauf @nestjs/cqrs dans application/).
- TypeScript strict mode + noUncheckedIndexedAccess + exactOptionalPropertyTypes. Target ES2023.
- Zod comme unique librairie de validation (front + back + shared). Pas de class-validator.
- Pas de barrel files (index.ts), pas d'export default, pas d'enums TypeScript.
- Svelte 5 runes exclusivement ($state, $derived, $effect). Pas de stores legacy.
- Server-to-server : le navigateur ne parle jamais directement à NestJS.
- Conventional commits : `type(scope): description` en anglais.
- GitHub Flow : branche main toujours déployable, feature branches.
- Husky + lint-staged sur pre-commit. ESLint + Prettier.
- Colocalisation stricte des tests : `document.model.ts` → `document.model.spec.ts`.
- Couverture minimum : domaine 80%, application 80%, général 60%.

### FR Coverage Map

- FR1: Epic 1 — Création de compte (email + mot de passe)
- FR2: Epic 1 — Connexion et déconnexion
- FR3: Epic 1 — Consultation et modification du profil
- FR4: Epic 1 — Suppression de compte et données
- FR5: Epic 1 — Consultation du quota de stockage (2 Go)
- FR6: Epic 2 — Dépôt par drag & drop desktop
- FR7: Epic 2 — Dépôt via sélecteur de fichier mobile
- FR8: Epic 2 — Capture caméra mobile
- FR9: Epic 2 — Upload batch simultané
- FR10: Epic 2 — Formats acceptés (PDF, JPG, PNG, WEBP, HEIC, XLSX, DOCX)
- FR11: Epic 2 — Rejet si dépassement de quota
- FR43: Epic 2 — Import ZIP structuré avec choix de traitement
- FR12: Epic 3 — Extraction de texte (OCR)
- FR13: Epic 3 — Extraction d'entités typées (émetteur, type, date, personne, montant)
- FR14: Epic 3 — Génération d'embedding pour recherche sémantique
- FR15: Epic 3 — Classification automatique dans l'arborescence
- FR16: Epic 3 — Orientation vers "À trier" si faible confiance
- FR17: Epic 2 — Chiffrement du document après traitement
- FR18: Epic 3 — Feedback SSE du classement (< 2s après pipeline)
- FR19: Epic 2 — Génération de thumbnail
- FR20: Epic 3 — Mode dégradé (stockage + classement différé)
- FR21: Epic 3 — Arborescence auto-générée
- FR22: Epic 3 — Stabilité de l'arborescence entre les visites
- FR23: Epic 3 — Navigation dans l'arborescence
- FR24: Epic 3 — Consultation de la file "À trier"
- FR25: Epic 4 — Recherche en langage naturel
- FR26: Epic 4 — Résultats hybrides (full-text + sémantique + métadonnées)
- FR27: Epic 4 — Preview inline des résultats
- FR28: Epic 4 — Ouverture du document complet
- FR29: Epic 5 — Déplacement de documents entre dossiers
- FR30: Epic 5 — Signal d'apprentissage à chaque déplacement
- FR31: Epic 5 — Suppression de documents
- FR32: Epic 5 — Consultation des documents récents
- FR33: Epic 5 — Téléchargement de document
- FR34: Epic 5 — Export complet (portabilité)
- FR35: Epic 1 — Consentement explicite à l'inscription
- FR36: Epic 5 — Droit à l'effacement (< 30 jours)
- FR37: Epic 2 — Chiffrement at-rest des documents
- FR38: Epic 2 — Documents en clair uniquement pendant le pipeline
- FR39: Epic 2 — Isolation des données utilisateur
- FR40: Epic 5 — Journalisation des accès (audit trail)
- FR41: Epic 6 — Landing page
- FR42: Epic 6 — CGU et politique de confidentialité

## Epic List

### Epic 1 : Inscription et accès sécurisé

L'utilisateur peut créer un compte, se connecter, gérer son profil, consentir au traitement de ses données et consulter son quota de stockage.

**FRs couverts :** FR1, FR2, FR3, FR4, FR5, FR35

### Epic 2 : Dépôt et stockage sécurisé de documents

L'utilisateur peut déposer ses documents par différents canaux (drag & drop, sélecteur, caméra, batch) et les retrouver stockés de manière sécurisée avec des thumbnails.

**FRs couverts :** FR6, FR7, FR8, FR9, FR10, FR11, FR17, FR19, FR37, FR38, FR39, FR43

### Epic 3 : Classification intelligente et arborescence

Les documents déposés sont automatiquement traités par l'IA (OCR, extraction d'entités, embedding, classification) et organisés dans une arborescence auto-générée. L'utilisateur reçoit un feedback temps réel et peut naviguer dans ses dossiers et consulter la file "À trier".

**FRs couverts :** FR12, FR13, FR14, FR15, FR16, FR18, FR20, FR21, FR22, FR23, FR24

### Epic 4 : Recherche en langage naturel

L'utilisateur retrouve ses documents en < 1 seconde via une barre de recherche unique en langage naturel, avec preview inline et visionneuse intégrée.

**FRs couverts :** FR25, FR26, FR27, FR28

### Epic 5 : Gestion documentaire et apprentissage

L'utilisateur a le contrôle total sur son coffre-fort : déplacer des documents (avec apprentissage implicite de l'IA), supprimer, consulter les récents, télécharger, exporter. Le système apprend de chaque correction et journalise les accès.

**FRs couverts :** FR29, FR30, FR31, FR32, FR33, FR34, FR36, FR40

### Epic 6 : Vitrine publique

Les visiteurs peuvent découvrir Archie via la landing page et consulter les CGU et la politique de confidentialité.

**FRs couverts :** FR41, FR42

---

## Epic 1 : Inscription et accès sécurisé

L'utilisateur peut créer un compte, se connecter, gérer son profil, consentir au traitement de ses données et consulter son quota de stockage.

### Story 1.1 : Initialisation du monorepo

En tant que développeur,
Je veux un monorepo entièrement configuré avec SvelteKit, NestJS, le package shared et l'outillage de développement,
Afin de pouvoir commencer à implémenter les fonctionnalités d'Archie sur une base solide.

**Acceptance Criteria:**

**Given** le repository Git est vide
**When** la séquence d'initialisation est exécutée
**Then** le monorepo Turborepo est créé avec la structure `apps/web`, `apps/api`, `packages/shared`
**And** `apps/web` est une application SvelteKit (Svelte 5, TypeScript strict) avec Tailwind CSS, shadcn-svelte et Houdini configurés
**And** `apps/api` est une application NestJS (TypeScript strict) avec GraphQL code-first, Drizzle ORM et BullMQ configurés
**And** `packages/shared` contient un `tsconfig.json` et exporte les path aliases `@archie/shared`
**And** les path aliases `@archie/web`, `@archie/api`, `@archie/shared` sont configurés dans chaque package

**Given** le monorepo est initialisé
**When** je lance `pnpm dev`
**Then** SvelteKit démarre sur son port et NestJS démarre sur son port
**And** Turborepo orchestre les deux en parallèle avec le hot reload actif

**Given** le monorepo est initialisé
**When** je lance `docker compose up`
**Then** PostgreSQL (avec pgvector) et Redis démarrent et sont accessibles depuis les applications

**Given** le monorepo est initialisé
**When** je lance `pnpm lint`
**Then** ESLint (flat config v9+) et Prettier vérifient le code des trois packages
**And** Husky + lint-staged sont configurés sur le hook pre-commit

**Given** le monorepo est initialisé
**When** je lance `pnpm test`
**Then** Vitest s'exécute sur les trois packages via Turborepo

**Given** le monorepo est initialisé
**When** dependency-cruiser est exécuté
**Then** les 5 règles de frontières hexagonales sont actives (no-framework-in-domain, no-infra-in-domain, no-cross-module-imports, no-core-infra-in-domain, no-backend-only-in-shared)

**Given** le monorepo est initialisé
**When** j'inspecte `.github/workflows/`
**Then** un pipeline CI (`ci.yml`) est configuré avec les étapes : lint, type-check, tests (Vitest), dependency-cruiser
**And** le pipeline s'exécute sur chaque push et pull request

**Given** le monorepo est initialisé
**When** j'inspecte `apps/api/src/core/`
**Then** le module Core existe avec `core.module.ts`, `domain/errors/` (AppError, DomainError, InfrastructureError) et `infrastructure/` (structure de base pour CQRS, guards, filters, pipes)

### Story 1.2 : Inscription avec consentement

En tant qu'utilisateur,
Je veux créer un compte avec mon email et un mot de passe en donnant mon consentement explicite,
Afin de pouvoir accéder à Archie.

**Acceptance Criteria:**

**Given** je suis sur la page d'inscription
**When** je remplis un email valide, un mot de passe (≥ 8 caractères) et je coche la case de consentement
**Then** mon compte est créé
**And** mon mot de passe est hashé avec Argon2id (memory 19 MiB, iterations 2, parallelism 1)
**And** mon consentement est enregistré avec un horodatage
**And** je suis redirigé vers le dashboard

**Given** je suis sur la page d'inscription
**When** je soumets un email déjà utilisé
**Then** un message d'erreur s'affiche : "Cet email est déjà utilisé"
**And** aucun compte n'est créé

**Given** je suis sur la page d'inscription
**When** je soumets le formulaire sans cocher la case de consentement
**Then** un message d'erreur s'affiche indiquant que le consentement est obligatoire
**And** aucun compte n'est créé

**Given** je suis sur la page d'inscription
**When** je soumets un email invalide ou un mot de passe trop court
**Then** les erreurs de validation Zod s'affichent inline sous les champs concernés

**Given** une adresse IP tente de s'inscrire
**When** plus de 5 tentatives sont effectuées en 1 minute
**Then** les requêtes suivantes sont rejetées avec un code 429 (rate limiting)

**Given** le formulaire d'inscription est affiché
**When** j'inspecte la case de consentement
**Then** le texte mentionne explicitement le traitement de tous types de documents y compris les données de santé, l'hébergement en France et le chiffrement

**Given** JavaScript est désactivé dans le navigateur
**When** je soumets le formulaire d'inscription
**Then** le formulaire fonctionne via la form action SvelteKit (progressive enhancement)

### Story 1.3 : Connexion et gestion de session

En tant qu'utilisateur inscrit,
Je veux me connecter et rester authentifié de manière sécurisée,
Afin d'accéder à mes documents sans me reconnecter à chaque visite.

**Acceptance Criteria:**

**Given** je suis sur la page de connexion
**When** je saisis mon email et mot de passe corrects
**Then** un access token JWT (durée 15 min) est placé dans un cookie httpOnly secure
**And** un refresh token (durée 7 jours) est créé en base de données et placé dans un cookie httpOnly secure
**And** je suis redirigé vers le dashboard

**Given** je suis sur la page de connexion
**When** je saisis des identifiants incorrects
**Then** un message d'erreur générique s'affiche : "Email ou mot de passe incorrect"
**And** aucune information ne révèle si l'email existe ou non

**Given** je suis connecté et mon access token expire
**When** je fais une requête vers une page protégée
**Then** SvelteKit hooks.server.ts utilise le refresh token pour obtenir un nouveau access token silencieusement
**And** la requête aboutit normalement sans interruption

**Given** je suis connecté et mon refresh token expire (> 7 jours)
**When** je fais une requête vers une page protégée
**Then** je suis redirigé vers la page de connexion

**Given** je suis connecté
**When** je clique sur "Se déconnecter"
**Then** le refresh token est supprimé de la base de données
**And** les cookies sont supprimés
**And** je suis redirigé vers la page de connexion

**Given** je ne suis pas connecté
**When** j'essaie d'accéder à une route du groupe `(app)/`
**Then** je suis redirigé vers la page de connexion

**Given** une adresse IP tente de se connecter
**When** plus de 5 tentatives échouent en 1 minute
**Then** les requêtes suivantes sont rejetées avec un code 429

### Story 1.4 : Profil utilisateur et quota de stockage

En tant qu'utilisateur connecté,
Je veux consulter et modifier mon profil et voir mon espace de stockage utilisé,
Afin de gérer mon compte et connaître ma capacité restante.

**Acceptance Criteria:**

**Given** je suis connecté
**When** j'accède à la page de profil (`(app)/settings`)
**Then** je vois mon email, la date de création de mon compte et la date de mon consentement

**Given** je suis sur la page de profil
**When** je modifie mon mot de passe en fournissant l'ancien et un nouveau mot de passe valide
**Then** le nouveau mot de passe est hashé avec Argon2id et enregistré
**And** un message de confirmation s'affiche

**Given** je suis sur la page de profil
**When** je modifie mon mot de passe avec un ancien mot de passe incorrect
**Then** un message d'erreur s'affiche et le mot de passe n'est pas modifié

**Given** je suis connecté
**When** j'accède à la page de stockage (`(app)/settings/storage`)
**Then** je vois l'espace utilisé et l'espace total (2 Go)
**And** l'affichage est clair (ex : "1.2 Go / 2 Go utilisés")

**Given** je n'ai aucun document
**When** j'accède à la page de stockage
**Then** l'espace utilisé affiche "0 o / 2 Go utilisés"

### Story 1.5 : Suppression de compte

En tant qu'utilisateur connecté,
Je veux pouvoir supprimer mon compte et toutes mes données associées,
Afin de quitter la plateforme et exercer mon droit à l'effacement.

**Acceptance Criteria:**

**Given** je suis sur la page de profil
**When** je clique sur "Supprimer mon compte"
**Then** une boîte de dialogue de confirmation s'affiche : "Supprimer votre compte et toutes vos données ?"

**Given** la boîte de confirmation est affichée
**When** je confirme la suppression
**Then** mon compte utilisateur est supprimé
**And** mes refresh tokens sont supprimés
**And** mon consentement et ses métadonnées sont supprimés
**And** je suis déconnecté et redirigé vers la page d'accueil

**Given** la boîte de confirmation est affichée
**When** je clique sur "Annuler"
**Then** la boîte se ferme et aucune action n'est effectuée

**Given** mon compte est supprimé
**When** j'essaie de me connecter avec mes anciens identifiants
**Then** un message d'erreur générique s'affiche : "Email ou mot de passe incorrect"

---

## Epic 2 : Dépôt et stockage sécurisé de documents

L'utilisateur peut déposer ses documents par différents canaux (drag & drop, sélecteur, caméra, batch) et les retrouver stockés de manière sécurisée avec des thumbnails.

### Story 2.1 : Chiffrement et isolation de mes documents

En tant qu'utilisateur,
Je veux que mes documents soient chiffrés et isolés des autres utilisateurs,
Afin que personne d'autre ne puisse accéder à mes données.

**Acceptance Criteria:**

**Given** un utilisateur est créé
**When** le système dérive sa clé de chiffrement
**Then** une data key est générée via HKDF (SHA-256) à partir de la master key + userId
**And** la data key chiffrée est stockée en PostgreSQL dans la table `data_keys`

**Given** un document est soumis au stockage
**When** le système le persiste dans Scaleway Object Storage
**Then** le document est chiffré avec AES-256 via la data key de l'utilisateur avant l'envoi
**And** le document est stocké sous un chemin partitionné par userId (`{userId}/{documentId}`)

**Given** un document chiffré est stocké
**When** le système le déchiffre pour le traitement
**Then** le document en clair n'existe que pendant la durée du traitement (max 60 secondes)
**And** en cas d'échec du traitement, le document est automatiquement chiffré à l'expiration du délai

**Given** un utilisateur A est connecté
**When** il effectue une requête vers l'API (GraphQL query ou mutation)
**Then** le user-isolation guard injecte automatiquement son userId dans le contexte
**And** toutes les requêtes Drizzle sont filtrées par ce userId
**And** aucune donnée de l'utilisateur B n'est accessible

**Given** le module encryption est initialisé
**When** j'inspecte la structure du code
**Then** le port `EncryptionService` est défini dans `modules/encryption/domain/ports/`
**And** l'adapter `NodeCryptoEncryption` est dans `modules/encryption/infrastructure/adapters/`
**And** le port `StorageService` est défini dans `modules/ingestion/domain/ports/`
**And** l'adapter `ScalewayStorage` est dans `modules/ingestion/infrastructure/adapters/`

**Given** le schéma Drizzle est défini
**When** j'inspecte `database/schema/`
**Then** les tables `documents` et `data_keys` existent avec les colonnes nécessaires (userId, encryptedKey, createdAt, etc.)
**And** la table `documents` contient les colonnes : id (UUID), userId, originalName, mimeType, size, storagePath, status, createdAt, updatedAt

### Story 2.2 : Upload unitaire et stockage sécurisé

En tant qu'utilisateur connecté,
Je veux déposer un document via le sélecteur de fichier ou la caméra de mon mobile,
Afin de le stocker en sécurité dans mon coffre-fort Archie.

**Acceptance Criteria:**

**Given** je suis connecté et sur le dashboard
**When** je clique sur le bouton d'upload et sélectionne un fichier PDF
**Then** le fichier est validé (format, taille)
**And** le fichier est chiffré et stocké dans Scaleway Object Storage
**And** une entrée est créée dans la table `documents` avec le statut `uploaded`
**And** le message de souveraineté s'affiche lors du premier upload : "Vos documents sont hébergés en France, chiffrés, et ne quittent jamais l'Europe"

**Given** je suis sur mobile
**When** je clique sur le bouton d'upload
**Then** le sélecteur de fichier s'ouvre avec l'option de prendre une photo (attribut `capture`)
**And** la photo prise est uploadée comme un document

**Given** je sélectionne un fichier au format non supporté (ex: .exe, .mp4)
**When** le système valide le fichier
**Then** un toast d'erreur s'affiche : "Format non supporté"
**And** aucun fichier n'est stocké

**Given** les formats supportés sont configurés
**When** je dépose un fichier PDF, JPG, PNG, WEBP, HEIC, XLSX ou DOCX
**Then** le fichier est accepté et traité

**Given** mon quota de stockage est à 1.95 Go / 2 Go
**When** je dépose un fichier de 100 Mo
**Then** un toast d'erreur s'affiche : "Espace de stockage insuffisant"
**And** le fichier n'est pas stocké

**Given** JavaScript est désactivé
**When** je soumets un fichier via le formulaire
**Then** l'upload fonctionne via la form action SvelteKit (progressive enhancement)

**Given** le rate limiting est actif
**When** plus de 20 uploads sont tentés en 1 minute
**Then** les requêtes suivantes sont rejetées avec un code 429

### Story 2.3 : Upload par drag & drop et batch

En tant qu'utilisateur sur desktop,
Je veux déposer mes documents par drag & drop et en envoyer plusieurs à la fois,
Afin de remplir mon coffre-fort rapidement lors de l'onboarding.

**Acceptance Criteria:**

**Given** je suis connecté et sur le dashboard (desktop)
**When** je glisse des fichiers depuis mon explorateur vers la zone de dépôt
**Then** la zone de dépôt s'illumine (bordure indigo pointillée, fond indigo-50)
**And** les fichiers sont uploadés à la fin du drop

**Given** je glisse des fichiers vers la zone de dépôt
**When** je relâche les fichiers
**Then** chaque fichier est validé individuellement (format, taille, quota)
**And** les fichiers valides sont uploadés en parallèle
**And** les fichiers invalides affichent un toast d'erreur chacun

**Given** j'uploade 10 fichiers en batch
**When** l'upload est en cours
**Then** une barre de progression globale s'affiche (via XHR `upload.onprogress`)
**And** le traitement de chaque fichier commence dès que son upload individuel est terminé (pas d'attente du batch complet)

**Given** j'uploade 20 fichiers en batch
**When** l'upload débute
**Then** le début du traitement du premier fichier commence en < 5 secondes

**Given** le dashboard est vide (premier usage)
**When** j'arrive sur le dashboard
**Then** un état vide s'affiche : "Déposez vos documents, Archie s'occupe du reste"
**And** la zone de dépôt drag & drop est visible et fonctionnelle

**Given** un upload batch est en cours
**When** certains fichiers échouent (format invalide, quota dépassé)
**Then** les fichiers valides continuent leur upload normalement
**And** seuls les fichiers en erreur affichent un toast d'erreur

### Story 2.4 : Génération de thumbnails

En tant qu'utilisateur,
Je veux voir un aperçu visuel de chaque document déposé,
Afin de reconnaître mes documents sans les ouvrir.

**Acceptance Criteria:**

**Given** un document PDF est uploadé et stocké
**When** le système génère le thumbnail
**Then** une image de la première page du PDF est générée
**And** le thumbnail est chiffré et stocké dans Scaleway Object Storage
**And** le chemin du thumbnail est enregistré dans la table `documents`

**Given** un document image (JPG, PNG, WEBP, HEIC) est uploadé
**When** le système génère le thumbnail
**Then** une version redimensionnée de l'image est créée comme thumbnail
**And** le thumbnail est chiffré et stocké

**Given** un document XLSX ou DOCX est uploadé
**When** le système génère le thumbnail
**Then** un thumbnail générique par type de fichier est attribué (icône du format)

**Given** un thumbnail est demandé pour l'affichage
**When** le frontend requête le thumbnail
**Then** le thumbnail est déchiffré à la volée côté serveur et transmis au client
**And** le thumbnail n'est jamais stocké en clair sur le serveur

**Given** un document est en cours d'upload (thumbnail pas encore généré)
**When** le frontend affiche la carte du document
**Then** un placeholder skeleton s'affiche à la place du thumbnail
**And** le thumbnail remplace le placeholder dès qu'il est prêt (via SSE ou polling)

### Story 2.5 : Import ZIP structuré

En tant qu'utilisateur sur desktop,
Je veux déposer un fichier ZIP contenant mes documents déjà organisés en dossiers,
Afin de migrer facilement mon archivage existant vers Archie.

**Acceptance Criteria:**

**Given** je suis connecté et sur le dashboard (desktop)
**When** je glisse un fichier .zip vers la zone de dépôt
**Then** le système détecte l'archive et affiche un choix : "Conserver la structure" / "Optimiser la structure"

**Given** le choix "Conserver la structure" est sélectionné
**When** le système traite l'archive
**Then** l'arborescence des dossiers du ZIP est reproduite dans les dossiers d'Archie
**And** chaque document est placé dans le dossier correspondant à son emplacement dans le ZIP
**And** les fichiers à la racine du ZIP suivent le parcours de classification automatique standard

**Given** le choix "Optimiser la structure" est sélectionné
**When** le système traite l'archive
**Then** l'arborescence du ZIP sert d'indice mais l'IA peut réorganiser certains documents si elle détecte un meilleur classement
**And** les documents ambigus vont dans la file "À trier"
**And** les fichiers à la racine du ZIP suivent le parcours de classification automatique standard

**Given** le fichier ZIP est déposé
**When** le système extrait les fichiers
**Then** chaque fichier extrait est validé individuellement (format supporté, taille, quota global)
**And** les fichiers non supportés sont ignorés avec un toast d'erreur pour chacun
**And** le quota est vérifié sur la taille totale décompressée avant de commencer l'extraction

**Given** le fichier ZIP contient des fichiers valides
**When** l'extraction et le traitement sont terminés
**Then** chaque document suit le pipeline standard (chiffrement, stockage, thumbnail)
**And** les documents apparaissent dans la section "Documents récents" du dashboard

**Given** le fichier déposé n'est pas un ZIP valide ou est corrompu
**When** le système tente l'extraction
**Then** un toast d'erreur s'affiche : "Archive non valide"
**And** aucun fichier n'est stocké

---

## Epic 3 : Classification intelligente et arborescence

Les documents déposés sont automatiquement traités par l'IA (OCR, extraction d'entités, embedding, classification) et organisés dans une arborescence auto-générée. L'utilisateur reçoit un feedback temps réel et peut naviguer dans ses dossiers et consulter la file "À trier".

### Story 3.1 : Pipeline d'extraction de texte (OCR)

En tant qu'utilisateur ayant déposé un document,
Je veux que le texte de mon document soit extrait automatiquement,
Afin qu'Archie puisse analyser et classer mon document.

**Acceptance Criteria:**

**Given** un document est uploadé avec le statut `uploaded`
**When** l'événement DocumentUploadedEvent est publié (post-commit)
**Then** un job `extract-text` est créé dans la queue BullMQ `document-pipeline`
**And** le job contient documentId, userId, step et attempt

**Given** un job `extract-text` est dans la queue
**When** le worker BullMQ le traite
**Then** le document est déchiffré temporairement
**And** le texte est extrait via l'adapter Tesseract (langues fr/en)
**And** le texte extrait est stocké dans la table `documents` (colonne `extractedText`)
**And** le statut du document passe à `text_extracted`
**And** un événement TextExtractedEvent est publié

**Given** le service Tesseract est indisponible
**When** le worker tente l'extraction de texte
**Then** le circuit breaker cockatiel intercepte l'échec (seuil 5 échecs/60s, timeout 30s)
**And** le job est retenté automatiquement (3 tentatives, backoff exponentiel)

**Given** un document image (JPG, PNG, WEBP, HEIC) est dans la queue
**When** le worker le traite
**Then** l'OCR extrait le texte de l'image

**Given** un document PDF est dans la queue
**When** le worker le traite
**Then** le texte est extrait des pages du PDF (texte natif + OCR sur les pages scannées)

**Given** un document XLSX ou DOCX est dans la queue
**When** le worker le traite
**Then** le contenu textuel est extrait directement (pas d'OCR nécessaire)

**Given** j'inspecte la structure du code
**When** je regarde le module pipeline
**Then** le port `OcrService` est défini dans `modules/pipeline/domain/ports/`
**And** l'adapter `TesseractOcr` est dans `modules/pipeline/infrastructure/adapters/`
**And** le processor BullMQ est dans `modules/pipeline/infrastructure/processors/`

### Story 3.2 : Extraction d'entités et génération d'embeddings

En tant qu'utilisateur ayant un document dont le texte est extrait,
Je veux que les informations clés soient identifiées et le contenu indexé,
Afin que mon document soit classable et cherchable.

**Acceptance Criteria:**

**Given** un document a le statut `text_extracted`
**When** l'événement TextExtractedEvent est traité
**Then** un job `extract-entities` est créé dans la queue BullMQ

**Given** le job `extract-entities` est traité par le worker
**When** le texte extrait est envoyé à l'adapter Mistral (LlmService)
**Then** seul le texte est transmis à l'API externe (jamais le document original)
**And** les entités typées sont extraites : émetteur, type de document, date, personne(s), montant(s)
**And** les entités sont stockées en JSON dans la table `documents` (colonne `entities`)
**And** le statut passe à `entities_extracted`
**And** un événement EntitiesExtractedEvent est publié

**Given** un document a le statut `entities_extracted`
**When** l'événement EntitiesExtractedEvent est traité
**Then** un job `generate-embedding` est créé dans la queue BullMQ

**Given** le job `generate-embedding` est traité par le worker
**When** le texte extrait est envoyé à l'API d'embedding
**Then** un vecteur d'embedding est généré
**And** le vecteur est stocké dans la colonne `embedding` (pgvector) de la table `documents`
**And** le statut passe à `embedding_generated`
**And** un événement EmbeddingGeneratedEvent est publié

**Given** le service Mistral est indisponible
**When** le worker tente l'extraction d'entités ou la génération d'embedding
**Then** le circuit breaker cockatiel intercepte l'échec
**And** le job est retenté automatiquement (3 tentatives, backoff exponentiel)

**Given** j'inspecte la structure du code
**When** je regarde le module pipeline
**Then** le port `LlmService` est défini dans `modules/pipeline/domain/ports/`
**And** l'adapter `MistralLlm` est dans `modules/pipeline/infrastructure/adapters/`
**And** aucune donnée utilisateur n'alimente un modèle partagé (zéro cross-learning)

### Story 3.3 : Classification automatique et mode dégradé

En tant qu'utilisateur,
Je veux que mes documents soient classés automatiquement dans une arborescence cohérente,
Afin de ne jamais avoir à organiser mes documents moi-même.

**Acceptance Criteria:**

**Given** un document a le statut `embedding_generated`
**When** l'événement EmbeddingGeneratedEvent est traité
**Then** un job `classify-document` est créé dans la queue BullMQ

**Given** le job `classify-document` est traité
**When** le système analyse les entités + l'embedding + la similarité avec les documents existants de l'utilisateur
**Then** un dossier cible est déterminé avec un score de confiance
**And** si la confiance est haute (≥ seuil configurable), le document est classé dans le dossier cible
**And** le statut passe à `classified`

**Given** le système classifie un document avec un score de confiance bas (< seuil)
**When** la classification est incertaine
**Then** le document est orienté vers la file "À trier" (statut `to_sort`)
**And** aucun dossier n'est assigné

**Given** le dossier cible n'existe pas encore dans l'arborescence de l'utilisateur
**When** le système classifie un document
**Then** le dossier (et ses parents si nécessaire) sont créés automatiquement dans la table `folders`
**And** un événement FolderCreatedEvent est publié

**Given** un utilisateur a déjà des dossiers dans son arborescence
**When** un nouveau document est classé
**Then** les dossiers existants ne sont pas réorganisés ni renommés
**And** le document est ajouté à un dossier existant ou un nouveau dossier est créé

**Given** un document est classé avec succès
**When** la classification est terminée
**Then** un événement DocumentClassifiedEvent est publié avec documentId, folderId, folderPath et confidence

**Given** le service LLM ou OCR est indisponible et les 3 tentatives de retry sont épuisées
**When** le pipeline échoue
**Then** le document original reste stocké et chiffré (jamais perdu)
**And** le document reçoit le statut `pending_classification`
**And** un événement PipelineFailedEvent est publié
**And** le classement est repris automatiquement quand le service redevient disponible

**Given** j'inspecte le schéma Drizzle
**When** je regarde `database/schema/`
**Then** la table `folders` existe avec : id (UUID), userId, name, parentId (nullable, FK vers folders), path (texte matérialisé), createdAt
**And** la table `documents` a une colonne `folderId` (nullable, FK vers folders)

### Story 3.4 : Arborescence et navigation

En tant qu'utilisateur connecté,
Je veux parcourir mes dossiers et voir mes documents organisés dans une arborescence,
Afin de vérifier visuellement que tout est bien rangé et naviguer vers un document spécifique.

**Acceptance Criteria:**

**Given** je suis connecté et j'ai des documents classés
**When** j'accède au dashboard
**Then** je vois la section "Mes dossiers" affichant les dossiers racine en grille de FolderCards
**And** chaque FolderCard affiche l'icône Lucide Folder (indigo), le nom du dossier et le compteur de documents

**Given** je suis sur le dashboard
**When** je clique sur un FolderCard
**Then** je navigue dans le dossier et vois ses sous-dossiers et documents en grille
**And** un breadcrumb cliquable s'affiche en haut (chaque niveau est navigable)

**Given** je suis dans un sous-dossier
**When** je clique sur un niveau du breadcrumb
**Then** je navigue directement vers ce niveau de l'arborescence

**Given** je suis dans l'arborescence
**When** je vois les documents dans un dossier
**Then** les documents sont affichés en DocumentCard variante `tree` (thumbnail + titre + métadonnées, sans breadcrumb ni label de statut)

**Given** des documents sont dans la file "À trier"
**When** j'accède à la section "À trier" (via un onglet ou badge dans la navigation)
**Then** je vois les documents non classés en grille de DocumentCards
**And** un badge amber avec le compteur "À trier" est visible dans la barre de navigation

**Given** la file "À trier" est vide
**When** j'accède à cette section
**Then** un état vide sobre s'affiche : "Tous vos documents sont classés"

**Given** je navigue dans l'arborescence
**When** un dossier est vide
**Then** un état vide s'affiche : "Ce dossier est vide"

**Given** les dossiers sont en cours de chargement
**When** j'accède au dashboard ou à un dossier
**Then** des skeletons de FolderCard et DocumentCard s'affichent pendant le chargement

### Story 3.5 : Feedback temps réel (SSE)

En tant qu'utilisateur ayant déposé des documents,
Je veux voir en temps réel le résultat du classement de chaque document,
Afin de savoir immédiatement où mes documents sont rangés.

**Acceptance Criteria:**

**Given** un document est classé avec succès (DocumentClassifiedEvent publié)
**When** le worker publie l'événement sur Redis Pub/Sub (channel `user:{userId}:events`)
**Then** NestJS SSE endpoint reçoit l'événement
**And** SvelteKit le relaye au browser via son endpoint `/api/events`
**And** un toast emerald s'affiche : "Classé dans Factures › EDF › 2025" avec un bouton "Déplacer"
**And** le toast disparaît après 5 secondes (auto-dismiss)

**Given** un document est orienté vers "À trier" (statut `to_sort`)
**When** l'événement est publié via SSE
**Then** un toast amber s'affiche : "Ajouté dans À trier" avec un bouton "Classer"
**And** le badge "À trier" dans la navigation se met à jour

**Given** un pipeline échoue après 3 tentatives
**When** l'événement PipelineFailedEvent est relayé via SSE
**Then** un toast rouge s'affiche : "Échec du traitement — Réessayer" (persiste jusqu'à dismiss)

**Given** plusieurs documents sont en cours de traitement (batch upload)
**When** le pipeline tourne en arrière-plan
**Then** un PipelineIndicator apparaît sur le dashboard : pastille indigo animée + "N documents en cours de traitement..."
**And** le compteur décrémente à chaque document terminé
**And** le PipelineIndicator disparaît quand tous les documents sont traités

**Given** le feedback SSE arrive < 2 secondes après la fin du pipeline
**When** le document est classé
**Then** le toast apparaît en temps réel sans refresh de la page

**Given** le browser perd la connexion SSE
**When** la connexion est interrompue
**Then** le client tente une reconnexion automatique (EventSource natif)
**And** les événements manqués sont récupérés au prochain chargement de page

**Given** le ton des toasts
**When** un toast s'affiche
**Then** le sujet est le document (jamais l'IA) : "Classé dans..." et non "J'ai classé..."
**And** aucun point d'exclamation n'est utilisé

---

## Epic 4 : Recherche en langage naturel

L'utilisateur retrouve ses documents en < 1 seconde via une barre de recherche unique en langage naturel, avec preview inline et visionneuse intégrée.

### Story 4.1 : Moteur de recherche hybride (backend)

En tant qu'utilisateur,
Je veux que mes documents soient retrouvés par une recherche combinant texte, sémantique et métadonnées,
Afin de retrouver n'importe quel document en quelques mots, même approximatifs.

**Acceptance Criteria:**

**Given** un utilisateur a des documents classés avec texte extrait et embeddings générés
**When** il envoie une requête de recherche via le resolver GraphQL `searchDocuments(query: String!, limit: Int)`
**Then** le système effectue en parallèle une recherche full-text (tsvector/tsquery sur `extractedText`) et une recherche sémantique (cosine distance sur la colonne `embedding` via pgvector)
**And** les résultats des deux recherches sont fusionnés avec un score combiné pondéré
**And** les métadonnées (entités : émetteur, type, date, montant) sont utilisées comme signal de boost si elles matchent la requête
**And** seuls les documents de l'utilisateur connecté sont retournés (user-isolation guard)

**Given** une requête de recherche est envoyée
**When** le système génère l'embedding de la requête pour la recherche sémantique
**Then** seul le texte de la requête est envoyé à l'API d'embedding (jamais de document)
**And** l'index HNSW pgvector est utilisé (m=16, ef_construction=64)

**Given** une requête de recherche identique a été effectuée récemment
**When** la même requête est soumise dans les 5 minutes
**Then** les résultats sont servis depuis le cache Redis (TTL 5 min)
**And** le temps de réponse est significativement réduit

**Given** un document de l'utilisateur est modifié, déplacé ou supprimé
**When** le cache Redis contient des résultats de recherche
**Then** le cache est invalidé pour cet utilisateur

**Given** le resolver `searchDocuments` retourne des résultats
**When** le frontend reçoit la réponse
**Then** chaque résultat contient : documentId, titre (originalName), snippet (extrait de texte avec les termes matchés), score de pertinence, folderId, folderPath (breadcrumb), thumbnailUrl, mimeType, entités

**Given** la recherche est exécutée
**When** les résultats sont calculés et retournés
**Then** le temps total (embedding de la requête + requêtes DB + fusion) est < 1 seconde (NFR-P1)

**Given** une adresse IP effectue des recherches
**When** plus de 60 requêtes de recherche sont envoyées en 1 minute
**Then** les requêtes suivantes sont rejetées avec un code 429 (rate limiting)

**Given** la requête ne retourne aucun résultat
**When** le resolver `searchDocuments` est exécuté
**Then** un tableau vide est retourné (pas d'erreur)

**Given** j'inspecte la structure du code
**When** je regarde le module search
**Then** le port `SearchService` est défini dans `modules/search/domain/ports/`
**And** le query handler `SearchDocumentsHandler` est dans `modules/search/application/queries/`
**And** l'adapter `PgVectorSearch` est dans `modules/search/infrastructure/adapters/`
**And** le module suit l'architecture hexagonale (zéro import @nestjs/* dans domain/)

### Story 4.2 : Interface de recherche et résultats

En tant qu'utilisateur connecté,
Je veux rechercher mes documents via une barre de recherche et voir les résultats avec une preview inline,
Afin de retrouver rapidement le document que je cherche sans naviguer dans l'arborescence.

**Acceptance Criteria:**

**Given** je suis connecté et sur n'importe quelle page du dashboard
**When** je regarde la barre de navigation
**Then** un composant SearchBar est visible en permanence
**And** le placeholder indique "Rechercher un document..."

**Given** je suis sur le dashboard
**When** j'appuie sur la touche `/`
**Then** le focus est placé dans la SearchBar
**And** le curseur est prêt pour la saisie

**Given** je tape dans la SearchBar
**When** j'ai saisi au moins 2 caractères
**Then** la requête `searchDocuments` est envoyée (avec debounce de 300ms)
**And** des skeletons de résultats s'affichent pendant le chargement

**Given** les résultats de recherche arrivent
**When** le frontend les affiche
**Then** les résultats sont présentés en grille de DocumentCards variante `search`
**And** chaque carte affiche : thumbnail, titre du document, snippet avec les termes de recherche mis en évidence, breadcrumb du dossier (ex : "Factures › EDF › 2025")
**And** les cartes sont triées par score de pertinence décroissant

**Given** je clique sur le breadcrumb d'un résultat de recherche
**When** le breadcrumb est cliquable
**Then** je navigue vers le dossier correspondant dans l'arborescence

**Given** la recherche ne retourne aucun résultat
**When** les résultats sont affichés
**Then** un état vide sobre s'affiche : "Aucun document trouvé"

**Given** je vide la SearchBar
**When** le texte est effacé
**Then** la vue de recherche disparaît et je retrouve la vue précédente (dashboard ou dossier)

**Given** la SearchBar est affichée
**When** j'inspecte l'accessibilité
**Then** le composant a un label ARIA `role="search"` et `aria-label="Rechercher un document"`
**And** les résultats ont `role="list"` et chaque résultat `role="listitem"`
**And** la navigation clavier (Tab, Enter) fonctionne sur les résultats

**Given** je suis sur mobile
**When** j'utilise la SearchBar
**Then** les résultats s'affichent en grille 2 colonnes
**And** la SearchBar occupe toute la largeur disponible

### Story 4.3 : Visionneuse de document complète

En tant qu'utilisateur,
Je veux ouvrir un document en pleine page depuis un résultat de recherche ou l'arborescence,
Afin de consulter le contenu complet de mon document sans le télécharger.

**Acceptance Criteria:**

**Given** je suis sur une page affichant des DocumentCards (recherche, arborescence, récents, "À trier")
**When** je clique sur une DocumentCard
**Then** le composant DocumentViewer s'ouvre en pleine page (route `(app)/documents/[id]`)
**And** le document est affiché dans son intégralité

**Given** le document est un PDF
**When** le DocumentViewer l'affiche
**Then** pdf.js (Mozilla) est chargé en lazy-loading (import dynamique)
**And** le rendu PDF s'exécute dans un web worker pour ne pas bloquer le thread principal
**And** toutes les pages du PDF sont navigables (scroll continu)

**Given** le document est une image (JPG, PNG, WEBP, HEIC)
**When** le DocumentViewer l'affiche
**Then** l'image est affichée en pleine résolution avec zoom possible (pinch-to-zoom sur mobile)

**Given** le document est un XLSX ou DOCX
**When** le DocumentViewer l'affiche
**Then** le texte extrait (extractedText) est affiché en format lisible
**And** un bouton "Télécharger l'original" est disponible pour consulter le fichier natif

**Given** le document est demandé pour l'affichage
**When** le frontend requête le contenu du document
**Then** le document est déchiffré à la volée côté serveur (SvelteKit endpoint)
**And** le document en clair n'est jamais stocké sur le serveur (streaming)
**And** le navigateur ne parle jamais directement à NestJS (server-to-server)

**Given** le DocumentViewer est ouvert
**When** je regarde les métadonnées affichées
**Then** le titre du document (originalName), le dossier (breadcrumb cliquable), la date de dépôt et les entités extraites (émetteur, type, montant, date) sont visibles

**Given** le document est en cours de chargement
**When** le DocumentViewer s'ouvre
**Then** un skeleton pleine page s'affiche pendant le chargement
**And** le skeleton est remplacé par le contenu dès qu'il est prêt

**Given** le DocumentViewer est ouvert
**When** j'appuie sur Escape ou je clique sur le bouton retour
**Then** je reviens à la page précédente (recherche, arborescence, etc.)

**Given** le DocumentViewer est affiché
**When** j'inspecte l'accessibilité
**Then** le focus est piégé dans le viewer (focus trap)
**And** le bouton retour est accessible au clavier
**And** le contenu PDF a un `aria-label` descriptif

---

## Epic 5 : Gestion documentaire et apprentissage

L'utilisateur a le contrôle total sur son coffre-fort : déplacer des documents (avec apprentissage implicite de l'IA), supprimer, consulter les récents, télécharger, exporter. Le système apprend de chaque correction et journalise les accès.

### Story 5.1 : Journalisation des accès (audit trail)

En tant qu'opérateur du système,
Je veux que chaque accès et action sur un document soit journalisé,
Afin de garantir la traçabilité et la conformité RGPD.

**Acceptance Criteria:**

**Given** un utilisateur effectue une action sur un document (consultation, upload, déplacement, suppression, téléchargement, export)
**When** l'action est exécutée
**Then** une entrée est créée dans la table `access_logs` contenant : userId, documentId, action (enum : `view`, `upload`, `move`, `delete`, `download`, `export`), timestamp (UTC), metadata (ex : dossier source/cible pour un déplacement)

**Given** les logs d'accès sont écrits
**When** j'inspecte la table `access_logs`
**Then** la table est en mode append-only (pas d'UPDATE, pas de DELETE sauf par le pipeline d'effacement RGPD)
**And** un index existe sur (userId, timestamp) pour les requêtes de rétention

**Given** des logs d'accès ont plus de 12 mois
**When** un job de nettoyage périodique s'exécute (cron BullMQ quotidien)
**Then** les logs datant de plus de 12 mois sont supprimés
**And** seuls les logs expirés sont affectés

**Given** le module audit est implémenté
**When** j'inspecte la structure du code
**Then** le port `AuditService` est défini dans `modules/audit/domain/ports/`
**And** l'adapter `DrizzleAuditLog` est dans `modules/audit/infrastructure/adapters/`
**And** le logging est déclenché via les event handlers CQRS (DocumentViewedEvent, DocumentMovedEvent, etc.) et non par du code inline dans chaque handler

**Given** le schéma Drizzle est défini
**When** j'inspecte `database/schema/`
**Then** la table `access_logs` existe avec : id (UUID), userId (FK), documentId (nullable FK), action (text enum), metadata (JSONB nullable), createdAt (timestamp UTC)

### Story 5.2 : Dashboard documents récents

En tant qu'utilisateur connecté,
Je veux voir mes documents récemment déposés sur le dashboard,
Afin de retrouver rapidement mes derniers ajouts et vérifier leur statut de classement.

**Acceptance Criteria:**

**Given** je suis connecté et j'ai déposé des documents
**When** j'accède au dashboard
**Then** une section "Récents" affiche les derniers documents déposés en grille de DocumentCards variante `recent`
**And** les documents sont triés par date de dépôt décroissante
**And** un maximum de 12 documents est affiché (avec un lien "Voir tous les récents" si plus)

**Given** un document récent est classé dans un dossier
**When** sa carte est affichée
**Then** un label emerald "Classé dans [dossier]" est visible sur la carte
**And** un breadcrumb du dossier est affiché (ex : "Factures › EDF › 2025")
**And** un bouton "Modifier" est visible sur la carte

**Given** un document récent est dans la file "À trier"
**When** sa carte est affichée
**Then** un label amber "À trier" est visible sur la carte
**And** un bouton "Modifier" est visible sur la carte

**Given** je clique sur le bouton "Modifier" d'une carte récente
**When** le FolderSelector s'ouvre
**Then** je peux choisir un dossier de destination (dropdown inline sur desktop, modal plein écran sur mobile)
**And** le FolderSelector supporte la recherche, la navigation dans l'arbre et la création de dossier à la volée

**Given** je sélectionne un dossier dans le FolderSelector depuis une carte récente
**When** je valide le choix
**Then** le document est déplacé vers le dossier choisi
**And** le label de statut se met à jour immédiatement
**And** aucune confirmation n'est demandée (le déplacement n'est pas destructif)

**Given** je n'ai aucun document
**When** j'accède au dashboard
**Then** la section "Récents" affiche un état vide sobre : "Déposez vos documents, Archie s'occupe du reste"

**Given** les documents récents sont en cours de chargement
**When** j'accède au dashboard
**Then** des skeletons de DocumentCard s'affichent pendant le chargement

### Story 5.3 : Déplacement de documents et apprentissage

En tant qu'utilisateur connecté,
Je veux déplacer mes documents entre dossiers par drag & drop ou via le FolderSelector,
Afin de corriger le classement automatique et aider Archie à mieux classer à l'avenir.

**Acceptance Criteria:**

**Given** je suis dans l'arborescence et je vois des DocumentCards
**When** je glisse une DocumentCard vers un FolderCard
**Then** la cible affiche un feedback visuel : bordure indigo pointillée
**And** au drop, le document est déplacé vers le dossier cible
**And** aucune confirmation n'est demandée
**And** un toast factuel s'affiche : "Déplacé dans [dossier]"

**Given** un document est déplacé d'un dossier à un autre
**When** le déplacement est enregistré
**Then** la colonne `folderId` du document est mise à jour
**And** un événement DocumentMovedEvent est publié avec : documentId, sourceFolderId, targetFolderId, userId
**And** un signal d'apprentissage est créé dans la table `classification_feedback` : documentId, sourceFolderId, targetFolderId, entities (snapshot), timestamp
**And** ce signal sera utilisé par le classifieur pour améliorer ses prédictions futures (zéro cross-learning : uniquement les signaux de l'utilisateur courant)

**Given** je suis dans l'arborescence ou les résultats de recherche
**When** je clique sur le bouton "Déplacer" d'un document (ou du toast de classement)
**Then** le FolderSelector s'ouvre
**And** je peux naviguer dans l'arbre, rechercher un dossier ou créer un nouveau dossier à la volée
**And** la sélection d'un dossier déplace le document immédiatement

**Given** je crée un nouveau dossier à la volée dans le FolderSelector
**When** je saisis un nom et valide
**Then** le dossier est créé dans l'arborescence à l'emplacement choisi
**And** le document est déplacé dans ce nouveau dossier

**Given** le cache Redis contient des résultats de recherche pour cet utilisateur
**When** un document est déplacé
**Then** le cache est invalidé

**Given** j'inspecte le schéma Drizzle
**When** je regarde `database/schema/`
**Then** la table `classification_feedback` existe avec : id (UUID), userId (FK), documentId (FK), sourceFolderId (nullable FK), targetFolderId (FK), entities (JSONB), createdAt (timestamp)

### Story 5.4 : Sélection multiple et suppression

En tant qu'utilisateur connecté,
Je veux sélectionner plusieurs documents et les supprimer en une seule action,
Afin de gérer efficacement mon coffre-fort.

**Acceptance Criteria:**

**Given** je suis dans l'arborescence, les récents ou la file "À trier"
**When** je fais Ctrl+clic (desktop) ou un appui long (mobile) sur une DocumentCard
**Then** la carte passe en mode sélectionné (bordure indigo, coche visible)
**And** une ContextualActionBar apparaît en bas de l'écran avec les actions disponibles

**Given** des documents sont sélectionnés et la ContextualActionBar est affichée
**When** je regarde la barre
**Then** elle affiche le compteur "N document(s) sélectionné(s)" et les boutons : "Déplacer", "Supprimer"

**Given** des documents sont sélectionnés
**When** j'appuie sur Ctrl+A
**Then** tous les documents visibles dans la vue courante sont sélectionnés

**Given** des documents sont sélectionnés
**When** je clique sur "Déplacer" dans la ContextualActionBar
**Then** le FolderSelector s'ouvre en mode action groupée
**And** la sélection d'un dossier déplace tous les documents sélectionnés
**And** un signal d'apprentissage est créé pour chaque document déplacé

**Given** des documents sont sélectionnés
**When** je clique sur "Supprimer" dans la ContextualActionBar
**Then** une boîte de confirmation s'affiche : "Supprimer N document(s) ?"

**Given** la boîte de confirmation de suppression est affichée
**When** je confirme la suppression
**Then** chaque document sélectionné est supprimé : fichier dans Object Storage, entrée en base (document, entities, embedding, extractedText, thumbnail), entrée dans le dossier
**And** le cache Redis de recherche est invalidé
**And** un toast factuel s'affiche : "N document(s) supprimé(s)"

**Given** un seul document est affiché
**When** j'appuie sur la touche Delete (desktop) avec le document sélectionné
**Then** la boîte de confirmation de suppression s'affiche

**Given** la boîte de confirmation est affichée
**When** je clique sur "Annuler"
**Then** la boîte se ferme et aucun document n'est supprimé

**Given** je clique n'importe où hors des cartes sélectionnées
**When** la sélection est active
**Then** la sélection est annulée et la ContextualActionBar disparaît

### Story 5.5 : Téléchargement et export de données

En tant qu'utilisateur connecté,
Je veux télécharger un document ou exporter l'ensemble de mes données,
Afin de partager un document hors de l'application ou exercer mon droit à la portabilité.

**Acceptance Criteria:**

**Given** je suis sur le DocumentViewer ou j'ai sélectionné un document
**When** je clique sur "Télécharger"
**Then** le document original est déchiffré à la volée côté serveur
**And** le fichier est téléchargé dans son format original avec son nom d'origine
**And** le navigateur ne parle jamais directement à NestJS (server-to-server)

**Given** je suis dans la ContextualActionBar avec des documents sélectionnés
**When** je clique sur "Télécharger" (si plusieurs documents)
**Then** un fichier ZIP est généré côté serveur contenant tous les documents sélectionnés déchiffrés
**And** le ZIP est téléchargé

**Given** je suis sur la page de profil / paramètres
**When** je clique sur "Exporter toutes mes données"
**Then** un job d'export est créé dans la queue BullMQ
**And** un toast s'affiche : "Export en cours de préparation..."

**Given** le job d'export est traité
**When** l'export est terminé
**Then** un fichier ZIP est généré contenant : tous les documents déchiffrés dans leur arborescence de dossiers, un fichier `metadata.json` avec les métadonnées de chaque document (entités, dates, dossier, texte extrait)
**And** un événement SSE notifie l'utilisateur : "Export prêt — Télécharger"
**And** le lien de téléchargement est disponible pendant 24h puis automatiquement supprimé

**Given** l'export est volumineux (proche du quota de 2 Go)
**When** le job d'export s'exécute
**Then** le ZIP est généré en streaming pour ne pas saturer la mémoire du serveur

**Given** un téléchargement ou export est effectué
**When** l'action est terminée
**Then** un log d'accès est créé avec l'action `download` ou `export`

### Story 5.6 : Droit à l'effacement RGPD

En tant qu'utilisateur,
Je veux pouvoir demander la suppression complète de toutes mes données sous 30 jours,
Afin d'exercer mon droit à l'effacement conformément au RGPD.

**Acceptance Criteria:**

**Given** je suis sur la page de profil
**When** je clique sur "Supprimer toutes mes données" (distinct de "Supprimer mon compte" de la Story 1.5)
**Then** une boîte de confirmation détaillée s'affiche expliquant : "Toutes vos données seront supprimées de manière irréversible : documents, métadonnées, texte extrait, embeddings, logs d'accès. Cette opération est irréversible."

**Given** la boîte de confirmation est affichée
**When** je confirme l'effacement
**Then** un job `rgpd-erasure` est créé dans la queue BullMQ avec priorité haute
**And** un toast s'affiche : "Demande d'effacement enregistrée"
**And** la date de la demande est enregistrée

**Given** le job `rgpd-erasure` est traité
**When** le pipeline d'effacement s'exécute
**Then** les éléments suivants sont supprimés dans l'ordre :
1. Tous les fichiers dans Scaleway Object Storage (documents + thumbnails)
2. Tous les embeddings (colonne `embedding` dans `documents`)
3. Tout le texte extrait (colonne `extractedText` dans `documents`)
4. Toutes les entités extraites (colonne `entities` dans `documents`)
5. Tous les logs d'accès (table `access_logs` pour ce userId)
6. Tous les signaux d'apprentissage (table `classification_feedback` pour ce userId)
7. Tous les dossiers (table `folders` pour ce userId)
8. Toutes les entrées documents (table `documents` pour ce userId)
9. La data key chiffrée (table `data_keys` pour ce userId) — cette suppression rend les données irrécupérables même si un backup était restauré

**Given** le pipeline d'effacement est terminé
**When** la suppression est complète
**Then** un email de confirmation est envoyé à l'utilisateur (si l'email existe encore)
**And** le compte utilisateur reste actif mais vide (l'utilisateur peut redéposer des documents)

**Given** le pipeline d'effacement rencontre une erreur
**When** une étape échoue
**Then** le job est retenté (3 tentatives, backoff exponentiel)
**And** les étapes déjà complétées ne sont pas rejouées (idempotence)
**And** en cas d'échec définitif, une alerte est envoyée à l'opérateur

**Given** la demande d'effacement est enregistrée
**When** j'inspecte les délais
**Then** l'effacement complet est garanti sous 30 jours maximum
**And** dans la pratique, le job s'exécute dans les minutes suivant la demande

**Given** l'utilisateur a aussi demandé la suppression de son compte (Story 1.5)
**When** les deux actions sont combinées
**Then** le pipeline d'effacement RGPD s'exécute d'abord, puis le compte est supprimé

---

## Epic 6 : Vitrine publique

Les visiteurs peuvent découvrir Archie via la landing page et consulter les CGU et la politique de confidentialité.

### Story 6.1 : Landing page

En tant que visiteur,
Je veux consulter une page de présentation d'Archie,
Afin de comprendre ce que le service propose avant de m'inscrire.

**Acceptance Criteria:**

**Given** je suis un visiteur non connecté
**When** j'accède à la racine du site (`/`)
**Then** la landing page s'affiche avec :
- Une section hero présentant Archie et sa proposition de valeur (coffre-fort documentaire intelligent)
- Les fonctionnalités clés (classement automatique, recherche en langage naturel, chiffrement)
- Un message de souveraineté : hébergement 100% français, chiffrement at-rest, données qui ne quittent jamais l'Europe
- Un CTA principal "Créer un compte" menant à la page d'inscription

**Given** la landing page est affichée
**When** j'inspecte le design
**Then** la page respecte le design system "Indigo Doux" : palette neutres + accent indigo-500, police Inter, espacements multiples de 4px, border-radius doux, shadows minimales
**And** les icônes utilisées proviennent de Lucide (lucide-svelte)

**Given** la landing page est affichée sur mobile
**When** j'inspecte le responsive
**Then** le contenu s'adapte en une seule colonne
**And** le CTA reste visible et accessible
**And** les cibles tactiles font ≥ 44x44px

**Given** la landing page est affichée
**When** j'inspecte l'accessibilité
**Then** le LCP (Largest Contentful Paint) est < 2.5s (NFR-P4)
**And** le CLS (Cumulative Layout Shift) est < 0.1 (NFR-P6)
**And** le contraste des textes est ≥ 4.5:1 (texte normal) et ≥ 3:1 (grands textes) (NFR-A3)
**And** un skip link "Aller au contenu" est le premier élément du DOM
**And** la navigation clavier est fonctionnelle sur tous les liens et boutons

**Given** la landing page est affichée
**When** j'inspecte les liens de navigation
**Then** des liens vers "CGU" et "Politique de confidentialité" sont présents dans le footer
**And** un lien "Se connecter" est présent dans la barre de navigation

**Given** je suis déjà connecté
**When** j'accède à `/`
**Then** je suis redirigé vers le dashboard

**Given** la landing page est servie
**When** j'inspecte le rendu
**Then** la page est rendue côté serveur (SSR SvelteKit) pour le SEO et la performance
**And** aucune requête vers NestJS n'est nécessaire (contenu statique)

### Story 6.2 : CGU et politique de confidentialité

En tant que visiteur ou utilisateur,
Je veux consulter les conditions générales d'utilisation et la politique de confidentialité,
Afin de connaître mes droits et les engagements d'Archie concernant mes données.

**Acceptance Criteria:**

**Given** je suis un visiteur ou un utilisateur connecté
**When** j'accède à `/terms`
**Then** la page des CGU s'affiche avec le contenu juridique structuré (titres, paragraphes, listes)
**And** la date de dernière mise à jour est visible

**Given** je suis un visiteur ou un utilisateur connecté
**When** j'accède à `/privacy`
**Then** la politique de confidentialité s'affiche avec :
- Les types de données collectées
- Les finalités du traitement (classement automatique, recherche)
- Les mesures de sécurité (chiffrement, hébergement France, isolation)
- Les droits de l'utilisateur (accès, rectification, effacement, portabilité)
- La durée de conservation des données
- Les coordonnées du responsable de traitement

**Given** les pages CGU et politique de confidentialité sont affichées
**When** j'inspecte le design
**Then** les pages respectent le design system "Indigo Doux"
**And** le contenu est lisible (largeur maximale de lecture, typographie claire)
**And** les titres de section sont navigables (ancres)

**Given** les pages sont affichées sur mobile
**When** j'inspecte le responsive
**Then** le contenu s'adapte en pleine largeur avec des marges confortables

**Given** les pages sont affichées
**When** j'inspecte l'accessibilité
**Then** la structure heading (h1, h2, h3) est sémantiquement correcte
**And** le contraste est conforme (NFR-A3)
**And** le skip link est présent

**Given** les pages CGU et politique de confidentialité existent
**When** j'inspecte la navigation
**Then** elles sont accessibles depuis le footer de toutes les pages (publiques et authentifiées)
**And** elles sont liées depuis le formulaire d'inscription (Story 1.2, texte de consentement)
