# Story 1.1 : Initialisation du monorepo

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant que développeur,
Je veux un monorepo entièrement configuré avec SvelteKit, NestJS, le package shared et l'outillage de développement,
Afin de pouvoir commencer à implémenter les fonctionnalités d'Archie sur une base solide.

## Acceptance Criteria

1. **Given** le repository Git est vide **When** la séquence d'initialisation est exécutée **Then** le monorepo Turborepo est créé avec la structure `apps/web`, `apps/api`, `packages/shared` **And** `apps/web` est une application SvelteKit (Svelte 5, TypeScript strict) avec Tailwind CSS, shadcn-svelte et Houdini configurés **And** `apps/api` est une application NestJS (TypeScript strict) avec GraphQL code-first, Drizzle ORM et BullMQ configurés **And** `packages/shared` contient un `tsconfig.json` et exporte les path aliases `@archie/shared` **And** les path aliases `@archie/web`, `@archie/api`, `@archie/shared` sont configurés dans chaque package

2. **Given** le monorepo est initialisé **When** je lance `pnpm dev` **Then** SvelteKit démarre sur son port et NestJS démarre sur son port **And** Turborepo orchestre les deux en parallèle avec le hot reload actif

3. **Given** le monorepo est initialisé **When** je lance `docker compose up` **Then** PostgreSQL (avec pgvector) et Redis démarrent et sont accessibles depuis les applications

4. **Given** le monorepo est initialisé **When** je lance `pnpm lint` **Then** ESLint (flat config v9+) et Prettier vérifient le code des trois packages **And** Husky + lint-staged sont configurés sur le hook pre-commit

5. **Given** le monorepo est initialisé **When** je lance `pnpm test` **Then** Vitest s'exécute sur les trois packages via Turborepo

6. **Given** le monorepo est initialisé **When** dependency-cruiser est exécuté **Then** les 5 règles de frontières hexagonales sont actives (no-framework-in-domain, no-infra-in-domain, no-cross-module-imports, no-core-infra-in-domain, no-backend-only-in-shared)

7. **Given** le monorepo est initialisé **When** j'inspecte `.github/workflows/` **Then** un pipeline CI (`ci.yml`) est configuré avec les étapes : lint, type-check, tests (Vitest), dependency-cruiser **And** le pipeline s'exécute sur chaque push et pull request

8. **Given** le monorepo est initialisé **When** j'inspecte `apps/api/src/core/` **Then** le module Core existe avec `core.module.ts`, `domain/errors/` (AppError, DomainError, InfrastructureError) et `infrastructure/` (structure de base pour CQRS, guards, filters, pipes)

## Tasks / Subtasks

