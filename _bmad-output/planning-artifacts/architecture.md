---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-02-12'
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/project-context.md'
workflowType: 'architecture'
project_name: 'archie-v2'
user_name: 'Antoine'
date: '2026-02-12'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

42 FRs organisés en 7 groupes de capacités :

| Groupe | FRs | Implication architecturale |
|---|---|---|
| Gestion de compte | FR1-FR5 | Module Auth (inscription, session, profil, suppression complète, quota) |
| Dépôt de documents | FR6-FR11 | Module Ingestion (multi-canal : drag & drop, file input, caméra, batch, ZIP structuré). Formats : PDF, JPG, PNG, WEBP, HEIC, XLSX, DOCX. Validation quota. |
| Traitement IA (pipeline) | FR12-FR20 | Module Pipeline orchestrant 5 étapes séquentielles pluggables : extraction texte → extraction entités → génération embedding → classification → chiffrement. Feedback SSE. Mode dégradé. Thumbnail. |
| Organisation & navigation | FR21-FR24 | Module Classification (arborescence auto-générée, stable entre visites, file "À trier") |
| Recherche | FR25-FR28 | Module Search (hybride full-text + sémantique + métadonnées, résultats < 1s, preview inline) |
| Gestion documentaire | FR29-FR34 | Module Documents (déplacement = signal d'apprentissage, suppression, documents récents, téléchargement, export portabilité) |
| Confidentialité & conformité | FR35-FR40 | Transversal : consentement, effacement complet, chiffrement, pipeline éphémère, isolation, audit trail |

**Non-Functional Requirements:**

25 NFRs en 7 catégories, dont les plus structurants pour l'architecture :

| Catégorie | NFRs clés | Impact architectural |
|---|---|---|
| Performance | Recherche < 1s, pipeline < 20s, SSE < 2s, LCP < 2.5s | Index optimisés, queue async, SSE, SvelteKit SSR |
| Sécurité | AES-256 at-rest, TLS 1.3, pipeline éphémère 60s max, isolation utilisateur, zéro cross-learning | Chiffrement couche stockage, contexte pipeline isolé, RLS ou filtrage strict |
| Fiabilité | Mode dégradé LLM/OCR, retry 3x backoff exponentiel, fichier original persisté avant traitement | Queue BullMQ avec retry, stockage découplé du pipeline |
| Scalabilité | 50 users actifs simultanés (MVP), 200 (stretch), 10 docs parallèles, 2 Go × N users | Workers BullMQ parallèles, stockage objet S3-compatible |
| Accessibilité | WCAG 2.1 AA, navigation clavier, contraste ≥ 4.5:1, ARIA | shadcn-svelte + bits-ui (primitives accessibles) |
| Intégrations | Interfaces abstraites LLM/OCR, timeout 30s, circuit breaker | Pattern Strategy, injection de dépendances NestJS |
| Infrastructure | 100% français (Scaleway), conteneurisé, monitoring coûts | Docker Swarm, Scaleway Object Storage |

**Scale & Complexity:**

- Domaine principal : Full-stack web + pipeline IA asynchrone
- Niveau de complexité : **Medium-High**
- Composants architecturaux estimés : ~8 modules backend (Auth, Ingestion, Pipeline, Classification, Search, Documents, Shared/Encryption, Audit) + frontend SvelteKit + queue workers

### Technical Constraints & Dependencies

**Contraintes imposées par le project-context :**

- Architecture hexagonale stricte (domain / application / infrastructure) — enforced par dependency-cruiser
- Monorepo pnpm + Turborepo (`apps/web`, `apps/api`, `packages/shared`)
- Schema GraphQL code-first (NestJS) versionné dans `packages/shared/` comme contrat Houdini
- Server-to-server : le navigateur ne parle jamais directement à NestJS
- Zod comme unique librairie de validation (front + back + shared)
- Pas de barrel files, pas d'export default, pas d'enums TypeScript
- Svelte 5 runes exclusivement (pas de stores legacy)

**Dépendances externes critiques :**

- Mistral API (LLM) — classification, extraction d'entités, embeddings
- Tesseract (OCR) — self-hosted
- PostgreSQL + pgvector — stockage + recherche vectorielle
- Redis + BullMQ — queue de traitement async
- Scaleway Object Storage — stockage des documents chiffrés

### Cross-Cutting Concerns Identified

1. **Chiffrement end-to-end** — Touche le stockage objet, le pipeline (éphémère), les thumbnails (chiffrés at-rest, déchiffrés à la volée), les embeddings, les backups. Nécessite un module Encryption transversal.

2. **Isolation utilisateur** — Chaque requête DB, chaque embedding, chaque job de queue, chaque accès stockage doit être filtré par userId. Aucune fuite inter-utilisateurs. À implémenter comme guard/middleware systématique.

3. **Mode dégradé** — Chaque étape du pipeline peut tomber indépendamment. Le document original est persisté en premier. La queue retry avec backoff exponentiel. L'architecture doit prévoir le traitement différé et la reprise.

4. **Audit trail** — Toutes les actions sur les documents sont journalisées (qui, quand, quoi). Logs en append-only, rétention 12 mois, supprimés avec le droit à l'effacement.

5. **Abstraction des providers IA** — LLM et OCR derrière des interfaces pluggables dans la couche domaine. L'infrastructure câble les adapters concrets (Mistral, Tesseract). Changeable sans toucher au domaine ni à l'application.

6. **Apprentissage implicite** — Le signal de correction (déplacement) doit être capturé, stocké par utilisateur, et réinjecté dans le modèle de classification. Isolation stricte (zéro cross-learning).

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web (SvelteKit + NestJS) en monorepo pnpm + Turborepo, basé sur l'analyse des requirements et le project-context existant.

### Starter Options Considered

| Option | Description | Verdict |
|---|---|---|
| A — Composition de starters | create-turbo + sv create + nest new | **Retenu** — starters officiels, à jour, assemblables |
| B — From scratch | Setup manuel complet | Rejeté — effort inutile, même résultat avec plus de boilerplate |
| C — Template communautaire | Template monorepo SvelteKit + NestJS | Rejeté — aucun template maintenu trouvé pour cette combinaison |

### Selected Starter: Composition de starters officiels

**Rationale :**
Aucun starter unique ne couvre la combinaison SvelteKit + NestJS + monorepo pnpm. L'assemblage de starters officiels garantit des versions à jour, des conventions respectées, et une compatibilité avec le project-context existant.

**Séquence d'initialisation :**

```bash
# 1. Monorepo Turborepo
npx create-turbo@2.8.7 archie --package-manager pnpm

# 2. Frontend SvelteKit (remplacer l'app par défaut)
rm -rf apps/web
npx sv create apps/web --template minimal --types ts --add tailwindcss,vitest,sveltekit-adapter --install pnpm

# 3. Backend NestJS (remplacer l'app par défaut)
rm -rf apps/api
npx @nestjs/cli@11.0.16 new apps/api --strict --package-manager pnpm

# 4. Shared package
mkdir -p packages/shared/src
# Initialiser package.json, tsconfig.json manuellement

# 5. Ajouts séquentiels dans apps/web
cd apps/web
npx shadcn-svelte@1.1.1 init
npx houdini init

# 6. Ajouts dans apps/api
cd apps/api
pnpm add @nestjs/graphql@13.2.4 @nestjs/apollo @apollo/server
pnpm add drizzle-orm@0.45.1 postgres
pnpm add -D drizzle-kit@0.31.9
pnpm add bullmq@5.68.0
pnpm add zod@4.3.6
```

### Architectural Decisions Provided by Starters

**Language & Runtime :**
- TypeScript strict mode (enforced par `nest new --strict` et `sv create --types ts`)
- Target ES2023 (à configurer dans tsconfig)
- Node.js LTS

**Styling Solution :**
- Tailwind CSS (via `sv add tailwindcss`)
- shadcn-svelte + bits-ui (ajout post-init)

**Build Tooling :**
- Turborepo pour l'orchestration des builds et le cache
- Vite (via SvelteKit) pour le frontend
- tsc (via NestJS) pour le backend

**Testing Framework :**
- Vitest (via `sv add vitest`) pour les tests unitaires et d'intégration
- Playwright (à ajouter) pour les tests E2E

**Code Organization :**
- Monorepo : `apps/web`, `apps/api`, `packages/shared`
- Path aliases : `@archie/web`, `@archie/api`, `@archie/shared`
- Architecture hexagonale dans `apps/api` (structure à mettre en place manuellement)

**Development Experience :**
- Hot reload via Vite (frontend) et NestJS watch mode (backend)
- ESLint + Prettier (configurés par les starters)
- Docker Compose pour l'environnement local (PostgreSQL, Redis, Tesseract)

**Versions vérifiées (npm registry, 2026-02-12) :**

| Package | Version |
|---|---|
| Svelte | 5.50.2 |
| SvelteKit | 2.50.2 |
| sv CLI | 0.12.1 |
| shadcn-svelte | 1.1.1 |
| bits-ui | 2.15.5 |
| NestJS Core | 11.1.13 |
| NestJS CLI | 11.0.16 |
| @nestjs/graphql | 13.2.4 |
| Turborepo | 2.8.7 |
| Houdini | 1.5.10 |
| Drizzle ORM | 0.45.1 |
| Drizzle Kit | 0.31.9 |
| BullMQ | 5.68.0 |
| Zod | 4.3.6 |
| Apollo Server | 5.4.0 |

**Note :** L'initialisation du projet via cette séquence de commandes devrait être la première story d'implémentation.

## Core Architectural Decisions

### Decision Priority Analysis

**Décisions critiques (bloquent l'implémentation) :**
- Data : Index vectoriel HNSW, envelope encryption, stratégie de cache Redis
- Auth : JWT + refresh token, Argon2id, rate limiting
- API : Architecture SSE, circuit breaker, mapping erreurs GraphQL
- Frontend : PDF viewer, upload avec progress
- Infra : Tesseract en librairie worker, monitoring Grafana/Prometheus

**Décisions différées (Post-MVP) :**
- Rotation des master keys de chiffrement (mécanisme automatisé)
- Scaling Tesseract en service séparé
- Alerting avancé (PagerDuty, OpsGenie)
- CDN pour les assets statiques

### Data Architecture

**Index vectoriel pgvector — HNSW**
- Décision : Index HNSW pour les embeddings vectoriels
- Rationale : Performance de recherche ~2-5x supérieure à IVFFlat, adapté au volume MVP (~10k-40k vecteurs). La contrainte < 1s de recherche est un différenciateur produit.
- Affects : Module Search, pipeline d'embedding
- Configuration : `CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)`

**Chiffrement — Envelope Encryption**
- Décision : Pattern envelope encryption (master key → data keys par utilisateur)
- Rationale : Rotation de la master key sans re-chiffrer les documents. Isolation cryptographique par utilisateur. Compatible avec le droit à l'effacement (supprimer la data key = données irrécupérables).
- Affects : Module Encryption (transversal), stockage objet, pipeline, thumbnails, backups
- Implémentation : Master key en variable d'environnement (Scaleway Secret Manager post-MVP). Data keys dérivées via HKDF (SHA-256) depuis master key + userId. Data keys chiffrées stockées en PostgreSQL.

**Stratégie de cache — Redis multi-usage**
- Décision : Redis utilisé pour BullMQ (queue) + cache applicatif (recherche fréquente, métadonnées)
- Rationale : Redis est déjà dans la stack pour BullMQ. L'utiliser pour le cache évite d'ajouter une dépendance. Cache des résultats de recherche fréquents pour garantir < 1s.
- Affects : Module Search (cache résultats), Module Pipeline (queue BullMQ)
- Stratégie d'invalidation : Cache invalidé à chaque modification de document (upload, déplacement, suppression) pour l'utilisateur concerné. TTL 5 min par défaut.

### Authentication & Security

**Sessions — JWT dans cookie httpOnly**
- Décision : JWT (access token 15 min) + refresh token révocable en PostgreSQL
- Rationale : Stateless pour les requêtes courantes, refresh token en DB pour la révocabilité. Compatible RGPD (suppression des refresh tokens = invalidation immédiate). Pas besoin de Redis pour les sessions.
- Affects : Module Auth, hooks.server.ts (SvelteKit), guards NestJS
- Flow : Login → access token JWT (cookie httpOnly, 15 min) + refresh token (cookie httpOnly, 7 jours, stocké en DB). Refresh silencieux via SvelteKit hooks. Logout = suppression du refresh token en DB.

**Hashing — Argon2id**
- Décision : Argon2id pour le hashing des mots de passe
- Rationale : Recommandation OWASP 2024+, résistant aux attaques GPU et side-channel. Configurable en mémoire et itérations.
- Affects : Module Auth
- Configuration : `argon2id, memory: 19456 (19 MiB), iterations: 2, parallelism: 1` (OWASP minimum recommandé)

**Rate Limiting — @nestjs/throttler**
- Décision : @nestjs/throttler avec configuration par route
- Rationale : Module NestJS natif, intégration directe avec les guards, configurable par endpoint.
- Affects : Module Auth (login), Module Ingestion (upload), Module Search
- Limites : Login 5/min, Upload 20/min, Recherche 60/min, Global 100/min

### API & Communication Patterns

**SSE — Architecture relay via SvelteKit**
- Décision : Worker BullMQ → Redis Pub/Sub → NestJS SSE endpoint → SvelteKit relay → Browser EventSource
- Rationale : Respecte la règle server-to-server (browser ne parle jamais à NestJS). Redis Pub/Sub découple les workers du endpoint SSE. SvelteKit relay transparent.
- Affects : Module Pipeline (workers), Module Ingestion (feedback), infrastructure Redis
- Implémentation : NestJS expose un endpoint SSE par utilisateur (`/events/:userId`). SvelteKit le relaye via un endpoint server (`/api/events`). Le browser se connecte à SvelteKit. Les workers publient sur Redis Pub/Sub channel `user:{userId}:events`.

**Circuit Breaker — cockatiel**
- Décision : cockatiel pour les policies de résilience (circuit breaker + retry + timeout)
- Rationale : TypeScript-first, policies composables. Permet de combiner retry (BullMQ level) + circuit breaker (adapter level) + timeout (NFR-I3 : 30s). S'intègre dans la couche infrastructure sans polluer le domaine.
- Affects : Adapters LLM (Mistral), Adapter OCR (Tesseract)
- Configuration : Circuit breaker avec seuil 5 échecs / 60s, half-open après 30s. Timeout 30s par appel.

**Mapping erreurs — GraphQL Extensions + ExceptionFilter**
- Décision : DomainErrors traduits en GraphQLError avec code dans `extensions`
- Rationale : Standard GraphQL. Le client (Houdini) peut lire `extensions.code` pour le traitement d'erreurs côté frontend. ExceptionFilter NestJS global dans la couche infrastructure.
- Affects : Tous les modules (transversal)
- Pattern : `DomainError('DOCUMENT_NOT_FOUND')` → `GraphQLError('Document non trouvé', { extensions: { code: 'DOCUMENT_NOT_FOUND' } })` → HTTP 200 (GraphQL standard)

### Frontend Architecture

**PDF Viewer — pdf.js lazy-loaded**
- Décision : pdf.js (Mozilla) chargé à la demande au clic sur un document
- Rationale : Standard, gratuit, puissant. Le lazy-loading évite l'impact sur le bundle initial (~500KB chargés uniquement quand nécessaire). Thumbnails pré-générés pour la preview grid (pas besoin de pdf.js pour les vignettes).
- Affects : Module Documents (composant DocumentViewer), performance bundle
- Implémentation : `import('pdfjs-dist')` dynamique dans le composant DocumentViewer. Worker pdf.js en web worker pour ne pas bloquer le thread principal.

**Upload — XHR/fetch natif + progressive enhancement**
- Décision : Form action SvelteKit (no-JS fallback) + enrichissement avec fetch/XHR pour le progress
- Rationale : Progressive enhancement natif SvelteKit. Pas de dépendance tierce. `XMLHttpRequest.upload.onprogress` pour le feedback de progression en batch. Simple, suffisant pour le MVP.
- Affects : Module Ingestion, composants d'upload frontend
- Pattern : Form action POST pour l'upload basique (fonctionne sans JS). JavaScript enrichit avec : progress bar via XHR, drag & drop, preview avant upload, upload parallèle.

### Infrastructure & Deployment

**Tesseract — Librairie dans le worker**
- Décision : Tesseract intégré comme librairie native dans les workers BullMQ (pas de service séparé)
- Rationale : Zéro latence réseau, simplicité de déploiement pour dev solo. Le worker NestJS appelle Tesseract directement. Évolution possible vers un service séparé si besoin de scaling indépendant.
- Affects : Module Pipeline (workers), Docker Compose (Tesseract dans l'image API)
- Implémentation : `node-tesseract-ocr` ou binding natif dans le container Docker API. Image Docker avec Tesseract pré-installé + langues fr/en.

**Monitoring — Grafana + Prometheus self-hosted**
- Décision : Grafana + Prometheus sur Scaleway pour le monitoring applicatif et infrastructure
- Rationale : Self-hosted sur Scaleway respecte la souveraineté française. Open-source, pas de coût SaaS. Prometheus collecte les métriques, Grafana les visualise.
- Affects : Infrastructure Docker Swarm, tous les services
- Métriques clés : Temps de pipeline, latence recherche, taux de classification, erreurs LLM/OCR, usage stockage par utilisateur (NFR-INF3), queue BullMQ (jobs en attente, échecs).
- Error tracking : Sentry (SaaS, plan gratuit 5k events/mois) pour le tracking d'erreurs frontend + backend. Alternative self-hosted : GlitchTip sur Scaleway.

### CQRS & Transaction Management

**CQRS Léger — Commands/Queries + Event Bus**
- Décision : Séparation Commands (écriture) / Queries (lecture) via `@nestjs/cqrs`, avec bus d'événements pour les réactions asynchrones. Pas d'Event Sourcing.
- Rationale : Le pipeline de classification est naturellement event-driven (document classifié → SSE + audit + cache invalidé). Le bus d'événements formalise ce flux sans couplage direct entre modules. La séparation C/Q améliore la lisibilité des resolvers GraphQL (Mutation → Command, Query → Query).
- Affects : Tous les modules backend (structure application/)
- Ce qu'on **ne fait pas** : Event Store, event replay, projections, modèles de lecture séparés. La DB reste unique.
- Règles de communication inter-modules :
  - **Commands** → scope module uniquement. Jamais de Command cross-module.
  - **Queries** → cross-module autorisées (lecture seule). Le type de retour est une interface de `core/domain/models/`, jamais un Domain Model interne.
  - **Events** → cross-module par design (via le bus d'événements).

**Transaction Middleware sur CommandBus**
- Décision : Pipeline de middlewares custom sur le CommandBus. Les Commands annotées `@Transactional()` sont wrappées dans une transaction SQL (Drizzle). Commit si succès, rollback si throw. Domain Events publiés **après le commit uniquement**.
- Rationale : Cohérence données garantie. Le CQRS rend ça naturel : Commands = écriture = transaction, Queries = lecture = pas de transaction. Les événements post-commit évitent les effets de bord sur un rollback (pas de SSE fantôme, pas de job BullMQ orphelin).
- Affects : Command Handlers transactionnels, tous les adapters Drizzle, bus d'événements.
- Propagation : `AsyncLocalStorage` (Node.js natif) via `@nestjs/cls` pour passer le `tx` Drizzle aux adapters sans polluer les signatures domain/application.
- Dépendances ajoutées : `@nestjs/cqrs`, `@nestjs/cls`

**Module Core — Infrastructure commune backend**
- Décision : Module `core/` dans `apps/api/src/` séparé en `domain/` (TS pur) et `infrastructure/` (NestJS-aware). Regroupe tout ce qui est partagé côté backend mais n'a pas sa place dans `packages/shared/`.
- Rationale : `packages/shared/` reste le contrat frontend ↔ backend (Zod, types GraphQL, constantes). `core/` contient les contrats inter-modules backend : event payloads, interfaces de projection publique des entités, erreurs de base, CQRS middleware, guards, filters.
- Affects : Tous les modules backend (importent depuis `core/`)
- Séparation des responsabilités :
  - `packages/shared/` → Frontend + Backend (Zod schemas, types DTO, constantes métier)
  - `core/domain/` → Backend uniquement, TS pur (errors, events, models partagés). Importable par `modules/*/domain/`
  - `core/infrastructure/` → Backend uniquement, NestJS-aware (CQRS bus, guards, filters, pipes). Importable par `modules/*/application/` et `modules/*/infrastructure/`

### Decision Impact Analysis

**Séquence d'implémentation recommandée :**

1. Auth (JWT + Argon2id + throttler) — fondation de sécurité
2. Data (PostgreSQL + Drizzle + schéma initial) — fondation données
3. Encryption (envelope encryption + module transversal) — avant tout stockage de documents
4. Ingestion (upload + stockage objet) — premier flux utilisateur
5. Pipeline (OCR Tesseract + extraction Mistral + embedding + chiffrement) — coeur IA
6. Search (pgvector HNSW + full-text + cache Redis) — révélation de la valeur
7. SSE (Redis Pub/Sub + relay SvelteKit) — feedback temps réel
8. Frontend (composants UX, PDF viewer, upload enrichi) — en parallèle avec 4-7
9. Monitoring (Grafana + Prometheus) — avant mise en production

**Dépendances inter-composants :**
- Encryption dépend de Auth (userId pour la dérivation de clés)
- Pipeline dépend de Ingestion (document uploadé) + Encryption (chiffrement post-traitement)
- Search dépend de Pipeline (embeddings générés)
- SSE dépend de Pipeline (événements publiés) + Redis (Pub/Sub)
- Monitoring dépend de tous les services (métriques exposées)

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Points de conflit identifiés :** 8 catégories où des agents IA pourraient prendre des décisions incompatibles.

### Naming Patterns

**Database (Drizzle ORM) :**

| Élément | Convention | Exemple |
|---|---|---|
| Tables | snake_case, **pluriel** | `documents`, `users`, `refresh_tokens` |
| Colonnes | snake_case | `created_at`, `user_id`, `confidence_score` |
| Foreign keys | `{table_singulier}_id` | `user_id`, `folder_id`, `document_id` |
| Index | `idx_{table}_{colonnes}` | `idx_documents_user_id`, `idx_documents_embedding` |
| Contraintes unique | `uq_{table}_{colonnes}` | `uq_users_email` |
| Enums DB | snake_case | `document_status`, `pipeline_step` |

**GraphQL (NestJS code-first) :**

| Élément | Convention | Exemple |
|---|---|---|
| Types | PascalCase | `Document`, `Folder`, `SearchResult` |
| Queries | camelCase, verbe descriptif | `document(id)`, `searchDocuments(query)`, `recentDocuments` |
| Mutations | camelCase, verbe d'action | `uploadDocument`, `moveDocument`, `deleteDocuments` |
| Champs | camelCase | `createdAt`, `userId`, `confidenceScore` |
| Enums GraphQL | SCREAMING_SNAKE_CASE | `PENDING`, `CLASSIFIED`, `TO_SORT`, `ERROR` |
| Subscriptions/SSE | camelCase, préfixe `on` | `onDocumentClassified`, `onPipelineProgress` |

**BullMQ Jobs & Redis :**

| Élément | Convention | Exemple |
|---|---|---|
| Queue names | kebab-case | `document-pipeline`, `thumbnail-generation` |
| Job names | kebab-case, verbe-nom | `extract-text`, `classify-document`, `generate-embedding` |
| Redis Pub/Sub channels | colon-separated | `user:{userId}:events`, `pipeline:{jobId}:progress` |
| Redis cache keys | colon-separated, préfixe module | `search:{userId}:cache:{queryHash}`, `auth:refresh:{tokenId}` |

**Variables d'environnement :**

| Convention | Exemple |
|---|---|
| SCREAMING_SNAKE_CASE | `DATABASE_URL`, `REDIS_URL`, `MISTRAL_API_KEY` |
| Préfixe par service | `MISTRAL_API_KEY`, `SCALEWAY_ACCESS_KEY`, `ENCRYPTION_MASTER_KEY` |
| URL complètes pour les connexions | `DATABASE_URL=postgresql://user:pass@host:5432/archie` |

### Structure Patterns

**Modules NestJS — Structure hexagonale CQRS :**

```
apps/api/src/modules/{module-name}/
├── domain/
│   ├── models/          # {name}.model.ts
│   ├── ports/           # {name}.port.ts (interfaces)
│   ├── errors/          # {name}.error.ts (DomainError avec code unique)
│   ├── events/          # {name}-{past-verb}.event.ts (classes TS pures)
│   └── schemas/         # {name}.schema.ts (Zod)
├── application/
│   ├── commands/        # {verb}-{noun}.command.ts + {verb}-{noun}.handler.ts
│   ├── queries/         # {verb}-{noun}.query.ts + {verb}-{noun}.handler.ts
│   └── events/          # on-{noun}-{past-verb}.handler.ts (réactions)
├── infrastructure/
│   ├── adapters/        # {provider}-{name}.adapter.ts
│   ├── resolvers/       # {name}.resolver.ts (GraphQL)
│   └── {module-name}.module.ts
└── __fixtures__/        # Fixtures partagées du module (si nécessaire)
```

**Convention de nommage CQRS :**

| Élément | Fichier | Classe | Couche |
|---|---|---|---|
| Command | `{verb}-{noun}.command.ts` | `{VerbNoun}Command` | application/commands/ |
| Command Handler | `{verb}-{noun}.handler.ts` | `{VerbNoun}Handler` | application/commands/ |
| Query | `{verb}-{noun}.query.ts` | `{VerbNoun}Query` | application/queries/ |
| Query Handler | `{verb}-{noun}.handler.ts` | `{VerbNoun}Handler` | application/queries/ |
| Domain Event | `{noun}-{past-verb}.event.ts` | `{NounPastVerb}Event` | **domain/events/** (pur TS) |
| Event Handler | `on-{noun}-{past-verb}.handler.ts` | `On{NounPastVerb}Handler` | application/events/ |

**Règles CQRS :**
- Les Domain Events dans `domain/events/` sont des classes TS pures (pas de décorateur NestJS)
- Les `@CommandHandler`, `@QueryHandler`, `@EventsHandler` de `@nestjs/cqrs` sont autorisés dans `application/` (exception pragmatique pour le MVP — la frontière stricte reste domain/ pur)
- Chaque handler a une méthode `execute()` unique
- Un Command Handler peut publier des Domain Events via `EventBus.publish()`
- Un Event Handler réagit à un événement (SSE, audit, cache invalidation) — jamais de logique métier dedans
- Les Queries sont **read-only** : aucune mutation d'état
- Les Queries cross-modules retournent un type défini dans `core/domain/models/`, jamais un Domain Model interne

**Module Core — Structure :**

```
apps/api/src/core/
├── core.module.ts
├── domain/                              # TS pur — importable par tous les domain/
│   ├── errors/                          # AppError, DomainError, InfrastructureError
│   ├── events/                          # Payloads des domain events partagés
│   └── models/                          # Projections publiques des entités (interfaces TS)
└── infrastructure/                      # NestJS-aware
    ├── cqrs/
    │   ├── middleware/
    │   │   ├── command-middleware.interface.ts
    │   │   ├── transaction.middleware.ts
    │   │   └── logging.middleware.ts
    │   ├── transactional-command-bus.ts
    │   └── cqrs.module.ts
    ├── guards/
    ├── filters/
    ├── pipes/
    ├── interceptors/
    ├── decorators/
    └── test-helpers/
```

**Middleware CommandBus — Pipeline :**

| Middleware | Ordre | Rôle |
|---|---|---|
| `LoggingMiddleware` | 1 | Log command name + durée + succès/échec |
| `TransactionMiddleware` | 2 | BEGIN TX → handler → COMMIT ou ROLLBACK (opt-in via `@Transactional()`) |

**Flux événements post-commit :**

```
Command reçue
  → LoggingMiddleware.execute()
    → TransactionMiddleware.execute()
      → BEGIN TX (si @Transactional)
        → Handler.execute() → publie events (bufferisés)
      → COMMIT ✓
    → EventBus.publishAll(events)  ← APRÈS le commit
  → Log durée totale

Si le handler throw :
  → ROLLBACK
  → Aucun événement publié
  → L'erreur remonte au resolver GraphQL → DomainExceptionFilter
```

**Convention adapters Drizzle avec CLS :**

Chaque adapter Drizzle utilise un getter `conn` qui retourne la transaction active (CLS) ou la connexion directe :
```typescript
private get conn() {
  return this.cls.get<DrizzleTx>('TX') ?? this.db
}
```

**Couches de typage — Flux complet :**

| Couche | Type | Visible par |
|---|---|---|
| Drizzle `$inferSelect` | Row DB brute | Adapters du même module uniquement |
| Domain Model | Entité métier complète | Le module propriétaire uniquement |
| Interface `core/domain/models/` | Projection publique read-only | Tous les modules (via queries cross-module) |
| Types `packages/shared/` | DTO frontend ↔ backend | Frontend + Backend |

**Convention de nommage des ports :**

| Pattern | Exemple fichier | Exemple interface |
|---|---|---|
| `{nom}.port.ts` | `document-repository.port.ts` | `DocumentRepository` |
| Ports de service externe | `ocr-service.port.ts` | `OcrService` |
| Pas de préfixe `I` | `llm-service.port.ts` | `LlmService` (pas `ILlmService`) |

**Frontend SvelteKit — Organisation des composants :**

```
apps/web/src/lib/components/
├── ui/              # shadcn-svelte (générés, pas de modification)
├── documents/       # DocumentCard.svelte, DocumentViewer.svelte
├── folders/         # FolderCard.svelte, FolderSelector.svelte
├── search/          # SearchBar.svelte
├── pipeline/        # PipelineIndicator.svelte
├── selection/       # ContextualActionBar.svelte
└── layout/          # Header.svelte, Navigation.svelte
```

Composants Svelte en **PascalCase** : `DocumentCard.svelte`, `FolderSelector.svelte`

### Format Patterns

**GraphQL — Réponses et erreurs :**

Pas de wrapper custom. GraphQL standard :
- Succès : `{ data: { ... } }`
- Erreur : `{ errors: [{ message: "...", extensions: { code: "DOCUMENT_NOT_FOUND" } }] }`
- Erreurs partielles : `{ data: { ... }, errors: [...] }` (GraphQL natif)

**Dates :**

| Contexte | Format | Exemple |
|---|---|---|
| Base de données | `TIMESTAMPTZ` (PostgreSQL) | `2026-02-12T19:30:00+01:00` |
| GraphQL / JSON | ISO 8601 string | `"2026-02-12T18:30:00.000Z"` |
| Affichage UI | Intl.DateTimeFormat (fr-FR) | `"12 février 2026"`, `"12/02/2026"` |
| Librairie de manipulation | Aucune — `Date` natif + `Intl` | Pas de dayjs/moment/date-fns |

**Identifiants :**

| Contexte | Type | Rationale |
|---|---|---|
| Clés primaires DB | UUID v4 (`gen_random_uuid()`) | Standard PostgreSQL, pas de séquence prédictible |
| IDs exposés en GraphQL | UUID string | Même valeur que la DB, pas de mapping |
| IDs de jobs BullMQ | UUID v4 | Cohérence avec le reste |

**Null handling :**
- GraphQL : champs nullable explicitement marqués. Pas de `null` pour les listes (retourner `[]`).
- TypeScript : `undefined` pour "absent", `null` pour "explicitement vide" (aligné avec `exactOptionalPropertyTypes`)
- DB : `NULL` autorisé uniquement quand sémantiquement justifié (ex: `classified_at` est `NULL` avant classification)

### Communication Patterns

**Événements SSE (Redis Pub/Sub → Browser) :**

| Événement | Channel Redis | Payload |
|---|---|---|
| Document classé | `user:{userId}:events` | `{ type: "document.classified", documentId, folderId, folderPath, confidence }` |
| Document en attente triage | `user:{userId}:events` | `{ type: "document.to_sort", documentId }` |
| Pipeline en cours | `user:{userId}:events` | `{ type: "pipeline.progress", documentId, step, totalSteps }` |
| Pipeline erreur | `user:{userId}:events` | `{ type: "pipeline.error", documentId, errorCode }` |
| Thumbnail prêt | `user:{userId}:events` | `{ type: "thumbnail.ready", documentId, thumbnailUrl }` |

**Convention événements :** `{domaine}.{action_passée}` en dot notation, lowercase.

**BullMQ Job data :**

Chaque job contient obligatoirement :
```typescript
type PipelineJobData = {
  documentId: string    // UUID du document
  userId: string        // UUID de l'utilisateur (isolation)
  step: string          // Étape courante
  attempt: number       // Numéro de tentative (pour le retry)
}
```

### Process Patterns

**Error handling — Hiérarchie standardisée :**

```
AppError (code: string, message: string, httpStatus?: number)
├── DomainError
│   ├── DocumentNotFoundError         (code: 'DOCUMENT_NOT_FOUND')
│   ├── ClassificationError           (code: 'CLASSIFICATION_FAILED')
│   ├── ClassificationLowConfidence   (code: 'CLASSIFICATION_LOW_CONFIDENCE')
│   ├── QuotaExceededError            (code: 'QUOTA_EXCEEDED')
│   ├── UnsupportedFormatError        (code: 'UNSUPPORTED_FORMAT')
│   └── FolderNotFoundError           (code: 'FOLDER_NOT_FOUND')
├── InfrastructureError
│   ├── OcrServiceUnavailableError    (code: 'OCR_SERVICE_UNAVAILABLE')
│   ├── LlmServiceUnavailableError    (code: 'LLM_SERVICE_UNAVAILABLE')
│   ├── StorageError                  (code: 'STORAGE_ERROR')
│   └── EncryptionError               (code: 'ENCRYPTION_ERROR')
└── AuthError
    ├── InvalidCredentialsError        (code: 'INVALID_CREDENTIALS')
    ├── TokenExpiredError              (code: 'TOKEN_EXPIRED')
    └── UnauthorizedError              (code: 'UNAUTHORIZED')
```

**Règle : assertions sur `error.code` uniquement**, jamais sur les messages.

**Loading states (frontend) :**

| État | Pattern Svelte 5 | Usage |
|---|---|---|
| Chargement initial | Skeleton (composant shadcn) | Dashboard, résultats recherche, dossiers |
| Action en cours | Bouton disabled + spinner inline | Upload, déplacement, suppression |
| Pipeline | PipelineIndicator (pulse indigo) | Traitement IA en arrière-plan |
| Recherche | Imperceptible (< 1s) → skeleton si > 1s | Résultats de recherche |

Pas de spinner plein écran. Pas de barre de progression pour le pipeline (juste "en cours" → "classé").

**Validation — Timing et flux :**

| Couche | Quand | Comment |
|---|---|---|
| Frontend (formulaire) | Au submit | Zod schema, erreurs affichées inline |
| SvelteKit form action | À la réception | Zod schema (même que frontend, importé de `@archie/shared`) |
| NestJS (resolver/controller) | À l'entrée | ZodValidationPipe dans la couche infrastructure |
| Domain (command/query handler) | Règles métier | Vérification dans le handler, DomainError si invalide |

**Schémas Zod partagés** entre frontend et backend via `packages/shared/src/schemas/`.

### Enforcement Guidelines

**Tout agent IA DOIT :**

1. Vérifier le project-context.md ET cette section avant d'écrire du code
2. Suivre la structure hexagonale : zéro import `@nestjs/*` dans domain/ (exception : `@nestjs/cqrs` autorisé dans application/)
3. Utiliser les conventions de nommage exactes (DB snake_case, GraphQL camelCase, fichiers kebab-case)
4. Créer les schémas Zod dans `packages/shared/` pour toute donnée traversant frontend ↔ backend
5. Inclure `userId` dans chaque requête DB et chaque job BullMQ (isolation)
6. Utiliser les codes d'erreur standardisés (jamais de nouveaux codes sans les documenter ici)
7. Écrire les tests colocalisés avec le code source (.spec.ts à côté du fichier)
8. Utiliser Commands pour les mutations et Queries pour les lectures (CQRS)
9. Ne jamais importer de Commands d'un autre module — utiliser un Event pour déclencher une action cross-module
10. Typer les retours de Queries cross-modules avec les interfaces de `core/domain/models/`
11. Utiliser le getter `conn` (CLS) dans les adapters Drizzle, jamais `this.db` directement

**Vérification automatisée :**
- dependency-cruiser : frontières hexagonales + isolation inter-modules + zéro import cross-module de commands (CI + local)
- ESLint : conventions de nommage, imports
- TypeScript strict : pas de `any`, pas de type unsafe
- Zod : validation exhaustive à chaque frontière

### Anti-Patterns

| Anti-pattern | Pourquoi c'est un problème | Pattern correct |
|---|---|---|
| `import { Injectable } from '@nestjs/core'` dans domain/ | Viole l'hexagone | Framework uniquement dans infrastructure/ |
| `const data = await fetch('/api/nestjs/...')` côté client | Browser parle directement à NestJS | Passer par SvelteKit server (load/action) |
| `export default class UserService` | Export default interdit | `export class UserService` |
| `enum Status { Active, Inactive }` | Enums TypeScript interdits | `type Status = 'active' \| 'inactive'` |
| `const store = writable({})` | Stores legacy Svelte interdits | `let state = $state({})` |
| Table DB `Users` (PascalCase) | Incohérent avec la convention | `users` (snake_case pluriel) |
| `throw new Error('Not found')` | Message au lieu de code | `throw new DocumentNotFoundError(documentId)` |
| Tests dans `__tests__/` | Pas de colocation | `document.model.spec.ts` à côté de `document.model.ts` |
| `import { UploadDocumentCommand } from '../ingestion/'` | Command cross-module interdit | Publier un Event, l'autre module réagit via EventHandler |
| `eventBus.publish()` dans un adapter | Événement émis avant le commit, side-effect sur rollback | Events publiés via le handler, dispatch post-commit par le bus |
| `this.db.insert()` dans un adapter | Bypass la transaction active | Toujours utiliser `this.conn` (getter CLS) |
| Transaction manuelle dans un handler | Double transaction, comportement imprévisible | Laisser le `TransactionMiddleware` gérer via `@Transactional()` |
| Retourner un Domain Model dans une Query cross-module | Expose les détails internes d'un module | Retourner une interface de `core/domain/models/` |

## Project Structure & Boundaries

### Complete Project Directory Structure

```
archie/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # Lint + type-check + tests + dependency-cruiser
│       └── deploy.yml                      # Build Docker + deploy Scaleway
├── .env.example
├── .gitignore
├── .npmrc                                  # shamefully-hoist=false
├── docker-compose.yml                      # Dev local : PostgreSQL, Redis
├── docker-compose.prod.yml                 # Production : Swarm stack
├── turbo.json
├── pnpm-workspace.yaml
├── package.json                            # Scripts racine : dev, build, test, lint
├── .dependency-cruiser.cjs                 # Règles frontières hexagonales + isolation modules
│
├── apps/
│   ├── web/                                # SvelteKit (frontend)
│   │   ├── package.json
│   │   ├── svelte.config.js
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── houdini.config.js
│   │   ├── src/
│   │   │   ├── app.html
│   │   │   ├── app.css                     # Tailwind directives + design tokens
│   │   │   ├── hooks.server.ts             # Auth guard, JWT refresh silencieux
│   │   │   ├── hooks.client.ts             # SSE EventSource connexion
│   │   │   ├── lib/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ui/                 # shadcn-svelte (généré)
│   │   │   │   │   ├── documents/          # DocumentCard, DocumentViewer, DocumentGrid
│   │   │   │   │   ├── folders/            # FolderCard, FolderTree, FolderSelector
│   │   │   │   │   ├── search/             # SearchBar, SearchResults, SearchFilters
│   │   │   │   │   ├── pipeline/           # PipelineIndicator, ProcessingBadge
│   │   │   │   │   ├── upload/             # UploadZone, UploadProgress, BatchUpload
│   │   │   │   │   ├── selection/          # ContextualActionBar, SelectionCheckbox
│   │   │   │   │   └── layout/             # Header, Navigation, Sidebar, MobileNav
│   │   │   │   ├── stores/                 # Svelte 5 runes ($state, $derived)
│   │   │   │   │   ├── documents.svelte.ts
│   │   │   │   │   ├── folders.svelte.ts
│   │   │   │   │   ├── search.svelte.ts
│   │   │   │   │   └── sse.svelte.ts       # État SSE temps réel
│   │   │   │   ├── utils/
│   │   │   │   │   ├── date.ts             # Intl.DateTimeFormat wrappers
│   │   │   │   │   └── file.ts             # Validation format/taille côté client
│   │   │   │   └── server/
│   │   │   │       └── api.ts              # Proxy vers NestJS (server-to-server)
│   │   │   ├── routes/
│   │   │   │   ├── +layout.svelte
│   │   │   │   ├── +layout.server.ts       # Auth check global
│   │   │   │   ├── +page.svelte            # Dashboard (documents récents + stats)
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/+page.svelte
│   │   │   │   │   ├── register/+page.svelte
│   │   │   │   │   └── forgot-password/+page.svelte
│   │   │   │   ├── (app)/
│   │   │   │   │   ├── documents/
│   │   │   │   │   │   ├── +page.svelte            # Vue grille/liste tous documents
│   │   │   │   │   │   └── [id]/+page.svelte       # Détail + viewer PDF
│   │   │   │   │   ├── folders/
│   │   │   │   │   │   ├── +page.svelte            # Arborescence dossiers
│   │   │   │   │   │   └── [id]/+page.svelte       # Contenu d'un dossier
│   │   │   │   │   ├── search/+page.svelte         # Recherche hybride
│   │   │   │   │   ├── upload/+page.svelte         # Upload dédié (batch)
│   │   │   │   │   └── settings/
│   │   │   │   │       ├── +page.svelte            # Profil utilisateur
│   │   │   │   │       └── storage/+page.svelte    # Usage quota
│   │   │   │   └── api/
│   │   │   │       └── events/+server.ts           # SSE relay endpoint
│   │   │   └── $houdini/                           # Généré par Houdini
│   │   ├── static/
│   │   │   └── favicon.png
│   │   └── tests/
│   │       └── e2e/                                # Playwright
│   │
│   └── api/                                        # NestJS (backend)
│       ├── package.json
│       ├── nest-cli.json
│       ├── tsconfig.json
│       ├── tsconfig.build.json
│       ├── Dockerfile                              # Multi-stage + Tesseract
│       ├── src/
│       │   ├── main.ts                             # Bootstrap NestJS
│       │   ├── app.module.ts                       # Root module
│       │   ├── config/
│       │   │   ├── database.config.ts
│       │   │   ├── redis.config.ts
│       │   │   ├── storage.config.ts
│       │   │   ├── mistral.config.ts
│       │   │   └── encryption.config.ts
│       │   │
│       │   ├── core/                               # Module Core — infrastructure commune backend
│       │   │   ├── core.module.ts
│       │   │   ├── domain/                         # TS pur — importable par modules/*/domain/
│       │   │   │   ├── errors/
│       │   │   │   │   ├── app.error.ts
│       │   │   │   │   ├── domain.error.ts
│       │   │   │   │   └── infrastructure.error.ts
│       │   │   │   ├── events/                     # Payloads des domain events partagés
│       │   │   │   │   ├── document.events.ts      # DocumentUploadedPayload, DocumentClassifiedPayload...
│       │   │   │   │   ├── pipeline.events.ts      # PipelineFailedPayload, TextExtractedPayload...
│       │   │   │   │   ├── folder.events.ts        # FolderCreatedPayload, DocumentMovedPayload
│       │   │   │   │   └── user.events.ts          # UserRegisteredPayload
│       │   │   │   └── models/                     # Projections publiques des entités (interfaces TS)
│       │   │   │       ├── user-quota.model.ts
│       │   │   │       ├── document-summary.model.ts
│       │   │   │       ├── folder-info.model.ts
│       │   │   │       └── classification-result.model.ts
│       │   │   └── infrastructure/                 # NestJS-aware — importable par application/ et infrastructure/
│       │   │       ├── cqrs/
│       │   │       │   ├── middleware/
│       │   │       │   │   ├── command-middleware.interface.ts
│       │   │       │   │   ├── transaction.middleware.ts    # BEGIN/COMMIT/ROLLBACK via Drizzle + CLS
│       │   │       │   │   └── logging.middleware.ts        # Log command + durée
│       │   │       │   ├── transactional-command-bus.ts     # CommandBus custom + buffer events post-commit
│       │   │       │   └── cqrs.module.ts
│       │   │       ├── guards/
│       │   │       │   ├── jwt-auth.guard.ts
│       │   │       │   └── user-isolation.guard.ts         # Injecte userId dans le contexte
│       │   │       ├── filters/
│       │   │       │   └── domain-exception.filter.ts      # DomainError → GraphQLError
│       │   │       ├── pipes/
│       │   │       │   └── zod-validation.pipe.ts
│       │   │       ├── interceptors/
│       │   │       │   └── audit.interceptor.ts
│       │   │       ├── decorators/
│       │   │       │   └── current-user.decorator.ts
│       │   │       └── test-helpers/
│       │   │           └── with-transaction.ts             # Helper test : CLS + TX rollback
│       │   │
│       │   ├── database/
│       │   │   ├── drizzle.provider.ts
│       │   │   ├── migrations/                     # Drizzle Kit migrations
│       │   │   └── schema/                         # Drizzle schema definitions
│       │   │       ├── users.schema.ts
│       │   │       ├── documents.schema.ts
│       │   │       ├── folders.schema.ts
│       │   │       ├── refresh-tokens.schema.ts
│       │   │       ├── audit-logs.schema.ts
│       │   │       └── index.ts
│       │   │
│       │   └── modules/
│       │       ├── auth/
│       │       │   ├── domain/
│       │       │   │   ├── models/                 # user.model.ts
│       │       │   │   ├── ports/                  # user-repository.port.ts, hasher.port.ts
│       │       │   │   ├── errors/                 # invalid-credentials.error.ts
│       │       │   │   └── events/                 # user-registered.event.ts
│       │       │   ├── application/
│       │       │   │   ├── commands/               # register-user, login-user, refresh-token
│       │       │   │   ├── queries/                # get-current-user
│       │       │   │   └── events/                 # on-user-registered
│       │       │   └── infrastructure/
│       │       │       ├── adapters/               # drizzle-user.adapter.ts, argon2-hasher.adapter.ts
│       │       │       ├── resolvers/              # auth.resolver.ts
│       │       │       ├── strategies/             # jwt.strategy.ts
│       │       │       └── auth.module.ts
│       │       │
│       │       ├── ingestion/
│       │       │   ├── domain/
│       │       │   │   ├── models/                 # upload.model.ts
│       │       │   │   ├── ports/                  # storage.port.ts, document-repository.port.ts
│       │       │   │   ├── errors/                 # quota-exceeded.error.ts, unsupported-format.error.ts
│       │       │   │   └── events/                 # document-uploaded.event.ts
│       │       │   ├── application/
│       │       │   │   ├── commands/               # upload-document, upload-batch
│       │       │   │   └── events/                 # on-document-uploaded → crée job pipeline
│       │       │   └── infrastructure/
│       │       │       ├── adapters/               # scaleway-storage.adapter.ts, drizzle-document.adapter.ts
│       │       │       ├── resolvers/              # ingestion.resolver.ts
│       │       │       └── ingestion.module.ts
│       │       │
│       │       ├── pipeline/
│       │       │   ├── domain/
│       │       │   │   ├── models/                 # pipeline-job.model.ts, pipeline-step.model.ts
│       │       │   │   ├── ports/                  # ocr-service.port.ts, llm-service.port.ts
│       │       │   │   ├── errors/                 # classification.error.ts
│       │       │   │   └── events/                 # text-extracted, entities-extracted, embedding-generated,
│       │       │   │                               #   document-classified, pipeline-failed
│       │       │   ├── application/
│       │       │   │   ├── commands/               # run-pipeline, extract-text, extract-entities,
│       │       │   │   │                           #   generate-embedding, classify-document
│       │       │   │   ├── queries/                # get-pipeline-status
│       │       │   │   └── events/                 # on-document-classified → SSE + cache
│       │       │   │                               # on-pipeline-failed → SSE erreur
│       │       │   └── infrastructure/
│       │       │       ├── adapters/               # tesseract-ocr.adapter.ts, mistral-llm.adapter.ts
│       │       │       ├── processors/             # pipeline.processor.ts (BullMQ worker)
│       │       │       └── pipeline.module.ts
│       │       │
│       │       ├── classification/
│       │       │   ├── domain/
│       │       │   │   ├── models/                 # folder.model.ts, classification-result.model.ts
│       │       │   │   ├── ports/                  # folder-repository.port.ts
│       │       │   │   ├── errors/                 # folder-not-found.error.ts
│       │       │   │   └── events/                 # folder-created, document-moved
│       │       │   ├── application/
│       │       │   │   ├── commands/               # move-document, create-folder
│       │       │   │   ├── queries/                # list-folders, get-folder-contents
│       │       │   │   └── events/                 # on-document-moved → signal apprentissage
│       │       │   └── infrastructure/
│       │       │       ├── adapters/               # drizzle-folder.adapter.ts
│       │       │       ├── resolvers/              # classification.resolver.ts
│       │       │       └── classification.module.ts
│       │       │
│       │       ├── search/
│       │       │   ├── domain/
│       │       │   │   ├── models/                 # search-result.model.ts, search-query.model.ts
│       │       │   │   └── ports/                  # search-engine.port.ts
│       │       │   ├── application/
│       │       │   │   ├── queries/                # search-documents, get-recent-documents
│       │       │   │   └── events/                 # on-document-classified → invalide cache
│       │       │   └── infrastructure/
│       │       │       ├── adapters/               # pgvector-search.adapter.ts
│       │       │       ├── resolvers/              # search.resolver.ts
│       │       │       └── search.module.ts
│       │       │
│       │       ├── documents/
│       │       │   ├── domain/
│       │       │   │   ├── models/                 # document.model.ts
│       │       │   │   ├── ports/                  # document-repository.port.ts
│       │       │   │   ├── errors/                 # document-not-found.error.ts
│       │       │   │   └── events/                 # document-deleted.event.ts
│       │       │   ├── application/
│       │       │   │   ├── commands/               # delete-document, export-documents
│       │       │   │   ├── queries/                # get-document, list-user-documents
│       │       │   │   └── events/                 # on-document-deleted → cleanup storage + audit
│       │       │   └── infrastructure/
│       │       │       ├── adapters/               # drizzle-document.adapter.ts
│       │       │       ├── resolvers/              # documents.resolver.ts
│       │       │       └── documents.module.ts
│       │       │
│       │       ├── encryption/
│       │       │   ├── domain/
│       │       │   │   ├── models/                 # data-key.model.ts
│       │       │   │   ├── ports/                  # encryption-service.port.ts, key-store.port.ts
│       │       │   │   └── errors/                 # encryption.error.ts
│       │       │   ├── application/
│       │       │   │   ├── commands/               # encrypt-document, decrypt-document, derive-user-key
│       │       │   │   └── queries/                # (pas de queries)
│       │       │   └── infrastructure/
│       │       │       ├── adapters/               # node-crypto-encryption.adapter.ts, drizzle-key-store.adapter.ts
│       │       │       └── encryption.module.ts
│       │       │
│       │       └── audit/
│       │           ├── domain/
│       │           │   ├── models/                 # audit-entry.model.ts
│       │           │   └── ports/                  # audit-repository.port.ts
│       │           ├── application/
│       │           │   ├── commands/               # log-audit-entry
│       │           │   ├── queries/                # get-audit-trail
│       │           │   └── events/                 # écoute les events des autres modules
│       │           └── infrastructure/
│       │               ├── adapters/               # drizzle-audit.adapter.ts
│       │               └── audit.module.ts
│       │
│       └── test/
│           ├── e2e/                                # Tests end-to-end NestJS
│           └── helpers/                            # Factories, DB setup, etc.
│
├── packages/
│   └── shared/                                     # Contrat frontend ↔ backend uniquement
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── schemas/                            # Zod schemas partagés
│           │   ├── auth.schema.ts
│           │   ├── document.schema.ts
│           │   ├── folder.schema.ts
│           │   ├── search.schema.ts
│           │   └── upload.schema.ts
│           ├── types/                              # Types TypeScript partagés (DTO)
│           │   ├── document.types.ts
│           │   ├── folder.types.ts
│           │   ├── search.types.ts
│           │   ├── sse-event.types.ts
│           │   └── error-codes.types.ts
│           └── constants/
│               ├── file-formats.ts
│               ├── limits.ts                       # Quotas, tailles max, etc.
│               └── pipeline-steps.ts
│
├── docker/
│   ├── api/
│   │   └── Dockerfile
│   ├── web/
│   │   └── Dockerfile
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── dashboards/
│
└── docs/
    ├── adr/                                        # Architecture Decision Records
    └── api/                                        # Documentation API (générée)
```

### Architectural Boundaries

**Frontière hexagonale (par module) :**

```
┌─────────────────────────────────────────────┐
│  infrastructure/                             │
│  ┌─────────────────────────────────────┐     │
│  │  application/                        │     │
│  │  ┌─────────────────────────────┐     │     │
│  │  │  domain/                     │     │     │
│  │  │  models, ports, errors,      │     │     │
│  │  │  events (pur TS)             │     │     │
│  │  └─────────────────────────────┘     │     │
│  │  commands/, queries/, events/         │     │
│  │  (@nestjs/cqrs autorisé ici)         │     │
│  └─────────────────────────────────────┘     │
│  adapters/, resolvers/, modules              │
│  (@nestjs/*, drizzle, bullmq, etc.)          │
└─────────────────────────────────────────────┘
```

**Règle de dépendance :** `domain/ → rien (sauf core/domain/)` | `application/ → domain/ + core/` | `infrastructure/ → application/ + domain/ + core/`

**Frontière inter-modules (enforced par dependency-cruiser) :**

```
modules/{A}/  --X-->  modules/{B}/                    INTERDIT (tout import cross-module)
modules/*/    ----->  core/domain/                    AUTORISÉ (TS pur)
modules/*/domain/ -X-> core/infrastructure/           INTERDIT
modules/*/    ----->  core/infrastructure/            AUTORISÉ (sauf depuis domain/)
modules/*/    ----->  packages/shared/                AUTORISÉ
```

- Les modules communiquent **uniquement** via le bus d'événements CQRS (pour les actions) ou via Queries cross-module (pour les lectures)
- Pas d'import direct entre modules
- Les event payloads partagés sont dans `core/domain/events/`
- Les types de retour des Queries cross-modules sont dans `core/domain/models/`

**Frontière frontend ↔ backend :**

```
Browser ←→ SvelteKit (routes/) ←→ NestJS (resolvers/)
           hooks.server.ts          GraphQL + SSE
           (server-to-server)
```

Le browser ne contacte **jamais** NestJS directement. Toute communication passe par les routes SvelteKit server-side.

### Requirements to Structure Mapping

**FR → Modules :**

| Groupe FR | Module(s) | Commands clés | Queries clés |
|---|---|---|---|
| FR1-FR5 Gestion compte | auth/ | register-user, login-user, refresh-token | get-current-user |
| FR6-FR11 Dépôt documents | ingestion/ | upload-document, upload-batch | — |
| FR12-FR20 Pipeline IA | pipeline/ + encryption/ | run-pipeline, extract-text, classify-document, encrypt-document | get-pipeline-status |
| FR21-FR24 Organisation | classification/ | move-document, create-folder | list-folders, get-folder-contents |
| FR25-FR28 Recherche | search/ | — | search-documents, get-recent-documents |
| FR29-FR34 Gestion docs | documents/ | delete-document, export-documents | get-document, list-user-documents |
| FR35-FR40 Confidentialité | encryption/ + audit/ | encrypt-document, log-audit-entry | get-audit-trail |

**Concerns transverses → Localisation :**

| Concern | Localisation | Mécanisme |
|---|---|---|
| Chiffrement | encryption/ module + pipeline event handlers | Command encrypt/decrypt, appelé via event bus |
| Isolation utilisateur | core/infrastructure/guards/user-isolation.guard.ts | Guard NestJS global, injecte userId |
| Mode dégradé | pipeline/ event handlers + cockatiel adapters | CircuitBreaker dans infra/, PipelineFailedEvent |
| Audit trail | audit/ module event handlers | Écoute tous les domain events pertinents |
| Abstraction IA | pipeline/domain/ports/ + infra/adapters/ | OcrService.port.ts → TesseractOcr.adapter.ts |
| Apprentissage | classification/events/on-document-moved | DocumentMovedEvent → stocke signal correction |
| Transactions | core/infrastructure/cqrs/transaction.middleware.ts | `@Transactional()` opt-in sur les Command Handlers |

### Integration Points

**Flux principal — Upload → Classification :**

```
Browser → SvelteKit form action → NestJS Mutation uploadDocument
  → UploadDocumentCommand
    → UploadDocumentHandler.execute()
      → persiste le document, stocke fichier chiffré (Scaleway)
      → publie DocumentUploadedEvent
  → [post-commit]
    → OnDocumentUploadedHandler → crée job BullMQ "document-pipeline"
    → OnDocumentUploadedHandler → log audit

BullMQ Worker pickup job
  → RunPipelineCommand : orchestre les étapes séquentielles
    1. ExtractTextCommand → Tesseract OCR → publie TextExtractedEvent
    2. ExtractEntitiesCommand → Mistral API → publie EntitiesExtractedEvent
    3. GenerateEmbeddingCommand → Mistral API → publie EmbeddingGeneratedEvent
    4. ClassifyDocumentCommand → logique classification → publie DocumentClassifiedEvent
    5. EncryptDocumentCommand → chiffre métadonnées extraites

DocumentClassifiedEvent [post-commit]
  → OnDocumentClassifiedHandler (pipeline/) → Redis Pub/Sub → SSE → Browser
  → OnDocumentClassifiedHandler (search/) → invalide cache recherche
  → OnDocumentClassifiedHandler (audit/) → log audit entry
```

**Intégrations externes :**

| Service | Adapter | Port | Résilience |
|---|---|---|---|
| Mistral API | mistral-llm.adapter.ts | llm-service.port.ts | cockatiel : 5 échecs/60s, timeout 30s |
| Tesseract | tesseract-ocr.adapter.ts | ocr-service.port.ts | cockatiel : timeout 30s |
| Scaleway Object Storage | scaleway-storage.adapter.ts | storage.port.ts | retry 3x backoff |
| PostgreSQL + pgvector | drizzle-*.adapter.ts | *-repository.port.ts | pool connexions |
| Redis (BullMQ + Pub/Sub + cache) | via NestJS modules | — | reconnexion auto |

### Dependency-Cruiser Rules

```javascript
// .dependency-cruiser.cjs — Règles principales
module.exports = {
  forbidden: [
    // 1. Frontière hexagonale : domain/ n'importe rien du framework
    {
      name: 'no-framework-in-domain',
      severity: 'error',
      from: { path: 'modules/.+/domain/' },
      to: { path: ['@nestjs/(?!cqrs)', 'drizzle-orm', 'bullmq'] }
    },
    // 2. Frontière hexagonale : domain/ n'importe pas de infrastructure/
    {
      name: 'no-infra-in-domain',
      severity: 'error',
      from: { path: 'modules/.+/domain/' },
      to: { path: 'modules/.+/infrastructure/' }
    },
    // 3. Isolation inter-modules : zéro import cross-module
    {
      name: 'no-cross-module-imports',
      severity: 'error',
      from: { path: 'src/modules/([^/]+)/' },
      to: { path: 'src/modules/(?!\\1/)' }
    },
    // 4. domain/ ne peut importer que core/domain/ (pas core/infrastructure/)
    {
      name: 'no-core-infra-in-domain',
      severity: 'error',
      from: { path: 'modules/.+/domain/' },
      to: { path: 'core/infrastructure/' }
    },
    // 5. packages/shared/ reste le contrat frontend ↔ backend
    {
      name: 'no-backend-only-in-shared',
      severity: 'error',
      from: { path: 'packages/shared/' },
      to: { path: ['src/modules/', 'src/core/'] }
    }
  ]
}
```

## Architecture Validation Results

### Coherence Validation

**Compatibilité des décisions :**

| Vérification | Statut |
|---|---|
| SvelteKit + NestJS + Turborepo (starters officiels, versions 2026-02-12) | OK |
| GraphQL code-first (NestJS) + Houdini (SvelteKit) | OK |
| CQRS léger + Architecture hexagonale | OK |
| Transaction middleware + Drizzle ORM + @nestjs/cls | OK |
| Events post-commit + BullMQ (jobs créés après commit uniquement) | OK |
| JWT httpOnly + SvelteKit hooks (refresh silencieux server-to-server) | OK |
| Envelope encryption + droit à l'effacement RGPD | OK |
| cockatiel (circuit breaker) dans infrastructure/ uniquement | OK |
| dependency-cruiser (5 règles) couvre toutes les frontières | OK |

Contradictions détectées : **0**

**Consistency des patterns :**
- Naming : DB snake_case, GraphQL camelCase, fichiers kebab-case, classes PascalCase — cohérent
- CQRS : Convention `{verb}-{noun}` uniforme pour commands, queries, events
- Erreurs : hiérarchie unique AppError → DomainError/InfrastructureError/AuthError avec codes standardisés

### Requirements Coverage Validation

**Functional Requirements — 42/42 couverts :**

| Groupe FR | Module(s) | Statut |
|---|---|---|
| FR1-FR5 Gestion compte | auth/ | Complet — JWT + Argon2id + throttler |
| FR6-FR11 Dépôt documents | ingestion/ | Complet — Upload XHR/fetch, validation Zod, quota |
| FR12-FR20 Pipeline IA | pipeline/ + encryption/ | Complet — BullMQ 5 étapes, CQRS events, mode dégradé |
| FR21-FR24 Organisation | classification/ | Complet — list-folders, move-document → apprentissage |
| FR25-FR28 Recherche | search/ | Complet — pgvector HNSW + full-text, cache Redis |
| FR29-FR34 Gestion docs | documents/ | Complet — CRUD + export portabilité |
| FR35-FR40 Confidentialité | encryption/ + audit/ | Complet — Envelope encryption, audit trail |

**Non-Functional Requirements — 25/25 adressés :**

| Catégorie | Mécanisme architectural |
|---|---|
| Performance | HNSW index, BullMQ async, SSE, Redis cache TTL 5min, SvelteKit SSR |
| Sécurité | AES-256 envelope, JWT httpOnly, Argon2id, throttler, user-isolation guard |
| Fiabilité | cockatiel circuit breaker, BullMQ retry, events post-commit |
| Scalabilité | Workers BullMQ parallèles, Scaleway Object Storage, pool connexions |
| Accessibilité | shadcn-svelte + bits-ui (WCAG 2.1 AA), skeletons |
| Intégrations | Ports/adapters hexagonal, Strategy pattern, timeout 30s |
| Infrastructure | Docker Swarm Scaleway, Grafana + Prometheus, Sentry |

### Implementation Readiness Validation

| Critère | Statut |
|---|---|
| Technologies avec versions (15 packages) | OK |
| Séquence d'initialisation (commandes bash) | OK |
| Patterns avec exemples de code | OK |
| Conventions de nommage (6 catégories) | OK |
| Anti-patterns documentés (13 patterns) | OK |
| Dependency-cruiser rules (5 règles JS) | OK |
| Séquence d'implémentation (9 étapes ordonnées) | OK |
| Arborescence complète (~200 fichiers/dossiers) | OK |
| 8 modules NestJS + module core/ détaillés | OK |
| Enforcement guidelines pour agents IA (11 règles) | OK |

### Gap Analysis

**Gaps critiques : 0**

**Gaps importants (non bloquants, à traiter en stories) :**

| Gap | Recommandation |
|---|---|
| Schéma DB détaillé (tables, colonnes, relations) | Définir lors de la story Data/Drizzle |
| Configuration Docker Swarm (replicas, ressources) | Définir en story Infrastructure |
| Convention de migration DB (versioning, rollback) | Documenter dans la première story DB |

**Gaps nice-to-have (post-MVP) :**

| Gap | Recommandation |
|---|---|
| ADR formels | Créer dans `docs/adr/` au fil des stories |
| Diagramme C4 | Utile pour la documentation |
| Feature flags | Non nécessaire pour dev solo MVP |
| Rotation automatisée master keys | Post-MVP |

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Contexte projet analysé (42 FRs, 25 NFRs, 6 cross-cutting concerns)
- [x] Scale et complexité évalués (Medium-High)
- [x] Contraintes techniques identifiées (project-context, 87 règles)

**Architectural Decisions**
- [x] Décisions critiques documentées avec versions
- [x] Stack technologique complètement spécifié (15 packages versionnés)
- [x] CQRS léger + bus d'événements + transaction middleware
- [x] Module core/ avec séparation domain/infrastructure
- [x] Patterns d'intégration définis (SSE relay, GraphQL, BullMQ events)

**Implementation Patterns**
- [x] Conventions de nommage établies (DB, GraphQL, BullMQ, Redis, env vars, CQRS)
- [x] Structure patterns définis (hexagonale CQRS, core/, frontend)
- [x] Communication patterns spécifiés (SSE events, BullMQ jobs, CQRS bus)
- [x] Process patterns documentés (error handling, loading states, validation)

**Project Structure**
- [x] Arborescence complète définie (~200 entrées)
- [x] Frontières architecturales documentées et enforçables
- [x] Mapping FRs → modules complet
- [x] Points d'intégration et flux de données documentés

### Architecture Readiness Assessment

**Statut : PRÊT POUR L'IMPLÉMENTATION**

**Niveau de confiance : HIGH**

**Forces clés :**
- Architecture décisionnelle complète — un agent IA peut implémenter sans ambiguïté
- Frontières enforçables automatiquement (dependency-cruiser, TypeScript strict, Zod)
- CQRS léger + events post-commit = cohérence données + découplage modules
- Module core/ = vocabulaire partagé backend sans polluer packages/shared/
- 4 couches de typage claires (Drizzle row → Domain Model → Core interface → Shared DTO)

**Améliorations futures (post-MVP) :**
- Rotation automatisée des master keys de chiffrement
- Scaling Tesseract en service séparé
- Diagrammes C4 de l'architecture
- Feature flags si multi-tenant

### Implementation Handoff

**Directives pour agents IA :**
1. Lire `project-context.md` + ce document avant toute implémentation
2. Suivre les 11 enforcement guidelines de la section Implementation Patterns
3. Respecter les 5 règles dependency-cruiser
4. Vérifier les 13 anti-patterns avant chaque PR

**Première priorité d'implémentation :**
Story 0 — Initialisation du monorepo via la séquence de starters documentée (section Starter Template Evaluation)
