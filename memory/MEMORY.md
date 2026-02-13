# Archie Project Memory

## Project Overview
- **Archie** = intelligent document vault (coffre-fort documentaire) with AI classification
- Monorepo: pnpm + Turborepo (`apps/web` SvelteKit, `apps/api` NestJS, `packages/shared`)
- User: Antoine (solo dev)

## Key Architecture Rules
- Hexagonal architecture: ZERO `@nestjs/*` imports in domain/ or application/ (except `@nestjs/cqrs` in application/)
- CQRS: Commands for writes, Queries for reads, Events for cross-module communication
- No barrel files, no default exports, no TS enums, no class-validator
- Svelte 5 runes only (no legacy stores)
- Server-to-server: browser never talks directly to NestJS
- Zod for all validation (shared between frontend and backend)
- File naming: kebab-case with explicit suffixes (.port.ts, .model.ts, .adapter.ts, etc.)
- Tests colocated: `foo.model.spec.ts` next to `foo.model.ts`

## Current Sprint Status
- Epic 1 in-progress, Story 1.1 (monorepo init) is `ready-for-dev`
- All other stories are backlog

## Key Files
- Project context: `_bmad-output/project-context.md`
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Story 1.1: `_bmad-output/implementation-artifacts/1-1-initialisation-du-monorepo.md`
- Sprint status: `_bmad-output/implementation-artifacts/sprint-status.yaml`
- Epics: `_bmad-output/planning-artifacts/epics.md`

## Package Versions (verified 2026-02-12)
- Turborepo 2.8.7, Svelte 5.50.2, SvelteKit 2.50.2, NestJS 11.1.13
- Drizzle ORM 0.45.1, BullMQ 5.68.0, Zod 4.3.6, Houdini 1.5.10
- shadcn-svelte 1.1.1, bits-ui 2.15.5
