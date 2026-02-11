---
project_name: 'archie'
user_name: 'Antoine'
date: '2026-02-11'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 87
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core

- **Language:** TypeScript (strict mode) — partout (frontend, backend, shared types)
- **Runtime:** Node.js (LTS)
- **Package Manager:** pnpm (workspaces)
- **Monorepo:** pnpm workspaces + Turborepo (cache de builds)

### Frontend

- **Framework:** SvelteKit (Svelte 5 — runes)
- **Role:** UI + load functions (data fetching SSR) + form actions
- **GraphQL Client:** Houdini (natif SvelteKit, codegen, cache)
- **State management:** Svelte 5 runes ($state, $derived) — pas de lib externe
- **UI:** shadcn-svelte + bits-ui (primitives accessibles) + Tailwind CSS

### Backend

- **Framework:** NestJS
- **Role:** API principale, logique métier, intégrations externes, pipeline de traitement
- **Architecture:** Modulaire (modules NestJS par domaine : ingestion, classification, recherche, auth)
- **Pipeline:** Modules pluggables — chaque étape (OCR, extraction, embedding, chiffrement) est interchangeable (pattern Strategy via injection de dépendances NestJS)

### Data

- **Base de données:** PostgreSQL + pgvector (embeddings vectoriels)
- **Query Builder:** Drizzle ORM (schémas dans infrastructure/, pas de decorators dans le domaine)
- **File d'attente:** BullMQ + Redis (pipeline async MVP)
- **Stockage objets:** Scaleway Object Storage (S3-compatible) — documents chiffrés

### IA

- **LLM / Extraction d'entités:** Mistral (API) — abstrait derrière une interface pluggable
- **OCR:** Tesseract (self-hosted)
- **Embeddings:** à définir (Mistral Embed / autre)

### Infrastructure

- **Containerisation dev:** Docker Compose
- **Containerisation prod:** Docker Swarm
- **Cloud:** Scaleway (souveraineté française)
- **CI/CD:** GitHub Actions

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

#### Configuration

- `strict: true` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `noPropertyAccessFromIndexSignature` + `noFallthroughCasesInSwitch`
- Target: ES2023
- Module: NodeNext (backend), ESNext (frontend)

#### Architecture hexagonale — Structure par module

```
modules/<nom-module>/
├── domain/          # ZÉRO import @nestjs/* — purement TypeScript
│   ├── models/      # Entités, value objects
│   ├── ports/       # Interfaces (contrats d'injection)
│   ├── errors/      # DomainErrors spécifiques avec code unique
│   └── schemas/     # Schémas Zod (validation)
├── application/     # Use cases — ZÉRO import @nestjs/*
│   └── commands/    # CreateDocument, ClassifyDocument...
├── infrastructure/  # Adapters NestJS, implémentations concrètes
│   ├── adapters/    # PostgresDocumentRepository, TesseractOcrService...
│   ├── controllers/ # Routes HTTP
│   └── pipes/       # ZodValidationPipe
```

**Règle fondamentale : le domaine ne connaît pas l'infrastructure. Jamais.**

- Aucun import `@nestjs/*` dans `domain/` ou `application/`
- Les ports (interfaces dans `domain/ports/`) sont les contrats d'injection
- NestJS câble les adapters sur les ports via son système de DI dans la couche infrastructure

#### Enforcement architectural — dependency-cruiser

- **dependency-cruiser** configuré en CI pour valider les frontières hexagonales
- Règles obligatoires :
  - `domain/` ne peut pas importer depuis `infrastructure/` ni depuis `@nestjs/*`
  - `application/` ne peut pas importer depuis `infrastructure/` ni depuis `@nestjs/*`
  - `infrastructure/` peut importer depuis `domain/` et `application/`
- Exécuté à chaque PR — build bloqué si violation détectée

#### Imports & Exports

