# CLAUDE.md — Projet Archie

## Apercu du projet

Archie est un coffre-fort documentaire intelligent qui classifie, chiffre et organise automatiquement les documents personnels grace a l'IA. Construit en monorepo avec SvelteKit (frontend), NestJS (backend) et un package partage.

## Stack technique

- **Monorepo :** pnpm workspaces + Turborepo
- **Frontend :** SvelteKit (Svelte 5 runes), Tailwind CSS, shadcn-svelte, Houdini (GraphQL)
- **Backend :** NestJS, GraphQL code-first, Drizzle ORM, BullMQ, Zod
- **Donnees :** PostgreSQL + pgvector, Redis
- **IA :** Mistral (LLM), Tesseract (OCR)
- **Infra :** Docker Compose (dev), Docker Swarm sur Scaleway (prod)

## Structure du projet

```
archie/
├── apps/web/          # Frontend SvelteKit (@archie/web)
├── apps/api/          # Backend NestJS (@archie/api)
├── packages/shared/   # Types partages, schemas Zod, constantes (@archie/shared)
├── _bmad-output/      # Artefacts de planification (PRD, architecture, stories)
└── docker-compose.yml
```

## Regles d'architecture (CRITIQUE)

### Architecture hexagonale
- Couches `domain/` et `application/` : ZERO import depuis `@nestjs/*`, `drizzle-orm`, `bullmq`
  - Exception : les decorateurs `@nestjs/cqrs` sont autorises dans `application/`
- Couche `infrastructure/` : peut importer depuis toutes les couches
- Direction des dependances : infrastructure → application → domain

### Pattern CQRS
- Commands pour les mutations, Queries pour les lectures
- Communication inter-modules : Events uniquement (jamais d'import de Commands d'un autre module)
- Queries cross-module : types de retour depuis `core/domain/models/`, jamais de Domain Models internes
- Events publies apres le commit uniquement (bufferises par le TransactionMiddleware)

### Regles TypeScript
- `strict: true` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- Target : ES2023
- JAMAIS de barrel files (`index.ts`)
- JAMAIS d'`export default` — toujours des exports nommes
- JAMAIS d'enums TypeScript — utiliser les union types : `type Status = 'active' | 'inactive'`
- JAMAIS de `any` (explicite ou implicite)
- JAMAIS de `class-validator` / `class-transformer` — Zod uniquement

### Regles Svelte
- Svelte 5 runes EXCLUSIVEMENT : `$state`, `$derived`, `$effect`
- JAMAIS de stores legacy (`writable`, `derived` de `svelte/store`)
- Server-to-server : le navigateur ne parle JAMAIS directement a NestJS

### Nommage des fichiers
- Tous les fichiers : kebab-case
- Suffixes : `.port.ts`, `.model.ts`, `.error.ts`, `.schema.ts`, `.usecase.ts`, `.command.ts`, `.adapter.ts`, `.controller.ts`, `.resolver.ts`, `.pipe.ts`, `.module.ts`
- Tests colocalises : `foo.model.spec.ts` a cote de `foo.model.ts`
- JAMAIS de repertoires `__tests__/` (sauf pour les fixtures partagees)

### Regles d'import
- Imports directs uniquement (pas de barrel files)
- Interne au module : chemins relatifs (`./domain/ports/...`)
- Cross-package : aliases `@archie/web`, `@archie/api`, `@archie/shared`
- Pas de prefixe `I` pour les interfaces — utiliser le suffixe de fichier (`.port.ts`)

## Validation
- Zod partout (frontend + backend + shared)
- Schemas dans `packages/shared/src/schemas/` pour les donnees traversant frontend ↔ backend
- ZodValidationPipe dans la couche infrastructure NestJS

## Gestion d'erreurs
- `AppError` → `DomainError` / `InfrastructureError` / `AuthError`
- Chaque erreur a un `code` string unique (ex : `'DOCUMENT_NOT_FOUND'`)
- Assertions de test sur `error.code`, JAMAIS sur les messages

## Conventions base de donnees
- Tables : snake_case, pluriel (`documents`, `users`, `refresh_tokens`)
- Colonnes : snake_case (`created_at`, `user_id`)
- Cles primaires : UUID v4
- Schemas Drizzle dans `apps/api/src/database/schema/`

## Tests
- Vitest pour les tests unitaires + integration
- Playwright pour les tests E2E
- Couche domaine : tests unitaires purs, zero dependance framework, couverture ≥ 80%
- Couche application : ports mockes, couverture ≥ 80%
- Infrastructure : tests d'integration avec testcontainers
- Suffixes : `.spec.ts` (unitaire), `.integration.spec.ts` (integration), `.e2e.ts` (e2e)

## Conventions Git
- GitHub Flow : branche `main` toujours deployable
- Noms de branches : `feat/`, `fix/`, `chore/`, `refactor/` + description en kebab-case
- Conventional commits : `type(scope): description` en anglais
- Merge commits (pas de squash, pas de rebase)

## Documentation technique

- **TOUJOURS** utiliser le MCP Context7 pour consulter la documentation technique d'une librairie avant de l'utiliser ou quand un doute survient sur une API.
- Ne pas se fier uniquement a ses connaissances internes : les API evoluent, et Context7 fournit la documentation a jour.

## Commandes courantes

```bash
pnpm dev          # Demarrer toutes les apps (Turborepo)
pnpm build        # Builder tous les packages
pnpm test         # Lancer Vitest sur tous les packages
pnpm lint         # Verification ESLint + Prettier
pnpm type-check   # Verification des types TypeScript
pnpm depcruise    # Dependency-cruiser (frontieres hexagonales)
docker compose up # Demarrer PostgreSQL + Redis
```

## Artefacts de planification

- PRD : `_bmad-output/planning-artifacts/prd.md`
- Architecture : `_bmad-output/planning-artifacts/architecture.md`
- Design UX : `_bmad-output/planning-artifacts/ux-design-specification.md`
- Contexte projet (regles IA) : `_bmad-output/project-context.md`
- Epics & Stories : `_bmad-output/planning-artifacts/epics.md`
- Statut du sprint : `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Story en cours : `_bmad-output/implementation-artifacts/1-2-inscription-avec-consentement.md`