- [ ] Task 1 : Initialisation du monorepo Turborepo (AC: #1)
  - [ ] 1.1 Exécuter `npx create-turbo@2.8.7 archie --package-manager pnpm` (ou initialiser manuellement si le repo existe déjà)
  - [ ] 1.2 Configurer `pnpm-workspace.yaml` avec `apps/*` et `packages/*`
  - [ ] 1.3 Configurer `turbo.json` avec les pipelines : `build`, `dev`, `lint`, `test`, `type-check`
  - [ ] 1.4 Configurer `.npmrc` avec `shamefully-hoist=false`
  - [ ] 1.5 Configurer le `package.json` racine avec les scripts : `dev`, `build`, `test`, `lint`, `type-check`

- [ ] Task 2 : Setup SvelteKit — apps/web (AC: #1, #2)
  - [ ] 2.1 Supprimer l'app par défaut de Turborepo et exécuter `npx sv create apps/web --template minimal --types ts --add tailwindcss,vitest,sveltekit-adapter --install pnpm`
  - [ ] 2.2 Configurer TypeScript strict dans `tsconfig.json` : `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `target: "ES2023"`
  - [ ] 2.3 Configurer les path aliases dans `svelte.config.js` et `tsconfig.json` : `@archie/web` → `src/`, `@archie/shared` → `../../packages/shared/src`
  - [ ] 2.4 Initialiser shadcn-svelte : `npx shadcn-svelte@1.1.1 init` (theme : custom, style : default, base color : slate)
  - [ ] 2.5 Initialiser Houdini : `npx houdini init` puis configurer `houdini.config.js` avec l'URL du endpoint GraphQL de SvelteKit relay (`/api/graphql`)
  - [ ] 2.6 Créer la structure de répertoires frontend : `src/lib/components/{ui,documents,folders,search,pipeline,upload,selection,layout}`, `src/lib/stores/`, `src/lib/utils/`, `src/lib/server/`
  - [ ] 2.7 Créer les route groups : `src/routes/(auth)/`, `src/routes/(app)/`, `src/routes/api/`
  - [ ] 2.8 Créer un fichier `src/app.css` avec les directives Tailwind et les design tokens Indigo Doux (palette neutres + accent indigo-500, police Inter)
  - [ ] 2.9 Vérifier que `pnpm dev` démarre le serveur Vite avec hot reload

- [ ] Task 3 : Setup NestJS — apps/api (AC: #1, #2)
  - [ ] 3.1 Supprimer l'app par défaut de Turborepo et exécuter `npx @nestjs/cli@11.0.16 new apps/api --strict --package-manager pnpm`
  - [ ] 3.2 Configurer TypeScript strict dans `tsconfig.json` : ajouter `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `target: "ES2023"`
  - [ ] 3.3 Configurer les path aliases : `@archie/api` → `src/`, `@archie/shared` → `../../packages/shared/src`
  - [ ] 3.4 Installer et configurer GraphQL code-first : `pnpm add @nestjs/graphql@13.2.4 @nestjs/apollo @apollo/server graphql`
  - [ ] 3.5 Installer et configurer Drizzle ORM : `pnpm add drizzle-orm@0.45.1 postgres` + `pnpm add -D drizzle-kit@0.31.9`
  - [ ] 3.6 Installer BullMQ : `pnpm add bullmq@5.68.0`
  - [ ] 3.7 Installer Zod : `pnpm add zod@4.3.6`
  - [ ] 3.8 Installer les dépendances CQRS et CLS : `pnpm add @nestjs/cqrs @nestjs/cls`
  - [ ] 3.9 Créer la structure de répertoires hexagonale : `src/modules/`, `src/core/`, `src/config/`, `src/database/`
  - [ ] 3.10 Configurer `app.module.ts` avec GraphQL module (autoSchemaFile, playground), configurer le bootstrap dans `main.ts`
  - [ ] 3.11 Vérifier que `pnpm dev` démarre NestJS avec watch mode et GraphQL playground accessible

- [ ] Task 4 : Setup packages/shared (AC: #1)
  - [ ] 4.1 Créer `packages/shared/package.json` avec le nom `@archie/shared` et les exports
  - [ ] 4.2 Créer `packages/shared/tsconfig.json` avec `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `target: "ES2023"`
  - [ ] 4.3 Créer la structure : `src/schemas/`, `src/types/`, `src/constants/`
  - [ ] 4.4 Installer Zod : `pnpm add zod@4.3.6`
  - [ ] 4.5 Créer un fichier placeholder dans chaque répertoire pour valider les imports cross-package
  - [ ] 4.6 Vérifier que `apps/web` et `apps/api` peuvent importer depuis `@archie/shared`

- [ ] Task 5 : Docker Compose pour dev local (AC: #3)
  - [ ] 5.1 Créer `docker-compose.yml` à la racine avec les services PostgreSQL et Redis
  - [ ] 5.2 Configurer PostgreSQL : image `pgvector/pgvector:pg17`, port 5432, volume persistant, base `archie_dev`
  - [ ] 5.3 Configurer Redis : image `redis:7-alpine`, port 6379
  - [ ] 5.4 Créer `.env.example` avec les variables : `DATABASE_URL`, `REDIS_URL`, `ENCRYPTION_MASTER_KEY` (placeholder)
  - [ ] 5.5 Vérifier que `docker compose up` démarre les services et qu'ils sont accessibles depuis les applications

- [ ] Task 6 : ESLint, Prettier, Husky, lint-staged (AC: #4)
  - [ ] 6.1 Configurer ESLint flat config v9+ à la racine (`eslint.config.js`) avec les règles TypeScript + Svelte + NestJS
  - [ ] 6.2 Configurer Prettier à la racine (`.prettierrc`) : singleQuote, trailingComma, printWidth 100
  - [ ] 6.3 Installer et configurer Husky : `pnpm add -D husky` + `npx husky init`
  - [ ] 6.4 Configurer lint-staged : `pnpm add -D lint-staged` + configurer dans `package.json` racine pour ESLint + Prettier sur les fichiers staged
  - [ ] 6.5 Vérifier que `pnpm lint` passe sans erreur sur les trois packages
  - [ ] 6.6 Vérifier que le hook pre-commit exécute lint-staged

- [ ] Task 7 : Configuration Vitest (AC: #5)
  - [ ] 7.1 Configurer Vitest dans `apps/web/vite.config.ts` (déjà initialisé par sv create, vérifier la config)
  - [ ] 7.2 Configurer Vitest dans `apps/api` : `pnpm add -D vitest` + créer `vitest.config.ts` (remplacer Jest si NestJS l'a installé)
  - [ ] 7.3 Configurer Vitest dans `packages/shared` : `pnpm add -D vitest` + créer `vitest.config.ts`
  - [ ] 7.4 Créer un test placeholder dans chaque package pour valider l'exécution
  - [ ] 7.5 Configurer `turbo.json` pour que `pnpm test` exécute Vitest sur les trois packages
  - [ ] 7.6 Vérifier que `pnpm test` passe avec tous les tests verts

- [ ] Task 8 : Dependency-cruiser avec 5 règles hexagonales (AC: #6)
  - [ ] 8.1 Installer dependency-cruiser : `pnpm add -D dependency-cruiser` à la racine
  - [ ] 8.2 Créer `.dependency-cruiser.cjs` avec les 5 règles :
    - `no-framework-in-domain` : `modules/.+/domain/` ne peut pas importer `@nestjs/(?!cqrs)`, `drizzle-orm`, `bullmq`
    - `no-infra-in-domain` : `modules/.+/domain/` ne peut pas importer `modules/.+/infrastructure/`
    - `no-cross-module-imports` : `modules/{A}/` ne peut pas importer `modules/{B}/`
    - `no-core-infra-in-domain` : `modules/.+/domain/` ne peut pas importer `core/infrastructure/`
    - `no-backend-only-in-shared` : `packages/shared/` ne peut pas importer `src/modules/` ou `src/core/`
  - [ ] 8.3 Ajouter un script `depcruise` dans le `package.json` racine
  - [ ] 8.4 Vérifier que dependency-cruiser s'exécute et passe sans violation

- [ ] Task 9 : Pipeline CI GitHub Actions (AC: #7)
  - [ ] 9.1 Créer `.github/workflows/ci.yml`
  - [ ] 9.2 Configurer le trigger : `on: [push, pull_request]`
  - [ ] 9.3 Configurer les étapes : checkout, setup Node.js LTS, setup pnpm, install, lint (`pnpm lint`), type-check (`pnpm type-check`), tests (`pnpm test`), dependency-cruiser (`pnpm depcruise`)
  - [ ] 9.4 Vérifier la syntaxe du workflow YAML

- [ ] Task 10 : Module Core backend (AC: #8)
  - [ ] 10.1 Créer `apps/api/src/core/core.module.ts` (module NestJS)
  - [ ] 10.2 Créer `apps/api/src/core/domain/errors/app.error.ts` — classe de base `AppError` avec `code: string`, `message: string`, `httpStatus?: number`
  - [ ] 10.3 Créer `apps/api/src/core/domain/errors/domain.error.ts` — extends `AppError`
  - [ ] 10.4 Créer `apps/api/src/core/domain/errors/infrastructure.error.ts` — extends `AppError`
  - [ ] 10.5 Créer `apps/api/src/core/domain/events/` — répertoire vide avec un README ou fichier placeholder (les event payloads seront ajoutés avec les stories suivantes)
  - [ ] 10.6 Créer `apps/api/src/core/domain/models/` — répertoire vide avec fichier placeholder
  - [ ] 10.7 Créer la structure `apps/api/src/core/infrastructure/` avec les sous-répertoires : `cqrs/`, `guards/`, `filters/`, `pipes/`, `interceptors/`, `decorators/`, `test-helpers/`
  - [ ] 10.8 Créer `apps/api/src/core/infrastructure/cqrs/cqrs.module.ts` — structure de base pour le CQRS module (sera complété dans les stories suivantes)
  - [ ] 10.9 Créer `apps/api/src/core/infrastructure/filters/domain-exception.filter.ts` — structure de base : `DomainError` → `GraphQLError` avec code dans `extensions`
  - [ ] 10.10 Créer `apps/api/src/core/infrastructure/pipes/zod-validation.pipe.ts` — structure de base pour la validation Zod
  - [ ] 10.11 Écrire les tests unitaires pour les erreurs de base (AppError, DomainError, InfrastructureError)
  - [ ] 10.12 Importer `CoreModule` dans `app.module.ts`

- [ ] Task 11 : Validation finale (AC: #1-#8)
  - [ ] 11.1 Vérifier `pnpm dev` — les deux apps démarrent via Turborepo
  - [ ] 11.2 Vérifier `docker compose up` — PostgreSQL + Redis accessibles
  - [ ] 11.3 Vérifier `pnpm lint` — passe sans erreur
  - [ ] 11.4 Vérifier `pnpm test` — tous les tests verts
  - [ ] 11.5 Vérifier dependency-cruiser — aucune violation
  - [ ] 11.6 Vérifier les imports cross-package (`@archie/shared` importable depuis web et api)
  - [ ] 11.7 Vérifier que le code respecte les conventions : pas de barrel files, pas d'export default, pas d'enums TypeScript

## Dev Notes

### Contraintes architecturales critiques

- **TypeScript strict partout** : `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `target: "ES2023"` dans TOUS les tsconfig.json
- **Pas de barrel files** : pas de `index.ts` qui réexportent. Imports directs vers les fichiers source
- **Pas d'export default** : utiliser `export class`, `export function`, etc.
- **Pas d'enums TypeScript** : utiliser `type Status = 'active' | 'inactive'` à la place
- **Svelte 5 runes exclusivement** : `$state`, `$derived`, `$effect`. Pas de stores legacy (`writable`, `readable`)
- **Zod uniquement** pour la validation : pas de `class-validator`, pas de `class-transformer`
- **Conventional commits** : `type(scope): description` en anglais

### Versions des packages (vérifiées 2026-02-12)

| Package | Version |
|---|---|
| Turborepo | 2.8.7 |
| Svelte | 5.50.2 |
| SvelteKit | 2.50.2 |
| sv CLI | 0.12.1 |
| shadcn-svelte | 1.1.1 |
| bits-ui | 2.15.5 |
| NestJS Core | 11.1.13 |
| NestJS CLI | 11.0.16 |
| @nestjs/graphql | 13.2.4 |
| Houdini | 1.5.10 |
| Drizzle ORM | 0.45.1 |
| Drizzle Kit | 0.31.9 |
| BullMQ | 5.68.0 |
| Zod | 4.3.6 |
| Apollo Server | 5.4.0 |
| @nestjs/cqrs | latest |
| @nestjs/cls | latest |

### Séquence d'initialisation recommandée

L'architecture recommande cette séquence de commandes comme point de départ :

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

# 5. Ajouts séquentiels dans apps/web
cd apps/web
npx shadcn-svelte@1.1.1 init
npx houdini init

# 6. Ajouts dans apps/api
cd apps/api
pnpm add @nestjs/graphql@13.2.4 @nestjs/apollo @apollo/server graphql
pnpm add drizzle-orm@0.45.1 postgres
pnpm add -D drizzle-kit@0.31.9
pnpm add bullmq@5.68.0
pnpm add zod@4.3.6
pnpm add @nestjs/cqrs @nestjs/cls
```

**ATTENTION :** Cette séquence est un guide. Adapter selon le contenu existant du repo (les fichiers de planning `_bmad-output/` existent déjà). Ne pas supprimer les fichiers existants qui ne font pas partie de Turborepo.

### Configuration Turborepo (turbo.json)

Le `turbo.json` doit définir les pipelines suivantes :
- `build` : dépend de `^build` (build en cascade)
- `dev` : mode persistent, pas de cache
- `lint` : dépend de `^build`
- `test` : dépend de `^build`
- `type-check` : dépend de `^build`

### Configuration Docker Compose

```yaml
# docker-compose.yml — PostgreSQL avec pgvector + Redis
services:
  postgres:
    image: pgvector/pgvector:pg17
    environment:
      POSTGRES_DB: archie_dev
      POSTGRES_USER: archie
      POSTGRES_PASSWORD: archie_dev_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Configuration ESLint flat config

ESLint doit être en flat config v9+ (`eslint.config.js`). Configuration à la racine qui couvre les trois packages. Intégrer :
- `@typescript-eslint/eslint-plugin` pour les règles TypeScript
- `eslint-plugin-svelte` pour le linting Svelte
- Prettier via `eslint-config-prettier`

### Dependency-cruiser — 5 règles exactes

```javascript
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    {
      name: 'no-framework-in-domain',
      severity: 'error',
      from: { path: 'modules/.+/domain/' },
      to: { path: ['@nestjs/(?!cqrs)', 'drizzle-orm', 'bullmq'] }
    },
    {
      name: 'no-infra-in-domain',
      severity: 'error',
      from: { path: 'modules/.+/domain/' },
      to: { path: 'modules/.+/infrastructure/' }
    },
    {
      name: 'no-cross-module-imports',
      severity: 'error',
      from: { path: 'src/modules/([^/]+)/' },
      to: { path: 'src/modules/(?!\\1/)' }
    },
    {
      name: 'no-core-infra-in-domain',
      severity: 'error',
      from: { path: 'modules/.+/domain/' },
      to: { path: 'core/infrastructure/' }
    },
    {
      name: 'no-backend-only-in-shared',
      severity: 'error',
      from: { path: 'packages/shared/' },
      to: { path: ['src/modules/', 'src/core/'] }
    }
  ]
}
```

### Module Core — Structure et contenu

Le module Core est la fondation backend partagée entre tous les modules :

```
apps/api/src/core/
├── core.module.ts
├── domain/                          # TS pur — importable par modules/*/domain/
│   ├── errors/
│   │   ├── app.error.ts             # Classe de base (code, message, httpStatus?)
│   │   ├── domain.error.ts          # extends AppError
│   │   └── infrastructure.error.ts  # extends AppError
│   ├── events/                      # Vide pour cette story (event payloads ajoutés plus tard)
│   └── models/                      # Vide pour cette story (projections ajoutées plus tard)
└── infrastructure/                  # NestJS-aware
    ├── cqrs/
    │   ├── middleware/               # Vide — Transaction/Logging middleware dans une story future
    │   └── cqrs.module.ts           # Structure de base
    ├── guards/                      # Vide — JwtAuth + UserIsolation guards dans story 1.2+
    ├── filters/
    │   └── domain-exception.filter.ts  # DomainError → GraphQLError
    ├── pipes/
    │   └── zod-validation.pipe.ts   # ValidationPipe Zod pour les resolvers
    ├── interceptors/                # Vide
    ├── decorators/                  # Vide
    └── test-helpers/                # Vide
```

**Hiérarchie d'erreurs :**

```typescript
// app.error.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus?: number,
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

// domain.error.ts
export class DomainError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 400)
  }
}

// infrastructure.error.ts
export class InfrastructureError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 500)
  }
}
```

**DomainExceptionFilter (structure de base) :**

Convertit `DomainError` → `GraphQLError` avec `code` dans `extensions` :
```typescript
// DomainError('DOCUMENT_NOT_FOUND') → GraphQLError('Document non trouvé', { extensions: { code: 'DOCUMENT_NOT_FOUND' } })
```

**ZodValidationPipe (structure de base) :**

Utilise un schéma Zod pour valider les arguments des resolvers GraphQL. En cas d'erreur Zod, lève une erreur de validation formatée.

### Anti-patterns à éviter

| Anti-pattern | Pattern correct |
|---|---|
| `import { Injectable } from '@nestjs/core'` dans domain/ | Framework uniquement dans infrastructure/ |
| `export default class UserService` | `export class UserService` |
| `enum Status { Active, Inactive }` | `type Status = 'active' \| 'inactive'` |
| `const store = writable({})` | `let state = $state({})` |
| Fichier `index.ts` (barrel file) | Imports directs |
| Table DB `Users` (PascalCase) | `users` (snake_case pluriel) |
| Tests dans `__tests__/` | `app.error.spec.ts` à côté de `app.error.ts` |
| `throw new Error('Not found')` | `throw new DomainError('DOCUMENT_NOT_FOUND', 'Document non trouvé')` |

### Design tokens pour app.css

Le design system "Indigo Doux" utilise :
- **Police** : Inter (Google Fonts ou auto-hébergée)
- **Accent** : indigo-500 (palette Tailwind)
- **Neutres** : palette Tailwind neutral/slate
- **Espacements** : multiples de 4px (Tailwind par défaut)
- **Border-radius** : doux (`rounded-lg` / `rounded-xl`)
- **Shadows** : minimales (`shadow-sm`)

### CI Pipeline — Structure

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 'lts/*'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm depcruise
```

### Project Structure Notes

- **Alignement avec l'architecture** : La structure cible est définie en détail dans `architecture.md` section "Complete Project Directory Structure" (~200 entrées). Cette story crée la fondation : le squelette de répertoires sera étendu par les stories suivantes.
- **`packages/shared/` vs `core/`** : `packages/shared/` = contrat frontend ↔ backend (Zod schemas, types DTO, constantes). `core/` = contrats inter-modules backend (errors, events, models, CQRS, guards, filters, pipes).
- **Turborepo pipeline** : Le cache Turborepo est activé pour `build`, `lint`, `test`, `type-check`. Le mode `dev` est persistent (pas de cache).
- **NestJS + Vitest** : NestJS installe Jest par défaut. Il faut le remplacer par Vitest pour l'uniformité du monorepo. Supprimer Jest et ses fichiers de config (`jest-e2e.json`, etc.).

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation] — Séquence d'initialisation et versions des packages
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — Conventions de nommage, structure patterns, anti-patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Dependency-Cruiser Rules] — 5 règles hexagonales
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure] — Arborescence cible complète
- [Source: _bmad-output/planning-artifacts/architecture.md#CQRS & Transaction Management] — Module Core structure et CQRS patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions] — Décisions techniques critiques
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1] — Acceptance criteria originaux
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Design system "Indigo Doux" pour les design tokens

## Dev Agent Record

### Agent Model Used

(à remplir par l'agent dev)

### Debug Log References

### Completion Notes List

### File List
