# Story 1.2 : Inscription avec consentement

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

En tant qu'utilisateur,
Je veux créer un compte avec mon email et un mot de passe en donnant mon consentement explicite,
Afin de pouvoir accéder à Archie.

## Acceptance Criteria

1. **Given** je suis sur la page d'inscription **When** je remplis un email valide, un mot de passe (≥ 8 caractères) et je coche la case de consentement **Then** mon compte est créé **And** mon mot de passe est hashé avec Argon2id (memory 19 MiB, iterations 2, parallelism 1) **And** mon consentement est enregistré avec un horodatage **And** je suis redirigé vers le dashboard

2. **Given** je suis sur la page d'inscription **When** je soumets un email déjà utilisé **Then** un message d'erreur s'affiche : "Cet email est déjà utilisé" **And** aucun compte n'est créé

3. **Given** je suis sur la page d'inscription **When** je soumets le formulaire sans cocher la case de consentement **Then** un message d'erreur s'affiche indiquant que le consentement est obligatoire **And** aucun compte n'est créé

4. **Given** je suis sur la page d'inscription **When** je soumets un email invalide ou un mot de passe trop court **Then** les erreurs de validation Zod s'affichent inline sous les champs concernés

5. **Given** une adresse IP tente de s'inscrire **When** plus de 5 tentatives sont effectuées en 1 minute **Then** les requêtes suivantes sont rejetées avec un code 429 (rate limiting)

6. **Given** le formulaire d'inscription est affiché **When** j'inspecte la case de consentement **Then** le texte mentionne explicitement le traitement de tous types de documents y compris les données de santé, l'hébergement en France et le chiffrement

7. **Given** JavaScript est désactivé dans le navigateur **When** je soumets le formulaire d'inscription **Then** le formulaire fonctionne via la form action SvelteKit (progressive enhancement)

## Tasks / Subtasks