- Imports directs uniquement — **pas de barrel files** (`index.ts`)
- **Pas d'export default** — toujours `export const` / `export class` / `export function`
- Path aliases monorepo : `@archie/shared`, `@archie/web`, `@archie/api`
- Imports internes à un module : chemins relatifs (`./domain/ports/...`)
- Imports cross-package : aliases `@archie/*`

#### Types & Interfaces

- **Pas de préfixe `I`** — le suffixe de fichier porte l'information (`.port.ts`, `.adapter.ts`)
- **Union types** au lieu d'enums : `type DocumentStatus = 'pending' | 'classified' | 'error'`
- **Types/interfaces pour les DTOs** — pas de classes (sauf quand NestJS l'impose dans la couche infra)
- Types inférés depuis les schémas Zod : `type CreateDocumentDto = z.infer<typeof createDocumentSchema>`

#### Validation

- **Zod** comme unique librairie de validation (front + back + shared)
- Schémas Zod définis dans la couche domaine (framework-agnostic)
- Pipes NestJS custom pour brancher Zod dans la couche infrastructure
- **Pas de `class-validator` / `class-transformer`** — incompatible avec l'architecture hexagonale

#### Gestion d'erreurs

- Classe de base `AppError` avec propriété `code` string unique obligatoire
- Hiérarchie domaine : `DomainError` > `DocumentNotFoundError`, `ClassificationError`, etc.
- Chaque erreur a un code explicite : `'CLASSIFICATION_LOW_CONFIDENCE'`, `'DOCUMENT_NOT_FOUND'`, etc.
- L'API NestJS traduit les erreurs domaine en HTTP status codes dans la couche infrastructure

#### Conventions de nommage fichiers

- **kebab-case** pour tous les fichiers
- Suffixes explicites reflétant l'hexagone :
  - Domaine : `.port.ts`, `.model.ts`, `.error.ts`, `.schema.ts`
  - Application : `.usecase.ts`, `.command.ts`
  - Infrastructure : `.adapter.ts`, `.controller.ts`, `.pipe.ts`, `.module.ts`
  - Shared : `.dto.ts`, `.type.ts`

### Framework-Specific Rules

#### NestJS (Backend API)

##### GraphQL

- **Approche code-first** — types GraphQL générés depuis les decorators TypeScript
- Resolvers dans `infrastructure/resolvers/` (même niveau que controllers)
- Les resolvers appellent les use cases de la couche `application/`, jamais le domaine directement
- **Pas de logique métier dans les resolvers** — uniquement mapping entrée/sortie
- NestJS génère automatiquement `schema.graphql` — ce fichier est versionné dans `packages/shared/` comme contrat partagé avec Houdini

##### Authentification

- Passport.js via `@nestjs/passport`
- Guards NestJS dans la couche infrastructure
- La logique d'autorisation métier (qui peut accéder à quel document) reste dans la couche application

##### Logging

- Winston via `@nestjs/winston`
- Logs structurés JSON en production
- Contexte de requête (userId, requestId) injecté automatiquement

##### Modules NestJS

- Un module NestJS par domaine métier : `IngestionModule`, `ClassificationModule`, `SearchModule`, `AuthModule`
- Chaque module encapsule ses 3 couches (domain / application / infrastructure)
- Les modules communiquent via les ports, pas par imports directs entre modules

#### SvelteKit (Frontend)

##### Communication SvelteKit → NestJS

- **Server-to-server par défaut** : le navigateur ne parle jamais directement à NestJS
- Flux : `Navigateur → SvelteKit (server) → NestJS (GraphQL)`
- L'URL de l'API NestJS n'est jamais exposée au client
- WebSocket direct navigateur → NestJS uniquement si besoin temps réel (post-MVP)

##### Routing & Rendering

- Conventions SvelteKit : `+page.svelte`, `+page.server.ts`, `+layout.svelte`
- **Server load functions** pour le data fetching SSR (pas de fetch côté client quand possible)
- **Form actions** pour les mutations (upload, reclassification, corrections)
- Progressive enhancement : l'app doit fonctionner sans JS côté client pour les actions critiques
- **Route groups** obligatoires :
  - `(app)/` — routes authentifiées (layout avec sidebar, navigation, barre de recherche)
  - `(auth)/` — routes publiques (login, register — layout minimal)

##### Authentification frontend

- **`hooks.server.ts`** comme middleware central :
  - Vérification du cookie de session (httpOnly)
  - Injection de l'utilisateur dans `event.locals`
  - Redirection vers `/login` si non authentifié
  - Attachement du token pour les appels vers NestJS

##### GraphQL — Houdini

- Houdini comme unique client GraphQL
- Requêtes définies dans des fichiers `.graphql` — codegen automatique
- Schema source : `packages/shared/schema.graphql` (généré par NestJS)
- Cache déclaratif géré par Houdini
- Queries dans les load functions (`+page.ts`) pour le SSR

##### Réactivité & State

- **Svelte 5 runes** exclusivement : `$state`, `$derived`, `$effect`
- **Pas de librairie de state management externe**
- **Pas de stores Svelte legacy** (`writable`, `derived` de `svelte/store`)
- État serveur géré par le cache Houdini
- État client (UI, filtres, préférences) géré par les runes

##### UI & Styling

- **shadcn-svelte** — composants copiés dans le projet (`$lib/components/ui/`)
- **bits-ui** comme primitives accessibles (équivalent Radix pour Svelte)
- **Tailwind CSS** pour le styling
- Pas de CSS-in-JS

##### Structure frontend

```
apps/web/src/
├── lib/
│   ├── components/
│   │   ├── ui/           # shadcn-svelte (générés)
│   │   ├── documents/    # composants métier documents
│   │   ├── search/       # composants métier recherche
│   │   └── layout/       # header, sidebar, navigation
│   ├── stores/           # runes partagées entre pages
│   └── utils/            # helpers frontend
├── routes/
│   ├── (app)/            # routes authentifiées (group layout)
│   │   ├── documents/
│   │   ├── search/
│   │   └── +layout.svelte  # layout app (sidebar + barre recherche)
│   ├── (auth)/           # routes publiques (login, register)
│   │   └── +layout.svelte  # layout minimal
│   └── +layout.svelte    # root layout
└── hooks.server.ts       # middleware auth
```

##### UX Rules

- La barre de recherche vit dans `(app)/+layout.svelte` — accessible depuis toutes les pages
- Upload de documents : form action natif (fonctionne sans JS) + enrichissement progressif (drag & drop, progress bar, preview)

#### Monorepo

##### Structure des packages

```
archie/
├── apps/
│   ├── web/          # SvelteKit (frontend)
│   └── api/          # NestJS (backend)
├── packages/
│   └── shared/       # Types, schémas Zod, schema.graphql, utilitaires
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

- `@archie/web` → `apps/web/`
- `@archie/api` → `apps/api/`
- `@archie/shared` → `packages/shared/`

##### Schema GraphQL comme contrat

- NestJS (code-first) génère `schema.graphql` automatiquement
- Ce fichier est versionné dans `packages/shared/schema.graphql`
- Houdini consomme ce schema pour son codegen
- Le codegen Houdini ne dépend pas d'un serveur NestJS qui tourne

### Testing Rules

#### Frameworks

- **Unitaires & Intégration :** Vitest
- **E2E :** Playwright
- **Composants visuels :** Storybook (environnement de développement uniquement)

#### Niveaux de test — Tags explicites

```
vitest.workspace.ts
├── unit          # .spec.ts — rapides, pas de container, pas de réseau
├── integration   # .integration.spec.ts — testcontainers, DB réelle
└── e2e           # .e2e.ts — Playwright, app complète déployée
```

#### Couverture

- **Couche domaine : minimum 80%**
- **Couche application (use cases) : minimum 80%**
- **Général (infrastructure + frontend) : minimum 60%**
- Couverture vérifiée en CI — PR bloquée si en dessous des seuils

#### Stratégie par couche (architecture hexagonale)

##### Couche domaine — Tests unitaires purs

- **Zéro dépendance framework** — pas de `@nestjs/testing`, pas de DI container
- Tests rapides, isolés, avec des mocks manuels simples des ports
- Tester : modèles, value objects, erreurs, schémas Zod, logique métier pure
- Assertions sur les `error.code` (string unique), jamais sur les messages

##### Couche application — Tests unitaires avec mocks des ports

- Use cases testés avec des implémentations mock des ports (in-memory repositories, fake services)
- Vérifier les orchestrations : le bon port est appelé, dans le bon ordre, avec les bons arguments

##### Couche infrastructure — Tests d'intégration (transaction-per-test)

- **Tests d'intégration GraphQL** : resolver → use case → mock des ports
- Tests des adapters Drizzle avec PostgreSQL réel via testcontainers
- **Pattern transaction-per-test** (style DAMA/Symfony) :
  - `beforeAll` : connexion unique (pas de pool), `BEGIN`, charger fixtures, `SAVEPOINT fixtures_loaded`
  - `afterEach` : `ROLLBACK TO SAVEPOINT fixtures_loaded`
  - `afterAll` : `ROLLBACK` + disconnect
  - Les adapters reçoivent la connexion transactionnée via DI (même interface qu'en prod)
- Pipes Zod testés avec des payloads valides et invalides
- **Tests de contrat Zod entre chaque étape du pipeline** (OCR → extraction → embedding → chiffrement)

##### Frontend SvelteKit — Tests composants + E2E

- Tests composants Vitest avec `@testing-library/svelte`
- Tests E2E Playwright pour les parcours critiques : upload, recherche, classification, auth
- Form actions testées via Playwright (vérifier le progressive enhancement)

#### Schema GraphQL — Test de non-régression

- Snapshot test du `schema.graphql` pour détecter les breaking changes silencieux
- Si le schema change, le dev met à jour le snapshot consciemment → Houdini recodegen

#### Frontières hexagonales — Test local

- dependency-cruiser exécuté comme test Vitest en plus de la CI
- Un dev qui viole l'hexagone le voit immédiatement en local

#### Storybook

- **Environnement de développement uniquement** — pas déployé en production
- Stories pour les composants `$lib/components/ui/` (shadcn-svelte)
- Stories pour les composants métier réutilisables
- **Composants isolés avec props mockées** — pas de load functions ni de form actions dans les stories

#### Conventions

- **Tout le code en anglais** (variables, fonctions, classes, descriptions de tests)
- `describe`/`it` en anglais : `it('should classify a PDF document')`
- Seuls les documents de projet (PRD, briefs, docs) sont en français
- **Colocalisation stricte** : `document.model.ts` → `document.model.spec.ts` (même dossier)
- Pas de dossier `__tests__/` sauf pour les fixtures partagées au niveau du module
- Suffixes : `.spec.ts` (unit), `.integration.spec.ts` (intégration), `.e2e.ts` (e2e)

### Code Quality & Style Rules

#### Linting & Formatting

- **ESLint** pour la qualité de code + **Prettier** pour le formatage
- Plugins Svelte : `eslint-plugin-svelte` + `prettier-plugin-svelte`
- Config ESLint flat (v9+)
- Règles ESLint notables :
  - `no-unused-vars` : error
  - `no-explicit-any` : error
  - `no-console` : warn (sauf Winston côté backend)
  - Règles d'import via `eslint-plugin-import` pour enforcer les conventions

#### Git Hooks

- **Husky** + **lint-staged** configurés sur pre-commit
- Lint-staged exécute ESLint + Prettier sur les fichiers stagés uniquement
- Pas de bypass autorisé (`--no-verify` interdit en workflow normal)

#### Code Style

- **Code auto-documenté** — pas de commentaires sauf si la logique n'est pas évidente
- **Pas de JSDoc** systématique — le typage TypeScript + les noms explicites suffisent
- Commentaires autorisés pour : décisions architecturales non évidentes, workarounds temporaires (avec `// TODO:` ou `// HACK:`)
- **Pas de limite de taille fixe** par fichier/fonction, mais vigilance : un fichier qui dépasse ~200 lignes ou une fonction qui dépasse ~30 lignes mérite un examen critique

### Development Workflow Rules

#### Git — GitHub Flow

- **Branche principale :** `main` (toujours déployable)
- **Feature branches** depuis `main`, merge vers `main`
- Pas de branche `develop` ni de release branches (GitHub Flow simple)

#### Nommage des branches

- `feat/<description>` — nouvelle fonctionnalité (`feat/upload-document`)
- `fix/<description>` — correction de bug (`fix/ocr-timeout`)
- `chore/<description>` — maintenance, config, dépendances
- `refactor/<description>` — restructuration sans changement de comportement
- Description en kebab-case, en anglais

#### Conventional Commits

- Format : `type(scope): description`
- Types : `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `ci`
- Scope = module concerné : `feat(ingestion): add PDF upload endpoint`
- Description en anglais, impératif, minuscule

#### Merge Strategy

- **Merge commit** (pas de squash, pas de rebase)
- L'historique complet des commits est préservé

#### CI/CD — GitHub Actions

- **Pipeline CI sur chaque PR :**
  1. Lint (ESLint + Prettier check)
  2. dependency-cruiser (frontières hexagonales)
  3. Tests unitaires (Vitest)
  4. Tests d'intégration (Vitest + testcontainers)
  5. Build (Turborepo)
- **Pipeline CD sur merge dans `main` :**
  - Build images Docker
  - Deploy sur Scaleway (Docker Swarm)

#### Environnements

- **Dev :** Docker Compose local (PostgreSQL, Redis, Tesseract, app)
- **Prod :** Docker Swarm sur Scaleway
- Pas de staging pour le MVP — dev → prod directement

### Critical Don't-Miss Rules

#### Anti-patterns INTERDITS

- **JAMAIS** d'import `@nestjs/*` dans `domain/` ou `application/` — c'est la règle #1
- **JAMAIS** de `class-validator` / `class-transformer` — Zod uniquement
- **JAMAIS** d'`export default` — toujours des exports nommés
- **JAMAIS** de barrel files (`index.ts`)
- **JAMAIS** de stores Svelte legacy (`writable`, `derived` de `svelte/store`) — runes uniquement
- **JAMAIS** de logique métier dans les resolvers GraphQL ou les controllers
- **JAMAIS** d'appel direct du navigateur vers l'API NestJS — server-to-server via SvelteKit
- **JAMAIS** d'enum TypeScript — union types uniquement
- **JAMAIS** de `any` explicite ou implicite

#### Sécurité & Privacy

- **Chiffrement at-rest post-analyse** — le document est chiffré après le pipeline de traitement
- **Pipeline éphémère** — le document en clair n'existe que pendant le traitement, dans un contexte isolé
- **Zéro cross-learning** — aucune donnée utilisateur n'alimente un modèle partagé
- **Cookies httpOnly** pour l'authentification — pas de token dans le localStorage
- **URL de l'API NestJS jamais exposée** au navigateur

#### Architecture

- **Les providers IA/OCR sont toujours derrière une interface pluggable** (pattern Strategy)
- **Le mode dégradé est un citoyen de première classe** — prévoir le comportement quand Mistral/Tesseract est down
- **L'IA humble** — mieux vaut placer un document dans "À trier" que de mal classer
- **Séparation stockage vs navigation** — l'arborescence sert la confiance, la recherche sert le retrouvage

#### Pièges spécifiques à la stack

- Drizzle : les schémas DB vivent dans `infrastructure/`, jamais dans `domain/`
- Houdini : toujours utiliser le schema versionné dans `packages/shared/`, pas l'introspection d'un serveur live
- SvelteKit : `hooks.server.ts` est le point central d'auth — ne pas disperser la logique d'auth dans les load functions
- BullMQ : les jobs du pipeline doivent être idempotents (un retry ne doit pas créer de doublon)

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-11