- [ ] Task 1 : Schéma Zod de registration dans packages/shared (AC: #1, #4)
  - [ ] 1.1 Créer `packages/shared/src/schemas/register.schema.ts` avec le schéma `registerSchema` : email (string.email), password (string.min(8)), consent (literal(true))
  - [ ] 1.2 Exporter le type inféré `type RegisterInput = z.infer<typeof registerSchema>`
  - [ ] 1.3 Écrire les tests unitaires dans `packages/shared/src/schemas/register.schema.spec.ts` : email valide/invalide, password ≥ 8 / < 8, consent true/false/absent

- [ ] Task 2 : Schéma Drizzle — table users + consents (AC: #1, #2, #6)
  - [ ] 2.1 Créer `apps/api/src/database/schema/users.schema.ts` : table `users` avec colonnes `id` (UUID, PK, gen_random_uuid), `email` (varchar 255, unique, not null), `password_hash` (text, not null), `created_at` (timestamp with time zone, default now), `updated_at` (timestamp with time zone, default now)
  - [ ] 2.2 Ajouter la contrainte unique sur email : `uq_users_email`
  - [ ] 2.3 Créer `apps/api/src/database/schema/consents.schema.ts` : table `consents` avec colonnes `id` (UUID, PK), `user_id` (UUID, FK → users.id, not null), `consent_text` (text, not null), `consented_at` (timestamp with time zone, not null), `ip_address` (varchar 45, nullable)
  - [ ] 2.4 Générer la migration Drizzle : `pnpm drizzle-kit generate`
  - [ ] 2.5 Appliquer la migration : `pnpm drizzle-kit migrate`

- [ ] Task 3 : Module Auth — couche domain (AC: #1, #2)
  - [ ] 3.1 Créer `apps/api/src/modules/auth/domain/models/user.model.ts` : classe `User` avec propriétés `id`, `email`, `passwordHash`, `createdAt`, `updatedAt`
  - [ ] 3.2 Créer `apps/api/src/modules/auth/domain/ports/user-repository.port.ts` : interface `UserRepository` avec méthodes `findByEmail(email: string): Promise<User | undefined>`, `create(user: { email: string; passwordHash: string }): Promise<User>`
  - [ ] 3.3 Créer `apps/api/src/modules/auth/domain/ports/hasher.port.ts` : interface `Hasher` avec méthodes `hash(plain: string): Promise<string>`, `verify(hash: string, plain: string): Promise<boolean>`
  - [ ] 3.4 Créer `apps/api/src/modules/auth/domain/ports/consent-repository.port.ts` : interface `ConsentRepository` avec méthode `create(consent: { userId: string; consentText: string; consentedAt: Date; ipAddress?: string }): Promise<void>`
  - [ ] 3.5 Créer `apps/api/src/modules/auth/domain/errors/email-already-exists.error.ts` : classe `EmailAlreadyExistsError` extends `DomainError` avec code `'EMAIL_ALREADY_EXISTS'`
  - [ ] 3.6 Créer `apps/api/src/modules/auth/domain/events/user-registered.event.ts` : classe TS pure `UserRegisteredEvent` avec propriétés `userId`, `email`, `registeredAt`
  - [ ] 3.7 Écrire les tests unitaires pour `User` model et les erreurs

- [ ] Task 4 : Module Auth — couche application (AC: #1, #2, #3)
  - [ ] 4.1 Créer `apps/api/src/modules/auth/application/commands/register-user.command.ts` : classe `RegisterUserCommand` avec propriétés `email`, `password`, `consent` (boolean), `consentText` (string), `ipAddress` (string optionnel)
  - [ ] 4.2 Créer `apps/api/src/modules/auth/application/commands/register-user.handler.ts` : `RegisterUserHandler` qui :
    - Vérifie que `consent === true` (sinon DomainError `'CONSENT_REQUIRED'`)
    - Vérifie que l'email n'est pas déjà pris via `UserRepository.findByEmail()` (sinon `EmailAlreadyExistsError`)
    - Hash le mot de passe via `Hasher.hash()`
    - Crée l'utilisateur via `UserRepository.create()`
    - Enregistre le consentement via `ConsentRepository.create()` avec l'horodatage
    - Publie `UserRegisteredEvent`
    - Retourne l'userId créé
  - [ ] 4.3 Écrire les tests unitaires pour `RegisterUserHandler` avec les ports mockés : cas nominal, email dupliqué, consent manquant

- [ ] Task 5 : Module Auth — couche infrastructure adapters (AC: #1, #2)
  - [ ] 5.1 Créer `apps/api/src/modules/auth/infrastructure/adapters/argon2-hasher.adapter.ts` : implémentation de `Hasher` utilisant le package `argon2` avec config Argon2id (memoryCost: 19456, timeCost: 2, parallelism: 1, type: argon2id)
  - [ ] 5.2 Créer `apps/api/src/modules/auth/infrastructure/adapters/drizzle-user.adapter.ts` : implémentation de `UserRepository` utilisant Drizzle ORM avec le getter `conn` (CLS)
  - [ ] 5.3 Créer `apps/api/src/modules/auth/infrastructure/adapters/drizzle-consent.adapter.ts` : implémentation de `ConsentRepository` utilisant Drizzle ORM avec le getter `conn` (CLS)
  - [ ] 5.4 Écrire un test unitaire pour `Argon2HasherAdapter` : hash + verify (succès et échec)
  - [ ] 5.5 Écrire les tests d'intégration pour les adapters Drizzle avec testcontainers PostgreSQL

- [ ] Task 6 : Module Auth — resolver GraphQL + rate limiting (AC: #1, #5)
  - [ ] 6.1 Créer `apps/api/src/modules/auth/infrastructure/resolvers/auth.resolver.ts` : mutation `register(input: RegisterInput!): AuthPayload!` qui dispatch `RegisterUserCommand` via le CommandBus
  - [ ] 6.2 Définir le type GraphQL `RegisterInput` (code-first) avec les champs `email`, `password`, `consent`
  - [ ] 6.3 Définir le type GraphQL `AuthPayload` avec le champ `userId`
  - [ ] 6.4 Appliquer le `ZodValidationPipe` avec `registerSchema` sur l'argument d'entrée
  - [ ] 6.5 Configurer `@nestjs/throttler` : ThrottlerModule dans `app.module.ts` avec la limite globale 100/min, et override 5/min sur la mutation `register` via `@Throttle({ default: { limit: 5, ttl: 60000 } })`
  - [ ] 6.6 Configurer le ThrottlerGuard en global dans `app.module.ts` (APP_GUARD)
  - [ ] 6.7 Créer `apps/api/src/modules/auth/infrastructure/auth.module.ts` : NestJS module câblant les ports sur les adapters via le système de DI

- [ ] Task 7 : Frontend SvelteKit — page d'inscription (AC: #1, #3, #4, #6, #7)
  - [ ] 7.1 Créer `apps/web/src/routes/(auth)/register/+page.svelte` : formulaire d'inscription avec champs email, password, checkbox de consentement
  - [ ] 7.2 Rédiger le texte de consentement : "J'accepte que mes documents, y compris ceux pouvant contenir des données de santé, soient traités par Archie pour classification et recherche. Mes données sont hébergées en France, chiffrées et ne quittent jamais l'Europe. Consulter la politique de confidentialité."
  - [ ] 7.3 Créer `apps/web/src/routes/(auth)/register/+page.server.ts` : form action `default` qui :
    - Parse le FormData et valide avec `registerSchema` (importé de `@archie/shared`)
    - En cas d'erreur Zod, retourne `fail(400, { errors, values })` pour afficher les erreurs inline
    - Appelle l'API NestJS (server-to-server) via le proxy GraphQL
    - En cas de succès, redirige vers le dashboard avec `redirect(303, '/')`
    - En cas d'email dupliqué (code `EMAIL_ALREADY_EXISTS`), retourne l'erreur formatée
  - [ ] 7.4 Implémenter la validation inline côté client avec Zod (erreurs sous chaque champ) tout en gardant la form action comme fallback no-JS
  - [ ] 7.5 Ajouter `use:enhance` sur le formulaire pour le progressive enhancement
  - [ ] 7.6 Styler la page selon le design system "Indigo Doux" : fond blanc/gray-50, accent indigo-500 sur le bouton, erreurs en red-600, police Inter
  - [ ] 7.7 Ajouter un lien "Déjà un compte ? Se connecter" vers la page de connexion
  - [ ] 7.8 Ajouter un lien vers `/privacy` dans le texte de consentement

- [ ] Task 8 : Layout auth et navigation (AC: #7)
  - [ ] 8.1 Créer `apps/web/src/routes/(auth)/+layout.svelte` : layout minimal centré pour les pages auth (pas de sidebar, pas de barre de navigation complète)
  - [ ] 8.2 Vérifier que le layout `(auth)` est visuellement distinct du layout `(app)`

- [ ] Task 9 : Proxy server-to-server SvelteKit → NestJS (AC: #1)
  - [ ] 9.1 Créer ou compléter `apps/web/src/lib/server/api.ts` : fonction utilitaire pour les appels GraphQL vers NestJS en mode server-to-server
  - [ ] 9.2 Vérifier que l'URL NestJS n'est JAMAIS exposée au client (uniquement dans les variables d'environnement serveur)

- [ ] Task 10 : Tests (AC: #1-#7)
  - [ ] 10.1 Tests unitaires domaine : User model, RegisterUserHandler (ports mockés), erreurs
  - [ ] 10.2 Tests unitaires infrastructure : Argon2HasherAdapter (hash/verify)
  - [ ] 10.3 Tests d'intégration : adapters Drizzle avec testcontainers PostgreSQL (création utilisateur, détection email dupliqué, enregistrement consentement)
  - [ ] 10.4 Tests d'intégration : resolver GraphQL `register` mutation (succès, email dupliqué, validation Zod échouée, rate limiting)
  - [ ] 10.5 Tests unitaires shared : registerSchema Zod
  - [ ] 10.6 Vérifier la couverture domaine ≥ 80%, application ≥ 80%

- [ ] Task 11 : Validation finale (AC: #1-#7)
  - [ ] 11.1 Vérifier que `pnpm lint` passe
  - [ ] 11.2 Vérifier que `pnpm type-check` passe
  - [ ] 11.3 Vérifier que `pnpm test` passe (tous les tests verts)
  - [ ] 11.4 Vérifier que `pnpm depcruise` ne détecte aucune violation (zéro import framework dans domain/)
  - [ ] 11.5 Vérifier le formulaire avec JS activé : validation inline, redirection après succès
  - [ ] 11.6 Vérifier le formulaire avec JS désactivé : form action fonctionne, erreurs affichées
  - [ ] 11.7 Vérifier que le rate limiting rejette la 6ème requête en 1 minute avec un 429

## Dev Notes

### Contraintes architecturales critiques

- **Architecture hexagonale stricte** : les fichiers dans `domain/` et `application/` ne doivent avoir AUCUN import depuis `@nestjs/*` (exception : `@nestjs/cqrs` autorisé dans `application/`), `drizzle-orm`, `argon2`, `bullmq` ou tout autre package framework/infra
- **Direction des dépendances** : infrastructure → application → domain. Jamais l'inverse.
- **Pas de barrel files** : pas de `index.ts` qui réexportent. Chaque import doit pointer vers le fichier source exact
- **Pas d'export default** : utiliser `export class`, `export function`, `export const`
- **Pas d'enums TypeScript** : utiliser les union types (`type Status = 'active' | 'inactive'`)
- **Zod uniquement** : pas de `class-validator`, pas de `class-transformer`. Les schémas Zod dans `packages/shared/` sont le contrat frontend ↔ backend
- **Assertions sur error.code** : dans les tests, JAMAIS assert sur les messages d'erreur, toujours sur le `code` string
- **Getter `conn` dans les adapters Drizzle** : toujours utiliser `this.conn` (qui retourne la transaction CLS active ou la connexion directe), jamais `this.db` directement
- **Server-to-server** : le navigateur ne parle JAMAIS directement à NestJS. Le form action SvelteKit fait l'appel GraphQL côté serveur
- **Conventional commits** en anglais : `feat(auth): add user registration with consent`

### Versions des packages (vérifiées 2026-02-13)

| Package | Version |
|---|---|
| argon2 | 0.44.0 |
| @nestjs/throttler | 6.5.0 |
| @nestjs/passport | 11.0.5 |
| @nestjs/jwt | 11.0.2 |
| @nestjs/core | 11.1.13 |
| @nestjs/graphql | 13.2.4 |
| Drizzle ORM | 0.45.1 |
| Zod | 4.3.6 |

### Configuration Argon2id (OWASP 2024+)

Le package npm `argon2` est la librairie recommandée pour Node.js. Paramètres OWASP minimum :

```typescript
import argon2 from 'argon2'

const hash = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 19456,      // 19 MiB
  timeCost: 2,            // 2 itérations
  parallelism: 1,
})

const isValid = await argon2.verify(hash, password)
```

**ATTENTION** : le package `argon2` utilise un import par défaut (`import argon2 from 'argon2'`). L'adapter dans `infrastructure/` encapsule cet import — le domain ne voit qu'une interface `Hasher` avec `hash()` et `verify()`.

### Configuration @nestjs/throttler

```typescript
// Dans app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,    // 1 minute
      limit: 100,    // 100 requêtes/min global
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
```

Sur le resolver d'inscription, override avec 5/min :

```typescript
import { Throttle } from '@nestjs/throttler'

@Throttle({ default: { limit: 5, ttl: 60000 } })
@Mutation(() => AuthPayload)
async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
  // ...
}
```

**IMPORTANT** : si NestJS est derrière un reverse proxy (Docker, Nginx), configurer `app.enableCors()` et `app.set('trust proxy', true)` dans `main.ts` pour que le throttler utilise la vraie IP depuis `X-Forwarded-For`.

### SvelteKit form action — Progressive enhancement

Le formulaire d'inscription DOIT fonctionner sans JavaScript (progressive enhancement) :

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms'

  let { form } = $props()
</script>

<form method="POST" use:enhance>
  <input type="email" name="email" value={form?.values?.email ?? ''} />
  {#if form?.errors?.email}
    <p class="text-red-600 text-sm">{form.errors.email}</p>
  {/if}

  <input type="password" name="password" />
  {#if form?.errors?.password}
    <p class="text-red-600 text-sm">{form.errors.password}</p>
  {/if}

  <label>
    <input type="checkbox" name="consent" />
    <!-- Texte de consentement -->
  </label>
  {#if form?.errors?.consent}
    <p class="text-red-600 text-sm">{form.errors.consent}</p>
  {/if}

  <button type="submit">Créer mon compte</button>
</form>
```

```typescript
// +page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import { registerSchema } from '@archie/shared/src/schemas/register.schema'

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData()
    const raw = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      consent: formData.get('consent') === 'on',
    }

    const result = registerSchema.safeParse(raw)
    if (!result.success) {
      return fail(400, {
        errors: result.error.flatten().fieldErrors,
        values: { email: raw.email },
      })
    }

    // Appel server-to-server vers NestJS GraphQL
    // ...
  },
}
```

### Texte de consentement (FR35)

Le texte exact de la case de consentement doit contenir ces 3 éléments obligatoires (FR35) :
1. Mention du traitement de **tous types de documents, y compris les données de santé**
2. Mention de l'**hébergement en France**
3. Mention du **chiffrement**

Texte proposé :

> « J'accepte que mes documents, y compris ceux pouvant contenir des données de santé, soient traités par Archie pour classification et recherche. Mes données sont hébergées en France, chiffrées et ne quittent jamais l'Europe. [Consulter la politique de confidentialité](/privacy) »

### Schéma Drizzle — Table users

```typescript
// apps/api/src/database/schema/users.schema.ts
import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique('uq_users_email'),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
```

### Schéma Drizzle — Table consents

```typescript
// apps/api/src/database/schema/consents.schema.ts
import { pgTable, uuid, text, varchar, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users.schema'

export const consents = pgTable('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  consentText: text('consent_text').notNull(),
  consentedAt: timestamp('consented_at', { withTimezone: true }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
})
```

### Structure hexagonale du module Auth

```
apps/api/src/modules/auth/
├── domain/
│   ├── models/
│   │   └── user.model.ts                    # Entité User (TS pur)
│   ├── ports/
│   │   ├── user-repository.port.ts          # Interface UserRepository
│   │   ├── hasher.port.ts                   # Interface Hasher
│   │   └── consent-repository.port.ts       # Interface ConsentRepository
│   ├── errors/
│   │   ├── email-already-exists.error.ts    # code: 'EMAIL_ALREADY_EXISTS'
│   │   └── consent-required.error.ts        # code: 'CONSENT_REQUIRED'
│   └── events/
│       └── user-registered.event.ts         # Classe TS pure
├── application/
│   └── commands/
│       ├── register-user.command.ts         # RegisterUserCommand
│       └── register-user.handler.ts         # RegisterUserHandler (@CommandHandler)
└── infrastructure/
    ├── adapters/
    │   ├── argon2-hasher.adapter.ts         # Implémente Hasher
    │   ├── drizzle-user.adapter.ts          # Implémente UserRepository
    │   └── drizzle-consent.adapter.ts       # Implémente ConsentRepository
    ├── resolvers/
    │   └── auth.resolver.ts                 # Mutation register()
    └── auth.module.ts                       # Câblage DI
```

### Hiérarchie d'erreurs Auth

```
AppError (core/domain/errors/)
├── DomainError
│   ├── EmailAlreadyExistsError   (code: 'EMAIL_ALREADY_EXISTS', httpStatus: 409)
│   └── ConsentRequiredError      (code: 'CONSENT_REQUIRED', httpStatus: 400)
└── AuthError
    ├── InvalidCredentialsError    (code: 'INVALID_CREDENTIALS')  ← story 1.3
    └── UnauthorizedError          (code: 'UNAUTHORIZED')         ← story 1.3
```

### Communication inter-modules

Cette story ne publie qu'un seul événement : `UserRegisteredEvent`. Cet événement sera consommé dans les stories futures (ex : story 2.1 pour la dérivation de la data key de chiffrement). Pour cette story, l'événement est publié mais aucun handler ne le consomme encore.

**IMPORTANT** : l'événement est publié APRÈS le commit de la transaction (mécanisme post-commit du TransactionMiddleware). Si la transaction échoue (rollback), l'événement n'est PAS publié.

### Design system — Page d'inscription

La page d'inscription suit le design system "Indigo Doux" :

- **Fond** : `white` / `gray-50`
- **Card du formulaire** : `bg-white rounded-xl shadow-sm border border-gray-200 p-8`
- **Titre** : "Créer un compte" en `text-gray-900 font-semibold text-xl`
- **Labels** : `text-gray-700 text-sm font-medium`
- **Inputs** : `border-gray-200 rounded-lg` avec focus `ring-indigo-500`
- **Bouton principal** : `bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg`
- **Erreurs** : `text-red-600 text-sm` sous chaque champ
- **Lien** : `text-indigo-500 hover:text-indigo-600`
- **Police** : Inter (configurée dans app.css depuis la story 1.1)
- **Layout** : centré verticalement et horizontalement, largeur max ~400px

### Accessibilité

- Labels `<label>` associés à chaque input via `for`/`id`
- Les erreurs de validation sont liées aux champs via `aria-describedby`
- Le formulaire a un `role="form"` et `aria-label="Formulaire d'inscription"`
- La case de consentement est un vrai `<input type="checkbox">` (pas un div cliquable)
- Le focus est visible (ring indigo) sur tous les éléments interactifs
- Le contraste texte/fond respecte WCAG 2.1 AA (≥ 4.5:1)

### Anti-patterns à éviter

| Anti-pattern | Pattern correct |
|---|---|
| `import argon2 from 'argon2'` dans domain/ | Uniquement dans `infrastructure/adapters/argon2-hasher.adapter.ts` |
| `import { db } from '../../database'` dans le handler | Le handler utilise le port `UserRepository`, l'adapter utilise `this.conn` |
| `throw new Error('Email already exists')` | `throw new EmailAlreadyExistsError(email)` |
| `expect(error.message).toBe(...)` dans les tests | `expect(error.code).toBe('EMAIL_ALREADY_EXISTS')` |
| `const store = writable({})` dans la page Svelte | `let formErrors = $state({})` (runes Svelte 5) |
| `fetch('http://localhost:3000/graphql')` côté client | Form action SvelteKit (`+page.server.ts`) → appel serveur |
| `export default class AuthResolver` | `export class AuthResolver` |
| `index.ts` barrel file dans auth/ | Imports directs vers chaque fichier |
| `enum ConsentStatus { ... }` | `type ConsentStatus = 'granted' | 'revoked'` |
| `@IsEmail()` de class-validator | `z.string().email()` de Zod |

### Sécurité — Points d'attention

1. **Ne JAMAIS stocker le mot de passe en clair** — Argon2id hash avant toute écriture en DB
2. **Ne JAMAIS exposer si l'email existe** lors de l'inscription — Exception acceptée ici car l'erreur "Cet email est déjà utilisé" est explicite (UX > sécurité pour l'inscription). Pour la connexion (story 1.3), le message sera générique.
3. **Rate limiting** : 5 tentatives/min par IP sur la mutation `register` pour prévenir le bruteforce et l'enumeration d'emails
4. **Validation double** : côté client (UX) ET côté serveur (sécurité). Le serveur est la source de vérité.
5. **Consentement horodaté** : stocker la date exacte + le texte exact du consentement accepté (pour preuve RGPD)
6. **IP address** : stocker l'IP de l'inscription dans la table `consents` (optionnel mais utile pour la conformité)

### Dépendances de cette story

- **Dépend de** : Story 1.1 (monorepo initialisé, module Core avec erreurs de base, Docker Compose PostgreSQL + Redis, Drizzle configuré, ZodValidationPipe, DomainExceptionFilter)
- **Bloque** : Story 1.3 (connexion — réutilise le module Auth, la table users, et ajoute JWT + refresh tokens)

### Project Structure Notes

- **Alignement architecture** : La structure suit exactement le pattern `modules/{module-name}/domain|application|infrastructure/` défini dans l'architecture
- **Table `consents`** : Ajoutée spécifiquement pour cette story. Non mentionnée explicitement dans l'architecture mais nécessaire pour FR35 (consentement explicite avec horodatage). Elle suit les conventions DB (snake_case, pluriel, UUID PK)
- **Pas de refresh tokens dans cette story** : La table `refresh_tokens` sera créée dans la story 1.3. Cette story crée uniquement l'utilisateur et le consentement. La redirection vers le dashboard implique qu'un mécanisme d'auth temporaire sera nécessaire (à détailler dans la story 1.3)
- **Note sur la redirection** : L'AC #1 dit "je suis redirigé vers le dashboard". Pour cette story, après la création du compte, on redirige vers la page de connexion (`/login`) ou vers le dashboard si la story 1.3 est déjà implémentée. Adapter selon le contexte d'implémentation.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security] — JWT dans cookie httpOnly, Argon2id (memory 19 MiB, iterations 2, parallelism 1), rate limiting @nestjs/throttler 5/min login
- [Source: _bmad-output/planning-artifacts/architecture.md#CQRS & Transaction Management] — Pattern Commands/Queries, événements post-commit, getter `conn` CLS
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns] — Structure hexagonale CQRS, conventions nommage, anti-patterns
- [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure] — Structure modules/auth/ avec domain/application/infrastructure
- [Source: _bmad-output/planning-artifacts/architecture.md#Naming Patterns] — Tables snake_case pluriel, colonnes snake_case, GraphQL camelCase
- [Source: _bmad-output/planning-artifacts/architecture.md#Process Patterns] — Hiérarchie d'erreurs AuthError, EmailAlreadyExists, validation timing
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2] — Acceptance criteria originaux
- [Source: _bmad-output/planning-artifacts/prd.md#FR1] — Création de compte email + mot de passe
- [Source: _bmad-output/planning-artifacts/prd.md#FR35] — Consentement explicite couvrant les données de santé
- [Source: _bmad-output/planning-artifacts/prd.md#NFR-S8] — Argon2 password hashing
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation] — Design system "Indigo Doux" : palette, typographie, espacements
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Core User Experience] — Inscription en 30 secondes, zéro friction
- [Source: _bmad-output/project-context.md#SvelteKit] — Form actions, progressive enhancement, hooks.server.ts, route groups (auth)/(app)
- [Source: _bmad-output/project-context.md#Architecture hexagonale] — Structure par module, ports, adapters, zéro import framework dans domain
- [Source: _bmad-output/project-context.md#Validation] — Zod uniquement, schémas partagés packages/shared
- [Source: _bmad-output/implementation-artifacts/1-1-initialisation-du-monorepo.md] — Fondations : module Core, erreurs de base, DomainExceptionFilter, ZodValidationPipe

## Dev Agent Record

### Agent Model Used

(à remplir par l'agent dev)

### Debug Log References

### Completion Notes List

### File List
